// mock: http://rap2.taobao.org:38080/app/mock/245931/wx/mini
// dev: https://nshare.store/hb/wx/mini
// product: 

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://rap2.taobao.org:38080/app/mock/245931/wx/mini' : require('./cumtom').RequestUrl

// Ajax统一状态码
const STATUS_CODE_MAP = {
  SUCCESS: 200, // 成功
  NOT_LOGIN: 401
}

const cloudUrl = 'https://7272-rryb-yug5z-1301653930.tcb.qcloud.la'

module.exports =  {
  mapKey: 'PSFBZ-S4WK4-PK4UP-DLSZP-RSK42-4HBDK',
  baseUrl,
  STATUS_CODE_MAP,
  cloudUrl
}
