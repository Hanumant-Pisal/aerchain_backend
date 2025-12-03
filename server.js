const express = require("express");
const cors = require('cors')
require("dotenv").config();
require("./Config/database");
const authRoutes = require("./routes/authRoutes")
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.get("/test", (req, resp) => {
  resp.send("api is working");
});

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
