import api from './api';

/**
 * Service to handle all order-related operations
 */
const orderService = {
  /**
   * Create a new order in the database
   * @param {Object} orderData - Complete order data including customer info, items, and payment details
   * @returns {Promise} - The created order with ID
   */
  createOrder: async (orderData) => {
    try {
      // Get current user if available
      const { data: userData } = await api.auth.getUser();
      const user = userData?.user;
      
      // Create the customer name and shipping address object
      const customerName = `${orderData.customer.firstName} ${orderData.customer.lastName}`;
      const shippingAddress = {
        street: orderData.customer.address.street,
        apartment: orderData.customer.address.apartment || '',
        city: orderData.customer.address.city,
        state: orderData.customer.address.state,
        postalCode: orderData.customer.address.postalCode,
        country: orderData.customer.address.country,
        phone: orderData.customer.phone
      };
      
      // Create the order record with fields matching the database structure
      const { data: order, error } = await api.post('orders', {
        user_id: user?.id || null,
        shipping_address: shippingAddress,
        payment_method: orderData.paymentMethod,
        payment_status: 'pending',
        status: 'pending',
        total: orderData.total
      });
      
      if (error) throw error;
      
      // Create order items for each product
      for (const item of orderData.items) {
        const { error: itemError } = await api.post('order_items', {
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          options: item.options || {}
        });
        
        if (itemError) throw itemError;
      }
      
      // Process payment (in a real production system, this would integrate with a payment processor)
      const { error: paymentError } = await api.post('payments', {
        order_id: order.id,
        amount: orderData.total,
        payment_method: orderData.paymentMethod,
        status: 'completed',
        transaction_id: `tr_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        payment_date: new Date().toISOString()
      });
      
      if (paymentError) throw paymentError;
      
      // Update order status to confirmed after successful payment
      const { error: updateError } = await api.put('orders', order.id, {
        status: 'confirmed',
        payment_status: 'completed'
      });
      
      if (updateError) throw updateError;
      
      // Generate order number (using the UUID)
      const orderNumber = `TNB-${order.id.substring(0, 8).toUpperCase()}`;
      
      return {
        ...order,
        orderNumber
      };
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  },
  
  /**
   * Get order details by ID
   * @param {string|number} orderId - The order ID
   * @returns {Promise} - The order details including items
   */
  getOrderById: async (orderId) => {
    try {
      // Get the order
      const { data: order, error } = await api.getById('orders', orderId);
      
      if (error) throw error;
      if (!order) throw new Error('Order not found');
      
      // Get order items
      const { data: orderItems, error: itemsError } = await api.get('order_items', {
        filters: { order_id: orderId }
      });
      
      if (itemsError) throw itemsError;
      
      return {
        ...order,
        items: orderItems || []
      };
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },
  
  /**
   * Get all orders for a user
   * @returns {Promise} - List of user orders
   */
  getUserOrders: async () => {
    try {
      const user = await api.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await api.get('orders', {
        filters: { user_id: user.id },
        sortBy: { column: 'order_date', ascending: false }
      });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Get user orders error:', error);
      throw error;
    }
  },
  
  /**
   * Update order status
   * @param {string|number} orderId - The order ID
   * @param {string} status - New status (pending, confirmed, shipped, delivered, cancelled)
   * @returns {Promise} - Updated order
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const { data, error } = await api.put('orders', orderId, { status });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },
  
  /**
   * Cancel an order
   * @param {string|number} orderId - The order ID
   * @returns {Promise} - Cancelled order
   */
  cancelOrder: async (orderId) => {
    try {
      return await orderService.updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }
};

export default orderService;
