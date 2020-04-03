<template>
  <view class="page">
    <view class="flex padding-tb-6 border-bottom tab-wraper">
      <view class="tab-item flex-1"
            :class="tabStatus === item.status ? 'active' : ''"
            v-for="item of tabList"
            :key="item.title"
            @click="handleTab(item)">
        {{ item.title }}
      </view>
    </view>
    <view class="search-wraper"
          v-if="tabStatus === 0">
      <image v-if="showPlaceholder"
             class="icon placeholder-icon"
             mode="aspectFit"
             :src="iconSrc.placeholder" />
      <text v-if="showPlaceholder"
            class="placeholder-text">请输入城市名称</text>
      <input type="text"
             class="search-input"
             confirm-type="搜索"
             v-model="inputValue"
             @focus="handleInputFocus"
             @blur="handleInputBlur"
             @input="handleInput"
             @confirm="handleSearch" />
      <image class="icon clear-icon"
             v-if="inputValue"
             @click="handleClear"
             mode="aspectFit"
             :src="iconSrc.clear" />
    </view>
    <scroll-view id="scrollView"
                 scroll-y
                 :scroll-into-view="viewId"
                 @scroll="handleScroll">
      <view id="top"
            class="city-wraper"
            v-for="item of quickPanelData"
            v-if="item.data.length"
            :key="item.title">
        <view class="title">{{ item.title }}</view>
        <view class="panel-item-wraper">
          <view class="panel-item"
                v-for="child of item.data"
                :key="child"
                :class="viewAddress === child ? 'active' : ''"
                @click="setLocation(child)">{{ child }}
          </view>
        </view>
      </view>
      <template v-for="item of cityList">
        <view class="title"
              :id="item.initial"
              :key="item.initial">{{ item.initial }}</view>
        <view :id="city.id"
              class="city-item"
              v-for="city of item.list"
              :key="city.code"
              :class="searchAddress === city.name ? 'active' : ''"
              @click="setLocation(city.name)"
              :data-name="city.name">
          {{ city.name }}
        </view>
      </template>
    </scroll-view>
    <view class="side-bar"
          :class="sidebarActive ? 'active': ''"
          v-if="tabStatus === 0"
          @touchstart='handleSidebarTouchStart'
          @touchend='handleSidebarTouchEnd'
          @touchmove='handleSidebarTouchMove'>
      <view class="side-bar-item"
            v-for="item of sideBarList"
            :data-itemid="item.id"
            :key="item.id"
            :class="getSideBarActive(item) ? 'active' : ''">
        {{ item.title }}
      </view>
    </view>
    <pre-loading :show='isPreLoadingShow' />
  </view>
</template>
<script>
  import { mapState, createNamespacedHelpers } from 'vuex'
  import { curry } from 'lodash'
  import pinyin from 'pinyin'
  import { navigateBack } from '../util/uniApi'
  import Task from '../util/timeTask'
  import { throttle, debounce } from 'lodash'
  import preLoading from '../components/preLoading'

  const { mapActions: userActions } = createNamespacedHelpers('user')

  const PositionChoice = require('../static/custom').PositionChoice

  const { hotCities = [] } = PositionChoice

  const timeTask = new Task()

  let querySelector = null

  const throttleScrollFunc = throttle(function(scrollTop) {
  	const schema = this.scrollSchema
  	const l = schema.length

  	if (!l) return
  	if (scrollTop < schema[0].top) {
  		this.scrollId = schema[0].id
  		return
  	}

  	scrollTop += this.scrollViewHeight / 2

  	for (let i = 1; i < l - 1; i++) {
  		if (scrollTop >= schema[i - 1].top && scrollTop < schema[i + 1].top) {
  			this.scrollId = schema[i].id
  			return
  		}
  	}

  	this.scrollId = schema[l - 1].id
  }, 200)

  const throttleSidebarFunc = throttle(function(clientY) {
  	const schema = this.sidebarSchema
    const l = schema.length
    
  	if (!l) return
  	if (clientY < schema[0].top + schema[0].height) {
  		this.groupNavigate(schema[0], false)
  		return
  	}

  	for (let i = 1; i < l - 1; i++) {
      const left = schema[i - 1]
      const right = schema[i + 1]
  		if (clientY >= (left.top + left.height) && clientY < right.top) {
  			this.groupNavigate(schema[i], false)
  			return
  		}
  	}
  	this.groupNavigate(schema[l - 1], false)
  })

  const citySearch = debounce(function(q, list) {
  	let initial = 'top'
  	if (q) {
  		initial = pinyin(q, {
  			style: pinyin.STYLE_NORMAL,
  		})[0][0][0].toUpperCase()

  		switch (q) {
  			case '重庆':
  			case '重庆市':
  				initial = 'C'
  				break
  			default:
  				break
  		}
  	}

  	const activeSide = this.sideBarList.find((item) => item.id === initial)

  	if (!activeSide) return

  	const matchCity = (keyword, list) => {
  		let i = 0,
  			bestMatch
  		let matchIndex = -1,
  			bestMatchIndex = -1

  		for (let item of list) {
  			if (item.name === keyword) {
  				bestMatch = item
  				return bestMatch
  			}
  			while (i < item.name.length && i < keyword.length) {
  				if (item.name[i] !== keyword[i]) break
  				matchIndex = i
  				i++
  			}
  			if (matchIndex > bestMatchIndex) {
  				bestMatchIndex = matchIndex
  				bestMatch = item
  			}
  		}
  		return bestMatch
  	}
  	let cityItem
  	for (let cities of this.cityList) {
  		if (cities.initial === activeSide.id) {
  			cityItem = matchCity(q, cities.list)
  			break
  		}
  	}
  	if (cityItem) {
  		this.searchAddress = cityItem.name
  		querySelector = uni.createSelectorQuery().in(this)
  		querySelector.selectAll(`.city-item`).boundingClientRect()
  		querySelector.exec((res) => {
  			for (let $city of res[0]) {
  				const { dataset, top } = $city
  				if (dataset.name === cityItem.name) {
  					this.groupNavigate(cityItem, false)
  					break
  				}
  			}
  		})
  	} else {
  		this.searchAddress = ''
  		this.groupNavigate(activeSide, false)
  	}
  }, 600)

  export default {
  	components: {
  		preLoading,
  	},
  	data() {
  		return {
  			tabList: [
  				{ title: '选择城市', status: 0 },
  				{ title: '选择地区', status: 1 },
  			],
  			tabStatus: -1,
  			addressStatus: -1,
  			cityList: [],
  			viewId: 'top',
  			viewAddress: '',
  			cityQuickPanelData: [],
  			districtListQuickPanelData: [],
  			sideBarList: [],
  			scrollSchema: [],
  			scrollId: '',
  			scrollViewHeight: 0,
  			iconSrc: {
  				clear:
  					'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/icon_clear.png',
  				placeholder:
  					'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/static/icon/icon_search.png',
  			},
  			inputValue: '',
  			isInputFocus: false,
  			searchAddress: '',
  			isPreLoadingShow: true,
  			sidebarActive: false,
  			sidebarSchema: [],
  		}
  	},
  	computed: {
  		...mapState(['user']),
  		quickPanelData() {
  			let result = []
  			switch (this.tabStatus) {
  				case 0:
  					result = this.cityQuickPanelData
  					break
  				case 1:
  					result = this.districtListQuickPanelData
  				default:
  					break
  			}
  			return result
  		},
  		selectorIds() {
  			return this.cityList.reduce(
  				(result, item) => {
  					result.push(item.initial)
  					return result
  				},
  				['top']
  			)
  		},
  		showPlaceholder() {
  			return !(this.inputValue || this.isInputFocus)
  		},
  	},
  	methods: {
  		...userActions(['getLocationAddress']),
  		handleTab(item) {
  			this.tabStatus = item.status
  		},
  		getList() {
  			const cityList = uni.getStorageSync('cityList')
  			const districtList = uni.getStorageSync('districtList')

  			let list = []
  			switch (this.tabStatus) {
  				case 0:
  					list = [...cityList]
  					break
  				case 1:
  					const { adcode } = this.user.location

  					const checkSubCode = (item, code, l) =>
  						item.id.substr(0, l) === code.substr(0, l)

  					const getDistrictList = (l) => {
  						return districtList
  							.filter((item) => {
  								return checkSubCode(item, adcode, l)
  							})
  							.map((item) => item.fullname)
  					}
  					let data = getDistrictList(4)
  					if (!data.length) data = getDistrictList(3)

  					this.districtListQuickPanelData.splice(0, 1, {
  						title: '选择区县',
  						data,
  					})
  				default:
  					break
  			}

  			list = list.reduce((result, city) => {
  				let initial = pinyin(city.fullname, {
  					style: pinyin.STYLE_NORMAL,
  				})[0][0][0].toUpperCase()

  				switch (city.fullname) {
  					case '重庆市':
  						initial = 'C'
  						break
  					default:
  						break
  				}

  				let group = result.find((item) => item.initial === initial)

  				if (!group) {
  					group = {
  						initial,
  						list: [],
  					}
  					result.push(group)
  				}

  				group.list.push({
  					id: initial + city.id,
  					code: city.id,
  					name: city.fullname,
  					label: city.fullname + city.id,
  					title: city.name,
  				})

  				return result
  			}, [])
  			this.cityList = list
  				.filter((item) => item.list.length)
  				.sort((a, b) => a.initial.charCodeAt() - b.initial.charCodeAt())

  			this.setSideBarList()
  		},
  		setSideBarList() {
  			this.sideBarList = this.cityList.reduce(
  				(result, item) => {
  					const initial = item.initial
  					result.push({
  						id: initial,
  						title: initial,
  					})
  					return result
  				},
  				[
  					{
  						id: 'top',
  						title: '↑',
  					},
  				]
  			)
  		},
  		groupNavigate(item, isShowTitle = true) {
  			this.viewId = this.scrollId
  			this.scrollId = ''
  			timeTask.run(() => {
  				this.viewId = item.id
  			})
  			isShowTitle &&
  				uni.showToast({
  					title: item.title,
  					duration: 600,
  					icon: 'none',
  				})
  		},
  		async getCurrentPosition(location) {
  			const { address } = location
  			if (
  				address !== this.user.location.address ||
  				!uni.getStorageSync('cityList')
  			)
  				await this.getLocationAddress(address || '成都市')

  			const addressStatus = (this.addressStatus = this.checkAddressStatus(
  				address
  			))
  			if (addressStatus === 1) this.viewAddress = address

  			const hotCity = {
  				title: '热门城市',
  				data: hotCities,
  			}

  			switch (addressStatus) {
  				case 0:
  					this.cityQuickPanelData = [
  						{
  							title: '当前城市',
  							data: [address],
  						},
  						hotCity,
  					]
  					break

  				case 1:
  					this.cityQuickPanelData = [hotCity]
  				default:
  					break
  			}
  		},
  		async setLocation(address) {
  			await this.getCurrentPosition({ address })

  			if (this.addressStatus === 0) {
  				this.handleTab({ status: 1 })
  				// this.getCurrentPosition({ address: cacheAddress })
  				// uni.showModal({
  				//   content: '是否需要当前城市下属地区',
  				//   cancelText: '否',
  				//   confirmText: '是',
  				//   success: ({ confirm, cancel }) => {
  				//     if (confirm) this.handleTab({ status: 1 })
  				//     if (cancel) navigateBack()
  				//   }
  				// })
  			} else navigateBack()
  		},
  		checkAddressStatus(address) {
  			const cityList = uni.getStorageSync('cityList')
  			const districtList = uni.getStorageSync('districtList')
  			let status = -1

  			const getCheck = (list, status) => {
  				let isChecked = false
  				for (let item of list) {
  					if (item.name === address || item.fullname === address) {
  						isChecked = true
  						break
  					}
  				}
  				return isChecked ? status : -1
  			}

  			status = getCheck(cityList, 0)

  			if (status === -1) {
  				status = getCheck(districtList, 1)
  			}

  			return status
  		},
  		handleScroll(e) {
        const { scrollTop } = e.detail
  			throttleScrollFunc.call(this, scrollTop)
  		},
  		getSideBarActive(item) {
  			if (this.scrollId) {
  				return this.scrollId === item.id
  			} else {
  				return this.viewId === item.id
  			}
  		},
  		handleInputFocus() {
  			this.isInputFocus = true
  		},
  		handleInputBlur() {
  			this.isInputFocus = false
  		},
  		handleInput(e) {
  			this.inputValue = e.detail.value
  			citySearch.call(this, this.inputValue)
  		},
  		handleSearch() {
  			citySearch.call(this, this.inputValue)
  		},
  		handleClear() {
  			this.inputValue = ''
  			citySearch.call(this, this.inputValue)
  		},
  		handleSidebarTouchStart(e) {
        this.sidebarActive = true
        const { clientY } = e.touches[0]
  			throttleSidebarFunc.call(this, clientY)
  		},
  		handleSidebarTouchMove(e) {
        const { clientY } = e.touches[0]
  			throttleSidebarFunc.call(this, clientY)
  		},
  		handleSidebarTouchEnd(e) {
  			this.sidebarActive = false
  		},
  		setSidebarSchema() {
  			querySelector = uni.createSelectorQuery().in(this)
  			querySelector.selectAll(`.side-bar-item`).boundingClientRect()
  			querySelector.exec((res) => {
  				for (let $sidebarItem of res[0]) {
  					const {
  						dataset: { itemid: id },
  						top,
  						height,
  					} = $sidebarItem
  					this.sidebarSchema.push({
  						id,
  						top,
  						height,
  					})
  				}
  			})
  		},
  		setScrollSchema() {
  			querySelector = uni.createSelectorQuery().in(this)
  			for (let id of this.selectorIds) {
  				const $el = querySelector.select(`#${id}`)
  				$el &&
  					$el.boundingClientRect(({ top }) => {
  						this.scrollSchema.push({ id, top })
  					})
  			}
  			querySelector.exec()
  		},
  	},
  	async mounted() {
  		this.isPreLoadingShow = true
  		await this.getCurrentPosition(this.user.location)
  		this.tabStatus = this.addressStatus

  		timeTask.run(() => {
  			uni
  				.createSelectorQuery()
  				.in(this)
  				.select('#scrollView')
  				.boundingClientRect(({ height }) => {
  					this.scrollViewHeight = height
  				})
  				.exec()
  		}, 500)
  		timeTask.run(() => {
  			this.isPreLoadingShow = false
  		}, 1500)
  	},
  	async onUnload() {
  		if (this.addressStatus === 0) await this.setLocation(this.viewAddress)
  	},
  	watch: {
  		tabStatus(val) {
  			this.getList()
  			this.viewId = 'top'
  			this.scrollId = ''
  			this.scrollSchema = []
  			this.sidebarSchema = []
  			val === 0 &&
  				timeTask.run(() => {
  					this.setScrollSchema()
  					this.setSidebarSchema()
  				}, 500)
  		},
  	},
  }
</script>
<style scoped lang="scss">
  @import '../styles/var.scss';
  @import '../styles/mixin.scss';

  .tab-wraper {
  	box-sizing: border-box;
  	background: #fff;
  }
  .tab-item {
  	font-size: 30upx;
  	line-height: 72upx;
  	transition: all 0.2s linear;
  	text-align: center;
  	&.active {
  		font-size: 36upx;
  	}
  	&:first-child {
  		border-right: borderStyle();
  	}
  }

  .city-wraper {
  	box-sizing: border-box;
  	position: relative;
  }
  .title {
  	background: #ececec;
  	box-sizing: border-box;
  	padding: 0 $themePadding;
  	font-size: 28upx;
  	line-height: 64upx;
  	color: $themeFontColor;
  }
  .panel-item-wraper {
  	padding-bottom: 30upx;
  	display: flex;
  	flex-wrap: wrap;
  	.panel-item {
  		@include border();
  		min-width: 160upx;
  		margin-left: 22upx;
  		box-sizing: border-box;
  		border-radius: 8upx;
  		line-height: 64upx;
  		text-align: center;
  		padding: 0 16upx;
  		font-size: 28upx;
  		margin-top: 30upx;
  		transition: all 0.2s linear;
  		&.active {
  			background: $themeColor;
  			color: $themeFontColor;
  			border: none;
  		}
  	}
  }

  .city-item {
  	box-sizing: border-box;
  	padding: 0 $themePadding;
  	line-height: 76upx;
  	border-bottom: borderStyle();
  	transition: all 0.2s linear;
  	&:last-child {
  		border: none;
  	}
  	&.active {
  		color: $themeColor;
  	}
  }
  .side-bar {
  	position: fixed;
  	right: 10upx;
  	top: 50%;
  	z-index: 99;
  	transform: translateY(-50%);
  	transition: all 0.2s linear;
  	&.active {
  		background-color: rgba($color: #000000, $alpha: 0.1);
  	}
  	.side-bar-item {
  		box-sizing: border-box;
  		height: 42upx;
  		text-align: center;
  		line-height: 38upx;
  		border-radius: 8upx;
  		font-size: 28upx;
  		transition: all 0.1s linear;
  		padding: 0 8upx;
  		color: $themeFontColor;
  		&.active {
  			background: $themeColor;
  		}
  	}
  }
  .search-wraper {
  	padding: 20upx 30upx;
  	position: relative;
  	box-sizing: border-box;
  	display: flex;
  	align-items: center;
  	color: #333;
  	font-size: 28upx;
  	justify-content: space-between;
  	padding-right: 80upx;
  	border-bottom: borderStyle();
  	.placeholder-text {
  		@include text-overflow(1);
  		flex: 1;
  		color: #999;
  	}
  	.search-input {
  		width: 100%;
  		border-radius: 42upx;
  		box-sizing: border-box;
  		height: 84upx;
  		line-height: 84upx;
  		text-align: left;
  		border: borderStyle();
  		outline: none;
  		background: #fff;
  		padding: 0 60upx;
  	}
  	text {
  		position: absolute;
  	}
  	.icon {
  		box-sizing: border-box;
  		padding: 10upx;
  		width: 60upx;
  		height: 60upx;
  		z-index: 999;
  		position: absolute;
  	}
  	.placeholder-icon {
  		left: 60upx;
  	}
  	.placeholder-text {
  		left: 140upx;
  	}
  	.clear-icon {
  		right: 100upx;
  	}
  }
</style>
