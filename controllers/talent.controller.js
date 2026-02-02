import talentService from "../services/talent.service.js";
import Response from "../utils/Response.js";

const talentController = {
  findTalents: async (req, res) => {
    const { talents, totalCount } = await talentService.getTalents(req.query);
    return res
      .status(200)
      .send(new Response(true, "Success", talents, totalCount));
  },
};

export default talentController;
