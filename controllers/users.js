const User = require("../models/user");
const bcrypt = require("bcryptjs");
const JWT_SECRET = require("../utils/config");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(404).send({ message: err.message });
      }
      if (err.name === "CastError") {
        return res.status(400).send({ message: err.message });
      }
      return res.status(500).send({ message: err.message });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!name || !avatar || !email || !password) {
    return res.status(400).send({ message: "All fields are required" });
  }

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(409)
          .send({ message: "User with this email already exists" });
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => {
      if (typeof hash !== "string") return; // already sent response
      return User.create({ name, avatar, email, password: hash });
    })
    .then((user) => {
      if (!user) return;
      user.password = undefined;
      res.status(201).send({ user });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(400).send({ message: err.message });
      }
      return res.status(500).send({ message: err.message });
    });
};

const getCurrentUser = (req, res) => {
  const { _id: userId } = req.user;

  User.findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      user.password = undefined;
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(404).send({ message: err.message });
      }
      if (err.name === "CastError") {
        return res.status(400).send({ message: err.message });
      }
      return res.status(500).send({ message: err.message });
    });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

const updateProfile = (req, res) => {
  const filter = req.user;
  const { name, avatar } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (avatar !== undefined) update.avatar = avatar;

  User.findOneAndUpdate(filter, update, { new: true, runValidators: true })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(404).send({ message: err.message });
      }
      if (err.name === "ValidationError") {
        return res.status(400).send({ message: err.message });
      }
      return res.status(500).send({ message: err.message });
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  loginUser,
  updateProfile,
};
