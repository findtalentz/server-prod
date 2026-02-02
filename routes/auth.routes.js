import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import authController from "../controllers/auth.controller.js";
import passwordResetCode from "../mails/passwordResetCode.js";
import signupCode from "../mails/signupCode.js";
import auth from "../middlewares/auth.js";
import { Code } from "../models/code.model.js";
import { User, validatePasswordChange } from "../models/user.model.js";
import generateCode from "../utils/generateCode.js";
import { compareHash } from "../utils/hash.js";
import Response from "../utils/Response.js";
import transporter from "../utils/transporter.js";
dotenv.config();

const router = express.Router();

router.post("/sign-up", authController.register);
router.post("/sign-up/admin", authController.registerAdmin);
router.post("/log-in", authController.login);
router.post("/verify-email", auth, authController.verifyEmail);

router.post("/resend", auth, authController.resendCode);
router.get("/bank/status", auth, authController.bankAccountStatus);

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.status(404).send("User not found");
  }

  res.status(200).send(new Response(true, "Success", user));
});

router.post("/check-email", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .send(new Response(false, "No account found with this email"));
  }

  const code = generateCode();

  await Code.findOneAndUpdate(
    { email },
    { code, createdAt: new Date() },
    { upsert: true, new: true }
  );

  // Send email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your Password Reset Code",
    html: passwordResetCode(code),
  });

  return res.json(new Response(true, "Verification code sent", user.email));
});

router.post("/verify-code", async (req, res) => {
  const { code, email } = req.body;

  const verifyCode = await Code.findOne({ email, code });
  if (!verifyCode) {
    return res
      .status(404)
      .send(new Response(false, "Invalid Verification Code"));
  }

  return res.json(
    new Response(true, "Verification code sent", verifyCode.code)
  );
});

router.post("/new-password", async (req, res) => {
  const { code, email, newPassword } = req.body;

  // Find and verify the verification code
  const verifyCode = await Code.findOne({ email, code });
  if (!verifyCode) {
    return res
      .status(400)
      .send(new Response(false, "Invalid verification code"));
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send(new Response(false, "User not found"));
  }

  // Update user password
  user.password = newPassword;
  await user.save();

  // Delete used verification code
  await Code.deleteOne({ _id: verifyCode._id });

  return res
    .status(200)
    .send(new Response(true, "Password changed successfully"));
});

router.post("/change-password", auth, async (req, res) => {
  try {
    // Validate request body
    const { error } = validatePasswordChange(req.body);
    if (error) {
      return res
        .status(400)
        .send(new Response(false, error.details[0].message));
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send(new Response(false, "User not found"));
    }

    // Verify current password
    const isPasswordValid = await compareHash(currentPassword, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .send(new Response(false, "Current password is incorrect"));
    }

    // Check if new password is different
    if (currentPassword === newPassword) {
      return res
        .status(400)
        .send(
          new Response(
            false,
            "New password must be different from current password"
          )
        );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send success response
    return res
      .status(200)
      .send(new Response(true, "Password changed successfully"));
  } catch (error) {
    return res.status(500).send(new Response(false, "Internal server error"));
  }
});

router.post("/set-seller", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role: "SELLER" },
    { new: true }
  );
  const token = user.generateAuthToken();
  return res.status(200).json(new Response(true, "Login success", token));
});

router.post("/set-client", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role: "CLIENT" },
    { new: true }
  );
  const token = user.generateAuthToken();
  return res.status(200).json(new Response(true, "Login success", token));
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.redirect(`${process.env.ORIGIN}?token=${req.user.token}`);
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    res.redirect(`${process.env.ORIGIN}?token=${req.user.token}`);
  }
);

export default router;
