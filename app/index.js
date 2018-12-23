const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

import { CrawlerRouter } from "./routes/index";

export default class App {
  constructor() {
    this.app = express();
  }

  start(port) {
    this.setMiddlewares();
    this.setRoutes();
    this.app.listen(port, () => {
      console.log(`Puppeteer Api listening on port ${port}`);
    });
  }

  setMiddlewares() {
    this.app.use("/static", express.static(path.join(__dirname, "public")));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  setRoutes() {
    this.app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    this.app.use("/crawler", new CrawlerRouter().router);
  }
}
