const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The name field is required."],
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must enter a valid url.",
    },
  },
  email: {
    type: String,
    required: [true, "The email field is required."],
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "You must enter a valid email.",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "The password field is required."],
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select(`+password`)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Incorrect email or password."));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error(`Incorrect email or password.`));
        }

        return user;
      });
    });
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    return ret;
  },
});

module.exports = mongoose.model("user", userSchema);
