import dotenv from "dotenv";
import referralJoinEmail from "../mails/referralJoinEmail.js";
import { validateReferral } from "../models/referral.model.js";
import referralRepository from "../repositories/referral.repository.js";
import userRepository from "../repositories/user.repository.js";
import APIError from "../utils/APIError.js";
import transporter from "../utils/transporter.js";
dotenv.config();

const referralService = {
  createReferral: async (data) => {
    const { error } = validateReferral(data);
    if (error) throw new APIError(400, error.details[0].message);
    const { referrer, refereeEmail } = data;
    const checkEmail = await userRepository.findUserByEmail(refereeEmail);
    if (checkEmail) throw new APIError(400, "This email is already registered");
    const referral = await referralRepository.createReferral(data);
    const link = `${process.env.ORIGIN}/sign-up?referral=${referral._id}`;
    const user = await userRepository.findUserById(referrer);
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: refereeEmail,
      subject: "We’d love to have you on Talentz!",
      text: "Hello world?",
      html: referralJoinEmail("", `${user.firstName} ${user.lastName}`, link),
    });

    return link;
  },
};

export default referralService;
