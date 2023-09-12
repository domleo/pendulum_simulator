<template>
  <div>
    <button @click="play">Play</button>
    <button @click="pause">Pause</button>
    <button @click="reset">Reset</button>
    <div ref="pendulumCanvas"></div>
    <p> Parameters</p>
    <table>
      <thead>
        <tr>
          <th>Pendulum</th>
          <th>Angular Offset</th>
          <th>Mass</th>
          <th>String Length</th>
          <th>Radius</th>
          <th>X,Y</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in pendulums" :key="p.id">
          <td>{{p.id}}</td>
          <td>{{p.angular_offset}}</td>
          <td>{{p.mass}}</td>
          <td>{{p.string_length}}</td>
          <td>{{p.radius}}</td>
          <td>{{p.curr_posx}}, {{p.curr_posy}}</td>
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
      pendulums: [
        {id: 1, dragging: false, curr_angle: 200, org_angle: 200, curr_angleVel: 0, curr_posx: 100, curr_posy: 200, org_posx: 100, org_posy: 200, angular_offset: 200, mass: 10, string_length: 10, radius: 20, r: 255, g:0, b:0},
        {id: 2, dragging: false, curr_angle: 200, org_angle: 200, curr_angleVel: 0, curr_posx: 200, curr_posy: 200, org_posx: 200, org_posy: 200, angular_offset: 200, mass: 10, string_length: 10, radius: 20, r: 255, g:255, b:0},
        {id: 3, dragging: false, curr_angle: 200, org_angle: 200, curr_angleVel: 0, curr_posx: 300, curr_posy: 200, org_posx: 300, org_posy: 200, angular_offset: 200, mass: 10, string_length: 10, radius: 20, r: 0, g:255, b:100},
        {id: 4, dragging: false, curr_angle: 200, org_angle: 200, curr_angleVel: 0, curr_posx: 400, curr_posy: 200, org_posx: 400, org_posy: 200, angular_offset: 200, mass: 10, string_length: 10, radius: 20, r: 100, g:100, b:255},
        {id: 5, dragging: false, curr_angle: 200, org_angle: 200, curr_angleVel: 0, curr_posx: 500, curr_posy: 200, org_posx: 500, org_posy: 200, angular_offset: 200, mass: 10, string_length: 10, radius: 20, r: 255, g:0, b:255}
      ],
      gravity: 0.4
    }
  },
  mounted() {
    this.initPendulumSketch();
    this.interval = null;
  },
  methods: {
    play() {
      console.log('play')
      if (this.interval) return
      this.interval = setInterval(() => {
        for (const i in this.pendulums) {
          const torque = -this.pendulums[i].string_length * this.gravity * Math.sin(this.pendulums[i].curr_angle)
          const angularAcceleration = torque / (this.pendulums[i].string_length * this.pendulums[i].string_length)
          this.pendulums[i].curr_angleVel += angularAcceleration
          this.pendulums[i].curr_angle += this.pendulums[i].curr_angleVel

          this.pendulums[i].curr_posx = this.pendulums[i].org_posx + this.pendulums[i].string_length * Math.sin(this.pendulums[i].curr_angle)
          this.pendulums[i].curr_posy = this.pendulums[i].org_posy + this.pendulums[i].string_length * Math.cos(this.pendulums[i].curr_angle)
        }
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
            p.line(self.pendulums[i].org_posx, 75, self.pendulums[i].curr_posx, self.pendulums[i].curr_posy);
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
</style>