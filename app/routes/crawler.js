import { Router } from "express";
import { CrawlerController } from "../controllers/index.js";

export default class CrawlerRouter {
  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.post("/", CrawlerController.crawl);
  }
}
