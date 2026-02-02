import adminService from "../services/admin.service.js";
import Response from "../utils/Response.js";

const adminController = {
  acceptWithdraw: async (req, res) => {
    await adminService.acceptWithdraw(req.body);
    return res.status(200).send(new Response(true, "Accepted"));
  },
};

export default adminController;
