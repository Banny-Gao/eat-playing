import {
  cosConfig
} from './constants'
import {
  CosAuths
} from './cos-auth'
import {
  getSecret
} from '@/api/user'
// 计算签名
const getAuthorization = async (options) => {
  try {
    const credentials = await getCredentials()
    return {
      XCosSecurityToken: credentials.sessionToken,
      Authorization: CosAuths({
        SecretId: credentials.tmpSecretId,
        SecretKey: credentials.tmpSecretKey,
        Method: options.Method,
        Pathname: options.Pathname
      })
    }
  } catch (error) {}
}

let stsCache

const getCredentials = async () => {
  if (stsCache && Date.now() / 1000 + 30 < stsCache.expiredTime) {
    return stsCache.credentials
  }
  try {
    const res = await getSecret()
    if (res.code == 1000) {
      const data = JSON.parse(res.data).data
      const credentials = data.credentials
      if (credentials) {
        stsCache = data
        return credentials
      } else {
        wx.showModal({
          title: '临时密钥获取失败'
        })
      }
    } else {
      wx.showModal({
        title: '临时密钥获取失败'
      })
    }
  } catch (error) {}
}

export const upload = async (filePath) => {
  const upLoadurl = `https://${cosConfig.bucket}.cos.${cosConfig.region}.myqcloud.com/`
  let progress = 0
  wx.showLoading({
    title: '正在上传',
    mask: true
  })
  var date = new Date()
  const that = this
  var Key = date.getTime() + '/' + filePath.substr(filePath.lastIndexOf('/') + 1) // 这里指定上传的文件名
  try {
    const AuthData = await getAuthorization({
      Method: 'POST',
      Pathname: '/'
    })
    return new Promise((resolve, reject) => {
      const requestTask = wx.uploadFile({
        url: upLoadurl,
        name: 'file',
        filePath: filePath,
        formData: {
          key: Key,
          success_action_status: 200,
          Signature: AuthData.Authorization,
          'x-cos-security-token': AuthData.XCosSecurityToken,
          'Content-Type': ''
        },
        success(res) {
          if (res.statusCode === 200) {
            let picUrl = upLoadurl + Key
            resolve(picUrl)
          } else {
            reject(res)
          }
        },
        fail: reject,
        complete() {
          wx.hideLoading()
        }
      })
    })
  } catch (error) {}
}