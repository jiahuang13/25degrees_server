const jwt = require("jsonwebtoken");
const config = require("../config");

// 配置白名單
const whitelist = [
  { path: /^\/(api)(\/.*)?$/, method: "GET" }, // 只允許 GET 跳過
  { path: /register/, method: "POST" },
  { path: /login/, method: "POST" },
  { path: /vCode/, method: "POST" },
];

// 驗證用戶身份及權限 (token + role) 中間件，默認權限為 `0`
exports.verifyAccess = (requiredRole = 0) => {
  return (req, res, next) => {
    // 檢查是否在白名單內
    const inWhitelist = whitelist.some(
      (entry) => entry.path.test(req.path) && req.method === entry.method
    );

    // 如果在白名單內，直接放行
    if (inWhitelist) {
      return next();
    }

    // 獲取 token
    const token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "未提供身份驗證令牌" });
    }

    try {
      // 驗證 JWT 並解碼出用戶信息
      const decoded = jwt.verify(token, config.jwtSecretKey);
      req.auth = decoded; // 存放到 req.auth 以供後續使用

      // 檢查是否有足夠的權限
      if (decoded.role < requiredRole) {
        return res.status(403).json({ message: "權限不足，禁止訪問" });
      }

      // 權限足夠，進入下一個中間件或路由
      next();
    } catch (error) {
      return res.status(401).json({ message: "身份驗證失敗，請重新登入" });
    }
  };
};

