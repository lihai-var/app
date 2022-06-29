// created by zach He on 2019-04-29
// 会员 登录、注册、修改密码等等
import url from './urls'

export default class Home {
  /**
   * @描述  1.1	获取首页banner图
   */
  static getBanner(parms) {
    return $http.post(url.getBanner, parms)
  }
}
