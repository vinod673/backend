const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Initialize Cashfree - Using direct API calls instead of SDK
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

// Determine environment (default to SANDBOX for testing)
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'SANDBOX'; // Set to 'PRODUCTION' when going live
const CASHFREE_API_URL = CASHFREE_ENV === 'PRODUCTION' 
  ? 'https://api.cashfree.com' 
  : 'https://sandbox.cashfree.com';

console.log('💰 Cashfree Environment:', CASHFREE_ENV);
console.log('🔗 API URL:', CASHFREE_API_URL);

// Create auth token for Cashfree API (NOT using Basic Auth)
// Cashfree uses x-client-id and x-client-secret headers

// Test API credentials helper
const testCredentials = async () => {
  try {
    console.log('🔍 Testing Cashfree credentials...');
    console.log('App ID:', APP_ID);
    console.log('Secret Key starts with:', SECRET_KEY?.substring(0, 15) + '...');
    
    // Try to fetch app status using correct headers
    const response = await axios.get(
      `${CASHFREE_API_URL}/pg/orders/ORDER_TEST_123`,
      {
        headers: {
          'Accept': 'application/json',
          'x-api-version': '2023-08-01',  // Valid API version
          'x-client-id': APP_ID,
          'x-client-secret': SECRET_KEY
        }
      }
    );
    console.log('✅ Credentials valid! App status:', response.data);
    return true;
  } catch (error) {
    // 404 is expected for test order, we just want to verify auth
    if (error.response?.status === 404) {
      console.log('✅ Credentials are valid! (Order not found is expected for test)');
      return true;
    }
    console.error('❌ Invalid credentials:', error.response?.status, error.response?.data);
    return false;
  }
};

/**
 * Create Payment Order
 * POST /api/payment/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, userId, userEmail, userName } = req.body;

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
    const orderId = `ORDER_${userId}_${Date.now()}`;

    // Get or generate phone number (must be valid 10-digit Indian number)
    let customerPhone = '+91';
    if (userEmail && userEmail.includes('@')) {
      // Try to extract/generate a consistent phone from email
      const hash = userEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const phoneDigits = 6000000000 + (hash % 3000000000); // Generate consistent 10-digit number
      customerPhone += phoneDigits;
    } else {
      // Fallback random number
      customerPhone += (6000000000 + Math.floor(Math.random() * 3000000000));
    }

    // Ensure HTTPS URLs for Cashfree (required for production, localhost OK for sandbox)
    const isSandbox = CASHFREE_ENV === 'SANDBOX';
    
    // Use environment-specific URLs - critical for Vercel deployment
    const frontendUrl = process.env.FRONTEND_URL || (isSandbox ? 'http://localhost:3000' : 'https://your-app.vercel.app');
    const backendUrl = process.env.BACKEND_URL || (isSandbox ? 'http://localhost:5000' : 'https://your-backend-url.com');
    
    // For webhooks in production, you need a publicly accessible URL
    // Options: ngrok for testing, or deploy backend to Railway/Render/Vercel
    const webhookUrl = isSandbox 
      ? `${backendUrl}/api/payment/webhook`
      : `${backendUrl}/api/payment/webhook`; // Update with actual production URL

    // Create order request
    const request = {
      "order_amount": parseFloat(amount),
      "order_currency": "INR",
      "order_id": orderId,
      "customer_details": {
        "customer_id": userId,
        "customer_phone": customerPhone,
        "customer_name": userName || "User",
        "customer_email": userEmail || "user@example.com"
      },
      "order_meta": {
        "return_url": `${frontendUrl}/wallet?order_id={order_id}`, // Redirects back to wallet after payment
        "notify_webhook": webhookUrl, // Webhook URL for async notifications
        "payment_methods": "cc,dc,upi,nb"
      },
      "order_note": `Wallet deposit of ₹${amount}`
    };

    console.log('Creating Cashfree order:', request);
    console.log('User details received:', { userId, userEmail, userName });

    console.log('📤 Sending request to:', `${CASHFREE_API_URL}/pg/orders`);
    console.log('📝 Request data:', JSON.stringify(request, null, 2));

    // Make direct API call to Cashfree using CORRECT endpoint and headers
    const response = await axios.post(
      `${CASHFREE_API_URL}/pg/orders`,  // Correct production endpoint
      request,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',  // Valid API version
          'x-client-id': APP_ID,  // Cashfree uses these headers
          'x-client-secret': SECRET_KEY
        }
      }
    );

    console.log('Cashfree order created:', JSON.stringify(response.data, null, 2));
    
    // Log the exact response structure for debugging
    console.log('Payment link field:', response.data.payment_link);
    console.log('Pay URL field:', response.data.pay_url);
    console.log('Payment session ID:', response.data.payment_session_id);
    console.log('Order ID in response:', response.data.order_id);
    
    // ALWAYS use manually constructed URL (more reliable than Cashfree's payment_link)
    // This prevents "Invalid Session ID" errors from malformed URLs
    const paymentSessionId = response.data.payment_session_id;
    
    if (response.data && paymentSessionId) {
      // Construct clean URL manually - this is the MOST RELIABLE method
      const payUrl = `https://sandbox.cashfree.com/checkout?order_id=${orderId}&session_id=${paymentSessionId}`;
      console.log('✅ Payment URL constructed:', payUrl);
      console.log('🔑 Session ID:', paymentSessionId);
      res.json({
        success: true,
        orderId: orderId,
        paymentSessionId: paymentSessionId,
        payUrl: payUrl,
        amount: amount,
        message: 'Order created successfully'
      });
    } else {
      console.error('No payment session ID in response:', response.data);
      throw new Error('Failed to create order with Cashfree - No payment session received');
    }

  } catch (error) {
    console.error('Error creating payment order:', error);
    console.error('Full error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create payment order';
    
    if (error.response?.status === 401) {
      errorMessage = 'Authentication failed - Invalid Cashfree credentials';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access forbidden - Check your Cashfree API keys and environment';
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid request - ' + (error.response?.data?.message || 'Please check the amount and user details');
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to Cashfree - Please check your internet connection';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message || error
    });
  }
});

/**
 * Verify Payment Status
 * GET /api/payment/verify/:orderId
 */
router.get('/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('Verifying payment for order:', orderId);

    console.log('🔍 Verifying payment:', `${CASHFREE_API_URL}/pg/orders/${orderId}/payments`);

    // Make direct API call to Cashfree using correct endpoint and headers
    const response = await axios.get(
      `${CASHFREE_API_URL}/pg/orders/${orderId}/payments`,
      {
        headers: {
          'Accept': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': APP_ID,
          'x-client-secret': SECRET_KEY
        }
      }
    );

    console.log('Payment verification response:', response.data);

    if (!response.data || !response.data.order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderData = response.data.order;
    
    // Extract payment details
    const payments = orderData.payments || [];
    const totalPaid = payments.reduce((sum, payment) => {
      return payment.payment_status === 'SUCCESS' ? sum + parseFloat(payment.payment_amount) : sum;
    }, 0);

    const successfulPayments = payments.filter(p => p.payment_status === 'SUCCESS');
    
    res.json({
      success: true,
      orderId: orderId,
      orderAmount: orderData.order_amount,
      paidAmount: totalPaid,
      paymentCount: successfulPayments.length,
      payments: successfulPayments,
      orderStatus: orderData.order_status,
      message: successfulPayments.length > 0 ? 'Payment successful' : 'Payment pending'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message || error
    });
  }
});

/**
 * Webhook Handler - Cashfree will call this endpoint
 * POST /api/payment/webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));

    const webhookData = req.body;

    // Verify webhook signature (optional but recommended for production)
    // const signature = req.headers['x-cashfree-signature'];
    // Verify signature here...

    // Process webhook based on event type
    switch (webhookData.event) {
      case 'ORDER_PAID':
      case 'PAYMENT_SUCCESS':
        console.log('✅ Payment successful:', webhookData.data);
        
        // Update transaction in database
        await handleSuccessfulPayment(webhookData.data);
        break;

      case 'PAYMENT_FAILED':
        console.log('❌ Payment failed:', webhookData.data);
        
        // Mark transaction as failed
        await handleFailedPayment(webhookData.data);
        break;

      case 'PAYMENT_PENDING':
        console.log('⏳ Payment pending:', webhookData.data);
        break;

      default:
        console.log('ℹ️ Webhook event:', webhookData.event);
    }

    // Acknowledge webhook
    res.status(200).json({
      success: true,
      message: 'Webhook received'
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

/**
 * Handle Successful Payment
 */
async function handleSuccessfulPayment(paymentData) {
  try {
    const { supabase } = require('../config/database');

    const orderId = paymentData.order_id;
    const userId = paymentData.customer_details?.customer_id;
    const amount = parseFloat(paymentData.payment_amount || paymentData.order_amount);

    console.log(`Processing successful payment: Order ${orderId}, User ${userId}, Amount $${amount}`);

    // Check if transaction already exists
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('metadata->>cashfree_order_id', orderId)
      .single();

    if (existingTx) {
      console.log('Transaction already exists:', existingTx.id);
      return;
    }

    // Create transaction record
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        type: 'deposit',
        amount: amount,
        status: 'completed',
        description: `Deposit via Cashfree (Order: ${orderId})`,
        metadata: {
          payment_method: 'cashfree',
          cashfree_order_id: orderId,
          payment_id: paymentData.payment_id,
          payment_mode: paymentData.payment_mode,
          payment_time: paymentData.payment_time || new Date().toISOString(),
          timestamp: new Date().toISOString()
        }
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    console.log('✅ Transaction created successfully:', transaction.id);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

/**
 * Handle Failed Payment
 */
async function handleFailedPayment(paymentData) {
  try {
    const { supabase } = require('../config/database');

    const orderId = paymentData.order_id;
    const userId = paymentData.customer_details?.customer_id;
    const amount = parseFloat(paymentData.payment_amount || paymentData.order_amount);

    console.log(`Processing failed payment: Order ${orderId}, User ${userId}, Amount $${amount}`);

    // Create failed transaction record
    const { error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        type: 'deposit',
        amount: amount,
        status: 'failed',
        description: `Failed deposit via Cashfree (Order: ${orderId})`,
        metadata: {
          payment_method: 'cashfree',
          cashfree_order_id: orderId,
          payment_id: paymentData.payment_id,
          failure_reason: paymentData.failure_reason || 'Payment failed',
          payment_time: paymentData.payment_time || new Date().toISOString(),
          timestamp: new Date().toISOString()
        }
      }]);

    if (error) {
      console.error('Error creating failed transaction:', error);
    }

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

module.exports = router;
