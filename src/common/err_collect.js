//本地持久化存储方案
//初始化时清除过期存储，vue初始化后将需要记录的信息通过请求发送
window.viewWillAppear = function () {}
window.viewDidAppear = function () {}
window.viewWillDisappear = function () {}
window.viewDidDisappear = function () {}
function YdStorage() {
  this.source = window.localStorage
  this.initClear() //去除过期缓存
}
YdStorage.prototype = {
  constructor: function () {
    this.name = 'storage'
  },
  initClear: function () {
    var data = this.source
    for (var item in data) {
      if (!data.hasOwnProperty(item)) return //过滤掉原型上的属性
      if (data[item].indexOf('_expires_') !== -1) {
        tarItem = JSON.parse(data[item])
        if (Date.now() >= tarItem._expires_) {
          this.remove(item)
        }
      }
    }
  },
  setItem: function (name, value, expires, needPost) {
    //expires是秒, needPost标记是否需要发送到服务器
    if (expires) {
      var obj = {
        value: value,
        _expires_: Date.now() + expires * 1000,
      }
      if (needPost) {
        obj._needPost_ = true //这个用来标记是否需要发送
      }
      localStorage.setItem(name, JSON.stringify(obj))
    } else {
      var type = Object.prototype.toString.call(value).slice(8, -1)
      if (type == 'Object' || type == 'Array') {
        value = JSON.stringify(value)
      }
      localStorage.setItem(name, value)
    }
  },
  getItem: function (name) {
    var item = localStorage.getItem(name)
    if (!item) return ''
    try {
      //先将拿到的试着进行json转为对象的形式
      item = JSON.parse(item)
    } catch (error) {
      //如果不行就不是json的字符串，就直接返回
      item = item
    }
    if (!item._expires_) return item
    if (Date.now() > item._expires_) {
      this.remove(name)
      return ''
    } else {
      return item.value
    }
  },
  remove: function (name) {
    localStorage.removeItem(name)
  },
  postItem: function () {
    var data = window.localStorage
    for (var item in data) {
      if (!data.hasOwnProperty(item)) return //过滤掉原型上的属性
      if (data[item].indexOf('_needPost_') !== -1) {
        //需要发送
        var tarItem = JSON.parse(data[item])
        if (window.tool && tool.$throwJS) {
          tool.$throwJS(tarItem.value)
        }
        this.remove(item)
      }
    }
  },
}
window.ydStorage = new YdStorage()

window.onerror = function (msg, url, line, col, error) {
  //捕捉js错误
  if (!msg) return true
  if (typeof msg === 'string') {
    msg = msg.split(':')[1]
    if (msg) msg = msg.replace(/^\s+|\s+$/g, '') //去掉左右空格
  }
  msg && ydDealErr(msg, true)
  return true //这句的作用是防止浏览器报错而阻塞进程
}
window.addEventListener(
  'error',
  function (error) {
    //捕捉资源加载错误，资源加载出错不会冒泡到window.onerror
    var path = error.target.src
    if (!path || path === location.href) return //条件一说明捕获的是js异常，条件二捕获的是img src为空
    ydDealErr(path)
  },
  true,
)

function ydDealErr(msg, isJs) {
  var hosts = location.host
  if (hosts.indexOf('localhost') > -1 || hosts.indexOf('test') > -1) {
    console.error(msg)
  }
  var obj = { err_msg: msg }
  if (window.tool && window.tool.$throwJS) {
    window.tool.$throwJS(obj)
  } else {
    obj.err_path = location.href
    obj.err_time = _ydErrDealTime()
    if (isJs) {
      postJsErr(obj)
    } else {
      ydStorage.setItem(msg, obj, 3600 * 24 * 7, true) //信息存储7天，过期删除
    }
  }
}
function _ydErrDealTime() {
  var timeSc = new Date()
  var year, month, day, hour, minute, second, timeStr //时间默认值
  year = timeSc.getFullYear() // 获取完整的年份(4位,1970)
  month = checkTime(timeSc.getMonth() + 1) // 获取月份(0-11,0代表1月,用的时候记得加上1)
  day = checkTime(timeSc.getDate()) // 获取日(1-31)
  hour = checkTime(timeSc.getHours()) // 获取小时数(0-23)
  minute = checkTime(timeSc.getMinutes()) // 获取分钟数(0-59)
  second = checkTime(timeSc.getSeconds()) // 获取分钟数(0-59)
  function checkTime(m) {
    return m < 10 ? '0' + m : m
  }
  timeStr =
    year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second
  return timeStr
}
function postJsErr(data) {
  var errInstance = axios.create({
    timeout: 1000 * 10,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  var errFd = new FormData()
  var uId = getCookieValue('user_id') || localStorage.getItem('user_id') || 0
  errFd.append('user_id', uId)
  errFd.append('cmd', 'vue_jserr')
  errFd.append('device_id', 'yuedongweb')
  errFd.append('data', JSON.stringify(data))
  var uri = 'https://api.51yund.com'
  errInstance
    .post(uri + '/sport/report', errFd)
    .then(function () {})
    .catch(function () {
      ydStorage.setItem(data.err_msg, data, 3600 * 24 * 7, true) //信息存储7天，过期删除
    })
}
function getCookieValue(name) {
  var nameEQ = name + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length)
    }
  }
  return ''
}
// 这两句是为了捕捉网页崩溃，模拟网页崩溃：chrome://crash
// window.addEventListener('load', function () { //进入页面
//     localStorage.setItem('good_exit', 'pending');
// });
// window.addEventListener('beforeunload', function () {  //正常关闭网页或退出
//     localStorage.setItem('good_exit', 'true');
// });
// if(localStorage.getItem('good_exit') != 'true') {
//     ydDealErr('网页崩溃')
// }
