const logger = require('pino')()
const mqtt = require('./mqtt')
const axios = require('axios')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let last_messsage = ""
function log(message) {
  if (message !== last_messsage) {
    last_messsage = message
    logger.info("   SM | " + message)
  }
}

const pendulums = [
  {id: 1, curr_posx: 100, curr_posy: 200, org_posx: 100, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:100, anchorY:75, r: 255,  g:0,   b:0  },
  {id: 2, curr_posx: 200, curr_posy: 200, org_posx: 200, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:200, anchorY:75, r: 255,  g:255, b:0  },
  {id: 3, curr_posx: 300, curr_posy: 200, org_posx: 300, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:300, anchorY:75, r: 0,    g:255, b:100},
  {id: 4, curr_posx: 400, curr_posy: 200, org_posx: 400, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:400, anchorY:75, r: 100,  g:100, b:255},
  {id: 5, curr_posx: 500, curr_posy: 200, org_posx: 500, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:500, anchorY:75, r: 255,  g:0,   b:255}
]

const gravity = 9.81

class StateMachine {
  constructor() {
      log('Creating')
      this.currentState = 'none'
      //this.interrupted = false
      this.start_data = JSON.parse(JSON.stringify(pendulums[parseInt(process.env.NAME.charAt(process.env.NAME.length - 1))-1]))
      this.curr_data = JSON.parse(JSON.stringify(this.start_data))
      this.theta = -(Math.atan2(this.curr_data.curr_posy - this.curr_data.anchorY, this.curr_data.curr_posx - this.curr_data.anchorX) - (Math.PI/2))
      this.curr_angleVel = 0
  }

  start() {
      log('Starting')
      mqtt.publish(`${process.env.NAME}/animation`, 'idle')
      this.currentState = 'idle'
      this.nextState()
  }

  getAngularAcceleration(theta, r){
    // Calculate the moment of inertia for a solid sphere rotating about an axis at its edge.
    const I = (2/5) * this.curr_data.mass * this.curr_data.radius * this.curr_data.radius;  // assuming unit mass for simplification
    const alpha = (-g * this.curr_data.radius * Math.sin(theta)) / I;
    return alpha
  }

  step(dt) {

    const momentOfInertia = this.curr_data.mass * this.curr_data.string_length * this.curr_data.string_length;
    const torque = -(momentOfInertia) * gravity * Math.sin(this.theta) 
    const angularAcc = torque / momentOfInertia 

    this.curr_angleVel += angularAcc * dt
    this.theta += this.curr_angleVel * dt
    this.curr_data.curr_angoff = this.theta * (180/Math.PI)

    this.curr_data.curr_posx = this.curr_data.anchorX + this.curr_data.string_length * Math.sin(this.theta)
    this.curr_data.curr_posy = this.curr_data.anchorY + this.curr_data.string_length * Math.cos(this.theta)

  }

  areCirclesOverlapping(circleA, circleB) {
    const dx = circleB.x - circleA.x;
    const dy = circleB.y - circleA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < circleA.r + circleB.r;
  }

  async nextState() {
    mqtt.publish(`${process.env.NAME}/State`, this.currentState)
    switch (this.currentState) {
      case 'none':
        break
      case 'idle':
        log('State : idle')
        await sleep(100)
        break
      case 'step':
        //log('State : step')
        if (this.currentState !== 'idle') this.currentState = 'collison_detection'
        this.step(0.01) //because of 10Hz
        mqtt.publish(`${process.env.NAME}/current`, JSON.stringify(this.curr_data))
        break
      case 'collison_detection':
        //log('State : collison_detection')
        const req1 = axios.get('http://backend1:3001/api/get_position')
        const req2 = axios.get('http://backend2:3002/api/get_position')
        const req3 = axios.get('http://backend3:3003/api/get_position')
        const req4 = axios.get('http://backend4:3004/api/get_position')
        const req5 = axios.get('http://backend5:3005/api/get_position')
        const ress = await Promise.all([req1, req2, req3, req4, req5])
        let circles = []
        for (let i = 0; i < ress.length; i++) {
          circles.push({x: ress[i].data.curr_posx, y: ress[i].data.curr_posy, r: ress[i].data.radius*1.3}) //10% more radius
        }

        for (let i = 0; i < circles.length; i++) {
          for (let j = 0; j < circles.length; j++) { 
            if (i !== j){
              if (this.areCirclesOverlapping(circles[i], circles[j])) {
                mqtt.publish(`${process.env.NAME}/collision`, `circle ${i+1} & ${j+1} `)
                mqtt.publish(`pendulum_sim`, 'STOP')
                this.currentState = 'stop'
                break
              }
            }
          }
        }
        if (this.currentState !== 'idle' && this.currentState !== 'stop') this.currentState = 'wait'
        break
      case 'wait':
        //log('State : wait')
        if (this.currentState !== 'idle') this.currentState = 'step'
        await sleep(10) //10Hz
        break
      case 'pause':
        log('State : pause')
        this.currentState = 'idle'
        break;
      case 'restart':
        log('State : restart')
        this.currentState = 'end'
        console.log('State machine restarted.')
        break
      case 'stop':
        log('State : stop')
        await sleep(5000)
        mqtt.publish(`pendulum_sim`, 'RESTART')
      default:
            console.error('Unknown state:', this.currentState)
    }

    this.nextState()
  }

  interrupt() {
    mqtt.publish(`${process.env.NAME}/animation`, 'paused')
    this.currentState = 'idle'
  }

  setStartPositions(start_data) {
    this.interrupt()
    this.start_data = start_data
    this.curr_data = start_data
    this.theta = -(Math.atan2(this.curr_data.curr_posy - this.curr_data.anchorY, this.curr_data.curr_posx - this.curr_data.anchorX) - (Math.PI/2))

    //reset values
    this.curr_angleVel = 0
    this.curr_data.curr_posx = this.curr_data.org_posx
    this.curr_data.curr_posy = this.curr_data.org_posy
    this.curr_data.curr_angoff = this.curr_data.angular_offset
  }

  start_sim(){
    mqtt.publish(`${process.env.NAME}/animation`, 'playing')
    this.currentState = 'step'
  }

  getCurrent() {
    return this.curr_data
  }
  
  restart() {
    mqtt.publish(`${process.env.NAME}/animation`, 'restarted')
    this.currentState = 'restart'
    this.setStartPositions(this.start_data)
  }

  stop() {
    logger.warn("   SM | got STOP")
    mqtt.publish(`${process.env.NAME}/animation`, 'stop')
    this.currentState = 'idle'
  }

}

const machine = new StateMachine()

mqtt.on("connect", () => { 
  mqtt.subscribe("pendulum_sim", (err) => {
    if (err) logger.error(err)
  })
})

mqtt.on("message", async (topic, message) => {
  if (topic === 'pendulum_sim') {
    if (message.toString() === 'STOP') {
      machine.stop()
    }
    if (message.toString() === 'RESTART') {
      machine.restart()
      machine.start_sim() 
    }
  }
})


module.exports = machine