const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT
const routes = require('./routes')
const _ = require('./mqtt') //this is just to get it to start connecting
const state_machine = require('./state_machine')
const logger = require('pino')()

async function bootstrap() {
  logger.info(` MAIN | Starting ${process.env.NAME}`)

  app.use(express.json())

  // Enable CORS for all routes
  app.use(cors());

  app.use('/', routes)

  app.listen(port, () => {
    logger.info(` MAIN | pendulum sim ${process.env.NAME} listening on port ${port}`)
  })

  state_machine.start()
}

bootstrap()

//process.stdin.resume()

async function exitHandler(options, exitCode) {
  if (options.cleanup) {
    logger.info(' MAIN | clean up before quit')
  }
  if (exitCode || exitCode === 0) {
    logger.info(` MAIN | exitCode: ${exitCode}`)
  }
  if (options.exit) {
    logger.info(` MAIN | Stopping ${process.env.NAME}`)
    process.exit()
  }
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGTERM', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));