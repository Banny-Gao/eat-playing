import {
  get,
  post
} from './http'

const queryFormatNoop = s => s

const mergeRequest = ((request, url) => async(params = {}, queryFormat = queryFormatNoop, options = {}) => {
  let result = null
  if (typeof queryFormat !== 'function') queryFormat = queryFormatNoop
  try {
    const response = await request(queryFormat(url), params, options)
    const {
      data,
      code, 
      status
    } = response
    result = data || {}
    result.code = code
    response.code = code || status
    if (+code !== 200) throw response
  } catch (error) {
    result = Promise.reject(error)
  }
  return result
})

// params: { code }
export const login = mergeRequest(get, '/user/login')

// params: { adcode, openid } head: openid
export const getCategories = mergeRequest(get, '/goods/categories')

// params : { adcode, pageIndex, pageSize, categoryId } head: openid
export const getGoods = mergeRequest(get, '/goods/list')

// params: { id }
export const getGoodInfos = mergeRequest(get, '/goods/info')

// params: { id } - good id
export const getRandomHeader = mergeRequest(get, '/getRandomHeadImgById')

// params: { scene }
export const getUnlimited = mergeRequest(get, '/getUnlimited')

// params: { goodsId, num, addressId, realMoney }
export const postCheckout = mergeRequest(post, '/addOrder');

// params: { weborder }
export const postOrderDetailInfo = mergeRequest(post, '/user/buyOrderInfo')

export const getAddressList = mergeRequest(get, '/user/addressList')

// params: { address, defaultFlag, addressInfo, userName, phone }
export const postCreateAddress = mergeRequest(post, '/user/addAddress')

// params: { addressId, address, defaultFlag, addressInfo, userName, phone }
export const postUpdateAddress = mergeRequest(post, '/user/updateAddress')

export const getDefaultAddress = mergeRequest(get, '/user/getDefaultAddress')

// params: { addressId }
export const postDeleteAddress = mergeRequest(post, '/user/delAddress')

// params: { status }
export const getOrderList = mergeRequest(get, '/user/orderList')

// params: { nickName, headImg }
export const postUploadHead = mergeRequest(post, '/user/upHeadAndName')

// params: { adcode }
export const getRecommendGoods = mergeRequest(get, '/recommend/list')