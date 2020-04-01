<template>
  <view class="page bg-fff">
    <view class="flex border-bottom tab-wraper">
      <view class="tab-item flex-1"
            :class="viewId === item.id ? 'active' : ''"
            v-for="item of tabList"
            :key="item.id"
            @click="handleTab(item)">
        {{ item.title }}
      </view>
    </view>
    <scroll-view scroll-y
                 :scroll-into-view="viewId">
      <view class="info-wraper">
        <view v-if="convertedGood.coupon_img"
              class="banner-wraper"
              :style="{ backgroundImage: `url(${convertedGood.coupon_img})` }"></view>
        <view class="random-headers-wraper">
          <view class="random-header"
                v-for="(item, index) of randomHeaders"
                :key="index"
                :style="{
              display: item.style.display,
              opacity: item.style.opacity
            }">
            <image :src="item.url"
                   v-if="item.url"></image>
            <text>刚刚购买了本商品</text>
          </view>
        </view>
      </view>
      <view class="good-info"
            v-if="convertedGood.realcost">
        <view class="price-group">
          <text class="realcost">{{ convertedGood.realcost / 100 }}</text>
          <text class="amount">{{ convertedGood.amount / 100 }}</text>
        </view>
        <view class="good-title">{{ convertedGood.coupon_display_name }}</view>
      </view>
      <view class="margin-top-10 flex flex-a-c padding-lr-15"
            v-if="randomHeaders.length">
        <view class="headImg-wraper">
          <image :style="{left: 20 * index + 'px'}"
                 v-for="(item, index) of randomHeaders"
                 :key="index"
                 :src="item.url"
                 v-if="item.url" />
        </view>
        <view class="kefu-btn flex flex-a-c"
              v-if="convertedGood.servicePhone"
              @click="handleMakePhoneCall(convertedGood.servicePhone)">
          <image class="margin-right-4"
                 src='https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/kefu.png'>
            <text>联系客服</text>
        </view>
      </view>
      <view id="org_name"
            class="org_name"
            v-if="convertedGood.org_name">
        <view class="text-center font-16 t">商家信息</view>
        <view class="flex flex-a-c">
          <text>商家名称： {{ convertedGood.org_name }}</text>
        </view>
        <view class="flex flex-a-c margin-top-10"
              v-if="convertedGood.org_address">
          <text class="flex-1 ellipsis-1">商家地址： {{ convertedGood.org_address }}
          </text>
          <view class="intro-btn">
            <uni-icons type="location-filled"
                       color="#fff"
                       size="14" />
            <text class="margin-left-4"
                  @click="handleMapNavigate">导航</text>
          </view>
        </view>
        <view class="flex flex-a-c margin-top-10"
              v-if="convertedGood.contact_phone">
          <text class="flex-1 ellipsis-1">联系电话 {{ convertedGood.contact_phone }}</text>
          <view class="intro-btn">
            <uni-icons type="phone-filled"
                       color="#fff"
                       size="14" />
            <text class="margin-left-4"
                  @click="handleMakePhoneCall(convertedGood.contact_phone)">拨打</text>
          </view>
        </view>
      </view>
      <view id="intro_text"
            class="intro_text"
            v-if="convertedGood.intro_text">
        <view class="text-center font-16 t">购买须知</view>
        <parser :html="convertedGood.intro_text" />
      </view>
      <view id="context"
            class="context"
            v-if="convertedGood.context">
        <view class="text-center font-16 t">商品详情</view>
        <parser :html="convertedGood.context" />
      </view>
      <view id="recomend" class="recomend" v-if="convertRecomendList.length">
        <view class="text-center font-16 t">为您推荐</view>
        <view class="goods-wraper">
          <view class="goods-item"
                v-for="item of convertRecomendList"
                :key="item.id"
                @click="redirectToDetail(item)">
            <view class="image-wraper">
              <image :src='item.encodeUrl' />
              <view class="expired-wraper"
                    v-if="item.isExpired">
                <image src='https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/img/expired.png'>
              </view>
              <view class="good-qty">{{item.salesQuantity}}件已售</view>
            </view>
            <view class="good-title ellipsis-2"
                  :class="item.isExpired ? 'disable': ''">{{item.title}}</view>
            <view class="padding-lr-8">
              <text class="pre-price margin-top-10"><text class="currency">￥</text>{{item.prePrice / 100}}</text>
            </view>
            <view class="flex flex-s-b flex-a-c padding-lr-8">
              <view class="price-wraper">
                <text class="price font-16">{{item.price / 100}}</text>
              </view>
              <view class="stock">库存{{item.size}}</view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    <view class="flex goods-nav-wraper border-top">
      <view class="options-item"
            v-for="item of goodsNavOptions"
            :key="item.text"
            @click="handleOptions(item)">
        <image :src="item.icon"></image>
        <text>{{ item.text }}</text>
      </view>
      <view class="flex-1 btn-group">
        <view v-for="item of goodsNavButtonGroup"
              :key="item.text"
              :style="{ color: item.color, backgroundColor: item.backgroundColor }"
              @click="handleCheckout">{{ item.text }}</view>
      </view>
    </view>
    <view v-if="isPosterShow"
          class="poster-wraper"
          @click="handlePosterClose(false)">
      <view class="poster-content"
            @click.stop="handlePosterClose(true)">
        <painter customStyle="position: absolute; left: -9999rpx;"
                 :palette="template"
                 @imgOK="onImgOK"
                 widthPixels="1000" />
        <image :src="posterImagePath"
               style="width: 100%; height: 100%;" />
      </view>
      <view class="poster-btn"
            v-if="posterImagePath"
            @click.stop="savePoster">
        <uni-icons type="download"
                   color="#fff"
                   size="18" />
        <text>保存</text>
      </view>
    </view>
    <get-user-info-modal v-if="isGetUserInfoModalShow"
                         @cancel="handleCancelGetUserModalShow"
                         @confirm="handleGetUserInfoModalConfirm" />
    <official-account></official-account>
  </view>
</template>
<script>
  import { imgEncodeUrl } from '../util/url'
  import { dataToQuery } from '../util/util'
  import * as Api from '../services/api'
  import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons'
  import { mapState, createNamespacedHelpers } from 'vuex'
  import {
  	getUserInfo,
  	showSuccess,
  	navigateTo,
  	authorize,
    switchTab,
    redirectTo,
  } from '../util/uniApi'
  import getUserInfoModal from '../components/getUserInfoModal'
  import TimeTask from '../util/timeTask'
  import parser from '../components/jyf-parser/jyf-parser'

  const { mapMutations: userMutations } = createNamespacedHelpers('user')
  const Cumtom = require('../static/cumtom')

  const timeTask = new TimeTask()

  export default {
  	components: {
  		uniIcons,
  		getUserInfoModal,
  		parser,
  	},
  	data() {
  		return {
  			id: '',
  			viewId: '',
  			tabList: [
  				{ id: 'org_name', title: '商家信息' },
  				{ id: 'intro_text', title: '购买须知' },
  				{ id: 'context', title: '商品详情' },
  				{ id: 'recomend', title: '为您推荐' },
  			],
  			goodInfo: {},
  			goodsNavOptions: [
  				{
  					id: 0,
  					icon:
  						'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/detail-shouye-icon.png',
  					text: '首页',
  					func: 'handleSwitchTab',
  					args: ['index'],
  				},
  				{
  					id: 0,
  					icon:
  						'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/share-icon.png',
  					text: '分享',
  					func: 'handlePosterShare',
  					args: [],
  				},
  				{
  					id: 0,
  					icon:
  						'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/detail-user-icon.png',
  					text: '我的',
  					func: 'handleSwitchTab',
  					args: ['user'],
  				},
  				// {
  				// 	id: 1,
  				// 	icon:
  				// 		'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/kefu.png',
  				// 	text: '客服',
  				// 	func: 'handleMakePhoneCall',
  				// 	args: [],
  				// },
  			],
  			wxacode: '',
  			template: {},
  			posterImagePath: '',
  			isPosterShow: false,
  			isGetUserInfoModalShow: false,
  			randomHeaders: [],
  			randomHeaderTimer: null,
        userInfoConfirmFn: function() {},
        recomendList: []
  		}
  	},
  	computed: {
  		...mapState(['user']),
  		convertedGood() {
  			return Object.entries(this.goodInfo).reduce((result, [key, value]) => {
  				if (value === undefined) value = ''

  				switch (key) {
  					case 'coupon_img':
  					case 'mini_share_img_url':
  						value = imgEncodeUrl(value)
  						break
  					default:
  						break
  				}

  				result[key] = value
  				return result
  			}, {})
      },
      convertRecomendList() {
        return this.recomendList.map((item) => {
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
  		goodsNavButtonGroup() {
  			const text = +this.goodInfo.type === 1 ? '送货上门' : '立即抢购'
  			return [
  				{
  					text,
  					backgroundColor: '#AD2532',
  					color: '#fff',
  				},
  			]
  		},
  	},
  	methods: {
  		...userMutations(['setUserInfo']),
  		async getRandomHeader() {
  			const { id } = this
  			const resp = await Api.getRandomHeader({ id })
  			this.randomHeaders = resp.map((item) => {
  				return {
  					url: imgEncodeUrl(item),
  					style: {
  						display: 'none',
  						opacity: 0,
  					},
  				}
  			})
  			let showIndex = 0

  			const runner = () => {
  				showIndex %= this.randomHeaders.length
  				const hideStyle = {
  					opacity: 0,
  				}
  				const showStyle = {
  					opacity: 1,
  				}
  				const setRandomHeadersStyle = (fn) => {
  					this.randomHeaders = this.randomHeaders.map((item, i) => {
  						item.style = hideStyle
  						if (fn instanceof Function) item = fn(item, i)
  						return item
  					})
  				}
  				setRandomHeadersStyle()
  				timeTask.run(() => {
  					setRandomHeadersStyle((item, i) => {
  						if (i === showIndex) item.style = showStyle
  						return item
  					})
  					showIndex++
  				}, 500)
  			}
  			this.randomHeaderTimer = setInterval(runner, 5000)
  		},
  		async getGoodInfos() {
  			const { id } = this
  			const resp = await Api.getGoodInfos({ id })
  			this.goodInfo = { ...resp }
  		},
  		handleTab(item) {
  			this.viewId = item.id
  		},
  		openMap({ latitude, longitude, name, address }) {
  			uni.openLocation({
  				latitude,
  				longitude,
  				name,
  				address,
  				scale: 16,
  				fail(err) {
  					uni.showToast({ title: '打开地图失败', icon: 'none' })
  				},
  			})
  		},
  		handleMapNavigate() {
  			const {
  				org_name: name,
  				org_address: address,
  				lat: latitude,
  				lon: longitude,
  			} = this.convertedGood
  			this.openMap({
  				name,
  				address,
  				latitude,
  				longitude,
  			})
  		},
  		handleMakePhoneCall(phoneNumber) {
  			uni.makePhoneCall({
  				phoneNumber,
  			})
  		},
  		handleSwitchTab(url) {
  			switchTab({
  				url,
  			})
  		},
  		handleOptions(option) {
  			this[option.func](...option.args)
  		},
  		async handlePosterShare() {
  			this.userInfoConfirmFn = this.renderPoster
  			const { posterImagePath } = this
  			if (posterImagePath) return (this.isPosterShow = true)

  			const [authErr] = await uni.authorize({ scope: 'scope.userInfo' })
  			console.log(authErr, 'authErr')
  			if (authErr) {
  				return (this.isGetUserInfoModalShow = true)
  			}
  			const userInfoEvt = await getUserInfo()
  			this.handleGetUserInfoModalConfirm({ detail: userInfoEvt })
  			// console.log('正在生成分享图')
  		},
  		onImgOK(e) {
  			this.posterImagePath = e.detail.path
  			uni.hideLoading()
  		},
  		handlePosterClose(open) {
  			this.isPosterShow = open
  		},
  		handleCancelGetUserModalShow() {
  			this.isGetUserInfoModalShow = false
  		},
  		handleGetUserInfoModalConfirm(e) {
  			this.isGetUserInfoModalShow = false
  			const { errMsg, userInfo } = e.detail
  			if (errMsg !== 'getUserInfo:ok') return
  			this.postUploadHead(userInfo).then(() => {
  				this.setUserInfo(userInfo)
  				uni.setStorageSync('userInfo', userInfo)
  				this.userInfoConfirmFn()
  			})
  		},
  		async postUploadHead(userInfo) {
  			const { nickName, avatarUrl: headImg } = userInfo
  			const resp = await Api.postUploadHead(
  				null,
  				(url) =>
  					url +
  					dataToQuery({
  						nickName: encodeURIComponent(nickName),
  						headImg: encodeURIComponent(headImg),
  					})
  			)
  			if (+resp.code !== 200) return Promise.reject()
  		},
  		async renderPoster() {
  			const { id } = this
  			uni.showLoading()
  			const time = String(new Date().getTime()).substr(5)
  			const scene = `${time}good=${id}`
  			// console.log(scene)
  			const { url } = await Api.getUnlimited({
  				scene,
  			})
  			this.wxacode = url
  			this.isPosterShow = true

  			this.template = {
  				width: '750rpx',
  				height: '1334rpx',
  				background: Cumtom.posterBg,
  				views: [
  					{
  						type: 'rect',
  						css: {
  							width: '670rpx',
  							height: '840rpx',
  							left: '40rpx',
  							top: '40rpx',
  							color: '#fff',
  							borderRadius: '20rpx',
  						},
  					},
  					{
  						type: 'rect',
  						css: {
  							width: '670rpx',
  							height: '300rpx',
  							left: '40rpx',
  							top: '910rpx',
  							color: '#fff',
  							borderRadius: '20rpx',
  						},
  					},
  					{
  						type: 'image',
  						url: this.convertedGood.mini_share_img_url,
  						css: {
  							width: '630rpx',
  							height: '630rpx',
  							left: '60rpx',
  							top: '60rpx',
  							borderRadius: '20rpx',
  						},
  					},
  					{
  						type: 'text',
  						text: this.convertedGood.coupon_display_name,
  						css: {
  							width: '630rpx',
  							left: '60rpx',
  							top: '750rpx',
  							color: '#000',
  							fontSize: '30rpx',
  							maxLines: 3,
  						},
  					},
  					// {
  					// 	type: 'text',
  					// 	text: `商家名称： ${this.convertedGood.org_name}`,
  					// 	css: {
  					// 		width: '630rpx',
  					// 		left: '60rpx',
  					// 		top: '660rpx',
  					// 		color: '#a0a0a0',
  					// 		fontSize: '24rpx',
  					// 		maxLines: 2,
  					// 	},
  					// },
  					// {
  					// 	type: 'text',
  					// 	text: `联系电话： ${this.convertedGood.contact_phone}`,
  					// 	css: {
  					// 		width: '630rpx',
  					// 		left: '60rpx',
  					// 		top: '700rpx',
  					// 		color: '#a0a0a0',
  					// 		fontSize: '24rpx',
  					// 	},
  					// },
  					// {
  					// 	type: 'text',
  					// 	text: `联系电话： ${this.convertedGood.org_address}`,
  					// 	css: {
  					// 		width: '630rpx',
  					// 		left: '60rpx',
  					// 		top: '740rpx',
  					// 		color: '#a0a0a0',
  					// 		fontSize: '24rpx',
  					// 		maxLines: 2,
  					// 	},
  					// },
  					{
  						type: 'image',
  						url: this.user.userInfo?.avatarUrl,
  						css: {
  							width: '120rpx',
  							height: '120rpx',
  							left: '60rpx',
  							top: '930rpx',
  							borderRadius: '120rpx',
  						},
  					},
  					{
  						type: 'text',
  						text: this.user.userInfo?.nickName || '',
  						css: {
  							width: '200rpx',
  							left: '200rpx',
  							top: '990rpx',
  							color: '#333',
  							fontSize: '24rpx',
  							maxLines: 1,
  						},
  					},
  					{
  						type: 'text',
  						text: `抢购价： ￥${this.convertedGood.realcost / 100}`,
  						css: {
  							width: '400rpx',
  							left: '60rpx',
  							top: '1070rpx',
  							color: '#ff0000',
  							fontSize: '32rpx',
  						},
  					},
  					{
  						type: 'text',
  						text: `原价： ￥${this.convertedGood.amount / 100}`,
  						css: {
  							width: '400rpx',
  							left: '60rpx',
  							top: '1150rpx',
  							color: '#999',
  							fontSize: '24rpx',
  						},
  					},
  					{
  						type: 'image',
  						url: this.wxacode,
  						css: {
  							width: '200rpx',
  							height: '200rpx',
  							left: '460rpx',
  							top: '930rpx',
  							borderRadius: '200rpx',
  						},
  					},
  					{
  						type: 'rect',
  						css: {
  							width: '200rpx',
  							height: '50rpx',
  							left: '460rpx',
  							top: '1140rpx',
  							color: '#f2f2f2',
  							borderRadius: '20rpx',
  						},
  					},
  					{
  						type: 'text',
  						text: '长按立即购买',
  						css: {
  							width: '180rpx',
  							left: '484rpx',
  							top: '1154rpx',
  							color: '#666',
  							fontSize: '24rpx',
  						},
  					},
  				],
  			}
  		},
  		async savePoster() {
  			await authorize('writePhotosAlbum')
  			const { posterImagePath } = this
  			const [errorMsg, result] = await uni.saveImageToPhotosAlbum({
  				filePath: posterImagePath,
  			})

  			if (errorMsg)
  				return uni.showToast({ title: '保存到相冊失败', icon: 'none' })
  			if (result.errMsg === 'saveImageToPhotosAlbum:ok') {
  				this.isPosterShow = false
  				showSuccess('保存到相册成功')
  			}
  		},
  		async handleCheckout() {
  			this.userInfoConfirmFn = this.checkoutNavigate
  			const [authErr] = await uni.authorize({ scope: 'scope.userInfo' })
  			if (authErr) {
  				return (this.isGetUserInfoModalShow = true)
  			}
  			const userInfoEvt = await getUserInfo()
  			this.handleGetUserInfoModalConfirm({ detail: userInfoEvt })
  		},
  		async checkoutNavigate() {
  			// console.log('checkout')
  			const { id } = this
  			uni.setStorageSync('goodInfo', this.goodInfo)
  			navigateTo({
  				url: 'checkout' + dataToQuery({ id }),
  			})
      },
      async getRecommendGoods() {
        const { openid, location } = this.user
        const { adcode } = location

        if (!openid || !adcode) this.recomendList = []
  			const res = await Api.getRecommendGoods({
  				adcode,
        })
        if (!Array.isArray(res)) return []
  			const goods =  res.map(item => {
          return {
            ...item,
            id: item.coupon_id,
            expiredTime: item.end_date,
            title: item.coupon_display_name,
            price: item.realcost,
            prePrice: item.amount
          }
        })
  			this.recomendList = goods
      },
      redirectToDetail(item) {
        if (item.isExpired) return
        const query = dataToQuery({
          id: item.id
        })
        const url = `goodDetail${query}`
        redirectTo({
          url
        })
      },
      checkIsExpired(time) {
  			const now = new Date().getTime()
  			const expiredTime = new Date(time).getTime()
  			return expiredTime < now ? true : false
      },
  	},
  	mounted() {},
  	onLoad({ id }) {
  		this.id = id
  		this.getGoodInfos()
      this.getRandomHeader()
      this.getRecommendGoods()
  	},
  	onUnload() {
  		clearInterval(this.randomHeaderTimer)
    },
    watch: {
  		user: {
  			deep: true,
  			handler(val) {
  				this.getRecommendGoods()
  			},
  		},
  	},
  }
</script>
<style scoped lang="scss">
  @import '../styles/var.scss';
  @import '../styles/mixin.scss';

  .tab-wraper {
  	box-sizing: border-box;
  }
  .tab-item {
  	font-size: 28upx;
  	line-height: 68upx;
  	transition: all 0.2s linear;
  	text-align: center;
  	background: #fff;
  	border-right: borderStyle();
    &.active {
  		color: $themeColor;
  	}
  	&:last-child {
  		border: none;
  	}
  }
  .info-wraper {
  	position: relative;
  	.banner-wraper {
  		width: 100%;
  		height: 0;
  		padding-top: 80%;
  		background-size: 100% 100%;
  		background-repeat: no-repeat;
  	}
  	.random-headers-wraper {
  		position: absolute;
  		top: 20upx;
  		left: 20upx;
  		width: 50%;
  		height: 48upx;
  		overflow: hidden;
  		.random-header {
  			position: absolute;
  			left: 0;
  			top: 0;
  			display: flex;
  			align-items: center;
  			transition: all 0.4s linear;
  			image {
  				width: 48upx;
  				height: 48upx;
  				border-radius: 50%;
  			}
  			text {
  				margin-left: 20upx;
  				border-radius: 36upx;
  				padding: 0 20upx;
  				line-height: 40upx;
  				background: rgba($color: #000000, $alpha: 0.3);
  				color: #f5f5f5;
  				font-size: 24upx;
  			}
  		}
  	}
  }
  .goods-nav-wraper {
  	height: 100upx;
  	box-sizing: border-box;
  	.options-item {
  		background-color: #fff;
  		padding: 0 30upx;
  		font-size: 24upx;
  		box-sizing: border-box;
  		display: flex;
  		flex-flow: column;
  		align-items: center;
  		padding-top: 20upx;
  		image {
  			width: 32upx;
  			height: 32upx;
  			margin-bottom: 8upx;
  		}
  	}
  	.btn-group {
  		height: 100upx;
  		line-height: 100upx;
  		font-size: 30upx;
  		text-align: center;
  	}
  }
  .good-info,
  .org_name,
  .intro_text,
  .context,
  .recomend {
  	@extend .border-bottom;
  	box-sizing: border-box;
  	padding: 28upx;
    .t {
      display: flex;
      align-items: center;
      justify-content: center;
      &::before, &::after{
        content: '-';
        margin: 0 12upx;
      }
    }
    
  }
  .border-bottom {
  	border-bottom: borderStyle();
  }
  .price-group {
  	display: flex;
  	align-items: center;
  	.realcost {
  		font-size: 40upx;
  		color: $themeColor;
  		vertical-align: baseline;
  		&::before {
  			content: '￥';
  			display: inline-block;
  			font-size: 28upx;
  		}
  	}
  	.amount {
  		font-size: 28upx;
  		color: #999;
  		margin-left: 20upx;
  		vertical-align: baseline;
  		text-decoration: line-through;
  		&::before {
  			content: '￥';
  			font-size: 24upx;
  			display: inline-block;
  			text-decoration: line-through;
  		}
  	}
  }
  .good-title {
  	font-size: 32upx;
  	color: #333;
  	margin-top: 20upx;
  }
  .intro-btn {
  	background: $themeColor;
  	line-height: 42upx;
  	font-size: 24upx;
  	padding: 0 20upx;
  	color: #fff;
  	border-radius: 12upx;
  	display: flex;
  	align-items: center;
  }
  .poster-wraper {
  	position: fixed;
  	background-color: rgba($color: #000000, $alpha: 0.6);
  	width: 100%;
  	height: 100%;
  	z-index: 9999;
  	.poster-content {
  		width: 80%;
  		height: 70vh;
  		position: absolute;
  		top: 44%;
  		left: 50%;
  		transform: translate(-50%, -50%);
  		border-radius: 20upx;
  		display: flex;
  		flex-flow: column;
  		overflow: hidden;
  	}
  }
  .poster-btn {
  	display: flex;
  	position: absolute;
  	bottom: 40upx;
  	left: 50%;
  	transform: translateX(-50%);
  	background: $themeColor;
  	color: #fff;
  	width: 500rpx;
  	font-size: 32upx;
  	line-height: 96upx;
  	justify-content: center;
  	align-items: center;
  	border-radius: 44upx;
  	text {
  		margin-left: 20upx;
  	}
  }
  .headImg-wraper {
  	flex: 1;
  	overflow: hidden;
  	margin-right: 40upx;
  	position: relative;
  	height: 80upx;
  	image {
  		width: 80upx;
  		height: 80upx;
  		border-radius: 50%;
  		border: borderStyle();
  		position: absolute;
  	}
  }
  .kefu-btn {
  	padding: 0 20upx;
  	border: 2upx solid $themeColor;
  	line-height: 48upx;
  	border-radius: 12upx;
  	color: $themeColor;
  	image {
  		width: 30upx;
  		height: 30upx;
  	}
  	text {
  		font-size: 24upx;
  	}
  }
  .recomend {
  	.goods-wraper {
  		box-sizing: border-box;
  		flex-wrap: wrap;
  		display: flex;
  		&.full-h {
  			height: 100%;
  		}
  		.goods-item {
  			@extend .boxshadow;
  			margin-top: 20upx;
  			width: 48%;
  			margin-right: 4%;
  			padding-bottom: 20upx;
  			background: #fff;
  			height: 480upx;
  			&:nth-child(2n) {
  				margin-right: 0;
  			}
  			.image-wraper {
  				overflow: hidden;
  				width: 100%;
  				height: 240upx;
  				position: relative;
  				image {
  					width: 100%;
  					height: 100%;
  				}
  				.good-qty {
  					position: absolute;
  					bottom: 0;
  					right: 0;
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
  				margin-top: 24upx;
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
  					color: $themeColor;
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
  }
</style>
