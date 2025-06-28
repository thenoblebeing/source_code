import api from './api';

const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId, options = {}) => {
    try {
      const queryOptions = {
        filters: { product_id: productId }
      };
      
      // Add sorting
      if (options.sortBy) {
        queryOptions.order = {
          column: options.sortBy,
          ascending: options.sortOrder !== 'desc'
        };
      } else {
        // Default sort by newest reviews first
        queryOptions.order = { column: 'created_at', ascending: false };
      }
      
      // Add filtering by rating
      if (options.minRating) {
        queryOptions.filters.rating_gte = options.minRating;
      }
      
      if (options.maxRating) {
        queryOptions.filters.rating_lte = options.maxRating;
      }
      
      // Add pagination
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        queryOptions.range = { from, to };
      }

      // Only show approved reviews by default
      if (options.showUnapproved !== true) {
        queryOptions.filters.status = 'approved';
      }
      
      const { data, error } = await api.supabase()
        .from('reviews')
        .select(`
          id,
          product_id,
          user_id,
          rating,
          title,
          comment,
          verified_purchase,
          helpful_votes,
          unhelpful_votes,
          created_at,
          profiles(first_name, last_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('status', options.showUnapproved === true ? undefined : 'approved')
        .order(options.sortBy || 'created_at', { ascending: options.sortOrder !== 'desc' })
        .range(
          options.page && options.limit ? (options.page - 1) * options.limit : 0,
          options.page && options.limit ? (options.page * options.limit) - 1 : 9
        );
        
      if (error) throw error;
      
      // Calculate average rating
      const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = data.length > 0 ? (totalRating / data.length).toFixed(1) : 0;
      
      // Group reviews by rating for the summary
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach(review => {
        ratingCounts[review.rating]++;
      });
      
      return {
        reviews: data,
        summary: {
          totalReviews: data.length,
          averageRating,
          ratingCounts
        }
      };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },
  
  // Create a new review
  addReview: async (reviewData) => {
    try {
      // Validate required fields
      if (!reviewData.productId || !reviewData.rating || !reviewData.comment) {
        throw new Error('Missing required fields for review');
      }
      
      // Check if user has already reviewed this product
      const user = await api.auth.getUser();
      if (!user) throw new Error('You must be logged in to submit a review');
      
      const { data: existingReviews } = await api.supabase()
        .from('reviews')
        .select('id')
        .eq('product_id', reviewData.productId)
        .eq('user_id', user.id);
      
      if (existingReviews && existingReviews.length > 0) {
        throw new Error('You have already reviewed this product');
      }
      
      // Check if the user has purchased this product for "verified purchase" badge
      const isVerifiedPurchase = await reviewService.checkVerifiedPurchase(
        user.id, 
        reviewData.productId
      );

      // Prepare review data
      const review = {
        product_id: reviewData.productId,
        user_id: user.id,
        rating: reviewData.rating,
        title: reviewData.title || null,
        comment: reviewData.comment,
        verified_purchase: isVerifiedPurchase,
        status: 'approved', // Automatic approval for now, can be changed to 'pending' if moderation is needed
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert the review
      const { data, error } = await api.supabase()
        .from('reviews')
        .insert(review)
        .select();
      
      if (error) throw error;
      
      // Update review request status if it exists
      await reviewService.updateReviewRequestStatus(
        user.id, 
        reviewData.productId, 
        'completed'
      );
      
      return data[0];
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },
  
  // Vote on a review (helpful/unhelpful)
  voteOnReview: async (reviewId, voteType) => {
    try {
      if (!['helpful', 'unhelpful'].includes(voteType)) {
        throw new Error('Invalid vote type');
      }
      
      const column = `${voteType}_votes`;
      
      // Get current votes
      const { data: review } = await api.supabase()
        .from('reviews')
        .select(column)
        .eq('id', reviewId)
        .single();
      
      if (!review) throw new Error('Review not found');
      
      // Increment the vote count
      const { data, error } = await api.supabase()
        .from('reviews')
        .update({ [column]: review[column] + 1 })
        .eq('id', reviewId)
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error(`Error voting ${voteType} on review:`, error);
      throw error;
    }
  },
  
  // Check if a user has purchased a product (for verified purchase badge)
  checkVerifiedPurchase: async (userId, productId) => {
    try {
      // Check orders table for this user and product
      const { data, error } = await api.supabase()
        .from('order_items')
        .select('id')
        .eq('product_id', productId)
        .in('order_id', api.supabase()
          .from('orders')
          .select('id')
          .eq('user_id', userId)
        )
        .limit(1);
      
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking verified purchase:', error);
      return false; // Default to false if there's an error
    }
  },
  
  // Create a review request for a user after purchase
  createReviewRequest: async (userId, productId, orderId) => {
    try {
      // Check if a request already exists
      const { data: existingRequests } = await api.supabase()
        .from('review_requests')
        .select('id, status')
        .eq('user_id', userId)
        .eq('product_id', productId);
      
      if (existingRequests && existingRequests.length > 0) {
        // Request already exists, just return it
        return existingRequests[0];
      }
      
      // Create new request
      const { data, error } = await api.supabase()
        .from('review_requests')
        .insert({
          user_id: userId,
          product_id: productId,
          order_id: orderId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Error creating review request:', error);
      throw error;
    }
  },
  
  // Update status of a review request
  updateReviewRequestStatus: async (userId, productId, status) => {
    try {
      if (!['pending', 'completed', 'declined'].includes(status)) {
        throw new Error('Invalid status');
      }
      
      const updates = {
        status,
        updated_at: new Date().toISOString()
      };
      
      // If completed, add completed_at timestamp
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      
      const { data, error } = await api.supabase()
        .from('review_requests')
        .update(updates)
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Error updating review request:', error);
      throw error;
    }
  },
  
  // Get pending review requests for a user
  getUserPendingReviewRequests: async (userId) => {
    try {
      const { data, error } = await api.supabase()
        .from('review_requests')
        .select(`
          id,
          product_id,
          order_id,
          status,
          created_at,
          products(id, name, images)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching pending review requests:', error);
      throw error;
    }
  },
  
  // Increment reminder count and update last reminded time
  incrementReminderCount: async (requestId) => {
    try {
      const { data: request } = await api.supabase()
        .from('review_requests')
        .select('reminder_count')
        .eq('id', requestId)
        .single();
      
      if (!request) throw new Error('Review request not found');
      
      const { data, error } = await api.supabase()
        .from('review_requests')
        .update({
          reminder_count: request.reminder_count + 1,
          last_reminded_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (error) {
      console.error('Error incrementing reminder count:', error);
      throw error;
    }
  }
};

export default reviewService;
