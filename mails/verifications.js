const identityVerificationSuccessEmail = (userName) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #28a745;">✅ Identity Verified Successfully!</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Congratulations, <strong>${userName}</strong>! Your identity verification has been approved.
        </p>
        <p style="font-size: 16px; margin-bottom: 30px;">
          You now have full access to all platform features. Thank you for completing this important security step.
        </p>
        <a href="${process.env.ORIGIN}/dashboard" 
          style="display: inline-block; background-color: #28a745; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px;">
          Go to Dashboard
        </a>
        <p style="font-size: 14px; color: #777; margin-top: 30px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2025 ${process.env.APP_NAME}. All rights reserved.
      </div>
    </div>
  </div>
`;

const identityVerificationRejectedEmail = (userName) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #dc3545;">❌ Identity Verification Rejected</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Dear <strong>${userName}</strong>, your identity verification was not approved.
        </p>
        <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; text-align: left;">
          <p style="font-weight: bold; margin-bottom: 5px;">Reason for rejection:</p>
        </div>
        <p style="font-size: 16px; margin-bottom: 30px;">
          Please review your documents and submit a new verification request.
        </p>
        <a href="${process.env.ORIGIN}/verify-identity" 
          style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px;">
          Resubmit Verification
        </a>
        <p style="font-size: 14px; color: #777; margin-top: 30px;">
          Need help? Contact our support team for assistance.
        </p>
      </div>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2025 ${process.env.APP_NAME}. All rights reserved.
      </div>
    </div>
  </div>
`;

export { identityVerificationRejectedEmail, identityVerificationSuccessEmail };
