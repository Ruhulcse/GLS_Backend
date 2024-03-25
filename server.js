const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const auth = require("./middleware/auth");
const routes = require("./routes/index");

dotenv.config();
connectDB();
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(routes);
app.use("/api", auth.protect);

app.get("/", function (req, res) {
  res.send("Backend is running successfully....");
});

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `server is running in ${process.env.NODE_ENV} mode  on port ${PORT}`
  )
);
