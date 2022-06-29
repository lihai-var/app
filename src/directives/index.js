import Vue from 'vue'
Vue.directive('copy', {
  //自定义指令                                      JS
  bind: function (el, binding) {
    el.onclick = function (e) {
      const range = document.createRange()
      range.selectNode(el)
      const selection = window.getSelection()
      if (selection.rangeCount > 0) selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('copy')
      globalVue.toast('复制成功')
    }
  },
})

Vue.directive('deal', {
  //处理输入框被遮挡问题
  bind: function (el, binding) {
    if (el.tagName !== 'INPUT') {
      el = el.querySelector('input')
    }
    ;(el.onfocus = function (e) {
      //处理思路：将输入框位置放在可视区域（除开软键盘）的中间位置
      let offsetTop = e.target.getBoundingClientRect().top
      let scrollDom = document.querySelector('.container')
      let scrolltop = scrollDom.scrollTop
      let emptyDom = document.createElement('div')
      emptyDom.className = 'empty-input-deal'
      scrollDom.appendChild(emptyDom) //底部空间不足时滚动拉不上来，所以用一个空div撑开底部空间
      if (tool.isIosWeb()) {
        //ios下软键盘弹起时页面会整体往上拉，所以要区别处理
        let bottomDom = document.querySelector('.fix-bottom')
        let screenHeightFirst = bottomDom.getBoundingClientRect().top
        let timer = setTimeout(() => {
          let screenHeight = bottomDom.getBoundingClientRect().top //注意这里不能用window.innerHeight，ios下不管软键盘是否弹出innerHeight都不变，
          let keyBoardHeight = screenHeightFirst - screenHeight || 400 //获取软键盘高度，只在ios下有用，如果没有获取到值，就默认400
          emptyDom.style.height = keyBoardHeight + 'px' //让空div的高度刚好等于软键盘的高度
          if (offsetTop > (3 / 5) * screenHeightFirst) {
            //如果输入框在整个页面的底部2/5的区域，点击时就让页面向上多滚动100px
            scrollDom.scrollTop = scrolltop + 100
          }
          timer = null
        }, 100)
      } else {
        //安卓下保证输入框滚动到可视区中间往上150px的地方
        emptyDom.style.height = '400px' //安卓内嵌webview页面无法获取软键盘高度，uc浏览器可以用window.innerHeight的差值获取
        let tarH = offsetTop - window.innerHeight / 2 //输入框距离可视区中间点的差值
        scrollDom.scrollTop = scrolltop + tarH + 150
      }
    }),
      (el.onblur = function (e) {
        let scrollDom = document.querySelector('.container')
        let emptyDom = document.querySelector('.empty-input-deal')
        scrollDom.removeChild(emptyDom)
      })
  },
})
