import config from '../static/config'


import QQMapWX from '../static/lib/qqmap-wx-jssdk.min'

const Map = new QQMapWX({
  key: config.mapKey
})

/**
 * @param  {function} fn
 * @param  {object} data
 */
const _promiseWrap = (fn, data) => {
  return new Promise((resolve, reject) => {
    const isObject = Object.prototype.toString.call(data) === '[object Object]'
    if (isObject) {
      data.success = function(res) {
         resolve(res)
      }
      data.fail = function(err) {
        reject(err)
      }
    }
    
    fn.call(Map,data)
  })
}

/**
 * @name    地点搜索
 * @param  {string} keyword 关键词 
 * @param  {string|object} location  '39.984060,116.307520' |  { latitude: 39.984060,longitude: 116.307520 }
 * @param  {string} address_format 短地址
 * @param  {number} page_size
 * @param  {number} page_index
 * @param  {string} region  指定地区名称
 * @param  {string} rectangle  矩形区域范围，不与region同时使用。格式：lat,lng<左下/西南>, lat,lng<右上/东北>(示例：rectangle:'40.984061,116.307520,39.984060,116.507520'
 * @param  {string} auto_extend  是否自动扩大  1 | 0
 * @param  {string} filter 搜索最多5多个分类：category=大学,中学  排除指定分类：category<>商务楼宇 
 */
const mapSearch = (keyword, location, address_format, page_size, page_index, region, rectangle, auto_extend, filter) => {
  return _promiseWrap(Map.search, {keyword, location, address_format, page_size, page_index, region, rectangle, auto_extend, filter})
}
/**
 * @name    地址解析
 * @param  {string} address  地址（注：地址中请包含城市名称，否则会影响解析效果），如：'北京市海淀区彩和坊路海淀西大街74号'
 * @param  {string} region 指定地址所属城市,如北京市
 */
const mapGeocoder = (address, region) => {
  return _promiseWrap(Map.geocoder, {address, region})
}
/**
 * @name    逆地址解析
 * @param  {string} location
 * @param  {number} coord_type  输入的locations的坐标类型，可选值为[1,6]之间的整数，每个数字代表的类型说明： 1 GPS坐标 2 sogou经纬度 3 baidu经纬度 4 mapbar经纬度 5 [默认]腾讯、google、高德坐标 6 sogou墨卡托
 * @param  {number} get_poi  是否返回周边POI列表： 1 | 0
 * @param  {string} poi_options  用于控制Poi列表： https://lbs.qq.com/qqmap_wx_jssdk/method-reverseGeocoder.html
 */
const mapReverseGeocoder = (location, coord_type, get_poi, poi_options) => {
  return _promiseWrap(Map.reverseGeocoder, {location, coord_type, get_poi, poi_options})
}

/**
 * @name    距离计算
 * @param  {string|object} from
 * @param  {string|object} to  输入的locations的坐标类型，可选值为[1,6]之间的整数，每个数字代表的类型说明： 1 GPS坐标 2 sogou经纬度 3 baidu经纬度 4 mapbar经纬度 5 [默认]腾讯、google、高德坐标 6 sogou墨卡托
 */
const calculateDistance = (from, to) => {
  return _promiseWrap(Map.calculateDistance, {from, to})
}

const getCityList = (sig) => {
  return _promiseWrap(Map.getCityList, { sig })
}

export {
  mapSearch,
  mapGeocoder,
  mapReverseGeocoder,
  calculateDistance,
  getCityList
}