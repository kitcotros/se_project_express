const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  createUser,
  loginUser,
  getCurrentUser,
  updateProfile,
} = require("../controllers/users");

router.post("/signin", loginUser);
router.post("/signup", createUser);
router.get("/users/me", auth, getCurrentUser);
router.patch("/users/me", auth, updateProfile);

module.exports = router;
