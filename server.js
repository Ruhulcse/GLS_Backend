const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const auth = require("./middleware/auth");
const routes = require("./routes/index");

const corsOptions = {
  origin: "*", // Replace with your UI's origin in production, for security
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

dotenv.config();
connectDB();
const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static("public"));
app.use(express.json());
app.use(cors(corsOptions));
app.use(routes);
app.use("/api/v1", routes);

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
