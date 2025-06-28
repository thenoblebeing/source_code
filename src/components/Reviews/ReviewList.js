import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ReviewListContainer = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    margin: 0;
    color: var(--soft-gold);
  }
  
  select {
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--sandstone-beige);
    padding: 0.5rem 1rem;
    border-radius: 4px;
  }
`;

const ReviewSummary = styled.div`
  display: flex;
  margin-bottom: 2rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
`;

const AverageRating = styled.div`
  flex: 1;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  
  .average {
    font-size: 3rem;
    color: var(--soft-gold);
    font-weight: bold;
  }
  
  .total {
    font-size: 0.9rem;
    color: var(--sandstone-beige);
    margin-top: 0.5rem;
  }
  
  .stars {
    margin-top: 0.5rem;
    font-size: 1.2rem;
  }
`;

const RatingBreakdown = styled.div`
  flex: 2;
  padding-left: 2rem;
  
  .rating-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    
    .stars {
      width: 80px;
      font-size: 0.9rem;
    }
    
    .bar-container {
      flex: 1;
      height: 8px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      margin: 0 0.5rem;
    }
    
    .bar {
      height: 8px;
      border-radius: 4px;
      background-color: var(--soft-gold);
    }
    
    .count {
      width: 40px;
      text-align: right;
      font-size: 0.9rem;
      color: var(--sandstone-beige);
    }
  }
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ReviewCard = styled(motion.div)`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  
  .review-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .user {
    display: flex;
    align-items: center;
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--soft-gold);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.8rem;
      color: black;
      font-weight: bold;
    }
    
    .name {
      font-weight: 500;
    }
    
    .date {
      font-size: 0.8rem;
      color: var(--sandstone-beige);
      opacity: 0.7;
    }
  }
  
  .stars {
    color: var(--soft-gold);
  }
  
  .title {
    font-weight: 600;
    margin: 0.8rem 0;
    font-size: 1.1rem;
  }
  
  .content {
    color: var(--sandstone-beige);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .badges {
    display: flex;
    margin-top: 0.5rem;
    
    .badge {
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin-right: 0.5rem;
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--soft-gold);
      color: var(--soft-gold);
    }
  }
  
  .actions {
    display: flex;
    margin-top: 1rem;
    
    button {
      background: none;
      border: none;
      color: var(--sandstone-beige);
      display: flex;
      align-items: center;
      cursor: pointer;
      margin-right: 1rem;
      font-size: 0.9rem;
      
      &:hover {
        color: var(--soft-gold);
      }
      
      svg {
        margin-right: 0.3rem;
      }
    }
  }
`;

const EmptyReviews = styled.div`
  text-align: center;
  padding: 3rem 0;
  
  p {
    margin-bottom: 1.5rem;
    color: var(--sandstone-beige);
  }
  
  button {
    background-color: var(--soft-gold);
    color: black;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
      background-color: #c0941e;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  
  button {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--sandstone-beige);
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin: 0 0.3rem;
    cursor: pointer;
    
    &:hover {
      border-color: var(--soft-gold);
      color: var(--soft-gold);
    }
    
    &.active {
      background-color: var(--soft-gold);
      border-color: var(--soft-gold);
      color: black;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

// Helper to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to render stars
const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<span key={i}>★</span>);
    } else {
      stars.push(<span key={i}>☆</span>);
    }
  }
  return <div className="stars">{stars}</div>;
};

const ReviewList = ({ reviews, summary, onSort, onWriteReview, loading }) => {
  const [sortBy, setSortBy] = useState('newest');
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    onSort(e.target.value);
  };
  
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <ReviewListContainer>
      <ReviewHeader>
        <h2>Customer Reviews</h2>
        <select value={sortBy} onChange={handleSortChange}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </ReviewHeader>
      
      {summary && summary.totalReviews > 0 ? (
        <>
          <ReviewSummary>
            <AverageRating>
              <div className="average">{summary.averageRating}</div>
              <div className="stars">
                {renderStars(Math.round(summary.averageRating))}
              </div>
              <div className="total">Based on {summary.totalReviews} reviews</div>
            </AverageRating>
            
            <RatingBreakdown>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = summary.ratingCounts[stars] || 0;
                const percentage = summary.totalReviews > 0 
                  ? (count / summary.totalReviews) * 100 
                  : 0;
                
                return (
                  <div className="rating-row" key={stars}>
                    <div className="stars">{stars} star{stars !== 1 ? 's' : ''}</div>
                    <div className="bar-container">
                      <div className="bar" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="count">{count}</div>
                  </div>
                );
              })}
            </RatingBreakdown>
          </ReviewSummary>
          
          <ReviewGrid>
            {reviews.map(review => (
              <ReviewCard 
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="review-header">
                  <div className="user">
                    <div className="avatar">
                      {review.profiles?.avatar_url ? (
                        <img 
                          src={review.profiles.avatar_url} 
                          alt={`${review.profiles.first_name || 'User'}'s avatar`} 
                        />
                      ) : (
                        getInitials(review.profiles?.first_name && review.profiles?.last_name 
                          ? `${review.profiles.first_name} ${review.profiles.last_name}`
                          : 'Anonymous User'
                        )
                      )}
                    </div>
                    <div>
                      <div className="name">
                        {review.profiles?.first_name && review.profiles?.last_name 
                          ? `${review.profiles.first_name} ${review.profiles.last_name}`
                          : 'Anonymous User'
                        }
                      </div>
                      <div className="date">{formatDate(review.created_at)}</div>
                    </div>
                  </div>
                  <div className="stars">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                {review.title && <div className="title">{review.title}</div>}
                <div className="content">{review.comment}</div>
                
                <div className="badges">
                  {review.verified_purchase && (
                    <div className="badge">✓ Verified Purchase</div>
                  )}
                </div>
                
                <div className="actions">
                  <button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 11V17H17V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Helpful ({review.helpful_votes})
                  </button>
                  <button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 13V7H17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Not Helpful ({review.unhelpful_votes})
                  </button>
                </div>
              </ReviewCard>
            ))}
          </ReviewGrid>
        </>
      ) : (
        <EmptyReviews>
          <p>There are no reviews for this product yet. Be the first to leave a review!</p>
          <button onClick={onWriteReview}>Write a Review</button>
        </EmptyReviews>
      )}
    </ReviewListContainer>
  );
};

export default ReviewList;
