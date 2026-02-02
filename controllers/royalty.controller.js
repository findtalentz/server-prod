import royaltyService from "../services/royalty.service.js";
import Response from "../utils/Response.js";

const royaltyController = {
  royaltyStatusSeller: async (req, res) => {
    const result = await royaltyService.royaltyStatusSeller(req.user._id);
    return res.status(200).send(new Response(true, "Sussess", result));
  },
  royaltyStatusClient: async (req, res) => {
    const result = await royaltyService.royaltyStatusClient(req.user._id);
    return res.status(200).send(new Response(true, "Sussess", result));
  },
};

export default royaltyController;
