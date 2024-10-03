const db = require("../db/index");
const { successRes, errorRes } = require("../utils/response_handler");

// items(id, count, price), totalprice
// 創建訂單
exports.createOrder = async (req, res) => {
  const userId = req.auth.id;
  const { finalList, totalPrice, address_id } = req.body;

  const status = "pending"; // 訂單初始狀態為 pending
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000); // 生成四位隨機數
  const orderId = `${timestamp}${randomPart}`; // 生成訂單ID

  try {
    // 插入訂單主記錄
    const orderSql =
      "INSERT INTO orders (id, user_id, total, status, address_id) VALUES (?, ?, ?, ?, ?)";
    const [orderResults] = await db.query(orderSql, [
      orderId,
      userId,
      totalPrice,
      status,
      address_id,
    ]);

    if (orderResults.affectedRows !== 1) {
      return errorRes(res, "生成訂單主記錄失敗");
    }

    // 插入訂單詳細記錄
    const itemSql =
      "INSERT INTO order_items (order_id, product_id, count, price) VALUES ?";
    const orderItemsData = finalList.map((item) => [
      orderId,
      item.id,
      item.count,
      item.price,
    ]);
    const [itemResults] = await db.query(itemSql, [orderItemsData]); // 插入多筆資料使用批量插入
    if (itemResults.affectedRows !== finalList.length) {
      return errorRes(res, "生成訂單詳細記錄失敗");
    }

    return successRes(res, "訂單創建成功", { orderId });
  } catch (err) {
    console.error(err);
    return errorRes(res, err.message);
  }
};

// 取得該會員所有訂單
exports.getAllOrdersById = async (req, res) => {
  const userId = req.auth.id;
  try {
    const sql = `
      SELECT
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
      ORDER BY orders.created_at DESC`;

    const [results] = await db.query(sql, [userId]);

    if (results.length === 0) {
      return successRes(res, `會員ID: ${userId} 目前沒有訂單`, []);
    }

    // 聚合訂單數據
    const ordersAggregation = results.reduce((acc, detail) => {
      if (!acc[detail.id]) {
        acc[detail.id] = {
          id: detail.id,
          user_id: detail.user_id,
          status: detail.status,
          total: detail.total,
          created_at: detail.created_at,
          items: [],
        };
      }
      acc[detail.id].items.push({
        id: detail.product_id,
        price: detail.price,
        count: detail.count,
        name: detail.name,
        img: detail.img,
      });
      return acc;
    }, {});

    // 返回排序後的訂單資料
    return successRes(
      res,
      `會員ID: ${userId} 的所有訂單取得成功`,
      Object.values(ordersAggregation)
    );
  } catch (err) {
    console.error(err);
    return errorRes(res, err.message);
  }
};

// 取得會員的一筆訂單
exports.getOneOrderById = async (req, res) => {
  const orderId = req.params.id;

  try {
    const sql = "SELECT * FROM orders WHERE id = ?";
    const [results] = await db.query(sql, [orderId]);

    if (results.length !== 1) {
      return errorRes(res, "無法取得指定訂單", 404);
    }

    return successRes(res, "單筆訂單取得成功", results[0]);
  } catch (err) {
    console.error(err);
    return errorRes(res, err.message);
  }
};

// 取得訂單各狀態的數量
exports.getOrderStatusCount = async (req, res) => {
  const userId = req.auth.id;

  try {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE user_id = ?
      GROUP BY status`;

    const [results] = await db.query(sql, [userId]);

    // 預設訂單狀態數量
    const orderCount = {
      pending: 0,
      paid: 0,
      shipped: 0,
      refunded: 0,
    };

    // 根據查詢結果更新訂單狀態數量
    results.forEach((item) => {
      if (orderCount[item.status] !== undefined) {
        orderCount[item.status] = item.count;
      }
    });

    return successRes(res, "訂單狀態數量取得成功", orderCount);
  } catch (err) {
    console.error(err);
    return errorRes(res, "訂單狀態數量取得失敗");
  }
};
