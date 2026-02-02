import dotenv from "dotenv";

dotenv.config();

const deliveryAcceptedEmail = (sellerName, clientName, jobTitle) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #28a745;">🎉 Delivery Accepted!</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Great news, <strong>${sellerName}</strong>! <strong>${clientName}</strong> has accepted your delivery.
        </p>
        <p style="font-size: 16px; margin-bottom: 30px;">
          <strong>Order Title:</strong> ${jobTitle}<br/>
        </p>
        <a href="${process.env.ORIGIN}/seller/earnings" 
          style="display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px;">
          View Earnings
        </a>
        <p style="font-size: 14px; color: #777; margin-top: 30px;">
          The payment for this order will be processed according to our payment schedule.
        </p>
      </div>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2025 Herdoy.dev. All rights reserved.
      </div>
    </div>
  </div>
`;

export default deliveryAcceptedEmail;
