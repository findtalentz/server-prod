import dotenv from "dotenv";

dotenv.config();

const referralJoinEmail = (recipientName, referrerName, referralLink) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #1A9395;">👋 Hi ${recipientName},</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          <strong>${referrerName}</strong> has invited you to join Talentz!
        </p>
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="font-size: 16px; margin: 0;">
            Get <strong>$${
              process.env.REFERRAL_BONUS || 50
            }</strong> credit when you sign up and post your first job!
          </p>
        </div>
        <a href="${referralLink}" 
          style="display: inline-block; background-color: #1A9395; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px; margin: 15px 0;">
          Accept Invitation
        </a>
        <p style="font-size: 14px; color: #777; margin-top: 20px;">
          Or copy and paste this link into your browser:<br/>
          <span style="word-break: break-all; color: #1A9395;">
            ${referralLink}
          </span>
        </p>
        <p style="font-size: 16px; margin-top: 30px;">
          Talentz helps you connect with top professionals for your projects.
        </p>
      </div>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p style="margin: 0;">This invitation was sent by ${referrerName} via Talentz</p>
        <p style="margin: 5px 0 0;">&copy; 2025 Talentz. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

export default referralJoinEmail;
