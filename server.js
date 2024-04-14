const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const { init } = require("./socket");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const auth = require("./middleware/auth");
const routes = require("./routes/index");

dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
const io = init(server); // Initialize Socket.IO

app.use(cors());
swaggerDocument.host =
  process.env.API_HOST || "default-host-if-env-var-not-set";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static("public"));
app.use(express.json());

app.use(routes);
app.use("/api/v1", routes);

app.get("/", function (req, res) {
  res.send("Backend is running successfully....");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
