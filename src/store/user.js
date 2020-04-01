import { getLocation } from "../util/uniApi"
import { mapReverseGeocoder, getCityList } from "../util/qqMap"
import * as Api from "../services/api"

export default {
  namespaced: true,
  state() {
    return {
      openid: uni.getStorageSync("openid") || "",
      thirdSessionKey: uni.getStorageSync('thirdSessionKey') || '',
      location: {},
      userInfo: uni.getStorageSync('userInfo') || {},
      choicedAddress: {
        address: "",
        addressInfo: "",
        userName: "",
        phone: ""
      }
    }
  },
  mutations: {
    setLocation(state, payload) {
      state.location = {
        ...state.location,
        ...payload
      }
    },
    setOpenId(state, { openid, thirdSessionKey }) {
      state.openid = openid
      state.thirdSessionKey = thirdSessionKey
      uni.setStorageSync("openid", openid)
      uni.setStorageSync("thirdSessionKey", thirdSessionKey)
    },
    setUserInfo(state, userInfo) {
      state.userInfo = {
        ...state.userInfo,
        ...userInfo
      }
    },
    setUserChoicedAddress(state, choicedAddress) {
      state.choicedAddress = {
        ...state.choicedAddress,
        ...choicedAddress,
      }
    }
  },
  actions: {
    async getLocation({ commit }, { mapReverse, location }) {
      if (!location) {
        location = await getLocation()
      }
      if (mapReverse) {
        const { result } = await mapReverseGeocoder({
          latitude: location.latitude,
          longitude: location.longitude
        })
        location = {
          ...location,
          ...result,
          ...{
            address: result.ad_info.district,
            adcode: result.ad_info.adcode
          }
        }
      }
      commit("setLocation", location)
    },
    async getLocationAddress({ commit }, keyword) {
      let cityList = uni.getStorageSync("cityList"),
        provinceList = uni.getStorageSync("provinceList"),
        districtList = uni.getStorageSync("districtList")
      if (!cityList) {
        const { result } = await getCityList()
        provinceList = [...result[0]]
        cityList = [...result[1]]
        districtList = [...result[2]]

        const customCity = [
          "110000",
          "120000",
          "310000",
          "500000",
          "810000",
          "820000"
        ]
        const customDistrict = cityList.filter(item => {
          const prefix = item.id.substr(0, 3)
          for (let c of customCity) {
            if (c.substr(0, 3) === prefix) return item
          }
        })
        districtList = [...districtList, ...customDistrict]

        cityList = cityList.reduce((result, item) => {
          const prefix = item.id.substr(0, 3)
          let isCoustom = false
          for (let c of customDistrict) {
            if (c.id.substr(0, 3) === prefix) {
              isCoustom = true
              break
            }
          }
          !isCoustom && result.push(item)
          return result
        }, [])

        provinceList = provinceList.filter(item => {
          if (customCity.includes(item.id)) {
            cityList.push(item)
            return false
          }
          return true
        })

        uni.setStorageSync("provinceList", provinceList)
        uni.setStorageSync("cityList", cityList)
        uni.setStorageSync("districtList", districtList)
      }
      let address = {}
      const getAddress = (data, key) => {
        return data.find(
          item => item.fullname === keyword || item.name === keyword
        )
      }
      address = getAddress(cityList)
      if (!address) {
        address = getAddress(districtList)
      }

      address = address || {
        latitude: "",
        longitude: "",
        location: "",
        address: {},
        adcode: ""
      }

      commit("setLocation", {
        latitude: address.location.lat,
        longitude: address.location.lng,
        location: address.location,
        address: address.fullname,
        adcode: address.id
      })
    },
    async getOpenId({ commit }) {
      const [error, result] = await uni.login()
      if (error) return Promise.reject()

      const { openid, thirdSessionKey } = await Api.login({
        code: result.code
      })
      commit("setOpenId", { openid, thirdSessionKey})
    }
  }
}
