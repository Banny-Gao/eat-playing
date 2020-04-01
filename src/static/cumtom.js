// 图片规格
// 首页商品列表： 170 * 120
// 详情页banner：375 * 300， 分享图： 1 : 1


// 服务器地址
const RequestUrl = "https://nshare.store/hb/wx/mini"

// 首页是否显示语音搜素 1:显示 0:不显示
const Index = {
  showSearchVoice: 1
}

// 选择地区热门城市配置: 完整的中国城市名称（地级市、直辖市）
const PositionChoice = {
  hotCities: [
    "北京市",
    "上海市",
    "天津市",
    "成都市",
    "重庆市",
    "西安市",
    "杭州市"
  ]
}

// 详情页分享图背景图，颜色或图片地址
const posterBg = 'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la/sharebg.png?sign=90bc6a9cb31cdb03530aab52f6d49abb&t=1585723843'

module.exports = {
  RequestUrl,
  Index,
  PositionChoice,
  posterBg
}
