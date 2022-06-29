import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import { injectGlobal } from './common/'
// import login from './common/login'
import auth from './common/auth'
import './style/reset.less'
import './style/common.less'
import './filters/filter'
import './directives/index'
//全局注入
injectGlobal()

//这段代码是为了先拿到sessionkey再初始化项目，避免直接访问页面不存在user_id和xyy的情况
window.globalVue = ''
// login((hasLogin) => {
auth(router, false)
Vue.config.productionTip = false
const globalVue = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
window.globalVue = globalVue
window.ydStorage && ydStorage.postItem()
// })
