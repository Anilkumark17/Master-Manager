const { Router } = require("express");
const controller = require("./controller");
const { requireAuth } = require("./middleware");

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", requireAuth, controller.me);

module.exports = router;
