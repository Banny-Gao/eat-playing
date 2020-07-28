<template>
  <view class="page-loading-wraper" v-if="show">
    <view class="loader">
      <image class="loading-gif" src="/static/icon/loading.gif"></image>
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
.loading-gif {
  width: 500upx;
  height: 150upx;
}
</style>
