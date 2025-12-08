const router = require("express").Router();

const userRouter = require("./users");
const itemRouter = require("./clothingitems");
const likesRouter = require("./likes");

router.use("/users", userRouter);
router.use("/items", itemRouter);
router.use("/items", likesRouter);

module.exports = router;
