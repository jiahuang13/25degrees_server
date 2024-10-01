function successRes(res, message = "操作成功", data = null) {
  return res.json({
    status: 200,
    message,
    data,
  });
}

function errorRes(res, message = "操作失敗", statusCode = 500) {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    error,
  });
}

module.exports = {
  successRes,
  errorRes,
};
