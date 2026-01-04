const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const JWT_SECRET = require("../utils/config");

const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const UnauthorizedError = require("../errors/unauthorized-err");

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("No users found"));
      }
      if (err.name === "CastError") {
        return next(
          new BadRequestError("The id string is in an invalid format")
        );
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new BadRequestError("Missing required fields"));
  }

  const firstInitial = name.trim()[0];
  const avatarUrl =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      firstInitial
    )}&background=random&color=fff`;

  return bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({ name, avatar: avatarUrl, email, password: hash })
    )
    .then((user) => {
      const userResponse = user.toObject();
      userResponse.password = undefined;
      return res.status(201).send({ user: userResponse });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError("User with this email already exists"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError({ message: err.message }));
      }
      return next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  const { _id: userId } = req.user;

  User.findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        return next(new NotFoundError("No user found"));
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(
          new BadRequestError("The id string is in an invalid format")
        );
      }
      return next(err);
    });
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { name, avatar } = user;

      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.send({
        user: {
          name,
          avatar,
        },
        token,
      });
    })
    .catch((err) => next(new UnauthorizedError({ message: err.message })));
};

const updateProfile = (req, res, next) => {
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
        return next(new NotFoundError("No user found"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError({ message: err.message }));
      }
      return next(err);
    });
};

module.exports = {
  getUsers,
  createUser,
  getCurrentUser,
  loginUser,
  updateProfile,
};
