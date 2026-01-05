const ClothingItem = require("../models/clothingItem");

const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");

module.exports.likeItem = (req, res, next) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("No item found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError({ message: err.message }));
      }
      return next(err);
    });

module.exports.dislikeItem = (req, res, next) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("No item found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError({ message: err.message }));
      }
      return next(err);
    });
