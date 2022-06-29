/**
 * Created by zach He on 2019-04-29
 */
import url from './urls'

export default class LoginMember {
  static wxLogin(params) {
    return $http.post(url.wxLogin, params)
  }

  static qqLogin(params) {
    return $http.post(url.qqLogin, params)
  }

  // 登出管理
  static loginOut(params) {
    return $http.post(url.loginOut, params)
  }
}
