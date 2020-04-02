<template>
  <view class="page">
    <view class="flex flex-a-c action-card-wraper"
          v-if='user.userInfo.avatarUrl'>
      <image class="avatar"
             :src="user.userInfo.avatarUrl" />
      <text class="nick-name margin-left-10">{{user.userInfo.nickName}}</text>
    </view>
    <view class="action-card-wraper margin-top-15">
      <view class="action-card">
        <view class="flex flex-a-c"
              @click="handleOrderTabClick('-1')">
          <text class="flex-1">我的优惠券</text>
          <text class="font-12 margin-right-4">全部</text>
          <uni-icons type='arrowright'
                     color='999'
                     size='14' />
        </view>
        <view class="flex flex-a-c flex-s-b margin-top-15">
          <view class="flex flex-column"
                v-for="item of orderTabList"
                :key="item.status"
                @click="handleOrderTabClick(item.status)">
            <image class="tab-icon"
                   :src="item.icon" />
            <text class="font-12 margin-top-6">{{item.title}}</text>
          </view>
        </view>
      </view>
    </view>
    <scroll-view class="margin-top-15"
                 scroll-y>
      <view class="flex flex-a-c padding-lr-15 padding-tb-10"
            v-for="(item, index) of tabList"
            :key="item.categoryId"
            @click="handdleTabChange(item, index)">
        <text class="flex-1">{{item.title}}</text>
        <uni-icons type='arrowright'
                   color='999'
                   size='14' />
      </view>
    </scroll-view>
    <get-user-info-modal v-if="isGetUserInfoModalShow"
                         @cancel="handleCancelGetUserModalShow"
                         @confirm="handleGetUserInfoModalConfirm" />
    <pre-loading :show='isPreLoadingShow'/>
  </view>
</template>
<script>
  import { dataToQuery } from '../util/util'
  import * as Api from '../services/api'
  import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons'
  import { mapState, createNamespacedHelpers } from 'vuex'
  import { navigateTo, switchTab } from '../util/uniApi'
  import getUserInfoModal from '../components/getUserInfoModal'
  import TimeTask from '../util/timeTask'
  import preLoading from '../components/preLoading'

  const timeTask = new TimeTask()

  const {
  	mapMutations: userMutations,
  	mapActions: userActions,
  } = createNamespacedHelpers('user')

  const { mapMutations: homeMutations } = createNamespacedHelpers('home')

  export default {
  	components: {
  		uniIcons,
      getUserInfoModal,
      preLoading,
  	},
  	data() {
  		return {
  			isGetUserInfoModalShow: false,
  			orderTabList: [
  				{
  					status: '-1',
  					title: '全部',
  					icon:
  						'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/quanbudingdan.png',
  				},
  				{
  					status: '0',
  					title: '未使用',
  					icon:
  						'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/weishiyongdingdan.png',
  				},
  				{
  					status: '1',
  					title: '已使用',
  					icon:
  						'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/yishiyongdingdan.png',
  				},
  				{
  					status: '2',
  					title: '已过期',
  					icon:
  						'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/yiguoqidingdan.png',
  				},
  			],
        tabList: [],
        isPreLoadingShow: true,
  		}
  	},
  	computed: {
  		...mapState(['user']),
  	},
  	methods: {
  		...userMutations(['setUserInfo']),
  		...userActions(['getLocation']),
  		...homeMutations(['setHomeTabState']),
  		handleCancelGetUserModalShow() {
  			this.isGetUserInfoModalShow = false
  		},
  		handleGetUserInfoModalConfirm(e) {
  			this.isGetUserInfoModalShow = false
  			const { errMsg, userInfo } = e.detail
  			if (errMsg !== 'getUserInfo:ok') return
  			uni.setStorageSync('userInfo', userInfo)
  			this.setUserInfo(userInfo)

  			this.isGetUserInfoModalShow = false
  			this.postUploadHead()
  		},
  		async getCategories() {
  			const { openid, location } = this.user
  			const { adcode } = location

  			if (!adcode) {
  				this.getLocation({
  					mapReverse: true,
  				})
  				return
  			}

  			if (!openid) return
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
  		},
  		handdleTabChange(item, initialIndex) {
  			this.setHomeTabState({
  				initialIndex,
  				shouldTabInitial: true,
  			})
  			switchTab({
  				url: 'index',
  			})
  		},
  		handleOrderTabClick(status) {
  			navigateTo({
  				url: 'orderList' + dataToQuery({ status }),
  			})
  		},
  		async postUploadHead() {
  			const { nickName, avatarUrl: headImg } = this.user.userInfo
  			if (!headImg) return
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
  	},
  	async onLoad() {
      this.isPreLoadingShow = true
      await this.getCategories()
      timeTask.run(() => {
        this.isPreLoadingShow = false
      }, 1000)
  	},
  	onShow() {
  		this.isGetUserInfoModalShow = this.user.userInfo.avatarUrl ? false : true
  	},
  	onUnload() {},
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
  @import '../styles/var.scss';
  @import '../styles/mixin.scss';

  .page {
  	padding-top: 20upx;
  	position: relative;
  	&::before {
  		content: '';
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
  	z-index: 10;
  	.action-card {
  		@extend .boxshadow;
  		background-color: #fff;
  		padding: 20upx;
  		border-radius: 20upx;
  	}
  	&:first-child {
  		margin-top: 0;
  	}
  }
  .tab-icon {
  	box-sizing: border-box;
  	width: 63upx;
  	height: 50upx;
  	z-index: 999;
  }
  .avatar {
  	width: 140upx;
  	height: 140upx;
  	border-radius: 50%;
  	border: 4upx solid #fff;
  }
  .nick-name {
    color: $themeFontColor;
  }
</style>
