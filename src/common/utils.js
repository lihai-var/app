// 自定义全局方法封装
const utils = {
  test: function () {},
}

export default () => {
  if (typeof window.utils == 'undefined') {
    window.utils = utils
  }
}
