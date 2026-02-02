import signupCode from "../mails/signupCode.js";
import {
  validateLogin,
  validateSignup,
  validateSignupAdmin,
} from "../models/user.model.js";
import codeRepository from "../repositories/code.repository.js";
import referralRepository from "../repositories/referral.repository.js";
import userRepository from "../repositories/user.repository.js";
import APIError from "../utils/APIError.js";
import generateCode from "../utils/generateCode.js";
import { compareHash } from "../utils/hash.js";
import stripe from "../utils/stripe.js";
import transporter from "../utils/transporter.js";

const authService = {
  register: async (userData) => {
    const { error } = validateSignup(userData);
    if (error) throw new APIError(400, error.details[0].message);

    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) throw new APIError(409, "User already exists");

    const code = generateCode();
    const user = await userRepository.createUser(userData);

    const isReferred = await referralRepository.findReferralByEmail(user.email);
    if (isReferred) {
      referralRepository.completeReferral(isReferred._id);
    }

    const verificationCode = await codeRepository.createCode({
      user: user._id,
      code,
      type: "EMAIL_VERIFICATION",
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Verify your email",
      html: signupCode(verificationCode.code),
    });

    return user.generateAuthToken();
  },

  registerAdmin: async (userData) => {
    const { error } = validateSignupAdmin(userData);
    if (error) throw new APIError(400, error.details[0].message);
    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) throw new APIError(409, "User already exists");
    const user = await userRepository.createUser(userData);
    return user.generateAuthToken();
  },

  login: async (loginData) => {
    const { error } = validateLogin(loginData);
    if (error) throw new APIError(400, error.details[0].message);

    const { email, password } = loginData;

    const user = await userRepository.findUserByEmail(email);
    if (!user) throw new APIError(401, "Invalid credentials");

    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) throw new APIError(401, "Invalid credentials");

    return user.generateAuthToken();
  },
  getUserBalanceFromStripe: async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new APIError(404, "User not found");

    if (!user.stripeAccountId) return 0;

    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    const availableBalance = balance?.available?.length
      ? balance.available[0].amount
      : 0;

    return availableBalance / 100;
  },

  bankAccountStatus: async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) return [];
    if (!user.stripeAccountId) return [];
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    const data = {
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      verificationStatus: account.details_submitted
        ? account.charges_enabled && account.payouts_enabled
          ? "approved"
          : "pending"
        : "incomplete",
      disabledReason: account.requirements?.disabled_reason || null,
      currentlyDue: account.requirements?.currently_due || [],
      pendingVerification: account.requirements?.pending_verification || [],
      externalAccounts: account.external_accounts?.data || [],
    };
    return data;
  },
};

export default authService;
