const logger = require('pino')()
const mqtt = require("mqtt")
const client = mqtt.connect('tcp://mosquitto:1883', {
  clientId: process.env.NAME
})


client.on("connect", () => {
  client.subscribe("presence/#", (err) => {
    if (!err) {
      client.publish(`presence/${process.env.NAME}`, "Hello mqtt");
    }
  });
});

client.on("message", (topic, message) => {
  // message is Buffer
  logger.info(` MQTT | on message | topic : '${topic}' | message : '${message.toString()}'`)
  //client.end();
});


module.exports = client