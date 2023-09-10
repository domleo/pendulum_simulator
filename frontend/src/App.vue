<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import MyCanvas from './components/MyCanvas.vue'
</script>

<template>
  <main>
    <header>Pendulum Simulator</header>
    <button>Play</button>
    <button>Pause</button>
    <button>Reset</button>
    <p>
      <my-canvas/>
    </p>
  </main>
</template>


<style scoped>
header {
  line-height: 2.0;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {

}
</style>
