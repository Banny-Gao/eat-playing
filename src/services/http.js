import Request from '../util/request'
import Config from '../static/config'
import TimeTask from '../util/timeTask'

const timeTask = new TimeTask()

const {
  STATUS_CODE_MAP,
  baseUrl
} = Config

const http = new Request()

http.setConfig((config) => {
  /* 设置全局配置 */
  config.baseUrl = baseUrl
  return config
})

let isShowErr, iShowLoading, isHideLoading

http.interceptor.request((config, cancel) => {
  const { showError, showLoading, hideLoading } = config.header

  isShowErr = showError !== undefined ? showError : true
  iShowLoading = showLoading !== undefined ? showLoading : false
  isHideLoading = hideLoading !== undefined ? hideLoading : false

  config.header = {
    ...config.header,
    ...{
      openid: uni.getStorageSync('openid') || '',
      thirdSessionKey: uni.getStorageSync('thirdSessionKey') || '',
      'content-type': 'application/x-www-form-urlencoded'
    },
  }
  iShowLoading && uni.showLoading()
  return config
})

http.interceptor.response(async (response) => {
  isHideLoading && uni.hideLoading()
  /* 请求之后拦截器 */
  const { msg: title, code } = response.data

  if (+code !== STATUS_CODE_MAP.SUCCESS && isShowErr) {
    timeTask.run(() => {
      uni.showToast({ title: title || 'network error', icon: 'none' })
    }, 1000)
  }
  return response.data
})

const get = async (url, data, options = {}) => {
  let result
  try {
    result =  await http.get(url, data, options)
  } catch (error) {
    result = error
  }
  return result
}

const post = async (url, data, options = {}) => {
  options = {
    header: {
      'content-type': 'application/json',
    },
    ...options,
  }
  let result
  try {
    result = await http.post(url, data, options)
  } catch (error) {
    result = error
  }
  return result
}

const put = (url, data, options = {}) => {
  options = {
    header: {
      'content-type': 'application/json',
    },
    ...options,
  }
  return http.put(url, data, options)
}

const DELETE = (url, data, options = {}) => {
  options = {
    header: {
      'content-type': 'application/json',
    },
    ...options,
  }
  return http.delete(url, data, options)
}

export {
  http,
  get,
  post,
  DELETE,
  put,
}