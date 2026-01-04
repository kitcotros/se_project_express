const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const JWT_SECRET = require("../utils/config");

const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const UnauthorizedError = require("../errors/unauthorized-err");
const ForbiddenError = require("../errors/forbidden-err");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("No users found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("The id string is in an invalid format"));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res) => {
  console.log("REQ BODY:", req.body);
  console.log("EMAIL:", req.body.email, typeof req.body.email);

  const { name, avatar, email, password } = req.body;

  if (!name || !email || !password) {
    next(new BadRequestError("Missing required fields"));
  }

  const firstInitial = name.trim()[0];
  const avatarUrl =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      firstInitial
    )}&background=random&color=fff`;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({ name, avatar: avatarUrl, email, password: hash })
    )
    .then((user) => {
      const userResponse = user.toObject();
      userResponse.password = undefined;
      res.status(201).send({ user: userResponse });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        next(new ConflictError("User with this email already exists"));
      } else if (err.name === "ValidationError") {
        next(new BadRequestError({ message: err.message }));
      } else {
        next(err);
      }
    });
  return null;
};

const getCurrentUser = (req, res) => {
  const { _id: userId } = req.user;

  User.findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        next(new NotFoundError("No user found"));
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("The id string is in an invalid format"));
      } else {
        next(err);
      }
    });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { name, avatar } = user;

      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.send({
        user: {
          name,
          avatar,
        },
        token,
      });
    })
    .catch((err) => next(new UnauthorizedError({ message: err.message })));
};

const updateProfile = (req, res) => {
  const { _id } = req.user;
  const filter = { _id };
  const { name, avatar } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (avatar !== undefined) update.avatar = avatar;

  User.findOneAndUpdate(filter, update, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError("No user found"));
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("No user found"));
      }
      if (err.name === "ValidationError") {
        next(new BadRequestError({ message: err.message }));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  loginUser,
  updateProfile,
};
