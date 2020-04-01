wx.cloud.init()

const promiseCall = (data) => new Promise((resolve, reject) => wx.cloud.callFunction({
  ...data,
  success: resolve,
  fail: reject
}))

export const getUnlimited = async( data = { page: '', width: 200, scene: 'a=1' } ) =>  promiseCall({
  name: 'getUnlimited',
  data,
})

export const getWxacode = async( data = { page: '', width: 200, scene: 'a=1' } ) => promiseCall({
  name: 'getWxacode',
  data,
})