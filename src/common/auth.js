import { logFlag, logPath } from '@/config/env'
let isFirst = false;
export default (router, hasLogin) => {
  router.beforeEach((to, from, next) => {
    if (to.meta.title) {
      document.title = to.meta.title;
    }
    isFirst = globalVue ? false : true;
    if (to.meta.auth && !hasLogin) { //需要登录而未登录
      let backUrl = _getTargetUrl(to, from);
      // tool.toLogin(backUrl);//如果不加backUrl则登录回调会跳转到前一个页面
    } else {
      next()
    }
  })
}

function _getTargetUrl (to, from) {
  let backUrl = location.href.split("?")[0];
  if (!isFirst) { //只有非首次进入才做处理
    if (from.path === '/' && to.path != '/') { //首页到其它页
      backUrl += to.path.slice(1);
    } else { //其它页互相跳（包括跳到首页）
      backUrl = backUrl.replace(from.path, to.path);
    }
  }

  if (location.search) {
    backUrl += location.search;
  }
  return backUrl;
}