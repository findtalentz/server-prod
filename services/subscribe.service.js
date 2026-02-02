import subscriptionThanksEmail from "../mails/subscribeResponse.js";
import { validateSubscribe } from "../models/subscribe.js";
import subscribeRepository from "../repositories/subscribe.repository.js";
import APIError from "../utils/APIError.js";
import transporter from "../utils/transporter.js";

const subscribeService = {
  subscribe: async (email) => {
    const { error } = validateSubscribe({ email });
    if (error) {
      throw new APIError(400, error.details[0].message);
    }
    const existingSubscriber = await subscribeRepository.findSubscriber(email);
    if (existingSubscriber) {
      throw new APIError(400, "Already Subscribed");
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Thanks for subscribe`,
      html: subscriptionThanksEmail(),
    });
    return await subscribeRepository.subscribe(email);
  },
};

export default subscribeService;
