const ClothingItem = require("../models/clothingItem");

const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const ForbiddenError = require("../errors/forbidden-err");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError({ message: err.message }));
      }
      return next(err);
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .populate("owner")
    .populate("likes")
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("No items found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError({ message: err.message }));
      }
      return next(err);
    });
};

const updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { imageUrl } = req.body;

    const item = await ClothingItem.findById(itemId);
    if (!item) {
      return next(new NotFoundError("Item not found"));
    }
    if (item.owner.toString() !== req.user._id.toString()) {
      return next(
        new ForbiddenError("You don't have permission to update this item")
      );
    }

    const updatedItem = await ClothingItem.findByIdAndUpdate(
      itemId,
      { $set: { imageUrl } },
      { new: true }
    );
    return res.status(200).send({ data: updatedItem });
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError({ message: err.message }));
    }
    return next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const item = await ClothingItem.findById(itemId);
    if (!item) {
      return next(new NotFoundError("Item not found"));
    }
    if (item.owner.toString() !== req.user._id.toString()) {
      return next(
        new ForbiddenError("You don't have permission to delete this item")
      );
    }

    const deletedItem = await ClothingItem.findByIdAndDelete(itemId);
    return res.status(200).send({ data: deletedItem });
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError({ message: err.message }));
    }
    return next(err);
  }
};

module.exports = { createItem, getItems, updateItem, deleteItem };
