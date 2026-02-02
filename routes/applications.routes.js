import express from "express";
import applicationController from "../controllers/application.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, applicationController.createApplication);
router.put("/:id", auth, applicationController.updateApplication);
router.get("/", auth, applicationController.getClientApplications);
router.post("/is-applyed", auth, applicationController.isApplyed);
router.get(
  "/client/:jobId",
  auth,
  applicationController.getClientApplicationsByJob
);
router.get(
  "/seller/:jobId",
  auth,
  applicationController.getSellerApplicationByJob
);

export default router;
