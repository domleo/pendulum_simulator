<template>
  <div>
    <div ref="pendulumCanvas"></div>
  </div>
</template>

<script>
import p5 from 'p5'
export default {
  mounted() {
    // Initialize p5.js sketch when the component is mounted
    this.initPendulumSketch();
  },
  methods: {
    initPendulumSketch() {
      // Define the p5.js sketch function
      const sketch = (p) => {
        let angle = 200;//Math.PI / 4;
        let angleVelocity = 0;
        //let angleAcceleration = 0.04;
        const gravity = 0.4; // Gravitational acceleration

        p.setup = () => {
          const canvas = p.createCanvas(800, 400);
          p.background('white')
          canvas.parent(this.$refs.pendulumCanvas); // Attach canvas to the div
        };

        p.draw = () => {
          p.background(220);

          const pendulumLength = 130;
          const originX = p.width / 2;
          const originY = 100;

          const pendulumX = originX + pendulumLength * Math.sin(angle);
          const pendulumY = originY + pendulumLength * Math.cos(angle);

          p.line(originX, originY, pendulumX, pendulumY);
          p.fill(0);
          p.ellipse(pendulumX, pendulumY, 30);

          // Calculate gravitational torque
          const torque = -pendulumLength * gravity * Math.sin(angle);
          // Calculate angular acceleration (based on torque and moment of inertia)
          const angularAcceleration = torque / (pendulumLength * pendulumLength);
          // Update angle and velocity
          angleVelocity += angularAcceleration;
          angle += angleVelocity;
          // Apply damping to limit the swing (optional)
          //angleVelocity *= 0.99; // Adjust the damping factor as needed



          //console.log(angle, angleVelocity, angleAcceleration)
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