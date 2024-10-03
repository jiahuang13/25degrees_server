const express = require("express");
const router = express.Router();
const handler = require("../router_handler/blog");

router
  .get("/api/blog/threeRandom", handler.getThreeRandBlog) //隨機取得三篇文章
  .get("/api/blog/search", handler.searchBlog) // 搜尋文章
  .get("/api/blog/:id", handler.getOneBlog) //取得單篇文章
  .get("/api/blog/", handler.getAllBlog) // 取得所有文章

  .post("/admin/blog", handler.addBlog) // 新增文章
  .delete("/admin/blog/:id", handler.deleteBlog) // 刪除文章
  .patch("/admin/blog", handler.updateBlog); // 更新文章

//將路由對象共享出去
module.exports = router;
