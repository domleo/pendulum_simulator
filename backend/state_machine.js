const logger = require('pino')()
const mqtt = require('./mqtt')

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

const g = 9.81

class StateMachine {
  constructor() {
      log('Creating')
      this.currentState = 'none'
      //this.interrupted = false
      this.start_data = {}
      this.curr_data = {}
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

    // Using simple Euler's method for integration
    const alpha = this.getAngularAcceleration(this.theta) //-(g / this.curr_data.string_length) * this.theta; // Angular acceleration
    this.theta += this.omega * dt;
    this.omega += alpha * dt;

    // Convert polar to Cartesian coordinates
    this.curr_data.curr_posx = this.curr_data.anchorX + this.curr_data.string_length * Math.sin(this.theta);
    this.curr_data.curr_posy = this.curr_data.anchorY + this.curr_data.string_length * Math.cos(this.theta);
    this.curr_data.curr_angoff = this.theta
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
        this.currentState = 'collison_detection'
        this.step(0.01) //because of 10Hz
        //log(JSON.stringify(this.curr_data))
        mqtt.publish(`${process.env.NAME}/current`, JSON.stringify(this.curr_data))
        break
      case 'collison_detection':
        //log('State : collison_detection')
        this.currentState = 'wait'
        break
      case 'wait':
        //log('State : wait')
        this.currentState = 'step'
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
    //this.org_data = start_data
    this.start_data = start_data
    this.curr_data = start_data
    this.theta = Math.atan2(this.curr_data.curr_posy - this.curr_data.anchorY, this.curr_data.curr_posx - this.curr_data.anchorX);
    this.omega = 0;  // Initial angular velocity
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


}

const machine = new StateMachine()

module.exports = machine