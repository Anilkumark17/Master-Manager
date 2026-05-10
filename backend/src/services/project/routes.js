const { Router } = require("express");
const controller = require("./controller");
const { PROJECT_TYPES } = require("./constants");
const { requireAuth } = require("../auth/middleware");
const { designerRouter } = require("../designer");
const { discoveryRouter } = require("../discovery");
const { prdRouter } = require("../prd");
const { requireProjectAccess } = require("../prd/middleware");

const router = Router();

router.get("/types", requireAuth, (req, res) => {
  res.json({ types: PROJECT_TYPES });
});

router.get("/", requireAuth, controller.list);
router.post("/", requireAuth, controller.create);

router.use(
  "/:projectId/discovery",
  requireAuth,
  requireProjectAccess,
  discoveryRouter
);

router.use(
  "/:projectId/prds",
  requireAuth,
  requireProjectAccess,
  prdRouter
);

router.use(
  "/:projectId/designer",
  requireAuth,
  requireProjectAccess,
  designerRouter
);

router.get("/:id", requireAuth, controller.getOne);
router.patch("/:id", requireAuth, controller.update);
router.delete("/:id", requireAuth, controller.remove);

module.exports = router;
