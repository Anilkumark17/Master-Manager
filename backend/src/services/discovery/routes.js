const { Router } = require("express");
const controller = require("./controller");

const router = Router({ mergeParams: true });

function longRunningAi(req, res, next) {
  req.setTimeout(900000);
  res.setTimeout(900000);
  next();
}

router.get("/workspace", controller.getWorkspace);
router.patch("/workspace", controller.patchWorkspace);
router.post("/brainstorm", longRunningAi, controller.brainstorm);
router.post("/prioritize", longRunningAi, controller.prioritize);
router.post("/validation-plan", longRunningAi, controller.validationPlan);
router.post("/validation-analyze", longRunningAi, controller.validationAnalyze);
router.post("/prd-planning", longRunningAi, controller.prdPlanning);

module.exports = router;
