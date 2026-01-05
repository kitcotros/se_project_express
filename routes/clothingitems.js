const router = require("express").Router();
const auth = require("../middlewares/auth");
const { validateCardBody, validateId } = require("../middlewares/validation");

const {
  createItem,
  getItems,
  updateItem,
  deleteItem,
} = require("../controllers/clothingitems");

router.post("/", auth, validateCardBody, createItem);
router.get("/", getItems);
router.put("/:itemId", auth, validateId, updateItem);
router.delete("/:itemId", auth, validateId, deleteItem);

module.exports = router;
