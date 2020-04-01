<template>
  <view class="page">
    <scroll-view scroll-y>
      <view class="action-card"
            :class="item.id === user.choicedAddress.id ? 'action-choiced': W"
            v-for="item of addressList"
            :key="item.id"
            @click="handleChoiced(item)">
        <uni-icons class="choiced-icon" type='circle-filled' color='#AD2532' v-if="user.choicedAddress.id === item.id"></uni-icons>
        <view class="flex flex-a-c"
              :class="item.defaultFlag === 1 ? 'default': ''">
          <view class="margin-right-10">{{item.userName}}</view>
          <view>{{item.phone}}</view>
        </view>
        <view class="margin-top-8">{{item.address}} {{item.addressInfo}}</view>
        <image class="edit" src='https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/edit-icon.png' @click.stop="handleEditAddress(item)"></image>
      </view>
    </scroll-view>
    <view class="action-card-wraper">
      <view class="new-list-button"
            @click="handleNewAddress">新建地址</view>
    </view>
  </view>
</template>
<script>
  import * as Api from '../services/api'
  import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons'
  import { mapState, createNamespacedHelpers } from 'vuex'
  import { navigateBack, navigateTo } from '../util/uniApi'
  import { dataToQuery } from '../util/util'
  import TimeTask from '../util/timeTask'

  const { mapMutations: userMutations } = createNamespacedHelpers('user')

  const timeTask = new TimeTask()

  export default {
  	components: {
  		uniIcons,
  	},
  	data() {
  		return {
        addressList: [],
  		}
  	},
  	computed: {
  		...mapState(['user']),
  	},
  	methods: {
  		...userMutations(['setUserChoicedAddress']),
  		async getAddressList() {
  			const resp = await Api.getAddressList()
  			this.addressList = [...resp]
      },
      handleChoiced(item) {
        this.setUserChoicedAddress(item)
        timeTask.run(navigateBack, 800)
      },
      handleEditAddress(item) {
  			const addressData = dataToQuery({ addressData: JSON.stringify(item) })
  			navigateTo({
  				url: 'createAddress' + addressData,
  			})
      },
      handleNewAddress() {
  			navigateTo({
  				url: 'createAddress',
  			})
  		},
  	},
  	onShow() {
  		this.getAddressList()
  	},
  }
</script>
<style scoped lang="scss">
  @import '../styles/var.scss';
  @import '../styles/mixin.scss';

  .page {
  	padding-bottom: 40upx;
  }
  .action-card-wraper {
  	box-sizing: border-box;
  	padding: 0 30upx;
  }
  .new-list-button {
  	background: $themeColor;
  	color: #fff;
  	font-size: 32upx;
  	text-align: center;
  	line-height: 100upx;
  	border-radius: 10upx;
  	margin-top: 80upx;
  }
  .action-card {
  	padding: 20upx 40upx;
  	margin-top: 20upx;
  	background-color: #fff;
  	border-radius: 8upx;
  	position: relative;
    border-bottom: borderStyle();
    transition: all .2s linear;
  	padding-right: 100upx;
  	.default {
  		&::before {
  			content: '默认';
  			background: $themeColor;
  			color: #fff;
  			font-size: 20upx;
  			padding: 0 8upx;
  			line-height: 40upx;
  			border-radius: 4upx;
  			margin-right: 20upx;
  		}
  	}
  	&:first-child {
  		margin-top: 0;
  	}
  	&:last-child {
  		border: none;
  	}
  	.edit{
      width: 48upx;
  		height: 48upx;
      position: absolute;
  		right: 20upx;
  		top: 50%;
  		transform: translateY(-50%);
    }
    &.action-choiced{
      padding-left: 80upx;
    }
    .choiced-icon{
      position: absolute;
      left: 20upx;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
