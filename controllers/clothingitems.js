const ClothingItem = require("../models/clothingItem");

const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const UnauthorizedError = require("../errors/unauthorized-err");
const ForbiddenError = require("../errors/forbidden-err");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError({ message: err.message }));
      } else {
        next(err);
      }
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .populate("owner")
    .populate("likes")
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("No items found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError({ message: err.message }));
      } else {
        next(err);
      }
    });
};

const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { imageUrl } = req.body;

    const item = await ClothingItem.findById(itemId);
    if (!item) {
      next(new NotFoundError("Item not found"));
    }
    if (item.owner.toString() !== req.user._id.toString()) {
      next(new ForbiddenError("You don't have permission to update this item"));
    }

    const updatedItem = await ClothingItem.findByIdAndUpdate(
      itemId,
      { $set: { imageUrl } },
      { new: true }
    );
    return res.status(200).send({ data: updatedItem });
  } catch (err) {
    if (err.name === "CastError") {
      next(new BadRequestError({ message: err.message }));
    } else {
      next(err);
    }
  }
};

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await ClothingItem.findById(itemId);
    if (!item) {
      next(new NotFoundError("Item not found"));
    }
    if (item.owner.toString() !== req.user._id.toString()) {
      next(new ForbiddenError("You don't have permission to delete this item"));
    }

    const deletedItem = await ClothingItem.findByIdAndDelete(itemId);
    return res.status(200).send({ data: deletedItem });
  } catch (err) {
    if (err.name === "CastError") {
      next(new BadRequestError({ message: err.message }));
    } else {
      next(err);
    }
  }
};

module.exports = { createItem, getItems, updateItem, deleteItem };
