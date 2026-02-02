import { validateProfileUpdate, validateSignup } from "../models/user.model.js";
import codeRepository from "../repositories/code.repository.js";
import userRepository from "../repositories/user.repository";
import APIError from "../utils/APIError.js";
import generateCode from "../utils/generateCode.js";
import transporter from "../utils/transporter.js";

const userService = {
  createUser: async (userData) => {
    const { error } = validateSignup(userData);
    if (error) throw new APIError(400, error.details[0].message);

    const existingUser = await userRepository.findUserByEmail(userData.email);
    if (existingUser) throw new APIError(409, "User already exists");

    const code = generateCode();
    const user = await userRepository.createUser(userData);

    const verificationCode = await codeRepository.createCode({
      user: user._id,
      code,
      type: "EMAIL_VERIFICATION",
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Verify your email",
      text: "Hello world?",
      html: signupCode(verificationCode.code),
    });

    return user;
  },

  updateUser: async (userId, userData) => {
    const { error } = validateProfileUpdate(userData);
    if (error) throw new APIError(400, error.details[0].message);
    await userRepository.updateUser(userId, userData);
  },
};

export default userService;
