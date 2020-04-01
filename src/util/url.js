/**
 * 替换图片路径中字符错误影响图片显示
 * @description img src urlEncodeComponent
 * @param {String} url image src
 * @return {String}
 */
export const imgEncodeUrl = (url) => {
  const regMap = new Map([
    ['!', '%21'],
    ["'", '%27'],
    ['(', '%28'],
    [')', '%29'],
    ['*', '%2A']
  ])
  return encodeURI(url).replace(/(?:([!\\*'\\(\\)]))/g, ($1) => {
    return regMap.get($1)
  })
}
/**
 * File或Blob转url
 * @param {File|Blob} data
 * @return {String}
 */
export const createObjectURL = (data) => {
  const type = Object.prototype.toString.call(data)
  if (type !== '[object File]' || type !== '[object Blob]') throw TypeError('type must be blob or file')
  const u = URL || window.webkitURL
  return u.createObjectURL(data)
}

/**
 * 释放Blob Url
 * @param {String} url
 * @return {undefined}
 */
export const revokeObjectURL = (url) => {
  if (!/^(blob\:)\w+/.test(url)) throw Error('url must be a blob url')
  const u = URL || window.webkitURL
  return u.revokeObjectURL(url)
}
