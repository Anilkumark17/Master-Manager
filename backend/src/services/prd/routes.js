const { Router } = require("express");
const controller = require("./controller");
const { longRunningAi } = require("../../utils/longRunningAiMiddleware");

const router = Router({ mergeParams: true });

router.get("/", controller.list);
router.post("/generate", longRunningAi, controller.generate);
router.post(
  "/strategic-rollout",
  longRunningAi,
  controller.strategicRollout
);
router.post("/", controller.create);
router.patch("/:prdId", controller.patch);
router.get("/:prdId", controller.getOne);

module.exports = router;
