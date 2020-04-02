<template>
  <view class="page" :class="addressList.length === 0 ? 'bg-fff': ''">
    <scroll-view scroll-y>
      <view class="action-card"
            v-for="item of addressList"
            :key="item.id">
        <view class="flex flex-a-c"
              :class="item.defaultFlag === 1 ? 'default' : ''"
              @click="handleEditAddress(item)">
          <view class="margin-right-10">{{ item.userName }}</view>
          <view>{{ item.phone }}</view>
        </view>
        <view class="margin-top-8"
              @click="handleEditAddress(item)">{{ item.address }} {{ item.addressInfo }}</view>
        <image class="edit"
               src="https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/edit-icon.png"
               @click="handleEditAddress(item)"></image>
        <uni-icons class="trash"
                   type="trash"
                   color="#FBDE20"
                   size="20"
                   @click.stop="handleDeleteAddress(item)" />
      </view>
      <image class="nodata" v-if="addressList.length === 0" src="https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/img/noaddress.png">
    </scroll-view>
    <view class="action-card-wraper">
      <view class="new-list-button"
            @click="handleNewAddress">新建地址</view>
    </view>
    <pre-loading :show='isPreLoadingShow'/>
  </view>
</template>
<script>
  import { dataToQuery } from '../util/util'
  import * as Api from '../services/api'
  import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons'
  import {
  	navigateTo,
  	showModal,
  } from '../util/uniApi'
  import TimeTask from '../util/timeTask'
  import preLoading from '../components/preLoading'

  const timeTask = new TimeTask()

  export default {
  	components: {
      uniIcons,
      preLoading,
  	},
  	data() {
  		return {
        addressList: [],
        isPreLoadingShow: true 
  		}
  	},
  	computed: {
  	},
  	methods: {
  		async getAddressList() {
  			const resp = await Api.getAddressList()
  			this.addressList = [...resp]
  		},
  		handleNewAddress() {
  			navigateTo({
  				url: 'createAddress',
  			})
  		},
  		handleEditAddress(item) {
  			const addressData = dataToQuery({ addressData: JSON.stringify(item) })
  			navigateTo({
  				url: 'createAddress' + addressData,
  			})
  		},
  		async handleDeleteAddress(item) {
  			const { id: addressId } = item
  			await showModal({ title: '提示', content: '确定要删除当前地址吗' })
  			const resp = await Api.postDeleteAddress({ addressId })
  			if (+resp.code === 200) this.getAddressList()
  		},
  	},
  	onShow() {
      this.getAddressList()
    },
    onLoad() {
      this.isPreLoadingShow = true
      timeTask.run(() => {
        this.isPreLoadingShow = false
      }, 1000)
    }
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
  	color: $themeFontColor;
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
  	padding-right: 100upx;
  	.default {
  		&::before {
  			content: '默认';
  			background: $themeColor;
  			color: $themeFontColor;
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
  	.edit {
  		width: 48upx;
  		height: 48upx;
  		position: absolute;
  		right: 18upx;
  		top: 26%;
  		transform: translateY(-50%);
  	}
  	.trash {
  		position: absolute;
  		right: 20upx;
  		top: 48%;
  	}
  }
  .nodata{
    width: 330upx;
    height: 210upx;
    display: block;
    margin: 200upx auto;
  }
  .bg-fff{
    background: #fff!important;
  }
</style>
