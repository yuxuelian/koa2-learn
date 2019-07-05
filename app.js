const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const pv = require('./src/middleware/koa2-pv')
const m1 = require('./src/middleware/m1')
const m2 = require('./src/middleware/m2')
const m3 = require('./src/middleware/m3')
const mongoose = require('mongoose')
const dbConfig = require('./src/db/config')
const index = require('./src/routes')
const users = require('./src/routes/users')
const session = require('koa-generic-session')
const RedisStore = require('koa-redis')
const redisConfig = require('./src/redis/config')
const Redis = require('ioredis');
// error handler
onerror(app)
app.keys = ['key', 'keys']
// 创建redis客户端
const redisClient = new Redis(redisConfig.host)
// 使用session中间件,并使用redis存储session
app.use(session({
  store: new RedisStore({
    client: redisClient
  }),
  key: 'SessionId',
  prefix: 'RedisPrefix-',
}))
redisClient.set('test1','test1')

mongoose.connect(dbConfig.host, {
  useNewUrlParser: true,
})
const connection = mongoose.connection
connection.on('error', function (e) {
  console.log('出错')
  console.log(e)
})
connection.on('connected', function () {
  console.log('连接 MongoDB 成功')
})
connection.once('open', function (callback) {
  console.log('数据库启动了')
})
// middlewares
app.use(async (ctx, next) => {
  const startTime = new Date().getTime()
  console.log(`-------------------start ${ctx.path}-----------------------`)
  await next()
  const endTime = new Date().getTime()
  console.log(`-------------------end ${ctx.path} 耗时${endTime - startTime}ms-----------------------`)
})
app.use(pv())
app.use(m3())
app.use(m1())
app.use(m2())
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
// 静态资源
app.use(require('koa-static')(__dirname + '/public'))
// 模板引擎
app.use(views(__dirname + '/src/views', {
  extension: 'ejs'
}))
// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
module.exports = app
