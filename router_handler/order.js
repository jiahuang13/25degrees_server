const db = require("../db/index");
const jwt = require("jsonwebtoken");
const config = require("../config");

// 創建訂單
exports.createOrder = async (req, res) => {
  const userId = req.auth.id;
  const { finalList, totalPrice, address_id } = req.body;

  const status = "pending"; // 初始状态为 pending

  // 生成 id 號
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000); // 生成四位随机数
  const orderId = `${timestamp}${randomPart}`;
  // console.log(orderId, userId, totalPrice, status, address_id);

  try {
    // 插入订单主记录
    const orderSql =
      "INSERT INTO orders (id, user_id, total, status, address_id) VALUES (?, ?, ?, ?, ?)";
    const orderResults = await db.query(orderSql, [
      orderId,
      userId,
      totalPrice,
      status,
      address_id,
    ]);
    if (orderResults.affectedRows !== 1) {
      return res.send({ status: 1, message: "生成訂單主紀錄失敗" });
    }

    // 插入订单详情记录
    finalList.forEach(async (item) => {
      const itemSql =
        "INSERT INTO order_items (order_id, product_id, count, price) VALUES (?, ?, ?, ?)";
      const itemResults = await db.query(itemSql, [
        orderId,
        item.id,
        item.count,
        item.price,
      ]);
      if (itemResults.affectedRows !== 1) {
        return res.send({ status: 1, message: "生成訂單詳情失敗" });
      }
    });

    res.json({
      status: 200,
      message: "Order created",
      orderId: orderId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

// 獲取該會員所有訂單
exports.getAllOrdersById = async (req, res) => {
  const userId = req.auth.id;
  try {
    const sql = `SELECT
    orders.id,
    orders.user_id,
    orders.status,
    orders.total,
    orders.created_at,
    order_items.product_id,
    order_items.price,
    order_items.count,
    product.name,
    product.img
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    JOIN product ON order_items.product_id = product.id
    WHERE orders.user_id = ?
    `;
    const results = await db.query(sql, userId);
    if (results.length === 0) {
      return res.send({
        status: 1,
        message: `獲取會員id:${userId} 所有訂單失敗`,
      });
    } else {
      // 聚合訂單再發送
      const ordersAggregation = {};
      results.forEach((detail) => {
        // 如果订单对象中还没有当前订单ID的键，创建一个
        if (!ordersAggregation[detail.id]) {
          ordersAggregation[detail.id] = {
            id: detail.id,
            user_id: detail.user_id,
            status: detail.status,
            total: detail.total,
            created_at: detail.created_at,
            items: [], // 这个数组将存储所有同一订单的订单项
          };
        }

        // 将当前项添加到订单的items数组中
        ordersAggregation[detail.id].items.push({
          id: detail.product_id,
          price: detail.price,
          count: detail.count,
          name: detail.name,
          img: detail.img,
        });
      });

      // 将订单按 created_at 降序排序
      const sortedOrders = Object.values(ordersAggregation).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      res.send({
        status: 200,
        message: `獲取會員id:${userId} 所有訂單成功`,
        data: sortedOrders,
      });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({ error: err.message });
  }
};

// 獲取該會員一筆訂單
exports.getOneOrderById = async (req, res) => {
  const orderId = req.params.id;
  console.log(orderId);

  try {
    const sql = "SELECT * FROM orders WHERE id = ?";
    const results = await db.query(sql, orderId);
    if (results.length !== 1) {
      console.log("獲取單筆訂單錯誤:", results);

      return res.send({ status: 1, message: "獲取單筆訂單失敗" });
    } else {
      res.send({ status: 200, message: "獲取單筆訂單成功", data: results[0] });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 獲取訂單各狀態的數量
exports.getOrderStatusCount = async (req, res) => {
  const userId = req.auth.id; // 假設從 Token 中獲取用戶 ID

  try {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE user_id = ?
      GROUP BY status`;

    const results = await db.query(sql, [userId]);

    // 構造結果物件
    const orderCount = {
      pending: 0,
      paid: 0,
      shipped: 0,
      refunded: 0,
    };

    // 遍歷結果，填充訂單狀態數量
    results.forEach((item) => {
      if (orderCount[item.status] !== undefined) {
        orderCount[item.status] = item.count;
      }
    });

    res.send({
      status: 200,
      message: "獲取訂單狀態數量成功",
      data: orderCount,
    });
  } catch (err) {
    console.error("獲取訂單狀態數量失敗", err);
    res.send({
      status: 500,
      message: "獲取訂單狀態數量失敗",
    });
  }
};
