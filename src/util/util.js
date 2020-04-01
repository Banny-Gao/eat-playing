export const regExp = {
  chinese: /[u4e00-u9fa5]/,
  dbcs: /[^x00-xff]/, //双字节
  trimLine: /ns*r/, //空白行
  trimHE: /^s*|s*$/, //首位空白
  email: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
  url: /[a-zA-z]+:\/\/[^s]*/,
  passWord: /^[~!@#$%^&*\-+=_.0-9a-zA-Z]{6,20}$/,
  tel: /d{3}-d{8}|d{4}-d{7}/, //匹配形式如 0511-4405222 或 021-87888822
  qq: /[1-9][0-9]{4,}/,
  postcode: /[1-9]d{5}(?!d)/, //中国邮政
  ip: /d+.d+.d+.d+/,
  en: /^[A-Za-z]+$/,
  enPower: /^[A-Z]+$/,
  enLower: /^[a-z]+$/,
  phone: /^1[3|4|5|7|8|9]\d{9}$/,
  number: /^[0-9]+.?[0-9]*$/,
  idcard: /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/, //身份证
  web: /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/,
  chineseName: /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/,
  carNumber: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/
}

export const validateIDCard = (idCard) => {
  if (!regExp.idcard.test(idCard)) return false;
  let idCardWi = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); //将前17位加权因子保存在数组里
  let idCardY = new Array(1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2); //这是除以11后，可能产生的11位余数、验证码，也保存成数组
  let idCardWiSum = 0; //用来保存前17位各自乖以加权因子后的总和
  for (let i = 0; i < 17; i++) {
    idCardWiSum += idCard.substring(i, i + 1) * idCardWi[i];
  }
  let idCardMod = idCardWiSum % 11; //计算出校验码所在数组的位置
  let idCardLast = idCard.substring(17); //得到最后一位身份证号码
  //如果等于2，则说明校验码是10，身份证号码最后一位应该是X
  if (idCardMod == 2) {
    if (idCardLast == "X" || idCardLast == "x") {
      return true;
    } else {
      return false;
    }
  } else {
    //用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
    if (idCardLast == idCardY[idCardMod]) {
      return true;
    } else {
      return false;
    }
  }
}

/**
 * 获取url链接中参数
 * @param  {String} url
 * @param  [String] key 参数名。可选
 * @return {String|Object}
 */
export const getQueryString = (url = '', key) => {
  const search = url.split('?').pop()
  if (search && search.length) {
    const result = {}
    const items = search.split('&')
    for (let item of items) {
      const entry = item.split('=')
      const name = decodeURIComponent(entry[0])
      if (name) {
        result[name] = decodeURIComponent(entry[1])
      }
    }
    return key ? result[key] : result
  }
  return null
}

export const dataToQuery = (data ={}) => {
  let text = '?'
  Object.keys(data).forEach(key => {
    text += `${key}=${data[key]}&`
  })
  return text
}
// 处理富文本中图片显示不全问题
export const dealRichText = (text) => {
  return text.replace(/<img/gi, '< img style="max-width:100%;height:auto;display:block;margin: 0 auto; "')
    .replace(/<font color="/g, '<div style="color:').replace(/\/font>/g, '/div>')
}

//通过身份证获取性别
export const getSexByIdCard = (idcard) => {
  var sexno, sex
  if (idcard.length === 18) {
    sexno = idcard.substring(16, 17)
  } else if (idcard.length == 15) {
    sexno = idcard.substring(14, 15)
  } else {
    return false
  }
  var tempid = sexno % 2
  if (tempid === 0) {
    sex = '女'
  } else {
    sex = '男'
  }
  return sex
}

export const getBirthByIdCard = (idCard, format = '/') => {
    const l = String(+idCard).length
    let birth
    if(l === 15) {
      birth = idCard.replace(/^\d{7}(\d{6})\d{2}$/,(v,a) => a);
      birth = '19'+birth
    } else {
      birth = idCard.replace(/^\d{6}(\d*)\d{3}[a-z|A-Z|0-9]$/,(v,a) => a);
    }
    const y = birth.substring(0,4)
    const m = birth.substring(4,6)
    const d = birth.substring(6)
    return `${y+format+m+format+d}`
}

export const hidePhone = (phone) => String(phone).replace(/^(\d{3})\d{4}(\d{4})$/,'$1****$2')