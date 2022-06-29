<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
    <div class="fix-bottom"></div>
  </div>
</template>

<style scoped>
.fix-bottom {
  position: fixed;
  left: 0;
  bottom: 0;
}
</style>
