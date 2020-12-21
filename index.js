const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const run = require("./scraper");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
app.get("/", (req, res) => res.status(200).json({ status: "ok" }));

app.get("/scraper", run.run);

app.listen(port, () => console.log(`app listening on port ${port}!`));
