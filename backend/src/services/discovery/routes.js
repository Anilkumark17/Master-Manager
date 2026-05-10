const { Router } = require("express");
const controller = require("./controller");
const { longRunningAi } = require("../../utils/longRunningAiMiddleware");

const router = Router({ mergeParams: true });

router.get("/workspace", controller.getWorkspace);
router.patch("/workspace", controller.patchWorkspace);
router.post("/brainstorm", longRunningAi, controller.brainstorm);
router.post("/prioritize", longRunningAi, controller.prioritize);
router.post("/validation-plan", longRunningAi, controller.validationPlan);
router.post("/validation-analyze", longRunningAi, controller.validationAnalyze);
router.post("/prd-planning", longRunningAi, controller.prdPlanning);

module.exports = router;
