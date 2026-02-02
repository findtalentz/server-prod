import signupCode from "../mails/signupCode.js";
import codeRepository from "../repositories/code.repository.js";
import userRepository from "../repositories/user.repository.js";
import authService from "../services/auth.service.js";
import generateCode from "../utils/generateCode.js";
import Response from "../utils/Response.js";
import transporter from "../utils/transporter.js";

const authController = {
  register: async (req, res) => {
    const token = await authService.register(req.body);
    return res
      .status(201)
      .send(new Response(true, "User registered successfully", token));
  },

  registerAdmin: async (req, res) => {
    const token = await authService.registerAdmin(req.body);
    return res
      .status(201)
      .send(new Response(true, "User registered successfully", token));
  },

  login: async (req, res) => {
    const token = await authService.login(req.body);
    return res
      .status(200)
      .send(new Response(true, "User logged in successfully", token));
  },

  resendCode: async (req, res) => {
    const code = generateCode();
    const newCode = await codeRepository.updateCode(req.user._id, code);

    const user = await userRepository.findUserById(req.user._id);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@findtalentz.com",
      to: user.email,
      subject: "Your Verification Code",
      html: signupCode(newCode.code),
    });

    return res.status(200).send(new Response(true, "Resent verification code"));
  },

  verifyEmail: async (req, res) => {
    const userId = req.user._id;
    const code = req.body.code;
    const checkCode = await codeRepository.getCode(userId, code);

    if (!checkCode) {
      return res
        .status(400)
        .send(new Response(false, "Invalid or expired verification code"));
    }
    const user = await userRepository.verifyUser(userId);
    await codeRepository.deleteCode(checkCode._id);
    const token = user.generateAuthToken();
    return res
      .status(200)
      .send(new Response(true, "Email verified successfully", token));
  },
  bankAccountStatus: async (req, res) => {
    const data = await authService.bankAccountStatus(req.user._id);
    return res.status(200).send(new Response(true, "Success", data));
  },
};

export default authController;
