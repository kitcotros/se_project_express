const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  validateLogin,
  validateRegister,
} = require("../middlewares/validation");

const {
  createUser,
  loginUser,
  getCurrentUser,
  updateProfile,
} = require("../controllers/users");

router.post("/signin", validateLogin, loginUser);
router.post("/signup", validateRegister, createUser);
router.get("/users/me", auth, getCurrentUser);
router.patch("/users/me", auth, updateProfile);

module.exports = router;
