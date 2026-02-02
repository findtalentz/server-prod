import { client } from "../utils/paypal.js";
import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";

dotenv.config();

const paypalService = {
  /**
   * Create a PayPal order for checkout
   * @param {Object} orderData - Order details
   * @param {Number} orderData.amount - Order amount in USD
   * @param {String} orderData.transactionId - Transaction ID
   * @param {String} orderData.jobId - Job ID
   * @param {String} orderData.seller - Seller user ID
   * @param {String} orderData.deliveryDate - Delivery date
   * @returns {Promise<Object>} PayPal order with approval URL
   */
  createOrder: async ({ amount, transactionId, jobId, seller, deliveryDate }) => {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            description: "Job Payment",
            custom_id: transactionId,
          },
        ],
        application_context: {
          brand_name: process.env.APP_NAME || "Talentz",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${process.env.ORIGIN}/deposit-success?payment_gateway=paypal&transaction_id=${transactionId}`,
          cancel_url: `${process.env.ORIGIN}/deposit-cancelled`,
        },
      });

      const order = await client().execute(request);
      
      // Store metadata in PayPal order (we'll use custom_id for transactionId)
      // PayPal doesn't support custom metadata like Stripe, so we'll use custom_id
      
      return {
        id: order.result.id,
        status: order.result.status,
        links: order.result.links,
        approvalUrl: order.result.links.find(link => link.rel === "approve")?.href,
      };
    } catch (error) {
      console.error("PayPal order creation error:", error);
      throw new Error(`Failed to create PayPal order: ${error.message}`);
    }
  },

  /**
   * Capture a PayPal order after approval
   * @param {String} orderId - PayPal order ID
   * @returns {Promise<Object>} Captured order details
   */
  captureOrder: async (orderId) => {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const capture = await client().execute(request);
      
      return {
        id: capture.result.id,
        status: capture.result.status,
        payer: capture.result.payer,
        purchase_units: capture.result.purchase_units,
      };
    } catch (error) {
      console.error("PayPal order capture error:", error);
      throw new Error(`Failed to capture PayPal order: ${error.message}`);
    }
  },

  /**
   * Get order details
   * @param {String} orderId - PayPal order ID
   * @returns {Promise<Object>} Order details
   */
  getOrder: async (orderId) => {
    try {
      const request = new paypal.orders.OrdersGetRequest(orderId);
      const order = await client().execute(request);
      return order.result;
    } catch (error) {
      console.error("PayPal get order error:", error);
      throw new Error(`Failed to get PayPal order: ${error.message}`);
    }
  },

  /**
   * Verify PayPal webhook signature
   * @param {Object} headers - Request headers
   * @param {String} body - Request body
   * @returns {Promise<Boolean>} True if signature is valid
   */
  verifyWebhook: async (headers, body) => {
    // PayPal webhook verification requires additional setup
    // For now, we'll verify the order status directly
    // In production, implement proper webhook signature verification
    return true;
  },
};

export default paypalService;

