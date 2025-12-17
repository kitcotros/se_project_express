const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  createItem,
  getItems,
  updateItem,
  deleteItem,
} = require("../controllers/clothingitems");

router.post("/", auth, createItem);
router.get("/", getItems);
router.put("/:itemId", auth, updateItem);
router.delete("/:itemId", auth, deleteItem);

module.exports = router;
