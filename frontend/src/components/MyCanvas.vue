<template>
  <div>
    <button @click="play">Play</button>
    <button @click="pause">Pause</button>
    <button @click="reset">Reset</button>
    <div ref="pendulumCanvas"></div>
    <p> Parameters</p>
    <div>Changing any parameter automatically pauses the simulation and update initial value for that pendulum.</div>
    <table>
      <thead>
        <tr>
          <th>Pendulum</th>
          <th>Angular Offset</th>
          <th>Mass</th>
          <th>String Length</th>
          <th>Radius</th>
          <th>X</th>
          <th>Y</th>
          <th>Anchor X</th>
          <th>Anchor Y</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in pendulums" :key="p.id">
          <td>{{p.id}}</td>
          <td><input type="number" :value="p.curr_angoff"     @input="onAngularOffsetChanged($event, p.id)"/></td>
          <td><input type="number" :value="p.mass"            @input="onMassChanged($event, p.id)"/></td>
          <td><input type="number" :value="p.string_length"   @input="onStringLengthChanged($event, p.id)"/></td>
          <td><input type="number" :value="p.radius"          @input="onRadiusChanged($event, p.id)"/></td>
          <td><input type="number" :value="p.curr_posx"       @input="onPosXChanged($event, p.id)"/></td>
          <td><input type="number" :value="p.curr_posy"       @input="onPosYChanged($event, p.id)"/></td>
          <td><input type="number" :value="p.anchorX"         @input="onAnchorXChanged($event, p.id)"/></td>
          <td>{{p.anchorY}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import p5 from 'p5'
import axios from 'axios'
export default {
  data() {
    return {
      interval: null,
      pendulums: [
        {id: 1, dragging: false, curr_posx: 100, curr_posy: 200, org_posx: 100, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:100, anchorY:75, r: 255,  g:0,   b:0  },
        {id: 2, dragging: false, curr_posx: 200, curr_posy: 200, org_posx: 200, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:200, anchorY:75, r: 255,  g:255, b:0  },
        {id: 3, dragging: false, curr_posx: 300, curr_posy: 200, org_posx: 300, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:300, anchorY:75, r: 0,    g:255, b:100},
        {id: 4, dragging: false, curr_posx: 400, curr_posy: 200, org_posx: 400, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:400, anchorY:75, r: 100,  g:100, b:255},
        {id: 5, dragging: false, curr_posx: 500, curr_posy: 200, org_posx: 500, org_posy: 200, angular_offset: 0, curr_angoff: 0, mass: 10, string_length: 125, radius: 20, anchorX:500, anchorY:75, r: 255,  g:0,   b:255}
      ],
      //gravity: 0.4
    }
  },
  mounted() {
    this.setStartPos()
    this.initPendulumSketch(); //start drawing right away
    //this is continuosly get the positions of the pendulums, regardless if the animation is in effect
    this.interval = setInterval(() => {
      //get updated positions from processes
      this.getPos()
    }, 16.7) //16.7 for about 60 fps
  },
  methods: {
    findAnchorPoint(x, y, L) {
      const sin45 = Math.sqrt(2) / 2;
      const cos45 = sin45;

      const x_a = x - L * sin45;
      const y_a = y + L * (1 - cos45);

      return { x: x_a, y: y_a };
    },
    findPendulumCoordinates(x_a, y_a, thetaDegrees, L) {
      //adding 180 degress so the value is relative
      const thetaRadians = ((thetaDegrees+180) * Math.PI) / 180; // Convert degrees to radians

      const x = x_a + L * Math.sin(thetaRadians);
      const y = y_a - L * Math.cos(thetaRadians);

      return { x: x, y: y };
    },
    calculateNewXYwithAngularOffset(id) {
      //find the anchor, since that doesn't change here
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id) {
          const pendulum = this.pendulums[i]
          const newCoor = this.findPendulumCoordinates(pendulum.anchorX, pendulum.anchorY, pendulum.angular_offset, pendulum.string_length)
          pendulum.curr_posx = newCoor.x
          pendulum.org_posx  = newCoor.x
          pendulum.curr_posy = newCoor.y
          pendulum.org_posy  = newCoor.y
          break
        }
      }
      
    },
    onAngularOffsetChanged(event, id){
      this.pause()
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id) {
          this.pendulums[i].angular_offset = event.target.valueAsNumber
          this.calculateNewXYwithAngularOffset(id)
          break
        }
      }
    },
    onMassChanged(event, id) {
      this.pause()
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id) this.pendulums[i].mass = event.target.valueAsNumber
      }
    },
    onStringLengthChanged(event, id) {
      this.pause()
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id) {
          const pendulum = this.pendulums[i]
          pendulum.string_length = event.target.valueAsNumber
          const newCoor = this.findPendulumCoordinates(pendulum.anchorX, pendulum.anchorY, pendulum.angular_offset, pendulum.string_length)
          pendulum.curr_posx = newCoor.x
          pendulum.org_posx  = newCoor.x
          pendulum.curr_posy = newCoor.y
          pendulum.org_posy  = newCoor.y
          break
        }
      }
    },
    onRadiusChanged(event, id) {
      this.pause()
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id) this.pendulums[i].radius = event.target.valueAsNumber
      }
    },
    getDistance(x1, y1, x2, y2) {
      const x = x2 - x1
      const y = y2 - y1
      return Math.sqrt((x*x)+(y*y))
    },
    getAngularOffset(x1, y1, x2, y2) {
      const dx = x2 - x1
      const dy = y2 - y1
      const angleRadians = Math.atan2(dy, dx)
      return (angleRadians * (180 / Math.PI)) - 90.0 //the -90 is to make the angle relative where straight down is zero degrees
    },
    updateXY(id, x, y) {
      console.log('updateXY', id, x, y)
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id) {
          const pendulum = this.pendulums[i]
          if (x){
            pendulum.curr_posx = x
            pendulum.org_posx  = x
          }
          if (y) {
            pendulum.curr_posy = y
            pendulum.org_posy  = y
          }
          pendulum.string_length = this.getDistance(pendulum.anchorX, pendulum.anchorY, pendulum.org_posx, pendulum.org_posy)
          pendulum.angular_offset = this.getAngularOffset(pendulum.anchorX, pendulum.anchorY, pendulum.org_posx, pendulum.org_posy)
          break
        }
      }
    },
    onPosXChanged(event, id) {
      this.pause()
      this.updateXY(id, event.target.valueAsNumber, null)
    },
    onPosYChanged(event, id) {
      this.pause()
      this.updateXY(id, null, event.target.valueAsNumber)
    },
    onAnchorXChanged(event, id) {
      this.pause()
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id)
        {
          const pendulum = this.pendulums[i]
          const delta = pendulum.anchorX - event.target.valueAsNumber
          pendulum.anchorX = event.target.valueAsNumber
          this.pendulums[i].curr_posx -= delta
          this.pendulums[i].org_posx  -= delta
          break
        }
      }
    },
    async setStartPos() {
      try {
        const req1 = axios.post('http://localhost:3001/api/set_starting', this.pendulums[0])
        await Promise.all([req1])
        //const req2 = axios.post('http://localhost:3002/api/set_starting', this.pendulums[1])
        //const req3 = axios.post('http://localhost:3003/api/set_starting', this.pendulums[2])
        //const req4 = axios.post('http://localhost:3004/api/set_starting', this.pendulums[3])
        //const req5 = axios.post('http://localhost:3005/api/set_starting', this.pendulums[4])
        //await Promise.all([req1, req2, req3, req4, req5])
      } catch (err) {
        console.error(err)
      }
    },
    async getPos() {
      try {
        const req1 = axios.get('http://localhost:3001/api/get_position')
        const [res1] = await Promise.all([req1])
        //console.log(res1)
        this.pendulums[0] = res1.data
      } catch (err) {
        console.error(err)
      }
    },
    async play() {
      console.log('play')
      try {
        //await this.setStartPos()

        const reqStart1 = axios.post('http://localhost:3001/api/start')
        await Promise.all([reqStart1])
        //const reqStart2 = axios.post('http://localhost:3002/api/start')
        //const reqStart3 = axios.post('http://localhost:3003/api/start')
        //const reqStart4 = axios.post('http://localhost:3004/api/start')
        //const reqStart5 = axios.post('http://localhost:3005/api/start')
        //await Promise.all([reqStart1, reqStart2, reqStart3, reqStart4, reqStart5])
      } catch (err) {
        console.error(err)
      }
      //if (this.interval) return
      //this.interval = setInterval(() => {
      //  for (const i in this.pendulums) {
      //    //base formula just to animate the pendulum just to prove the UI works, will remove later.
      //    const torque = -this.pendulums[i].string_length * this.gravity * Math.sin(this.pendulums[i].curr_angle)
      //    const angularAcceleration = torque / (this.pendulums[i].string_length * this.pendulums[i].string_length)
      //    this.pendulums[i].curr_angleVel += angularAcceleration
      //    this.pendulums[i].curr_angle += this.pendulums[i].curr_angleVel
      //    this.pendulums[i].curr_posx = this.pendulums[i].org_posx + this.pendulums[i].string_length * Math.sin(this.pendulums[i].curr_angle)
      //    this.pendulums[i].curr_posy = this.pendulums[i].org_posy + this.pendulums[i].string_length * Math.cos(this.pendulums[i].curr_angle)
      //  }
      //  //get updated positions from processes
      //}, 16.7) //16.7 for about 60 fps
    },
    async pause () {
      console.log('pause')
      try {
        const req1 = axios.post('http://localhost:3001/api/pause')
        await Promise.all([req1])
        //const req2 = axios.post('http://localhost:3002/api/pause')
        //const req3 = axios.post('http://localhost:3003/api/pause')
        //const req4 = axios.post('http://localhost:3004/api/pause')
        //const req5 = axios.post('http://localhost:3005/api/pause')
        //await Promise.all([req1, req2, req3, req4, req5])
      } catch (err) {
        console.error(err)
      }
      //if (this.interval) {
      //  clearInterval(this.interval)
      //  this.interval = null
      //}
    },
    async reset() {
      console.log('reset')
      try {
        const req1 = axios.post('http://localhost:3001/api/reset')
        await Promise.all([req1])
        //const req2 = axios.post('http://localhost:3002/api/reset')
        //const req3 = axios.post('http://localhost:3003/api/reset')
        //const req4 = axios.post('http://localhost:3004/api/reset')
        //const req5 = axios.post('http://localhost:3005/api/reset')
        //await Promise.all([req1, req2, req3, req4, req5])
      } catch (err) {
        console.error(err)
      }
      
      //if (this.interval) {
      //  clearInterval(this.interval)
      //  this.interval = null
      //}
      //for (const i in this.pendulums) {
      //  this.pendulums[i].curr_posx = this.pendulums[i].org_posx
      //  this.pendulums[i].curr_posy = this.pendulums[i].org_posy
      //  this.pendulums[i].curr_angle = this.pendulums[i].org_angle
      //  this.pendulums[i].curr_angoff this.pendulums[i].angular_offset
      //  //this.pendulums[i].curr_angularVel = 0
      //}
    },
    initPendulumSketch() {
      let self = this
      const sketch = (p) => {

        p.setup = () => {
          const canvas = p.createCanvas(600, 400);
          p.background('white')
          canvas.parent(this.$refs.pendulumCanvas); // Attach canvas to the div
        };

        p.draw = () => {
          p.background(220);

          //base line
          p.fill(0);
          p.rect(50, 50, 500, 25);

          //redraw pendulums with new positions
          for (const i in self.pendulums) {
            if (self.pendulums[i].dragging) {
              self.updateXY(self.pendulums[i].id, p.mouseX, p.mouseY);
            }
            //the string
            p.fill(0);
            p.line(self.pendulums[i].anchorX, self.pendulums[i].anchorY, self.pendulums[i].curr_posx, self.pendulums[i].curr_posy);
            //the circle
            p.fill(self.pendulums[i].r, self.pendulums[i].g, self.pendulums[i].b);
            p.ellipse(self.pendulums[i].curr_posx, self.pendulums[i].curr_posy, self.pendulums[i].radius*2, self.pendulums[i].radius*2);
            //the number id
            p.fill(0);
            p.text(self.pendulums[i].id, self.pendulums[i].curr_posx-3, self.pendulums[i].curr_posy+4);
            
          }
        };

        p.mousePressed = () => {
          for (const i in self.pendulums) {
            let d = p.dist(p.mouseX, p.mouseY, self.pendulums[i].curr_posx, self.pendulums[i].curr_posy);
            if (d < self.pendulums[i].radius) {
              self.pause()
              self.pendulums[i].dragging = true
              break
            }
          }
        };

        p.mouseReleased = () => {
          for (const i in self.pendulums) {
            self.pendulums[i].dragging = false
          }
        };
      };

      new p5(sketch);
    },
  },
};
</script>

<style scoped>
table {
    border-collapse: collapse;
    margin: 20px 0;
}

th, td {
    border: 1px solid gray;
    padding: 8px 12px;
    text-align: left;
}

th {
    background-color: gray;
}

input {
  width: 70px
}
</style>