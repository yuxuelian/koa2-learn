const router = require('koa-router')()
const Person = require('../db/models/person')
router.prefix('/users')
router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})
router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})
router.post('/addPerson', async function (ctx, next) {
  const person = new Person({
    name: ctx.request.body.name,
    age: ctx.request.body.age,
  })
  try {
    await person.save()
    ctx.body = {
      code: 0,
      data: person
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: -1,
      data: null
    }
  }
})
router.get('/getPerson', async function (ctx) {
  const result = await Person.findOne({name: ctx.request.query.name})
  const results = await Person.find({name: ctx.request.query.name})
  ctx.body = {
    code: 0,
    result: result,
    results: results
  }
})
router.post('/updatePerson', async function (ctx) {
  const res = await Person.where({
    name: ctx.request.body.name
  }).update({
    age: ctx.request.body.age
  })
  ctx.body = {
    code: 0,
    data: res
  }
})

router.delete('/deletePerson', async function (ctx) {
  const res = await Person.where({
    name: ctx.request.body.name
  }).deleteMany()
  ctx.body = {
    code: 0,
    data: res
  }
})

module.exports = router
