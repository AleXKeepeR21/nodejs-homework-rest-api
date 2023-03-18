const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = require("./app");

dotenv.config({ path: "./.env" });

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

mongoose
  .connect(MONGO_URL || "mongodb://127.0.0.1:27017/db-contacts")
  .then((connection) => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
