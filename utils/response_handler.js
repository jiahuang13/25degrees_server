function successRes(res, message = "操作成功", data = null) {
  const response = { message };
  if (data !== null) {
    response.data = data;
  }
  return res.status(200).json(response);
}

function errorRes(res, message = "操作失敗", statusCode = 500) {
  return res.status(statusCode).json({
    message,
  });
}

module.exports = {
  successRes,
  errorRes,
};
