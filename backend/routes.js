const express = require('express')
const router = express.Router()
const state_machine = require('./state_machine')
const mqtt = require('./mqtt')
const logger = require('pino')()

router.get('/', (req, res) => {
  logger.info(`ROUTE | get | /`)
  res.send(`Hello from ${process.env.NAME}!`)
})

router.post('/api/set_starting', (req, res) => {
  logger.info(`ROUTE | post | /api/set_starting | data: ${JSON.stringify(req.body)}`)
  state_machine.setStartPositions(req.body)
  res.json({})
})

router.get('/api/get_position', (req, res) => {
  //logger.info(`ROUTE | get | /api/get_position`)
  res.send(state_machine.getCurrent())
})

router.post('/api/start', (req, res) => {
  logger.info(`ROUTE | post | /api/start`)
  state_machine.start_sim()
  res.json({})
})

router.post('/api/pause', (req, res) => {
  logger.info(`ROUTE | post | /api/pause`)
  state_machine.interrupt()
  res.json({})
})

router.post('/api/reset', (req, res) => {
  logger.info(`ROUTE | post | /api/reset`)
  state_machine.restart()
  res.json({})
})


// get a test
router.get('/mqtt/publish', (req, res) => {
  logger.info(`ROUTE | get | /mqtt/publish`)
  mqtt.publish('test', JSON.stringify(Date.now()))
  res.send(`${Date.now()}`)
})

module.exports = router
