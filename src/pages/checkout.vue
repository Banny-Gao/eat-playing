<template>
  <scroll-view class="page" scroll-y>
    <view class="action-card-wraper">
      <view class="margin-bottom-20" v-if="convertedGood.type == 1">
        <view class="action-card">
          <view class="flex flex-a-c border-bottom padding-bottom-10" @click="handleChoiceAddress" v-if="user.choicedAddress.userName">
            <view class="flex-1">
              <view class="font-16 color-333 margin-bottom-10 line-height-16 flex">
                <view class="flex-1">
                  收货人: {{user.choicedAddress.userName}}
                </view>
                <view>{{user.choicedAddress.phone}}</view>
              </view>
              <view class="color-999">{{user.choicedAddress.address}} {{user.choicedAddress.addressInfo}}</view>
            </view>
            <uni-icons class="margin-left-10" type='arrowright' color='#FBDE20'></uni-icons>
          </view>
          <view v-else class="padding-tb-10 font-15 flex flex-a-c flex-s-c" @click="handleChoiceAddress">
            <uni-icons class="margin-right-6" type='plus-filled' color="#FBDE20" />
            <text class="color-999">去创建收货地址</text>
          </view>
          <view class="flex flex-a-c margin-top-10">
            <view class="flex-1 flex flex-a-c">
              <image class="icon-time" src='https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/time-icon.png' />
              <text class="margin-left-10">送达时间</text>
            </view>
            <text style="color: #FBDE20">尽快送达</text>
            <uni-icons class="margin-left-10" type='arrowright' color='#FBDE20' />
          </view>
        </view>
      </view>
      <view class="action-card">
        <view class="font-16 color-333 margin-bottom-10 line-height-16">{{
          convertedGood.org_name
        }}</view>
        <view class="good-wraper flex color-666">
          <image :src="convertedGood.coupon_img"></image>
          <view class="flex-1 flex flex-column">
            <text class="flex-1 ellipsis-2">{{
              convertedGood.coupon_display_name
            }}</text>
            <view class="flex flex-a-c">
              <text class="font-16 price flex-1">{{
                convertedGood.realcost / 100
              }}</text>
              <text class="count">x{{ goodCount }}</text>
            </view>
          </view>
        </view>
        <view class="flex flex-a-c margin-top-10">
          <text class="flex-1">数量</text>
          <view class="action-panel flex flex-a-c">
            <uni-icons
              type="minus-filled"
              color="#FBDE20"
              size="20"
              @click="handleMinus"
            />
            <text class="padding-lr-10">{{ goodCount }}</text>
            <uni-icons
              type="plus-filled"
              color="#FBDE20"
              size="20"
              @click="handlePlus"
            />
          </view>
        </view>
        <view class="total-price-wraper flex margin-top-10">
          <text class="flex-1"></text>
          <view class="flex flex-a-c">
            <text>实际付款：</text>
            <text class="price">{{ totalPrice / 100 }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="action-card-wraper margin-top-20">
      <view class="action-card">
        <view class="flex flex-a-c panel-item">
          <image class="icon" src="https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/hongbao-icon.png"></image>
          <text class="flex-1 color-666">可用红包余额</text>
          <text class="price color-666">0.00</text>
        </view>
        <view class="flex flex-a-c margin-top-20 panel-item">
          <image class="icon" src="https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/zhifu-icon.png"></image>
          <text class="flex-1 color-666">还需要支付</text>
          <text class="price">{{ totalPrice / 100 }}</text>
        </view>
        <view class="flex flex-a-c margin-top-20 panel-item">
          <uni-icons
            class="icon icon-weixin"
            type="weixin"
            color="#33C555"
            size="20"
          />
          <text class="flex-1">微信支付</text>
          <uni-icons type="checkbox-filled" color="#FBDE20" size="20" />
        </view>
      </view>
    </view>
    <view class="action-card-wraper">
      <view class="checkout-button" @click="handleCheckout">{{checkoutText}}</view>
    </view>
    <pre-loading :show='isPreLoadingShow'/>
  </scroll-view>
</template>
<script>
import { imgEncodeUrl } from "../util/url"
import { dataToQuery } from "../util/util"
import * as Api from "../services/api"
import uniIcons from "@dcloudio/uni-ui/lib/uni-icons/uni-icons"
import { mapState, createNamespacedHelpers } from "vuex"
import { getUserInfo, showError, showSuccess, reLaunch, navigateTo } from "../util/uniApi"
import TimeTask from "../util/timeTask"
import preLoading from '../components/preLoading'

const { mapMutations: userMutations } = createNamespacedHelpers("user")
const Cumtom = require("../static/cumtom")

const timeTask = new TimeTask()

export default {
  components: {
    uniIcons,
    preLoading
  },
  data() {
    return {
      id: '',
      goodInfo: {},
      goodCount: 1,
      isPreLoadingShow: true,
    }
  },
  computed: {
    ...mapState(["user"]),
    convertedGood() {
      return Object.entries(this.goodInfo).reduce((result, [key, value]) => {
        if (value === undefined) value = ""
        if (key === "coupon_img") value = imgEncodeUrl(value)
        result[key] = value
        return result
      }, {})
    },
    totalPrice() {
      return parseFloat(this.convertedGood.realcost * this.goodCount).toFixed(2)
    },
    checkoutText() {
      return +this.goodInfo.type === 2 ? '立即付款': '提交订单'
    },
    addressId() {
      return this.user.choicedAddress.id || ''
    }
  },
  methods: {
    ...userMutations(["setUserChoicedAddress"]),
    handleMinus() {
      if (this.goodCount > 0) this.goodCount--
    },
    handlePlus() {
      this.goodCount++
    },
    async handleCheckout() {
      const params = {
        goodsId: this.id,
        num: this.goodCount,
        addressId: this.addressId,
        realMoney: this.totalPrice * 1,
      }
      uni.showLoading()
      const resp = await Api.postCheckout(params)
      
      const {
        webOrder: orderId,
        order: {
          data
        }
      } = resp

      const [error, result] = await uni.requestPayment(data)
      uni.hideLoading()
      // console.log(error, result)
      if (error) {
        if (error.errMsg === 'requestPayment:fail cancel') {
          uni.showToast({
            title: '取消支付',
            icon: 'none'
          })
        } else showError('支付失败')
        return
      }
      if (result.errMsg === 'requestPayment:ok') {
        uni.showLoading({
          title: '正在验证支付'
        })
        const chechSuccess = () => {
          timeTask.run(async () => {
            try {
              await Api.postOrderDetailInfo({ weborder: orderId }, null, {
                header: { 
                  showError: false,
                  showLoading: false,
                  hideLoading: false
                }
              })
              uni.hideLoading()
              reLaunch({
                url: 'orderDetail' + dataToQuery({ orderId })
              })
            } catch (error) {
              chechSuccess()
            }
          }, 2000)
        }
        chechSuccess()
      } 
    },
    setTitle() {
      const { type } = this.goodInfo
      const title = +type === 2 ? '立即支付' : '订单提交'
      uni.setNavigationBarTitle({ title })
    },
    async getDefaultAddress() {
      const { type } = this.goodInfo
      if (+type === 1) {
        const resp = await Api.getDefaultAddress()
        this.setUserChoicedAddress(resp)
      }
    },
    handleChoiceAddress() {
      navigateTo({
        url: 'addressChoice'
      })
    },
  },
  async onShow() {
    this.setTitle()
    this.isPreLoadingShow = true
    timeTask.run(() => {
      this.isPreLoadingShow = false
    }, 1000)
  },
  onLoad({ id }) {
    this.id = id
    this.goodInfo = uni.getStorageSync("goodInfo")
    this.getDefaultAddress()
  },
  onUnload() {}
}
</script>
<style scoped lang="scss">
@import "../styles/var.scss";
@import "../styles/mixin.scss";

.page {
  padding-top: 20upx;
  &::before {
    content: "";
    background-color: $themeColor;
    height: 20vh;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }
}
.action-card-wraper {
  box-sizing: border-box;
  padding: 0 30upx;
  .action-card {
    @extend .boxshadow;
    background-color: #fff;
    padding: 20upx;
    border-radius: 20upx;
  }
  &:first-child{
    margin-top: 0;
  }
}
.good-wraper {
  image {
    width: 140upx;
    height: 82upx;
    margin-right: 20upx;
    border-radius: 6upx;
  }
  .count {
    color: #a0a0a0;
    word-spacing: 4upx;
    letter-spacing: 4upx;
  }
}
.price {
  font-size: 32upx;
  color: $themePriceColor;
  &::before {
    content: "￥";
    font-size: 24upx;
  }
}
.icon {
  box-sizing: border-box;
  padding: 10upx;
  width: 60upx;
  height: 60upx;
  z-index: 999;
}
.panel-item {
  position: relative;
  box-sizing: border-box;
  padding-left: 70upx;
  .icon {
    position: absolute;
    left: -4upx;
    top: -4upx;
  }
  .icon-weixin {
    top: -6upx;
  }
}
.checkout-button {
  background: $themeColor;
  color: $themeFontColor;
  font-size: 32upx;
  text-align: center;
  line-height: 100upx;
  border-radius: 10upx;
  margin-top: 80upx;
}
.icon-time{
  width: 40upx;
  height: 40upx;
}
</style>
