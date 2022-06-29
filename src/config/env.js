// 环境配置
// todo: 注意要修改下面packageName为项目名称
let appId = 102 //sso登录服务的appid，传0表示走老的授权登录
let appVersion = 1 //sso登录服务的版本，默认为第一版
let logFlag = {
  dev: false, // 开发和测试环境是否上报log
  from: false, // 是否上传页面来源
  packageName: 'test',
}
let basePath = 'https://' // api请求地址

export {
  basePath
}
