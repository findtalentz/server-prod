import referralService from "../services/referral.service.js";
import Response from "../utils/Response.js";

const referralController = {
  createReferral: async (req, res) => {
    await referralService.createReferral({
      referrer: req.user._id,
      refereeEmail: req.body.refereeEmail,
    });
    return res.status(201).send(new Response(true, "Referred successfully"));
  },
};

export default referralController;
