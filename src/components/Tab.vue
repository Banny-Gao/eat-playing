<template>
  <view class="__tab-wraper">
    <view class="tab-list">
      <view class="tab-item"
            v-for="(item, index) of convertList"
            :key="item.categoryId"
            @click="handdleListChange(item, index)">
        <text :class="item.__active ? 'active': ''">{{item.title}}</text>
      </view>
    </view>
  </view>
</template>
<script>
import { mapState, createNamespacedHelpers } from "vuex"
const { mapMutations: homeMutations } = createNamespacedHelpers("home")

  export default {
  	props: {
  		list: {
  			type: Array,
  			default: [],
  		},
  	},
  	data() {
  		return {
  			convertList: [],
  		}
    },
    computed: {
      ...mapState(["home"]),
    },
  	methods: {
      ...homeMutations(["setHomeTabState"]),
  		handdleListChange(tab, index, initial) {
  			this.convertList = this.convertList.map((item, index) => {
  				item.__active = false
  				if (item.categoryId === tab.categoryId) item.__active = true
  				return item
  			})
  			this.$emit('change', {
          tab,
          index,
          initial
        })
      },
      convertListInial() {
        const { initialIndex, shouldTabInitial } = this.home
        if (!shouldTabInitial) return
        this.convertList = this.list.map((item) => {
          item.__active = false
          return item
        })
        if (this.list.length) this.handdleListChange(this.convertList[initialIndex], initialIndex, true)
        this.setHomeTabState({
          shouldTabInitial: false
        })
      }
  	},
  	watch: {
      list(val) {
        this.setHomeTabState({
          shouldTabInitial: true
        })
        this.convertListInial()
      },
      home: {
        deep: true,
        handler(val) {
          if (val.shouldTabInitial) this.convertListInial()
        }
      }
    },
  }
</script>
<style scoped lang="scss">
  @import '../uni.scss';
  @import '../styles/var.scss';
  @import '../styles/mixin.scss';

  .__tab-wraper {
  	width: 100%;
  	overflow-x: auto;
  	color: $themeFontColor;
    background-color: $themeColor;
  	font-size: 28upx;
  	line-height: 60upx;
  	height: 80upx;
  	display: flex;
  	align-items: center;
  	.tab-list {
  		display: flex;
  		flex-wrap: nowrap;
  		.tab-item {
        @include padding-lr($themePadding / 2);
        text-align: center;
  			min-width: 160upx;
        box-sizing: border-box;
        text{
          border-radius: 4upx;
          display: inline-block;
          width: 100%;
          transition: all .2s linear;
        }
  		  text.active {
  				font-size: 32upx;
  			}
  		}
  	}
  }
</style>
