<template>
  <view class="page">
    <view class="tab-wraper flex flex-a-c">
      <view class="flex-1 tab-item"
            :class="item.status === status ? 'active': ''"
            v-for="item of orderTabList"
            :key="item.status"
            @click="handleTanChange(item)">{{item.title}}</view>
    </view>
    <scroll-view scroll-y class="padding-bottom-20">
      <view class="action-card-wraper"
            v-for="item of orderList"
            :key="item.weborder">
        <view class="action-card">
          <view class="flex flex-a-c font-12">
            <text class="flex-1">订单编号: {{item.weborder}}</text>
            <text class="status-text">{{getStatusText(item)}}</text>
          </view>
          <view class="good-wraper margin-top-10 border-top padding-lr-10 padding-tb-10 flex">
            <image :src="item.couponImg">
              <view>
                <text>{{item.couponDisplayName}}</text>
              </view>
          </view>
          <view class="font-12 flex flex-a-c padding-bottom-10"
                :class="item.overFlag !== 1 ? 'border-bottom': ''">
            <text class="color-99 flex-1">截止日期：{{item.invalidTime}}</text>
            <view class="flex">
              <text>合计：</text>
              <text class="price">{{item.realMoney / 100}}</text>
            </view>
          </view>
          <view class="margin-top-10 flex"
                v-if="item.overFlag !== 1">
            <view class="flex-1"></view>
            <view class="btn"
                  @click="handleNavToOrderDetail(item)">查看订单</view>
          </view>
        </view>
      </view>
      <pre-loading :show='isPreLoadingShow'/>
    </scroll-view>
  </view>
</template>
<script>
  import * as Api from '../services/api'
  import { navigateTo } from '../util/uniApi'
  import { dataToQuery } from '../util/util'
  import dayjs from 'dayjs'
  import TimeTask from '../util/timeTask'
  import preLoading from '../components/preLoading'

  const timeTask = new TimeTask()

  export default {
  	components: {
      preLoading
    },
  	data() {
  		return {
  			orderTabList: [
  				{
  					status: '-1',
  					title: '全部',
  				},
  				{
  					status: '0',
  					title: '未使用',
  				},
  				{
  					status: '1',
  					title: '已使用',
  				},
  				{
  					status: '2',
  					title: '已过期',
  				},
  			],
  			status: '-1',
        orderList: [],
        isPreLoadingShow: true,
  		}
  	},
  	computed: {},
  	methods: {
  		async getOrderList() {
  			const { status } = this
  			const resp = await Api.getOrderList({ status })
  			this.orderList = resp.map(item => {
          const time = item.invalidTime
          item.invalidTime = dayjs(time).format('YYYY-MM-DD HH:mm:ss')
          return item
        })
  		},
  		handleTanChange({ status }) {
  			this.status = status
  			this.getOrderList()
  		},
  		getStatusText(item) {
  			if (item.overFlag === 1) return '已过期'
  			if (item.status) return '已使用'
  			return '未使用'
  		},
  		async handleNavToOrderDetail(item) {
  			await this.getGoodInfos(item.goodsId)
  			const { weborder: orderId } = item
  			navigateTo({
  				url: 'orderDetail' + dataToQuery({ orderId }),
  			})
  		},
  		async getGoodInfos(id) {
  			const resp = await Api.getGoodInfos({ id })
  			uni.setStorageSync('goodInfo', { ...resp })
  		},
  	},
  	async onShow() {
      this.isPreLoadingShow = true
      await this.getOrderList()
      timeTask.run(() => {
        this.isPreLoadingShow = false
      }, 1500)
  	},
  	async onPullDownRefresh() {},
  	onLoad({ status }) {
  		this.status = status
  	},
  }
</script>
<style scoped lang="scss">
  .tab-wraper {
  	@extend .boxshadow-b;
  	line-height: 100upx;
  	text-align: center;
  	background: #fff;
  	.tab-item {
  		transition: all 0.2s linear;
  	}
  	.active {
  		font-size: 32upx;
  	}
  }
  .action-card-wraper {
  	box-sizing: border-box;
  	padding: 0 30upx;
  	margin-top: 30upx;
  	.action-card {
  		@extend .boxshadow;
  		background-color: #fff;
  		padding: 20upx;
  		border-radius: 20upx;
  		.status-text {
  			// color: $themePriceColor;
  		}
  		.btn {
  			line-height: 48upx;
  			color: $themeFontColor;
  			font-size: 24upx;
  			background: $themeColor;
  			border-radius: 8upx;
  			padding: 0 20upx;
  		}
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
  .price {
  	color: $themePriceColor;
  	&::before {
  		content: '￥';
  		font-size: 20upx;
  	}
  }
</style>
