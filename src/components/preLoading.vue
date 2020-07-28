<template>
  <view class="page-loading-wraper" v-if="show">
    <view class="loader">
      <view class="text">Loading</view>
      <view class="spinner"></view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {}
  },
  methods: {},
  mounted() {
    uni.hideTabBar()
  },
  watch: {
    show(val) {
      if (val) uni.hideTabBar()
      else uni.showTabBar()
    },
  },
}
</script>
<style scoped lang="scss">
.page-loading-wraper {
  width: 100%;
  height: 100%;
  background: #fff;
  position: fixed;
  z-index: 99999;
  left: 0;
  top: 0;
}
.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

/* Text align it the center of screen and connect the looped animation for 2.5 seconds */
.loader .text {
  position: absolute;
  top: 78%;
  left: 16%;
  z-index: 5;
  font-size: 1.5em;
  text-transform: uppercase;
  animation: text 2.5s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
}

/* Create a container for animation*/
.spinner {
  position: relative;
  height: 5em;
  color: #fff;
}

.spinner:before,
.spinner:after {
  content: "";
  position: relative;
  display: block;
}

/* Create cube and set animation*/
.spinner:before {
  animation: spinner 2.5s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  width: 10em;
  height: 10em;
  background-color: #FBDE20;
}

/* Create shadow and set animation*/
.spinner:after {
  animation: shadow 2.5s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
  position: relative;
  bottom: -1.75em;
  height: 0.25em;
  border-radius: 50%;
  background-color: #322b27;
}

@keyframes spinner {
  50% {
    border-radius: 50%;
    transform: scale(0.5) rotate(360deg);
    background-color: #13a3a5;
  }
  100% {
    transform: scale(1) rotate(720deg);
    background-color: #FBDE20;
  }
}

@keyframes shadow {
  50% {
    transform: scale(0.5);
    background-color: #322b27;
  }
}

@keyframes text {
  0% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(0.5, 0.5);
  }
  100% {
    transform: scale(1, 1);
  }
}
</style>
