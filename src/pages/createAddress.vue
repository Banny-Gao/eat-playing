<template>
  <view class="page">
    <view class="flex-1">
      <view
        class="flex flex-a-c border-bottom action-card-wraper input-item"
        @click="handleOpenPopup"
      >
        <view class="required margin-right-10">收货地址</view>
        <input
          class="flex-1"
          type="text"
          :value="addressParams.address"
          placeholder="点击选择收货地址"
        />
        <uni-icons type="arrowright" color="#333" />
      </view>
      <view class="flex flex-a-c border-bottom action-card-wraper input-item">
        <view class="required margin-right-10">详细地址</view>
        <input
          class="flex-1"
          type="text"
          :value="addressParams.addressInfo"
          placeholder="请填写详细地址"
          @input="handleInput('addressInfo', $event)"
        />
      </view>
      <view class="flex flex-a-c border-bottom action-card-wraper input-item">
        <view class="required margin-right-10">联系人</view>
        <input
          class="flex-1"
          type="text"
          :value="addressParams.userName"
          placeholder="请填写收货人姓名"
          @input="handleInput('userName', $event)"
        />
      </view>
      <view class="flex flex-a-c border-bottom action-card-wraper input-item">
        <view class="required margin-right-10">手机号</view>
        <input
          class="flex-1"
          type="text"
          :value="addressParams.phone"
          placeholder="请填写收货人手机号"
          @blur="handleInput('phone', $event)"
        />
      </view>
      <view class="flex flex-a-c border-bottom action-card-wraper input-item">
        <view class="flex-1">设为默认地址</view>
        <switch :checked="addressDeafultChecked" color="#FBDE20" @change="handleInput('defaultFlag', $event)"/>
      </view>
    </view>
    <view class="action-card-wraper">
      <view class="new-list-button" @click="handleActionAddress">保存</view>
    </view>
    <select-address
      ref="selectAddress"
      :address='selectedAddress'
      @selectAddress="handleSetAddressParams('address', $event)"
    ></select-address>
  </view>
</template>
<script>
import * as Api from "../services/api"
import uniIcons from "@dcloudio/uni-ui/lib/uni-icons/uni-icons"
import selectAddress from "../components/selectAddress"
import { showSuccess, navigateBack } from "../util/uniApi"
import { regExp } from '../util/util'

export default {
  components: {
    uniIcons,
    selectAddress
  },
  data() {
    return {
      navgationBarTitle: '',
      addressData: undefined,
      addressParams: {
        address: "",
        defaultFlag: 1,
        addressInfo: "",
        userName: "",
        phone: ""
      },
      errMsgTips: {
        address: "请检查收货地址",
        addressInfo: "请检查详细地址",
        userName: "请检查收货人姓名",
        phone: "请检查收货人手机号"
      }
    }
  },
  computed: {
    addressDeafultChecked() {
      return +this.addressParams.defaultFlag === 1
    },
    selectedAddress() {
      return this.addressParams.address.split(' ')
    }
  },
  methods: {
    setTitle() {
      let title = "新建地址"
      if (this.addressParams.id) title = "编辑地址"
      this.navgationBarTitle = title
      uni.setNavigationBarTitle({ title })
    },
    handleOpenPopup() {
      this.$refs.selectAddress.show()
    },
    handleSetAddressParams(key, value) {
      this.addressParams[key] = value
    },
    handleInput(key, evt, fn) {
      let f = true, value = evt.detail.value
      if (fn instanceof Function) f = fn.call(this)
      switch (key) {
        case 'defaultFlag':
          value = Number(value)
          break;
        case 'phone': 
          f = this.checkPhone(evt.detail.value)
        default: break;
      }
      if (f) this.handleSetAddressParams(key, value)
    },
    checkPhone(phone) {
      const f = regExp.phone.test(phone)
      if (!f) uni.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return f
    },
    validateAddressParamsItem() {
      for (let [key, value] of Object.entries(this.addressParams)) {
        if (value === '') return [{ type: false, msg: this.getErrorMsgOfKey(key) }]
        if (key === 'phone' && !this.checkPhone(value)) return [{ type: false }]
      }
      return [null, true]
    },
    getErrorMsgOfKey(key) {
      return this.errMsgTips[key]
    },
    async handleActionAddress() {
      let request, params = { ...this.addressParams }, title
      const { id } = this.addressParams
      const [error, validate] = this.validateAddressParamsItem()
      if (error) {
        error.msg && uni.showToast({ title: error.msg, icon: 'none' })
        return
      }
      if (!id) request = 'postCreateAddress'
      else {
        request = 'postUpdateAddress'
        params.addressId = params.id
      }

      const resp = await Api[request](params)
      if (+resp.code === 200) {
        await showSuccess(this.navgationBarTitle + '成功')
        navigateBack()
      }
    }
  },
  mounted() {
    this.setTitle()
  },
  onLoad({ addressData }) {
    if (addressData)
      this.addressParams = {
        ...this.addressParams,
        ...JSON.parse(addressData)
      }
  },
  onUnload() {}
}
</script>
<style scoped lang="scss">
@import "../styles/var.scss";
@import "../styles/mixin.scss";

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
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    border: none;
  }
  .edit {
    width: 60upx;
    height: 60upx;
    position: absolute;
    right: 20upx;
    top: 50%;
    transform: translateY(-50%);
  }
}
.input-item {
  position: relative;
  line-height: 100upx;
  background: #fff;
  padding-left: 50upx;
  .required {
    &::before {
      content: "*";
      color: $themePriceColor;
      position: absolute;
      left: 20upx;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
