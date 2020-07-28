<template>
  <view class="page">
    <scroll-view scroll-y
                 @scrolltolower='handleLoadMore'
                 @scroll="handlePageScroll">
      <view class="head">
        <CustomHeader @search="handleSearch"
                      :q='goodsParams.q'
                      @input="handleSearchInput"
                      @clear='clearQ'
                      :showBg='isHeadBgShow' />
        <tab :list='tabList'
             @change='handdleTabChange'
             :showBg='isHeadBgShow' />
      </view>
      <view class="goods-wraper"
            :style="{backgroundImage: `url(${pageBg})`}">
        <view class="goods-item"
              v-for="item of convertedGoods"
              :key="item.id"
              @click="navigateToDetail(item)">
          <view class="image-wraper">
            <image :src='item.encodeUrl' />
            <view class="expired-wraper"
                  v-if="item.isExpired">
              <image :src='`${CDNUrl}/static/img/expired.png`'>
            </view>
            <view class="good-qty">{{item.salesQuantity}}件已售</view>
          </view>
          <view class="good-title ellipsis-2"
                :class="item.isExpired ? 'disable': ''">{{item.title}}</view>
          <view class="padding-lr-8">
            <text class="pre-price"><text class="currency">￥</text>{{item.prePrice / 100}}</text>
          </view>
          <view class="flex flex-s-b flex-a-c padding-lr-8">
            <view class="price-wraper">
              <text class="price font-16">{{item.price / 100}}</text>
            </view>
            <view class="stock">库存{{item.size}}</view>
          </view>
        </view>
      </view>
      <view class="flex flex-a-c flex-s-c padding-tb-10">
        <text class="color-999"
              @click="handleNavigatePlatformInfo"> · 平台信息</text>
        <text class="color-999"
              @click="handleOpenFile(`${CDNUrl}/%E7%94%A8%E6%88%B7%E9%9A%90%E7%A7%81%E6%9D%A1%E6%AC%BE.docx`)"> · 用户隐私条款</text>
        <text class="color-999"
              @click="handleOpenFile(`${CDNUrl}/%E5%B9%B3%E5%8F%B0%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE.docx`)"> · 平台服务协议 · </text>
      </view>
      <view class="text-center color-999 padding-bottom-10">吃喝玩乐有吧旗下-优选商城</view>
      <official-account></official-account>
    </scroll-view>
    <pre-loading :show='isPreLoadingShow' />
  </view>
</template>
<script>
  import CustomHeader from '../components/CustomHeader'
  import Tab from '../components/Tab'
  import { mapState } from 'vuex'
  import * as Api from '../services/api'
  import { showSuccess, navigateTo } from '../util/uniApi'
  import { imgEncodeUrl } from '../util/url'
  import { dataToQuery } from '../util/util'
  import TimeTask from '../util/timeTask'
  import preLoading from '../components/preLoading'

  const Custom = require('../static/custom')
  const {
  	Index: { backgroundImage: pageBg },
  	CDNUrl,
  } = Custom
  const timeTask = new TimeTask()

  export default {
  	components: {
  		CustomHeader,
  		Tab,
  		preLoading,
  	},
  	data() {
  		return {
  			pageBg,
  			CDNUrl,
  			tabList: [],
  			goods: [],
  			goodsStack: [],
  			viewIndex: 0,
  			goodsParams: {
  				adcode: '',
  				pageIndex: 1,
  				pageSize: 10,
  				categoryId: '',
  				q: '',
  			},
  			pageIndexes: {},
  			isPreLoadingShow: true,
  			isHeadBgShow: false,
  		}
  	},
  	computed: {
  		...mapState(['user']),
  		convertedGoods() {
  			return this.goods.map((item) => {
  				const encodeUrl = imgEncodeUrl(item.coupon_img)
  				const isExpired = this.checkIsExpired(item.expiredTime)
  				item = {
  					...item,
  					encodeUrl,
  					isExpired,
  				}
  				return item
  			})
  		},
  	},
  	methods: {
  		async clearQ() {
  			this.handleSearch('')
  		},
  		handleSearchInput(q) {
  			this.goodsParams = {
  				...this.goodsParams,
  				q,
  			}
  		},
  		async handleSearch(q) {
  			const params = (this.goodsParams = {
  				...this.goodsParams,
  				pageIndex: 1,
  				pageSize: 10,
  				q,
  			})
  			const res = await this.getGoods(params)
  			this.goods = [...res]
  			this.goodsStack[this.viewIndex] = [...res]
  		},
  		async handdleTabChange({ tab, index, initial }) {
  			const preViewIndex = this.viewIndex
  			const prePageIndex = this.goodsParams.pageIndex
  			this.pageIndexes[preViewIndex] = prePageIndex

  			this.viewIndex = index

  			if (initial) {
  				this.goodsStack = []
  				this.pageIndexes = {}
  				this.goodsParams.pageIndex = 1
  			}

  			if (this.goodsParams.q) initial = true

  			if (this.goodsStack[index] && !initial) {
  				this.goods = this.goodsStack[index]
  				this.goodsParams.q = this.goods[0] ? this.goods[0].__q : ''
  				this.goodsParams.pageIndex = this.pageIndexes[index] || 1
  				return
  			}

  			if (!this.goodsStack[index]) {
  				this.goodsStack[index] = []
  				this.goodsParams.pageIndex = 1
  			}

  			const { categoryId } = tab
  			const params = (this.goodsParams = {
  				...this.goodsParams,
  				q: '',
  				categoryId,
  			})
  			const res = await this.getGoods(params)
  			this.goods = [...res]
  			this.goodsStack[index] = [...res]
  		},
  		async getCategories() {
  			const { openid, location } = this.user
  			const { adcode } = location

  			if (!openid || !adcode) return
  			const res = await Api.getCategories({
  				openid,
  				adcode,
  			})
  			this.tabList = res.map((item) => {
  				return {
  					categoryId: item.id,
  					title: item.name,
  					timestamp: new Date().getTime(),
  				}
  			})
  			this.goodsParams.adcode = adcode
  		},
  		async getGoods(params) {
  			if (!this.user.openid || !params.categoryId || !params.adcode)
  				return Promise.reject()

  			const res = await Api.getGoods(params)
  			if (!Array.isArray(res)) return []
  			const goods = res.map((item) => {
  				return {
  					...item,
  					imageUrl: item.logo,
  					id: item.coupon_id,
  					expiredTime: item.end_date,
  					title: item.coupon_display_name,
  					price: item.realcost,
  					prePrice: item.amount,
  					__q: params.q,
  				}
  			})
  			return goods
  		},
  		async handleLoadMore() {
  			const { pageIndex } = this.goodsParams
  			const params = {
  				...this.goodsParams,
  				pageIndex: pageIndex + 1,
  			}
  			const res = await this.getGoods(params)
  			if (!res.length) {
  				showSuccess('已全部加载完成')
  			} else {
  				this.goodsParams = {
  					...params,
  				}
  				this.goods.push(...res)
  				this.goodsStack[this.viewIndex].push(...res)
  			}
  		},
  		checkIsExpired(time) {
  			const now = new Date().getTime()
  			const expiredTime = new Date(time).getTime()
  			return expiredTime < now ? true : false
  		},
  		navigateToDetail(item) {
  			if (item.isExpired) return
  			const query = dataToQuery({
  				id: item.id,
  			})
  			const url = `goodDetail${query}`
  			navigateTo({
  				url,
  			})
  		},
  		handleNavigatePlatformInfo() {
  			navigateTo({
  				url: '/pages/platformInfo',
  			})
  		},
  		async handleOpenFile(url) {
  			const [err, result] = await uni.downloadFile({ url })
  			if (err) return
  			const { errMsg, tempFilePath: filePath } = result
  			if (errMsg === 'downloadFile:ok') uni.openDocument({ filePath })
  		},
  		handlePageScroll(e) {
  			const { scrollTop } = e.detail
  			if (scrollTop < 96 && this.isHeadBgShow) this.isHeadBgShow = false
  			if (scrollTop >= 96 && !this.isHeadBgShow) this.isHeadBgShow = true
  		},
  	},
  	async onLoad() {
  		this.isPreLoadingShow = true
  		await this.getCategories()
  		timeTask.run(() => {
  			this.isPreLoadingShow = false
  		}, 2500)
  	},
  	async onPullDownRefresh() {
  		const params = (this.goodsParams = {
  			...this.goodsParams,
  			pageIndex: 1,
  			pageSize: 10,
  			q: '',
  		})
  		const res = await this.getGoods(params)
  		this.goods = [...res]
  		this.goodsStack[this.viewIndex] = [...res]
  	},
  	watch: {
  		user: {
  			deep: true,
  			handler(val) {
  				this.getCategories()
  			},
  		},
  	},
  }
</script>
<style scoped lang="scss">
  .head {
  	position: fixed;
  	left: 0;
  	top: 0;
  	z-index: 9999;
    width: 100%;
  }
  .goods-wraper {
  	box-sizing: border-box;
  	flex-wrap: wrap;
  	padding: 0 20upx;
  	display: flex;
  	min-height: calc(100% - 416upx);
  	padding-bottom: 60upx;
  	padding-top: 400upx;
  	background-size: 100% auto;
  	background-repeat: no-repeat;
  	background-position: left top;
  	.goods-item {
  		@extend .boxshadow;
  		margin-top: 20upx;
  		width: 48%;
  		margin-right: 4%;
  		background: #fff;
  		height: 400upx;
  		&:nth-child(2n) {
  			margin-right: 0;
  		}
  		.image-wraper {
  			overflow: hidden;
  			width: 100%;
  			height: 200upx;
  			position: relative;
  			image {
  				width: 100%;
  				height: 100%;
  			}
  			.good-qty {
  				position: absolute;
  				left: 0;
  				top: 0;
  				padding: 0 20upx;
  				background: rgba($color: #000000, $alpha: 0.4);
  				color: #ffffff;
  				line-height: 48upx;
  				font-size: 24upx;
  			}
  			.expired-wraper {
  				width: 100%;
  				height: 100%;
  				position: absolute;
  				left: 0;
  				top: 0;
  				z-index: 99;
  				background-color: rgba($color: #000000, $alpha: 0.7);
  				image {
  					width: 140upx;
  					height: 140upx;
  					position: absolute;
  					left: 50%;
  					top: 50%;
  					transform: translate(-50%, -50%);
  				}
  			}
  		}
  		.good-title {
  			padding: 0 16upx;
  			font-size: 28upx;
  			color: #333;
  			height: 88upx;
  			&.disable {
  				color: #666;
  			}
  		}
  		.price-wraper {
  			display: flex;
  			align-items: baseline;
  			.price {
  				font-size: 32upx;
  				color: $themePriceColor;
  				&::before {
  					content: '￥';
  					font-size: 24upx;
  				}
  			}
  		}
  		.stock {
  			color: #666;
  		}
  		.pre-price {
  			position: relative;
  			font-size: 24upx;
  			padding: 0 8upx 0 60upx;
  			line-height: 30upx;
  			height: 30upx;
  			color: #333;
  			border-radius: 6upx;
  			border: 1px solid #333;
  			text-decoration: line-through;
  			&::before {
  				content: '原价';
  				width: 60upx;
  				height: 30upx;
  				text-align: center;
  				position: absolute;
  				left: 0;
  				top: 0;
  				background: #333;
  				color: #fff;
  				font-size: 20upx;
  			}
  			.currency {
  				font-size: 20upx;
  			}
  		}
  	}
  }
</style>
