require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errors } = require("celebrate");
const mainRouter = require("./routes/index");
const User = require("./models/user");
const errorHandler = require("./middlewares/error-handler");

const app = express();
const { PORT = 3001 } = process.env;

const { requestLogger, errorLogger } = require("./middlewares/logger");

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB");
    User.createIndexes();
  })
  .catch(console.error);

app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use("/", mainRouter);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
