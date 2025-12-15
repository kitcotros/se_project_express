const router = require("express").Router();

const userRouter = require("./users");
const itemRouter = require("./clothingitems");
const likesRouter = require("./likes");

router.use("/", userRouter);
router.use("/items", itemRouter);
router.use("/items", likesRouter);

router.use((req, res) => {
  res.status(404).send({ message: "Requested resource not found" });
});

module.exports = router;
