import * as config from '@/config/env'
import store from '@/store/index'
import urls from '@/server/urls'
const tool = {
  timeSpace: 0, //本地和服务器的时间间隔
  fetchSKtime: 0, //获取sessionkey超时的重试次数
  getUrlParam: function (name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    if (location.href.indexOf("?") < 0) return "";
    let r = location.href.split("?")[1].match(reg);
    if (r != null) {
      let d = decodeURIComponent(r[2]);
      return tool.getIntValue(d);
    }
    return '';
  },
  getCookieValue: function (name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return "";
  },
  getIntValue (value) {
    if (value === 'null' || value === 'undefined' || value === null || value === undefined) {
      return ''
    } else if (value === '0') {
      return 0
    }
    return value
  },
  createCookie (name, value, days) {
    let expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    }
    let cookieDomain = "";
    if (name == "user_id" || name == "xyy") {
      cookieDomain = "; domain=51yund.com";
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + cookieDomain + "; path=/";
  },
  getYdUserKey: function (key) {
    // 取值的时候先取store，再取storage
    let storeVal = store.state.comVal;
    let val = "";
    if (storeVal[key]) {
      val = storeVal[key];
    } else {
      val = _getLocalStorage(key) || sessionStorage.getItem(key);
      val = tool.getIntValue(val);
      if (!val) {
        val = tool.getUrlParam(key);
      }
      if (val) {
        store.dispatch('saveCommonValue', { key: key, value: val })
      }
    }
    return val;
  },
  // 本地持久化存储
  setStorage (name, value, expires) {
    if (window.ydStorage) {
      ydStorage.setItem(name, value, expires)
    } else {
      localStorage.setItem(name, value);
    }
  },
  getSessionKey: function (userId, xyy, cb) {
    var param = { "user_id": userId, "xyy": xyy };
    return $http.post(urls.getsskey, param, true).then(function (res) {
      if (res.code === 0) {
        let sessionkey = res.session_key;
        if (sessionkey) {
          tool.fetchSKtime = 0; //获取成功之后把fetchSKtime还原
          //存值的时候先存store，再存localStorage，存store为了取值更快，存storage为了看方便
          store.dispatch('saveCommonValue', { key: 'session_key', value: sessionkey });
          tool.setStorage("session_key", sessionkey, res.session_ttl);
          store.dispatch('saveCommonValue', { 'key': 'user_id', 'value': userId });
          localStorage.setItem("user_id", userId);
          store.dispatch('saveCommonValue', { 'key': 'xyy', 'value': xyy });
          localStorage.setItem("xyy", xyy);
        }
        let hasLogin = userId == 0 ? false : true;
        if (cb) cb(hasLogin);
        return sessionkey;
      } else if (res.code !== 7007) { //userId和xyy不匹配或其它异常情况，最常见的场景是首次进来时，用户之前本地存储的xyy过期，7007的情况在http层统一处理
        tool.toLogin();
      }
    }).catch(res => {
      console.log('页面出错');
    });
  },
  //简化版js节流，默认2s内只能点击一次
  throttle: function (callback, duration = 2000) {
    let lastTime = tool.lastTime || 0;
    let now = new Date().getTime();
    if (now - lastTime > duration) {
      callback();
      tool.lastTime = now;
    }
  },
  //记录上报（访问来源上报、错误上报）
  reportCmd: function (data) {
    $http.postOnly(config.logPath + '/sport/report', data)
  },
  // 上报错误信息
  postErrLog (data, cmdName) {
    let hosts = location.host;
    if ((hosts.indexOf("localhost") > -1 || hosts.indexOf("test") > -1) && !config.logFlag.dev) {
      return;
    }
    let param = {
      user_id: tool.getYdUserKey('user_id') || 0,
      cmd: cmdName,
      device_id: 'yuedongweb',
      data: JSON.stringify(data)
    }
    tool.reportCmd(param);
  },
  $throwJS (data) { //抛出js异常
    let obj = {  //公共部分
      platform: "web",
      local_path: location.pathname,
      local_url: location.href,
      package_name: config.logFlag.packageName
    }
    Object.assign(obj, data);
    let filterJsErr = [];
    if (config.filterErr && config.filterErr.length > 0) {
      filterJsErr.push(...config.filterErr);
    }
    if (filterJsErr.indexOf(obj.err_msg) > -1) return;
    let cmd_name = 'vue_jserr';
    if (obj.err_msg && obj.err_msg.indexOf('http') > -1) {
      cmd_name = 'vue_reserr';  //reserr表示资源加载异常（resource error）
    }
    tool.postErrLog(obj, cmd_name);
  },
  // 抛出请求异常
  $throw (err, info, uri, response) {
    let obj = {
      local_url: location.href,
      local_path: location.pathname,
      err_msg: err + '',
      req_params: info,
      req_uri: uri
    }
    if (response) { //返回值结构体异常
      obj.response = response
    }
    let filterErr = config.filterErr;
    if (filterErr && filterErr.indexOf(obj.err_msg) > -1) return;
    tool.postErrLog(obj, 'vue_reqerr');
  },
  //去登录
  toLogin: function (backUrl) {
    localStorage.removeItem('session_key');
    localStorage.removeItem('xyy');
    let cbUrl = backUrl ? backUrl : location.href;
    cbUrl = encodeURIComponent(cbUrl);
    // cbUrl = _clearUlrData(cbUrl);
    console.log('配置登录页路由');
  },
}

export const injectTool = () => {
  if (typeof window.tool == 'undefined') {
    window.tool = tool;
  }
}
//跳转登录时去掉url上的user_id、xyy和is_login
function _clearUlrData (cbUrl) {
  if (cbUrl.indexOf("?") == -1) return encodeURIComponent(cbUrl);
  let [url, query] = cbUrl.split("?");
  let arr = ['user_id', 'xyy', 'is_login'];
  for (let i = 0; i < arr.length; i++) {
    if (query.indexOf(arr[i]) > -1) {
      let reg = new RegExp('(^|&)' + arr[i] + '=[^&]*', 'g');
      query = query.replace(reg, '')
    }
  }
  if (query) {
    if (query.indexOf('&') === 0) {  //最开始一位是&时去掉
      query = query.slice(1);
    }
    url += '?' + query
  }
  return encodeURIComponent(url)
}

function _getLocalStorage (name) {
  if (window.ydStorage) {
    return ydStorage.getItem(name)
  } else {
    return localStorage.getItem(name);
  }
}