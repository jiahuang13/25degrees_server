const express = require("express");
const router = express.Router();
const blogHandler = require("../router_handler/blog");

router
  .get("/api/blog/threeRandom", blogHandler.getThreeRandBlog) //隨機取得三篇文章
  .get("/api/blog/search", blogHandler.searchBlog) // 搜尋文章
  .get("/api/blog/:id", blogHandler.getOneBlog) //取得單篇文章
  .get("/api/blog/", blogHandler.getAllBlog) // 取得所有文章

  .post("/admin/blog", blogHandler.addBlog) // 新增文章
  .delete("/admin/blog/:id", blogHandler.deleteBlog) // 刪除文章
  .patch("/admin/blog", blogHandler.updateBlog); // 更新文章

//將路由對象共享出去
module.exports = router;
