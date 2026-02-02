import { client } from "../utils/paypal.js";
import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";
import logger from "../startup/logger.js";

dotenv.config();

const paypalPayoutService = {
  /**
   * Create a PayPal payout to a PayPal account
   * @param {Object} payoutData - Payout details
   * @param {Number} payoutData.amount - Amount in USD
   * @param {String} payoutData.email - PayPal email address
   * @param {String} payoutData.senderItemId - Unique identifier for this payout
   * @returns {Promise<Object>} Payout batch details
   */
  createPayout: async ({ amount, email, senderItemId }) => {
    try {
      // PayPal Payouts API uses a different approach
      // We'll use the PayPal REST API directly via HTTP
      const accessToken = await paypalPayoutService.getAccessToken();
      
      const payoutData = {
        sender_batch_header: {
          sender_batch_id: `PAYOUT_${senderItemId}_${Date.now()}`,
          email_subject: "You have a payout from Talentz",
          email_message: `You have received a payout of $${amount.toFixed(2)} from Talentz.`,
        },
        items: [
          {
            recipient_type: "EMAIL",
            amount: {
              value: amount.toFixed(2),
              currency: "USD",
            },
            receiver: email,
            sender_item_id: senderItemId,
            note: "Withdrawal from Talentz",
            notification_language: "en-US",
          },
        ],
      };

      const response = await fetch(
        `${process.env.PAYPAL_MODE === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"}/v1/payments/payouts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payoutData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        logger.error("PayPal payout error:", result);
        throw new Error(result.message || "Failed to create PayPal payout");
      }

      return {
        batchId: result.batch_header.payout_batch_id,
        batchStatus: result.batch_header.batch_status,
        links: result.links,
      };
    } catch (error) {
      logger.error("PayPal payout creation error:", error);
      throw new Error(`Failed to create PayPal payout: ${error.message}`);
    }
  },

  /**
   * Get PayPal access token for API calls
   * @returns {Promise<String>} Access token
   */
  getAccessToken: async () => {
    try {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const mode = process.env.PAYPAL_MODE || "sandbox";
      const baseUrl =
        mode === "live"
          ? "https://api.paypal.com"
          : "https://api.sandbox.paypal.com";

      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: "grant_type=client_credentials",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || "Failed to get access token");
      }

      return data.access_token;
    } catch (error) {
      logger.error("PayPal access token error:", error);
      throw new Error(`Failed to get PayPal access token: ${error.message}`);
    }
  },

  /**
   * Get payout batch status
   * @param {String} batchId - PayPal payout batch ID
   * @returns {Promise<Object>} Payout batch status
   */
  getPayoutStatus: async (batchId) => {
    try {
      const accessToken = await paypalPayoutService.getAccessToken();
      const mode = process.env.PAYPAL_MODE || "sandbox";
      const baseUrl =
        mode === "live"
          ? "https://api.paypal.com"
          : "https://api.sandbox.paypal.com";

      const response = await fetch(
        `${baseUrl}/v1/payments/payouts/${batchId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to get payout status");
      }

      return {
        batchId: result.batch_header.payout_batch_id,
        batchStatus: result.batch_header.batch_status,
        items: result.items,
      };
    } catch (error) {
      logger.error("PayPal payout status error:", error);
      throw new Error(`Failed to get PayPal payout status: ${error.message}`);
    }
  },
};

export default paypalPayoutService;

