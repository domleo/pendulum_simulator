const express = require('express')
const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send(`Hello from ${process.env.NAME}!`)
})

app.listen(port, () => {
  console.log(`pendulum sim backend listening on port ${port}`)
})