const logger = require('pino')()
const mqtt = require("mqtt")
const client = mqtt.connect('tcp://mosquitto:1883', {
  clientId: process.env.NAME
})


client.on("connect", () => {
  client.subscribe("presence/#", (err) => {
    if (!err) {
      client.publish(`${process.env.NAME}`, Date().toString())
    }
    if (err) logger.error(err)
  })
})

client.on("message", async (topic, message) => {
  // message is Buffer
  logger.info(` MQTT | on message | topic : '${topic}' | message : '${message.toString()}'`)
})


module.exports = client