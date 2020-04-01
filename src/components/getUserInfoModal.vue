<template>
 <view class="modal-wraper">
   <view class='modal-group'>
     <view class="title">小程序需要获取您的头像、昵称</view>
    <view class="btn-group">
      <text class="button" @click="handleCancel">取消</text>
      <button class="button primary" open-type='getUserInfo' @getuserinfo='getuserinfo'>确认</button>
    </view>
  </view>
 </view>
</template>
<script>
 export default {
  data () {
   return {

   }
 },
 methods: {
   handleCancel() {
     this.$emit('cancel')
   },
   getuserinfo(e) {
     this.$emit('confirm', e)
   }
 }
}
</script>
<style scoped lang='scss'>
@import '../styles/wxnormalize.scss';
@import '../styles/var.scss';

.modal-wraper{
  width: 100%;
  height: 100%;
  background: rgba($color: #000000, $alpha: 0.6);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99999;
}
.modal-group{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  z-index: 9999;
  background: #fff;
  .title{
    text-align: center;
    padding: 30upx;
    line-height: 64upx;
  }
  .btn-group{
    margin-top: 20upx;
    display: flex;
    .button{
      flex: 1;
      line-height: 96upx;
      font-size: 32upx;
      text-align: center;
      border-top: borderStyle();
    }
    .primary{
      color: #fff;
      background: $themeColor;
      border-top: 1px solid $themeColor;
    }
  }
}
</style>