<template>
  <div>
    <button>Play</button>
    <button>Pause</button>
    <button>Reset</button>
    <div ref="pendulumCanvas"></div>
  </div>
</template>

<script>
import p5 from 'p5'
export default {
  data() {
    return {
      pendulums: [
        {id: 1, dragging: false, posx: 100, posy: 200, angular_offset: 200, mass: 0, string_length: 130, radius: 20, r: 255, g:0, b:0},
        {id: 2, dragging: false, posx: 200, posy: 200, angular_offset: 200, mass: 0, string_length: 130, radius: 20, r: 255, g:255, b:0},
        {id: 3, dragging: false, posx: 300, posy: 200, angular_offset: 200, mass: 0, string_length: 130, radius: 20, r: 0, g:255, b:100},
        {id: 4, dragging: false, posx: 400, posy: 200, angular_offset: 200, mass: 0, string_length: 130, radius: 20, r: 100, g:100, b:255},
        {id: 5, dragging: false, posx: 500, posy: 200, angular_offset: 200, mass: 0, string_length: 130, radius: 20, r: 255, g:0, b:255}
      ],
      ellipse: {
        posx: 300,
        posy: 350,
        width: 50,
        height: 50
      },
      dragging: false
    }
  },
  mounted() {
    // Initialize p5.js sketch when the component is mounted
    this.initPendulumSketch();
  },
  methods: {
    play() {

    },
    pause () {

    },
    stop() {

    },
    initPendulumSketch() {
      let self = this
      // Define the p5.js sketch function
      const sketch = (p) => {
        let angle = 200;//Math.PI / 4;
        let angleVelocity = 0;
        //let angleAcceleration = 0.04;
        const gravity = 0.4; // Gravitational acceleration

        p.setup = () => {
          const canvas = p.createCanvas(600, 400);
          p.background('white')
          canvas.parent(this.$refs.pendulumCanvas); // Attach canvas to the div
        };

        p.draw = (event) => {
          p.background(220);

          //base line
          p.fill(0);
          p.rect(50, 50, 500, 25);

          const stringLength = 130;
          const originX = p.width / 2;
          const originY = 75;

          const pendulumX = originX + stringLength * Math.sin(angle);
          const pendulumY = originY + stringLength * Math.cos(angle);

          p.line(originX, originY, pendulumX, pendulumY);
          p.fill(255, 10, 10);
          p.ellipse(pendulumX, pendulumY, 40);
          p.fill(220);
          p.text('1', pendulumX-3, pendulumY+4);

          // Calculate gravitational torque
          const torque = -stringLength * gravity * Math.sin(angle);
          // Calculate angular acceleration (based on torque and moment of inertia)
          const angularAcceleration = torque / (stringLength * stringLength);
          // Update angle and velocity
          angleVelocity += angularAcceleration;
          angle += angleVelocity;
          // Apply damping to limit the swing (optional)
          //angleVelocity *= 0.99; // Adjust the damping factor as needed

          if (self.dragging) {
            self.ellipse.posx = p.mouseX;
            self.ellipse.posy = p.mouseY;
          }

          p.fill(10, 255, 255);
          p.ellipse(self.ellipse.posx, self.ellipse.posy, self.ellipse.width, self.ellipse.height);

          //console.log(angle, angleVelocity, angleAcceleration)
          //console.log(pendulumX, pendulumY);

          for (const i in self.pendulums) {
            if (self.pendulums[i].dragging) {
              self.pendulums[i].posx = p.mouseX;
              self.pendulums[i].posy = p.mouseY;
            }
            //the string
            p.fill(0);
            p.line(self.pendulums[i].posx, 75, self.pendulums[i].posx, self.pendulums[i].posy);
            //the circle
            p.fill(self.pendulums[i].r, self.pendulums[i].g, self.pendulums[i].b);
            p.ellipse(self.pendulums[i].posx, self.pendulums[i].posy, self.pendulums[i].radius*2, self.pendulums[i].radius*2);
            //the number id
            p.fill(0);
            p.text(self.pendulums[i].id, self.pendulums[i].posx-3, self.pendulums[i].posy+4);
            
          }
        };

        p.mousePressed = (event) => {
          let d = p.dist(event.offsetX, event.offsetY, self.ellipse.posx, self.ellipse.posy);
          if (d < self.ellipse.width / 2) {
            self.dragging = true;
            
          }
          for (const i in self.pendulums) {
            let d = p.dist(event.offsetX, event.offsetY, self.pendulums[i].posx, self.pendulums[i].posy);
            if (d < self.pendulums[i].radius) {
              self.pendulums[i].dragging = true
            }
          }
        };

        p.mouseReleased = () => {
          self.dragging = false;
          for (const i in self.pendulums) {
            self.pendulums[i].dragging = false
          }
        };
      };

      // Create a new p5.js instance with the sketch function
      new p5(sketch);
    },
  },
};
</script>

<style scoped>
</style>