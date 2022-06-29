import Vue from 'vue'
import Router from 'vue-router'

//下面四句代码是为了处理router.beforeEach的异常报错(https://blog.csdn.net/haidong55/article/details/100939076)
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch((err) => err)
}

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: () => import('@/pages/home/index'),
      meta: {
        title: '悦动圈',
        auth: false,
      },
    },
    {
      path: '/index',
      component: () => import('@/pages/home/index'),
      meta: {
        title: '悦动圈',
        auth: false,
      },
    }
  ],
})
