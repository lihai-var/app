import Vue from 'vue'
/**
 * 日期格式重置   页面用法：{{'26565353' | formatDate(yyyy/MM/dd hh:mm)}}  返回值：'2017/08/22 18:30'
 */
Vue.filter('formatDate', function (value, fmt) {
  if (!value) return value
  let timeSc = new Date(value * 1000)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (timeSc.getFullYear() + '').substr(4 - RegExp.$1.length),
    )
  }
  let o = {
    'M+': timeSc.getMonth() + 1,
    'd+': timeSc.getDate(),
    'h+': timeSc.getHours(),
    'm+': timeSc.getMinutes(),
    's+': timeSc.getSeconds(),
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? str : padLeftZero(str),
      )
    }
  }
  function padLeftZero(str) {
    return ('00' + str).substr(str.length)
  }
  return fmt
})
