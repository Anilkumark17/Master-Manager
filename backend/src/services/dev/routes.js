const { Router } = require("express");
const controller = require("./controller");
const { longRunningAi } = require("../../utils/longRunningAiMiddleware");

const router = Router({ mergeParams: true });

router.get("/workspace", controller.getWorkspace);
router.patch("/workspace", controller.patchWorkspace);
router.post("/generate-document", longRunningAi, controller.generateDocument);
router.post(
  "/generate-document-stream",
  longRunningAi,
  controller.generateDocumentStream
);

module.exports = router;
