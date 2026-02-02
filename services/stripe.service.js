import { getUserById, saveStripeAccountId } from "../repositories/user.repo.js";
import stripe from "../utils/stripe.js";

const stripeService = {
  createConnectedAccount: async (userId) => {
    const user = await getUserById(userId);

    if (user.stripeAccountId) {
      return user.stripeAccountId;
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
      },
      business_profile: {
        url: "https://findtalentz.com",
        product_description: "Freelance services through Talentz",
        mcc: "7299",
      },
      settings: {
        payouts: {
          schedule: {
            interval: "manual",
          },
        },
      },
      metadata: {
        user_id: userId,
        platform_user: "freelancer",
      },
    });

    await saveStripeAccountId(userId, account.id);

    return account.id;
  },

  generateOnboardingLink: async (accountId) => {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: process.env.ORIGIN + "/dashboard/seller/earnings",
      return_url: process.env.ORIGIN + "/dashboard/seller/earnings",
      type: "account_onboarding",
    });

    return link.url;
  },
};

export default stripeService;
