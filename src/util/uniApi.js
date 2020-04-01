import { debounce, curry } from "lodash"

// 路由
export const navigateTo = debounce(uni.navigateTo, 300)
export const reLaunch = debounce(uni.reLaunch, 300)
export const redirectTo = debounce(uni.redirectTo, 300)
export const navigateBack = debounce(uni.navigateBack, 300)
export const switchTab = debounce(uni.switchTab, 300)

export const getUserInfo = async (
  data = {
    withCredentials: true,
    lang: "zh_CN"
  }
) => {
  let result
  try {
    await authorize("userInfo")
    const [error, userInfo] = await uni.getUserInfo(data)
    if (error) return Promise.reject(error)
    result = userInfo
  } catch (error) {
    result = error
  }
  return result
}

export const getLocation = async (
  data = {
    type: "gcj02",
    altitude: true
  }
) => {
  let result
  try {
    await authorize("userLocation")
    const [error, location] = await uni.getLocation(data)
    if (error) return Promise.reject(error)
    result = location
  } catch (error) {
    result = error
  }
  return result
}

const scopelistMap = [
  { key: "userInfo", title: "用户信息" },
  { key: "userLocation", title: "地理位置" },
  { key: "address", title: "通信地址" },
  { key: "invoiceTitle", title: "发票抬头" },
  { key: "invoice", title: "获取发票" },
  { key: "werun", title: "微信运动步数" },
  { key: "record", title: "录音功能" },
  { key: "writePhotosAlbum", title: "保存到相册" },
  { key: "camera", title: "摄像头" }
]

export const authorize = async key => {
  const scopeItem = scopelistMap.find(item => item.key === key)
  if (!scopeItem) return Promise.reject("error key")

  const [getSettingError, settings] = await uni.getSetting()
  if (getSettingError) return Promise.reject("get setting error")
  let result
  if (settings.authSetting && settings.authSetting[`scope.${key}`]) {
    result = settings.authSetting[`scope.${key}`]
  } else {
    const [authorizeError, res] = await uni.authorize({ scope: `scope.${key}` })
    if (authorizeError) {
      const isOpen = await openSetting(
        `检测到您没打开${scopeItem.title}，是否去设置打开？`
      )
      if (isOpen && !(openCount & -1)) return authorize(key)
      else return Promise.reject("用户拒绝获取权限")
    }
    result = res
  }
  return result
}

let openCount = 1

export const openSetting = async (content = "") => {
  const [showModalError, res] = await uni.showModal({
    content,
    confirmText: "确认",
    cancelText: "取消"
  })
  if (showModalError) return Promise.reject(showModalError)

  let result
  if (res.confirm) {
    const [openSettingError, success] = await uni.openSetting()
    if (openSettingError) return Promise.reject(openSettingError)
    result = success
  } else {
    result = Promise.reject("用户点点击去取消")
  }
  openCount--
  return result
}

const toastShow = curry(async (image, title) => {
  await uni.showToast({
    title,
    image
  })
})

export const showSuccess = toastShow("/static/icon/success.png")

export const showError = toastShow("/static/icon/error.png")

export const showTip = toastShow("/static/icon/tip.png")

export const showModal = ({ title, content }) =>
  new Promise((resolve, reject) => {
    uni.showModal({
      title,
      content,
      success(res) {
        if (res.confirm) resolve() 
        else if (res.cancel) reject()
      },
      fail: reject
    })
  })
