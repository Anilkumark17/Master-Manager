const { Router } = require("express");
const controller = require("./controller");

const router = Router({ mergeParams: true });

function longRunningAi(req, res, next) {
  req.setTimeout(900000);
  res.setTimeout(900000);
  next();
}

router.get("/deliverables", controller.list);
router.post("/generate", longRunningAi, controller.generate);
router.post("/deliverables", controller.create);
router.get("/deliverables/:deliverableId", controller.getOne);
router.patch("/deliverables/:deliverableId", controller.patch);

module.exports = router;
