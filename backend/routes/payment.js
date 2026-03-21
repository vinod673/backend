const express = require('express');
const { Cashfree, CFEnvironment } = require('cashfree-pg');
const crypto = require('crypto');
const router = express.Router();

// Cashfree Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'PRODUCTION';

// Initialize Cashfree SDK
const cashfree = new Cashfree(
  CASHFREE_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY
);

console.log('✅ Cashfree PG SDK initialized successfully');

/**
 * Create Payment Order using Cashfree PG SDK
 * POST /api/payment/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, userId, userEmail, userName, tournamentId } = req.body;

    // Validation
    if (!amount || amount < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount. Minimum deposit is $1' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Generate unique order ID
    const orderId = `order_${userId}_${Date.now()}`;

    // Prepare request for Cashfree PG SDK
    const request = {
      order_amount: amount,
      order_currency: 'INR',
      order_id: orderId,
      customer_details: {
        customer_id: userId,
        customer_phone: req.body.customerPhone || '9999999999',
        customer_name: userName || 'Customer',
        customer_email: userEmail || 'customer@example.com'
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/wallet?orderId={order_id}`,
        user_id: userId,
        tournament_id: tournamentId || ''
      },
      order_tags: {
        platform: 'ArenaX Gaming',
        type: tournamentId ? 'tournament_entry' : 'wallet_topup'
      }
    };

    console.log('📝 Creating order:', orderId);

    // Create order using Cashfree PG SDK
    const response = await cashfree.PGCreateOrder(request);

    if (response.data && response.data.order_id) {
      console.log('✅ Order created successfully:', orderId);
      
      res.json({
        success: true,
        message: 'Payment order created successfully',
        orderId: response.data.order_id,
        payUrl: response.data.pay_url || response.data.payment_url,
        paymentSessionId: response.data.payment_session_id,
        orderAmount: response.data.order_amount,
        orderCurrency: response.data.order_currency,
        orderStatus: response.data.order_status
      });
    } else {
      throw new Error('Invalid response from Cashfree');
    }

  } catch (error) {
    console.error('❌ Error creating payment order:', error.response?.data || error.message);
    
    // Handle specific Cashfree errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.message || 'Payment gateway error',
        errorCode: error.response.data?.code || 'PAYMENT_ERROR'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

/**
 * Verify Payment Status using Cashfree PG SDK
 * GET /api/payment/verify/:orderId
 */
router.get('/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    console.log('🔍 Verifying order:', orderId);

    // Fetch order status using Cashfree PG SDK
    const response = await cashfree.PGOrderFetch(orderId);

    if (response.data) {
      const orderStatus = response.data.order_status || response.data.status;
      
      console.log('✅ Order verified:', orderId, '- Status:', orderStatus);
      
      res.json({
        success: true,
        message: 'Payment verification successful',
        orderId: orderId,
        status: orderStatus,
        orderAmount: response.data.order_amount,
        orderCurrency: response.data.order_currency,
        customerDetails: response.data.customer_details,
        payments: response.data.payments || [],
        orderTags: response.data.order_tags
      });
    } else {
      throw new Error('Order not found');
    }

  } catch (error) {
    console.error('❌ Error verifying payment:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        orderId: req.params.orderId
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
      details: error.response?.data
    });
  }
});

/**
 * Webhook Handler
 * POST /api/payment/webhook
 * 
 * Handles Cashfree payment webhooks for automatic status updates
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));

    // Verify webhook signature (optional but recommended)
    const signature = req.headers['x-webhook-signature'];
    
    if (signature) {
      // Add webhook signature verification logic here
      // This ensures the webhook is actually from Cashfree
      console.log('Webhook signature:', signature);
    }

    const { event, data } = req.body;

    // Handle different webhook events
    switch (event) {
      case 'ORDER_PAID':
        console.log('✅ Payment completed for order:', data.order_id);
        // Update your database - mark order as paid
        // Credit user's wallet
        // Send confirmation email/SMS
        break;

      case 'ORDER_PENDING':
        console.log('⏳ Payment pending for order:', data.order_id);
        // Update order status to pending
        break;

      case 'ORDER_CANCELLED':
        console.log('❌ Order cancelled:', data.order_id);
        // Update order status to cancelled
        // Refund if necessary
        break;

      case 'PAYMENT_FAILED':
        console.log('💥 Payment failed for order:', data.order_id);
        // Update payment status
        // Notify user
        break;

      default:
        console.log('📝 Unhandled webhook event:', event);
    }

    // Acknowledge webhook receipt
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      status: 'processed'
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Still return 200 to prevent Cashfree from retrying
    // Log the error for manual investigation
    res.status(200).json({
      success: false,
      message: 'Webhook processing failed but acknowledged',
      error: error.message
    });
  }
});

module.exports = router;
