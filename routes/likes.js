const router = require("express").Router();
const { likeItem, dislikeItem } = require("../controllers/likes");
const auth = require("../middlewares/auth");
const { validateId } = require("../middlewares/validation");

router.put("/:itemId/likes", auth, validateId, likeItem);
router.delete("/:itemId/likes", auth, validateId, dislikeItem);

module.exports = router;
