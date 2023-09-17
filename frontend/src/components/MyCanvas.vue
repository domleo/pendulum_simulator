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
          <td><input type="number" :value="p.angular_offset"  @input="onAngularOffsetChanged($event, p.id)"/></td>
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
export default {
  data() {
    return {
      interval: null,
      pendulums: [
        {id: 1, dragging: false, curr_angle: Math.PI/4, org_angle: Math.PI/3, curr_angleVel: 0, curr_posx: 100, curr_posy: 200, org_posx: 100, org_posy: 200, angular_offset: 0, mass: 10, string_length: 125, radius: 20, anchorX:100, anchorY:75, r: 255, g:0, b:0},
        {id: 2, dragging: false, curr_angle: Math.PI/4, org_angle: Math.PI/3, curr_angleVel: 0, curr_posx: 200, curr_posy: 200, org_posx: 200, org_posy: 200, angular_offset: 0, mass: 10, string_length: 125, radius: 20, anchorX:200, anchorY:75, r: 255, g:255, b:0},
        {id: 3, dragging: false, curr_angle: Math.PI/4, org_angle: Math.PI/3, curr_angleVel: 0, curr_posx: 300, curr_posy: 200, org_posx: 300, org_posy: 200, angular_offset: 0, mass: 10, string_length: 125, radius: 20, anchorX:300, anchorY:75, r: 0, g:255, b:100},
        {id: 4, dragging: false, curr_angle: Math.PI/4, org_angle: Math.PI/3, curr_angleVel: 0, curr_posx: 400, curr_posy: 200, org_posx: 400, org_posy: 200, angular_offset: 0, mass: 10, string_length: 125, radius: 20, anchorX:400, anchorY:75, r: 100, g:100, b:255},
        {id: 5, dragging: false, curr_angle: Math.PI/4, org_angle: Math.PI/3, curr_angleVel: 0, curr_posx: 500, curr_posy: 200, org_posx: 500, org_posy: 200, angular_offset: 0, mass: 10, string_length: 125, radius: 20, anchorX:500, anchorY:75, r: 255, g:0, b:255}
      ],
      gravity: 0.4
    }
  },
  mounted() {
    this.initPendulumSketch(); //start drawing right away
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
          //const anchor_point = this.findAnchorPoint(pendulum.curr_posx, pendulum.curr_posy, pendulum.string_length)
          //console.log(anchor_point)
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
    onPosXChanged(event, id) {
      this.pause()
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id) {
          const pendulum = this.pendulums[i]
          const string_length = this.getDistance(pendulum.anchorX, pendulum.anchorY, event.target.valueAsNumber, pendulum.org_posy)
          //const new_angular_offset
          pendulum.curr_posx = event.target.valueAsNumber
          pendulum.org_posx  = event.target.valueAsNumber
          pendulum.string_length = string_length
          break
        }
      }
    },
    onPosYChanged(event, id) {
      this.pause()
      for (const i in this.pendulums) {
        if (this.pendulums[i].id === id) {
          const pendulum = this.pendulums[i]
          const string_length = this.getDistance(pendulum.anchorX, pendulum.anchorY, pendulum.org_posx, event.target.valueAsNumber)
          //const new_angular_offset
          pendulum.curr_posy = event.target.valueAsNumber
          pendulum.org_posy  = event.target.valueAsNumber
          pendulum.string_length = string_length
          break
        }
      }
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
    play() {
      console.log('play')
      if (this.interval) return
      this.interval = setInterval(() => {
        for (const i in this.pendulums) {
          //base formula just to animate the pendulum just to prove the UI works, will remove later.
          const torque = -this.pendulums[i].string_length * this.gravity * Math.sin(this.pendulums[i].curr_angle)
          const angularAcceleration = torque / (this.pendulums[i].string_length * this.pendulums[i].string_length)
          this.pendulums[i].curr_angleVel += angularAcceleration
          this.pendulums[i].curr_angle += this.pendulums[i].curr_angleVel

          this.pendulums[i].curr_posx = this.pendulums[i].org_posx + this.pendulums[i].string_length * Math.sin(this.pendulums[i].curr_angle)
          this.pendulums[i].curr_posy = this.pendulums[i].org_posy + this.pendulums[i].string_length * Math.cos(this.pendulums[i].curr_angle)
        }
        //get updated positions from processes
      }, 16.7) //16.7 for about 60 fps
    },
    pause () {
      console.log('pause')
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    },
    reset() {
       console.log('reset')
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
      for (const i in this.pendulums) {
        this.pendulums[i].curr_posx = this.pendulums[i].org_posx
        this.pendulums[i].curr_posy = this.pendulums[i].org_posy
        this.pendulums[i].curr_angle = this.pendulums[i].org_angle
        this.pendulums[i].curr_angularVel = 0
      }
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
              self.pendulums[i].org_posx = p.mouseX;
              self.pendulums[i].org_posy = p.mouseY;
              self.pendulums[i].curr_posx = p.mouseX;
              self.pendulums[i].curr_posy = p.mouseY;
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