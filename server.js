const express = require("express");
const cors = require('cors')
require("dotenv").config();
require("./Config/database");
const authRoutes = require("./routes/authRoutes")
const vendorRoutes = require("./routes/vendorRoutes")
const rfpRoutes = require("./routes/rfpRoutes")
const proposalRoutes = require("./routes/proposalRoutes")
const errorMiddleware = require("./middlewares/errorMiddleware");
// const morgan = require("morgan");
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/rfps", rfpRoutes);
app.use("/api/proposals", proposalRoutes);

app.get("/test", (req, resp) => {
  resp.send("api is working");
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
