<template>
  <scroll-view class="page"
               scroll-y>
    <view class="action-card">
      <view class="circle-cover left bottom"></view>
      <view class="circle-cover right bottom"></view>
      <!-- <view v-if="orderInfo.couponDisplayName" class="font-16 text-center margin-bottom-10">{{orderInfo.couponDisplayName}}</view> -->
      <view class="good-wraper flex color-666">
        <image :src="convertedGood.coupon_img"></image>
        <view class="flex-1 flex flex-column">
          <text class="flex-1 ellipsis-3">{{
            convertedGood.coupon_display_name
          }}</text>
        </view>
      </view>
    </view>
    <view class="action-card border-top-dash">
      <view class="circle-cover left top"></view>
      <view class="circle-cover right top"></view>
      <view class="circle-cover left bottom"></view>
      <view class="circle-cover right bottom"></view>
      <view class="qrcode-wraper">
        <canvas class="margin-top-20"
                style="width: 200px; height: 200px;"
                canvas-id="weborderQrcode"></canvas>
        <text class="font-12 color-999 margin-top-20">请将此二维码展示给商家核销</text>
      </view>
    </view>
    <view class="action-card border-top-dash">
      <view class="circle-cover left top"></view>
      <view class="circle-cover right top"></view>
      <view class="flex flex-a-c">
        <text>核销码</text>
        <text class="margin-left-10 font-12 color-99">点击核销码可复制</text>
      </view>
      <view class="font-24 font-blod text-wrap weborder-num" @click="handleCopyWeborder">{{
        orderInfo.priviCode
      }}</view>
    </view>
    <view class="action-card margin-top-20" v-if="orderInfo.realMoney">
      <view class="font-16 font-blod margin-bottom-10">订单支付：￥{{ orderInfo.realMoney }}</view>
      <view class="flex flex-a-c">
        <text class="flex-1">订单编号：</text>
        <text>{{ orderInfo.id }}</text>
      </view>
      <view class="flex flex-a-c">
        <text class="flex-1">姓 名：</text>
        <text>{{ orderInfo.nickName }}</text>
      </view>
      <view class="flex flex-a-c">
        <text class="flex-1"> 支付时间：</text>
        <text class="font-12">{{ orderInfo.createTime }}</text>
      </view>
      <view class="flex flex-a-c">
        <text class="flex-1">使用期限：</text>
        <text class="font-12">{{ orderInfo.useBeginDate }} 至 {{ orderInfo.useEndDate }}</text>
      </view>
      <view class="margin-top-10 padding-top-10 border-top" v-if="orderInfo.type === 1">
        <view>收货地址： {{ orderInfo.address }} {{orderInfo.addressInfo}}</view>
        <view class="flex flex-a-c">
          <text class="flex-1">联系人：</text>
          <text>{{ orderInfo.userName }}</text>
        </view>
        <view class="flex flex-a-c">
          <text class="flex-1">电话：</text>
          <text>{{ orderInfo.phone }}</text>
        </view>
      </view>
    </view>
    <view class="action-card margin-top-20">
      <view class="font-blod text-center margin-bottom-10">使用须知</view>
      <parser :html="orderInfo.introText" />
    </view>
  </scroll-view>
</template>
<script>
  import { imgEncodeUrl } from '../util/url'
  import * as Api from '../services/api'
  import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons'
  import drawQrcode from 'weapp-qrcode'
  import dayjs from 'dayjs'
  import parser from '../components/jyf-parser/jyf-parser'

  export default {
  	components: {
      uniIcons,
      parser,
  	},
  	data() {
  		return {
  			orderId: '',
  			orderInfo: {},
  			goodInfo: {},
  		}
  	},
  	computed: {
  		convertedGood() {
  			return Object.entries(this.goodInfo).reduce((result, [key, value]) => {
  				if (value === undefined) value = ''
  				if (key === 'coupon_img') value = imgEncodeUrl(value)
  				result[key] = value
  				return result
  			}, {})
  		},
  	},
  	methods: {
  		async postOrderDetailInfo() {
  			const { orderId: weborder } = this
  			const resp = await Api.postOrderDetailInfo({ weborder })
  			this.orderInfo = { 
          ...resp,
          createTime: dayjs(resp.createTime).format('YYYY-MM-DD HH:mm:ss'),
          useBeginDate: dayjs(resp.useBeginDate).format('YYYY-MM-DD HH:mm:ss'),
          useEndDate: dayjs(resp.useEndDate).format('YYYY-MM-DD HH:mm:ss'),
        }
  			this.setTitle()
  			this.renderQRcode()
  		},
  		setTitle() {
  			let { couponDisplayName: title } = this.orderInfo
  			if (title) {
  				title = title.substr(0, 10)
  				uni.setNavigationBarTitle({ title })
  			}
  		},
  		renderQRcode() {
  			const { priviCode: text } = this.orderInfo
  			drawQrcode({
  				width: 200,
  				height: 200,
  				canvasId: 'weborderQrcode',
  				text,
  			})
      },
      handleCopyWeborder() {
        const { priviCode: data } = this.orderInfo
        uni.setClipboardData({ data })
        // console.log(data, '已复制到剪切板')
      }
  	},
  	mounted() {
  		this.postOrderDetailInfo()
  	},
  	onLoad({ orderId }) {
  		this.orderId = orderId
  		this.goodInfo = uni.getStorageSync('goodInfo')
  	},
  	onUnload() {},
  }
</script>
<style scoped lang="scss">
  @import '../styles/var.scss';
  @import '../styles/mixin.scss';

  .page {
  	background: $themeColor;
  	padding: 20upx;
  	box-sizing: border-box;
  	.action-card {
  		position: relative;
  		background-color: #fff;
  		padding: 40upx;
  		border-radius: 20upx;
  	}
  	.qrcode-wraper {
  		display: flex;
  		flex-flow: column;
  		align-items: center;
  		justify-content: center;
  	}
  	.circle-cover {
  		width: 40upx;
  		height: 40upx;
  		border-radius: 50%;
  		background-color: $themeColor;
  		position: absolute;
  		&.left {
  			left: -20upx;
  		}
  		&.bottom {
  			bottom: -20upx;
  		}
  		&.right {
  			right: -20upx;
  		}
  		&.top {
  			top: -20upx;
  		}
  	}
  	.border-top-dash {
  		border-top: 1px dashed $border-default-color;
  	}
  	.border-bottom-dash {
  		border-bottom: 1px dashed $border-default-color;
  	}
  }
  .good-wraper {
  	image {
  		width: 140upx;
  		height: 112upx;
  		margin-right: 20upx;
  		border-radius: 6upx;
  	}
  }
  .weborder-num {
  	padding: 20upx;
  	border-radius: 8upx;
  	box-sizing: border-box;
  	background-color: #f2f2f2;
  }
</style>
