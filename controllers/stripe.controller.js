import stripeService from "../services/stripe.service.js";

const stripeController = {
  connectBankAccount: async (req, res) => {
    try {
      const userId = req.user._id;

      const accountId = await stripeService.createConnectedAccount(userId);
      const onboardingUrl = await stripeService.generateOnboardingLink(
        accountId
      );

      res.json({
        success: true,
        url: onboardingUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

export default stripeController;
