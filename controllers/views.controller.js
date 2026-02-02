import viewsRepository from "../repositories/views.repository.js";
import viewsService from "../services/views.service.js";
import Response from "../utils/Response.js";

const viewsController = {
  incrementProfileViews: async (req, res) => {
    await viewsService.incrementViews(req.body);
    return res.status(200).send("Success");
  },

  getViewsData: async (req, res) => {
    const monthlyViews = await viewsRepository.getViewsByMonth({
      numberOfMonth: req.query.numberOfMonth,
      viewsType: req.query.type,
      subjectId: req.user._id,
    });
    return res.status(200).send(new Response(true, "Success", monthlyViews));
  },
};

export default viewsController;
