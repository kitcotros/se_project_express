const ClothingItem = require("../models/clothingItem");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({ message: err.message });
      }
      return res.status(500).send({ message: err.message });
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .populate("owner")
    .populate("likes")
    .then((items) => res.status(200).send(items))
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

const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { imageUrl } = req.body;

    const item = await ClothingItem.findById(itemId);
    if (!item) {
      return res.status(404).send({ message: "Item not found" });
    }
    if (item.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send({ message: "You don't have permission to update this item" });
    }

    const updatedItem = await ClothingItem.findByIdAndUpdate(
      itemId,
      { $set: { imageUrl } },
      { new: true }
    );
    res.status(200).send({ data: updatedItem });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).send({ message: err.message });
    }
    return res.status(500).send({ message: err.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await ClothingItem.findById(itemId);
    if (!item) {
      return res.status(404).send({ message: "Item not found" });
    }
    if (item.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send({ message: "You don't have permission to delete this item" });
    }

    const deletedItem = await ClothingItem.findByIdAndDelete(itemId);
    res.status(200).send({ data: deletedItem });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).send({ message: err.message });
    }
    return res.status(500).send({ message: err.message });
  }
};

module.exports = { createItem, getItems, updateItem, deleteItem };
