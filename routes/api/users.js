const express = require("express");
const router = express.Router();

const authController = require("../../controllers/authController");
const authMiddleware = require("../../middlewares/authMiddleware");
const userMiddleware = require("../../middlewares/userMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/current", authMiddleware.protect, authController.current);
router.post("/logout", authMiddleware.protect, authController.logout);

router.patch(
  "/avatars",
  authMiddleware.protect,
  userMiddleware.uploadUserPhoto,
  authController.updateUser
);

router.get("/verify/:verificationToken", authController.verifyEmail);

router.post("/verify", authController.verifyEmailRepeat);

module.exports = router;
