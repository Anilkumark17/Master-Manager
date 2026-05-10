const { Router } = require("express");
const controller = require("./controller");
const { longRunningAi } = require("../../utils/longRunningAiMiddleware");

const router = Router({ mergeParams: true });

router.get("/deliverables", controller.list);
router.post("/generate", longRunningAi, controller.generate);
router.post("/deliverables", controller.create);
router.get("/deliverables/:deliverableId", controller.getOne);
router.patch("/deliverables/:deliverableId", controller.patch);

module.exports = router;
