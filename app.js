const express = require('express')
const app = express()
const joi = require('joi')

//導入並配置跨域中間件
const cors = require('cors')
app.use(cors())

//配置解析 x-www-form-urlencoded 表單數據的中間件
app.use(express.urlencoded({extended: false}))

//配置解析 json 表單數據的中間件
app.use(express.json())

//一定要在路由之前配置解析token的中間件 expressJWT().unless({path:})可配置白名單 不需
const {expressjwt: jwt} = require('express-jwt')
const config = require('./config')

const whitelist = [/^\/product\/([^\/]*)$/, /product/, /^\/article\/([^\/]*)$/, /article/, /login/, /register/, /^\/admin\/login$/, /album/, /^\/album\/([^\/]*)$/, /design/, /^\/design\/([^\/]*)$/ ]
app.use(jwt({secret: config.jwtSecretKey,algorithms: ["HS256"]}).unless({path:whitelist}))

//導入路由
const userRouter = require('./router/user')
app.use(userRouter)

// const userInfoRouter = require('./router/userInfo')
// app.use(userInfoRouter)

const articleRouter = require('./router/article')
app.use(articleRouter)

const productRouter = require('./router/product')
app.use(productRouter)

const photoRouter = require('./router/photography')
app.use(photoRouter)

//定義錯誤錯誤級別中間件
app.use((err, req, res, next) => {
  //驗證失敗導致的錯誤
if (err instanceof joi.ValidationError){
 return res.send({
  status:1,
  message: err.message
})
}
//身份認證失敗的錯誤
if(err.name === 'UnauthorizedError'){
  return res.send({
    status:1,
    message: '身份認證失敗'
  })
}
else {
  return res.send({
    status:1,
  message: '未知錯誤'
  })
}
})

app.listen(3007,()=>{
  console.log('server is running at port 3007');
})