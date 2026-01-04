const ClothingItem = require("../models/clothingItem");

const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const UnauthorizedError = require("../errors/unauthorized-err");
const ForbiddenError = require("../errors/forbidden-err");

module.exports.likeItem = (req, res) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("No item found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError({ message: err.message }));
      } else {
        next(err);
      }
    });

module.exports.dislikeItem = (req, res) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("No item found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError({ message: err.message }));
      } else {
        next(err);
      }
    });
