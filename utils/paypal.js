import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";

dotenv.config();

// PayPal environment configuration
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || "sandbox"; // 'sandbox' or 'live'

  if (mode === "live") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

// PayPal client
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export { client, environment };

