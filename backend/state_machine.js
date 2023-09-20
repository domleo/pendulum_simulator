const logger = require('pino')()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let last_messsage = ""
function log(message) {
  if (message !== last_messsage) {
    last_messsage = message
    //console.log(message)
    logger.info("   SM | " + message)
  }
}

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
      this.currentState = 'idle'
      this.nextState()
  }

  async nextState() {
      switch (this.currentState) {
          case 'none':
            break
          case 'idle':
              log('State : idle')
              await sleep(10)
              break

          case 'step':
              log('State : step')
              this.currentState = 'collison_detection'
              
              break

          case 'collison_detection':
              log('State : collison_detection')
              this.currentState = 'wait'
              break

          case 'wait':
            log('State : wait')
            this.currentState = 'step'
            await sleep(1000)
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
    this.currentState = 'idle'
  }

  setStartPositions(start_data) {
    this.interrupt()
    this.org_data = start_data
    this.start_data = start_data
    this.curr_data = start_data
  }

  start_sim(){
    this.currentState = 'step'
  }

  getCurrent() {
    return this.curr_data
  }
  
  restart() {
    this.currentState = 'restart'
    this.setStartPositions(this.org_data)
  }


}

const machine = new StateMachine();

module.exports = machine