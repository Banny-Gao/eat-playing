<template>
  <view class="header-fix" :class="showBg ? 'show': ''">
    <view class="status_bar" :style="{ height: statusBarHeight + 'px' }">
      <!-- 这里是状态栏 -->
    </view>
    <view class="__header" :style="{ height: titleBarHeight + 'px' }">
      <uni-icons type="arrowleft" color="#fff" v-if="!mode && showBackIcon" />
      <view class="address-wraper">
        <view class="city-con" v-if="city" @click="navigateToChoicePosition">
          <text class="city" :style="{fontSize: cityFont + 'rpx'}">{{ city }}</text>
          <uni-icons
            type="arrowdown"
            color="#000"
            size="16"
          />
        </view>
        <uni-icons
          v-else
          class="map-icon"
          type="map-pin-ellipse"
          color="#000"
          size="20"
        />
      </view>
      <view class="__title">
        <image
          v-if="showPlaceholder"
          class="icon"
          mode="aspectFit"
          :src="iconSrc.placeholder"
        />
        <text v-if="showPlaceholder" class="placeholder-text">{{
          locales.placeholder.search
        }}</text>
        <input
          type="text"
          class="search-input"
          confirm-type="搜索"
          v-model="inputValue"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          @input="handleInput"
          @confirm="handleSearch"
        />
        <image
          class="icon clear-icon"
          v-if="inputValue"
          @click="handleClear"
          mode="aspectFit"
          :src="iconSrc.clear"
        />
        <image
          class="icon clear-icon"
          v-if="showSearchVoice && !inputValue"
          @click="openVoiceGroup"
          mode="aspectFit"
          :src="iconSrc.voice"
        />
      </view>
    </view>
    <cover-view
      class="voice-group"
      v-if="isShowVoiceGroup"
      :style="{
        height: screenHeight - totalTopHeight + 'px'
      }"
    >
      <cover-view
        class="voice-button"
        :class="[
          recordStatus !== -1 && !isVoiceTouched ? 'btn-disable' : '',
          isVoiceTouched ? 'touched' : ''
        ]"
        @touchstart="handleVoiceTouchStart"
        @touchend="handleVoiceTouchEnd"
        @touchcancel="handleVoiceTouchEnd"
      >
        {{ voiceText }}
      </cover-view>
      <cover-image
        class="icon close-icon"
        mode="aspectFit"
        :src="iconSrc.close"
        @click="closeVoiceGroup"
      />
      <cover-view class="lisen-wraper">
        <cover-view :style="{ color: getRecordStatusColor }">
          {{ listenText }}
          <cover-view v-if="recordStatus === 0 && isVoiceTouched"
            >{{ recordSecondText }}s</cover-view
          >
        </cover-view>
        <cover-view class="animate" v-if="isShowListenAnimation">
          <cover-view
            :style="{ backgroundColor: getRecordStatusColor }"
            class="one"
          ></cover-view>
          <cover-view
            :style="{ backgroundColor: getRecordStatusColor }"
            class="two"
          ></cover-view>
          <cover-view
            :style="{ backgroundColor: getRecordStatusColor }"
            class="three"
          ></cover-view>
          <cover-view
            :style="{ backgroundColor: getRecordStatusColor }"
            class="four"
          ></cover-view>
          <cover-view
            :style="{ backgroundColor: getRecordStatusColor }"
            class="five"
          ></cover-view>
        </cover-view>
      </cover-view>
    </cover-view>
  </view>
</template>
<script>
import uniIcons from "@dcloudio/uni-ui/lib/uni-icons/uni-icons"
import locales from "../locales"
import { mapState, createNamespacedHelpers } from "vuex"
import { navigateTo, authorize } from "../util/uniApi"
import Task from "../util/timeTask"

const { mapActions: userActions } = createNamespacedHelpers("user")

const Custom = require('../static/custom')
const { Index, CDNUrl } = Custom

const showSearchVoice = !!Index.showSearchVoice

const recordTask = new Task()

export default {
  components: {
    uniIcons
  },
  props: {
    mode: {
      type: String,
      default: ""
    },
    q: {
      type: String,
      default: ""
    },
    showBg: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      locales,
      showSearchVoice,
      platform: "",
      totalTopHeight: 0,
      statusBarHeight: 0,
      titleBarHeight: 0,
      tabBarHeight: 0,
      screenHeight: 0,
      showBackIcon: false,
      iconSrc: {
        voice: `${CDNUrl}/static/icon/icon_voice.png`,
        clear: `${CDNUrl}/static/icon/icon_clear.png`,
        placeholder: `${CDNUrl}/static/icon/icon_search.png`,
        close: `${CDNUrl}/static/icon/icon_close.png`
      },
      inputValue: "",
      isInputFocus: false,
      isShowVoiceGroup: false,
      isVoiceTouched: false,
      touchedId: undefined,
      recordStatus: -1,
      recordStatusText: {
        "-1": "准备就绪，请按下开始按钮",
        0: "正在聆听",
        1: "正在识别",
        2: "翻译完成",
        3: "识别错误"
      },
      recordStatusColor: {
        "-1": "#f5f5f5",
        0: "#f8f8f8",
        1: "#189EFF",
        2: "#4FC08D",
        3: "#DC4F3F"
      },
      recordManager: null,
      recording: false,
      recordSecondText: 10
    }
  },
  computed: {
    ...mapState(["user"]),
    city() {
      return this.user.location.address || ''
    },
    cityFont() {
      if (this.city.length <= 3) {
        return 28
      } else {
        return 24
      }
    },
    showPlaceholder() {
      return !(this.inputValue || this.isInputFocus)
    },
    voiceText() {
      return this.isVoiceTouched ? "松开 结束" : "长按 开始"
    },
    listenText() {
      return this.recordStatusText[this.recordStatus] || ""
    },
    getRecordStatusColor() {
      return this.recordStatusColor[this.recordStatus] || "transparent"
    },
    isShowListenAnimation() {
      return [0, 1].includes(this.recordStatus)
    }
  },
  methods: {
    ...userActions(["getLocation"]),
    navigateToSearch() {
      navigateTo({
        url: "search"
      })
    },
    navigateToChoicePosition() {
      navigateTo({
        url: "positionChoice"
      })
    },
    handleSearch() {
      this.$emit("search", this.inputValue)
    },
    handleInput() {
      this.$emit("input", this.inputValue)
    },
    handleInputFocus() {
      this.isInputFocus = true
      this.isShowVoiceGroup = false
      this.$emit("inputFocus")
    },
    handleInputBlur() {
      this.isInputFocus = false
      this.isShowVoiceGroup = false
      this.$emit("inputBlur")
    },
    handleClear() {
      this.$emit("clear")
    },
    async openVoiceGroup() {
      if (!this.recordManager) await this.initVoiceManager()
      this.isShowVoiceGroup = true
    },
    closeVoiceGroup() {
      this.isShowVoiceGroup = false
      this.recordStatus = -1
    },
    async initVoiceManager() {
      await authorize("record")
      const plugin = requirePlugin("WechatSI")
      this.recordManager = plugin.getRecordRecognitionManager()
      this.listenRecordManagerStart()
      this.listenRecordManagerStop()
      this.listenRecordManagerRecognize()
      this.listenRecordManagerError()
    },
    handleVoiceTouchStart() {
    //  console.log("按下手指")
      if (this.recordStatus !== -1) return
      this.isVoiceTouched = true
      this.touchedId = recordTask.run(() => {
        this.touchedId = undefined
        this.recording = true
        this.recordManager.start({
          lang: "zh_CN"
        })
      }, 200)
    },
    handleVoiceTouchEnd() {
      if (this.touchedId) {
        recordTask.cacel(this.touchedId)
        this.touchedId = undefined
      }
    //  console.log("抬起手指")
      this.isVoiceTouched = false
      if (this.recordManager && this.recording) {
        this.recording = false
        this.recordStatus = 1
        this.recordManager.stop()
      }
    },
    // 录音时间限制
    recordSecondTextCountDown() {
      if (this.recordSecondText === 0) return this.handleVoiceTouchEnd()

      this.recordSecondText--
      recordTask.run(() => {
        this.recordSecondTextCountDown()
      }, 1000)
    },
    listenRecordManagerStart() {
      this.recordManager.onStart = res => {
      //  console.log("开始录音", res)
        this.recordStatus = 0
        this.recordSecondText = 10
        this.recordSecondTextCountDown()
      }
    },
    listenRecordManagerStop() {
      this.recordManager.onStop = res => {
      //  console.log("翻译结束", res)
        this.isVoiceTouched = false
        this.recordStatus = 2
        this.recordSecondText = 0
        const { result } = res
        if (result === "") {
          uni.showToast({
            title: "什么也没听到",
            icon: "none",
            duration: 1000
          })
          recordTask.run(() => {
            this.recordStatus = -1
          }, 1000)
          return
        }
        this.inputValue = result.substr(0, result.length - 1)
        this.closeVoiceGroup()
        this.handleSearch()
      }
    },
    listenRecordManagerRecognize() {
      this.recordManager.onRecognize = res => {
      //  console.log("识别了新内容", res)
        this.recordStatus = 1
      }
    },
    listenRecordManagerError() {
      this.recordManager.onError = res => {
      //  console.log("识别错误事件", res)
        this.isVoiceTouched = false
        this.recordStatus = 3
        this.recordSecondText = 0
        recordTask.run(() => {
        //  console.log("识别错误重置")
          this.recordStatus = -1
        }, 1000)
      }
    }
  },
  async mounted() {
    const [error, res] = await uni.getSystemInfo()
    if (error) return
    const {
      platform,
      model,
      statusBarHeight,
      screenHeight,
      pixelRatio,
      windowHeight
    } = res
    let totalTopHeight = 68
    if (model.indexOf("iPhone X") !== -1) {
      totalTopHeight = 88
    } else if (res.model.indexOf("iPhone") !== -1) {
      totalTopHeight = 64
    }

    const tabBarHeight =
      (screenHeight - totalTopHeight - windowHeight) * pixelRatio

    Object.assign(this, {
      platform,
      statusBarHeight,
      totalTopHeight,
      tabBarHeight,
      screenHeight,
      titleBarHeight: totalTopHeight - statusBarHeight
    })
    const pages = getCurrentPages()
    if (pages.length > 1) this.showBackIcon = true

    if (!this.user.location.address) this.getLocation({
      mapReverse: true
    })
  },
  watch: {
    q(val) {
      this.inputValue = val
    }
  }
}
</script>
<style scoped lang="scss">
@import "../uni.scss";
@import "../styles/var.scss";
@import "../styles/mixin.scss";

.header-fix {
  position: relative;
  font-size: 32upx;
  color: $themeFontColor;
  background-color: transparent;
  transition: all .25s linear;
  z-index: 9999;
  &.show{
    background-color: $themeColor;
  }
}
.__header {
  @include padding-lr($themePadding);
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  .__title {
    @include padding-lr($themePadding * 2);
    position: relative;
    width: 50vw;
    height: 72upx;
    border-radius: 72upx;
    background-color: #fff;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    color: $themeFontColor;
    font-size: 28upx;
    .placeholder-text {
      @include text-overflow(1);
      flex: 1;
      color: #999;
    }
    .search-input {
      position: absolute;
      left: 20px;
      width: calc(100% - 80upx);
      box-sizing: border-box;
      flex: 1;
      height: 68upx;
      line-height: 68upx;
      text-align: left;
      border: none;
      outline: none;
      background: transparent;
    }
  }
  .address-wraper {
    width: 20vw;
    height: 68upx;
    text-align: center;
    .city-con {
      display: flex;
      height: 68upx;
      align-items: center;
      .city {
        @include text-overflow(1);
        width: 13vw;
      }
    }
  }
  .map-icon {
    animation: toggleIn 1.2s infinite;
  }
}
.icon {
  box-sizing: border-box;
  padding: 10upx;
  width: 60upx;
  height: 60upx;
  z-index: 999;
}
.clear-icon {
  position: absolute;
  right: 0;
}
.close-icon {
  position: absolute;
  bottom: 140upx;
  left: 50%;
  transform: translate(-50%);
}
.voice-group {
  box-sizing: border-box;
  position: fixed;
  z-index: 999;
  width: 100%;
  height: 100%;
  background-color: rgba($color: #000000, $alpha: 0.56);
  .voice-button {
    background: #f8f8f8;
    width: 60%;
    height: 100upx;
    border-radius: 40upx;
    font-size: 36upx;
    color: #333;
    text-align: center;
    line-height: 100upx;
    position: absolute;
    bottom: 240upx;
    left: 50%;
    transform: translate(-50%);
    &.touched {
      background-color: #f5f5f5;
    }
    &.btn-disable {
      background: #ccc;
      color: #999;
    }
  }
  .lisen-wraper {
    position: absolute;
    width: 60%;
    box-sizing: border-box;
    text-align: center;
    top: 40%;
    left: 50%;
    transform: translate(-50%);
    color: #f8f8f8;
    .animate {
      margin-top: 40upx;
      height: 28upx;
      display: flex;
      justify-content: center;

      .one {
        animation: animate 0.6s infinite 0.1s;
      }

      .two {
        animation: animate 0.6s infinite 0.2s;
      }

      .three {
        animation: animate 0.6s infinite 0.3s;
      }

      .four {
        animation: animate 0.6s infinite 0.4s;
      }

      .five {
        animation: animate 0.6s infinite 0.5s;
      }

      .one,
      .two,
      .three,
      .four,
      .five {
        width: 4upx;
        height: 100%;
        margin-left: 6upx;
        border-radius: 50upx;
        display: inline-block;
      }
    }
  }
}
@keyframes toggleIn {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
@keyframes animate {
  0% {
    transform: scale(1, 0);
  }

  20% {
    transform: scale(1, 0.5);
  }

  50% {
    transform: scale(1, 1);
  }

  80% {
    transform: scale(1, 0.5);
  }

  100% {
    transform: scale(1, 0);
  }
}
</style>
