const { Router } = require("express");
const controller = require("./controller");

const router = Router({ mergeParams: true });

function longRunningAi(req, res, next) {
  req.setTimeout(900000);
  res.setTimeout(900000);
  next();
}

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
