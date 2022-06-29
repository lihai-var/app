// 微信分享
// 使用方法
// 步骤1，引入：
// import * as YdShare from '@/common/share.js'
// 步骤2，初始化：
// let shareObj = {
//     shareTitle: this.city + '竟然有那么多好玩的活动',
//     shareContent: "快来参加吧！",
//     shareIcon:"https://ssl-pubpic.51yund.com/857264683.jpg",
//     shareUrl: 'https://sslwxsharecircle.51yund.com/vapps/cityActivity/'
// }
// YdShare.setSimpleShare(shareObj);
// 步骤3，调用
// YdShare.onShare()
// 如果是右上角分享，则不需要步骤3

import CryptoJS from 'crypto-js'
import wx from 'weixin-js-sdk' //引入WxjsSDK
async function commonShare(shareObj, cbFun) {
  //sharePlatforom -2:右上角分享配置不调起分享面板 -1:分享面板 0:新浪微博 1:微信聊天 2:微信朋友圈 4:QQ聊天 5:QQ空间
  //shareType 0:分享链接(icon title content url) 1:分享图片(QQ空间不支持 即使是分享图片的时候 也需要设置一套分享链接的素材)
  //screenShotsFlag  true 分享截屏
  shareCb = cbFun
  var sharePlatforom = shareObj['sharePlatforom']
  var shareType = shareObj['shareType']
  if (sharePlatforom == -2 && shareType != 1) {
    updateShareMetaInfo(shareObj) //更新meta信息
    await addWeixinShareSpecifyInfoV2(shareObj) //增加二次分享
    return
  }
  if (!tool.isYuedong()) return
  if (tool.isAndroidWeb()) {
    if (sharePlatforom >= 0) {
      /*单渠道分享 （分享链接 or 图片）
              android 分享图片.meta带上share_pic_url
              QQ 空间不支持 正常分享页面meta配置的title、content、url、icon等
            */
      sharePlatforom = initAppShareType(sharePlatforom)
      shareObj['sharePlatforom'] = sharePlatforom
      androidShareByType(shareObj)
    } else {
      //分享面板分享链接（图片 ）
      updateShareMetaInfo(shareObj) //更新meta信息 给客户端取
      await addWeixinShareSpecifyInfoV2(shareObj) //增加二次分享
      ydShare()
    }
    return
  }

  if (sharePlatforom >= -1) {
    // ios 分享面板 or 单渠道分享 （图片 + 链接）
    var screenShotsFlag = shareObj['screenShotsFlag']
    var shareTitle = shareObj['shareTitle']
    var shareContent = shareObj['shareContent']
    var shareIcon = shareObj['shareIcon']
    var openShareUrl = shareObj['shareUrl']
    var imgBase64Url = shareObj['sharePicUrl']
    shareObj = initShareObj(shareObj)
    if (sharePlatforom < 0) {
      sharePlatforom = ''
    }
    //imgBase64Url与sharePicUrl都是base64格式且同时存在，分享图片就是根据sharePicUrl来生成
    //imgBase64Url1 为了兼容客户端无法分享bug加的
    var imgBase64Url1 =
      'iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAADlElEQVR4AX2VA6xEVxCGv3/OuYvajdPGSRvUCGvFKsPGZuPGbsyaQW3btm27T6s70+Ttnpzcfcrd3Tl435n7z73z6+ifjnfkmGOx+V3jemmnpRIvE7LCTUY44GCCAOEgsAAAc8JwAHBhQYlRYBgKwh0MENmYDwwKmvoXNcRRWepuq0NjQdvklhQMddA1Vsk63FSWVLYJgrJTm3HhEoRgK1p41LvuoKOjW02OAM/CjSKoMLaia1y0LmgKGrrSKxse1DMDwNqYtbBU63p1ZyBl9TporNStng/hh9the9u+jiCBxeY3JGSQyqSBJeU/fPWt2VeFsJC01A2spDyL9lAdcNEel4ASKalJpKwmKSVy33o99QwzWcL20ODyf657LT5p1LcAFd0MN9zCNQ/wxuzt6RsfTz4imMVsFtPyPXNaQRvt/DLs5dH7d208NbBkFML8EmG4yU2LhUSEpk+OHpsx0SKDACD6m7kbMilhLe1VK3eObZwKpKI755S4Z+lr//yt8es9NRRoQ+6rb1KSGTaw/hPrL786e3doqUsoXCMs3KIsbAbZeGr02L/+j2ECwZ5pj6xkmKGs9G/73/Wrd6SEEQtcVEltwVJI5Uy58Eb6nZ+fHz3dKAU+tMFQA6GEmWyg3p2rD3/pX/dltiCGVCTFTaVuFrF0O31LL06e+XH2fU/Nfmkfk6XNq0fz7fSH2zfuG6Sssr9kGlXfeggddBYb+u+R9fv3SfsMNLR5slhWvmXltr/4I4sqaLkUMZfRl5sLbuUdydJP/i1EVmoR0Kj39ujdx8dPDHMDtXNWggi0zXtBmGuBJtqzhudNfRJEwkAe7Y3/3Ti1UcOwZABROoPmsazmr/pIGGFEG+Mj0pGnDs+cxHjNV5Py0IZPrT/55uy1oWWjrY+BlghR+lks9y0nepEu2OvSfdP+q6ystav7pf3/bf+5ZeX6nDACgvD6X932VvVdMoKJT88cXHDy8LRxjBr1xj6KiHtWbvvGP+/nPR1XbO8yHb+owpe4p/T79Psr/risxR21ES3+1uzNYWrA6/0t9WuVghsx37e8gL3XvjCLcNKiEcuS9bOyF4uB4jI4wqNawVzf7ZxN9JWbjp/LwXF1+nVxGTpaF7/YUakaa3c/7hJq3XZGd51tB3QnuVK3Io1sobVYfuABbbH6wFS3KTAVP55zqzTb1lfU1KSuVXff4LIpC7eAKuKOT6WqXLGTIGWb/ge7OXDlEvWZtQAAAABJRU5ErkJggg=='
    var url =
      '/local_call?local_action=share_params&arg0=' +
      encodeURIComponent(shareTitle) +
      '&arg1=' +
      encodeURIComponent(shareContent) +
      '&arg2=' +
      encodeURIComponent(shareIcon) +
      '&arg3=' +
      encodeURIComponent(openShareUrl) +
      '&arg4=' +
      encodeURIComponent(JSON.stringify(shareObj)) +
      '&arg5=' +
      encodeURIComponent(sharePlatforom) +
      '&arg6=' +
      encodeURIComponent(screenShotsFlag) +
      '&arg7=' +
      encodeURIComponent(imgBase64Url1) +
      '&arg8=' +
      encodeURIComponent(imgBase64Url)
    iosIframeLocalCall(url)
  }
}
function checkShareContent(content) {
  var enableContent = true
  if (!content || content == undefined || content == '') {
    enableContent = false
  }
  return enableContent
}
function dealCheck(defaultVal, needVal) {
  let finalVal = defaultVal
  if (checkShareContent(needVal)) {
    finalVal = needVal
  }
  return finalVal
}
/**
 * 设置/更新 meta信息
 * @param {Object} shareObj
 */
function updateShareMetaInfo(shareObj) {
  var doc = document
  var metaNode = doc.getElementsByTagName('meta')
  for (var index = 0; index < metaNode.length; index++) {
    var metaInfo = metaNode[index]
    var metaAttr = metaInfo['attributes']
    if (!metaAttr) {
      continue
    }
    var metaAttrLen = metaAttr.length
    for (var attrIndex = 0; attrIndex < metaAttrLen; attrIndex++) {
      var metaAttrIndexNode = metaAttr[attrIndex]
      var itemProp = metaAttrIndexNode['itemprop']
      if (metaAttrIndexNode.name == 'itemprop') {
        var shareTitle = shareObj['shareTitle']
        var shareContent = shareObj['shareContent']
        if (metaAttrIndexNode.value == 'name') {
          metaInfo['content'] = shareTitle
        }
        if (metaAttrIndexNode.value == 'description') {
          metaInfo['content'] = shareContent
        }
        if (metaAttrIndexNode.value == 'qq_title') {
          metaInfo['content'] = dealCheck(shareTitle, shareObj['shareQqTitle'])
        }
        if (metaAttrIndexNode.value == 'qzone_title') {
          metaInfo['content'] = dealCheck(
            shareTitle,
            shareObj['shareQzoneTitle'],
          )
        }
        if (metaAttrIndexNode.value == 'qq_content') {
          metaInfo['content'] = dealCheck(
            shareContent,
            shareObj['shareQqContent'],
          )
        }
        if (metaAttrIndexNode.value == 'qzone_content') {
          metaInfo['content'] = dealCheck(
            shareContent,
            shareObj['shareQzoneContent'],
          )
        }
        if (metaAttrIndexNode.value == 'wx_circle') {
          metaInfo['content'] = dealCheck(
            shareContent,
            shareObj['shareWxCircle'],
          )
        }
        if (metaAttrIndexNode.value == 'wb_content') {
          metaInfo['content'] = dealCheck(
            shareContent,
            shareObj['shareWbContent'],
          )
        }
        if (metaAttrIndexNode.value == 'share_url') {
          metaInfo['content'] = dealCheck('', shareObj['shareUrl'])
        }
        if (metaAttrIndexNode.value == 'image') {
          metaInfo['content'] = dealCheck('', shareObj['shareIcon'])
        }
        if (metaAttrIndexNode.value == 'share_pic_url') {
          metaInfo['content'] = dealCheck('', shareObj['sharePicUrl'])
        }
        if (metaAttrIndexNode.value == 'screen_shots_flag') {
          metaInfo['content'] = dealCheck('', shareObj['screenShotsFlag'])
        }
      }
    }
  }
}

async function AccessWeixinShare(currentUrl) {
  //微信分享
  let ts = new Date().getTime()
  let noncestr = 'Wm3WZYTPz0wzccnW'
  let ticket = await GetWeixinTicket()
  let arrTemp = []
  arrTemp[0] = 'jsapi_ticket=' + ticket
  arrTemp[1] = 'noncestr=' + noncestr
  arrTemp[2] = 'timestamp=' + ts
  arrTemp[3] = 'url=' + currentUrl
  arrTemp.sort()
  let strTemp = arrTemp.join('&')
  strTemp = CryptoJS.SHA1(strTemp).toString(CryptoJS.enc.Hex)
  let strArr = new Object()
  strArr['sha1Str'] = strTemp
  strArr['ts'] = ts
  strArr['noncestr'] = noncestr
  return strArr
}
/**
 * 增加二次分享
 *
 * */
async function addWeixinShareSpecifyInfoV2(shareObj) {
  if (!tool.isWeixin()) {
    return
  }
  var shareTitle = shareObj['shareTitle']
  var shareContent = shareObj['shareContent']
  var shareIcon = shareObj['shareIcon']
  var shareWxCircle = dealCheck(shareContent, shareObj['shareWxCircle'])

  var shareQqTitle = dealCheck(shareTitle, shareObj['shareQqTitle'])

  var shareQqContent = dealCheck(shareContent, shareObj['shareQqContent'])

  var shareQzoneTitle = dealCheck(shareTitle, shareObj['shareQzoneTitle'])

  var shareQzoneContent = dealCheck(shareContent, shareObj['shareQzoneContent'])

  var shareWbTitle = dealCheck(shareTitle, shareObj['shareWbTitle'])

  var shareWbContent = dealCheck(shareContent, shareObj['shareWbContent'])

  var shareLinkUrl = 'window.location.href'

  var shareOpenUrl = dealCheck(shareLinkUrl, shareObj['shareUrl'])

  var strArr = await AccessWeixinShare(window.location.href)
  var sha1Str = strArr['sha1Str']
  var timestamp = strArr['ts']
  var noncestr = strArr['noncestr']
  // addWeixinShareViewInfo(sha1Str, timestamp, noncestr, shareTitle, shareContent, shareLinkUrl, shareIcon, shareOpenUrl);
  shareLinkUrl = shareLinkUrl.replace('v=*&', '')
  shareLinkUrl = shareLinkUrl.replace('&is_share=*', '')
  shareLinkUrl = shareLinkUrl.replace('user_id=', 'MSEASE=')
  shareLinkUrl = shareLinkUrl.replace('member=', tool.getUrlParam('user_id'))
  if (!shareOpenUrl) {
    shareOpenUrl = shareLinkUrl
  }

  wx.config({
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: 'wxa0bd6bb58c4f415f', // 必填，公众号的唯一标识
    timestamp: timestamp, // 必填，生成签名的时间戳
    nonceStr: noncestr, // 必填，生成签名的随机串
    signature: sha1Str, // 必填，签名，见附录1
    jsApiList: [
      'onMenuShareTimeline',
      'onMenuShareAppMessage',
      'onMenuShareQQ',
      'onMenuShareWeibo',
      'onMenuShareQZone',
      'showMenuItems',
    ], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
  })
  wx.ready(function () {
    //验证通过
    //分享到朋友圈
    wx.onMenuShareTimeline({
      title: shareWxCircle, // 分享标题
      link: shareOpenUrl, // 分享链接
      imgUrl: shareIcon, // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        if ('onYdShare' in window) {
          window.onYdShare()
        }
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
      },
    })
    //分享好友
    wx.onMenuShareAppMessage({
      title: shareTitle, // 分享标题
      desc: shareContent, // 分享描述
      link: shareOpenUrl, // 分享链接
      imgUrl: shareIcon, // 分享图标
      type: 'link', // 分享类型,music、video或link，不填默认为link
      dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
      success: function () {
        // 用户确认分享后执行的回调函数
        if ('onYdShare' in window) {
          window.onYdShare()
        }
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
      },
    })
    wx.onMenuShareQQ({
      title: shareQqTitle, // 分享标题
      desc: shareQqContent, // 分享描述
      link: shareOpenUrl, // 分享链接
      imgUrl: shareIcon, // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        if ('onYdShare' in window) {
          window.onYdShare()
        }
      },
      cancel: function () {
        // 用户取消分享后执行的回调函
      },
    })
    wx.onMenuShareQZone({
      title: shareQzoneTitle, // 分享标题
      desc: shareQzoneContent, // 分享描述
      link: shareOpenUrl, // 分享链接
      imgUrl: shareIcon, // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        if ('onYdShare' in window) {
          window.onYdShare()
        }
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
      },
    })
    wx.onMenuShareWeibo({
      title: shareWbTitle, // 分享标题
      desc: shareWbContent, // 分享描述
      link: shareOpenUrl, // 分享链接
      imgUrl: shareIcon, // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        if ('onYdShare' in window) {
          window.onYdShare()
        }
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
      },
    })
  })
  wx.error(function (res) {
    //微信验证失败
  })
}
/**
 * 点击右上角分享 客户端调用此方法获得分享信息
 */
function MetaShareInfo() {
  var doc = document
  var metaNode = doc.getElementsByTagName('meta')
  var shareTitle = ''
  var shareContent = ''
  var shareIcon = ''
  var shareWxCircle = ''
  var shareQqTitle = ''
  var shareQqContent = ''
  var shareQzoneTitle = ''
  var shareQzoneContent = ''
  var shareWbContent = ''
  var sharePicUrl = ''
  var screenShotsFlag = ''
  var openShareUrl = window.location.href
  for (var index = 0; index < metaNode.length; index++) {
    var metaInfo = metaNode[index]
    var metaAttr = metaInfo['attributes']
    if (!metaAttr) {
      continue
    }
    var metaAttrLen = metaAttr.length
    for (var attrIndex = 0; attrIndex < metaAttrLen; attrIndex++) {
      var metaAttrIndexNode = metaAttr[attrIndex]
      var itemProp = metaAttrIndexNode['itemprop']
      if (metaAttrIndexNode.name == 'itemprop') {
        let metaDesc = metaInfo['content']
        if (metaAttrIndexNode.value == 'description') {
          shareContent = metaDesc
        }
        if (metaAttrIndexNode.value == 'name') {
          shareTitle = metaDesc
        }
        if (metaAttrIndexNode.value == 'image') {
          shareIcon = metaDesc
        }
        if (metaAttrIndexNode.value == 'wx_circle') {
          shareWxCircle = metaDesc
        }
        if (metaAttrIndexNode.value == 'qq_title') {
          shareQqTitle = metaDesc
        }
        if (metaAttrIndexNode.value == 'qq_content') {
          shareQqContent = metaDesc
        }
        if (metaAttrIndexNode.value == 'qzone_title') {
          shareQzoneTitle = metaDesc
        }
        if (metaAttrIndexNode.value == 'qzone_content') {
          shareQzoneContent = metaDesc
        }
        if (metaAttrIndexNode.value == 'wb_content') {
          shareWbContent = metaDesc
        }
        if (metaAttrIndexNode.value == 'share_url') {
          openShareUrl = metaDesc
        }
        if (metaAttrIndexNode.value == 'share_pic_url') {
          sharePicUrl = metaDesc
        }
        if (metaAttrIndexNode.value == 'screen_shots_flag') {
          screenShotsFlag = metaDesc
        }
      }
    }
  }
  openShareUrl = openShareUrl.replace(/&is_share=[a-z]+/g, '')
  openShareUrl = openShareUrl.replace(/&is_share=/g, '')
  openShareUrl = openShareUrl.replace(/\?user_id=[0-9]+&?/g, '?')
  openShareUrl = openShareUrl.replace(/\?user_id=[0-9]+/g, '')
  openShareUrl = openShareUrl.replace(/&user_id=[0-9]+/g, '')
  openShareUrl = openShareUrl.replace(/&user_id=/g, '')
  if (!checkShareContent(shareWxCircle)) {
    shareWxCircle = shareContent
  }
  if (!checkShareContent(shareQqTitle)) {
    shareQqTitle = shareTitle
  }
  if (!checkShareContent(shareQqContent)) {
    shareQqContent = shareContent
  }
  if (!checkShareContent(shareQzoneTitle)) {
    shareQzoneTitle = shareTitle
  }
  if (!checkShareContent(shareQzoneContent)) {
    shareQzoneContent = shareContent
  }
  if (!checkShareContent(shareWbContent)) {
    shareWbContent = shareContent
  }
  if (!checkShareContent(openShareUrl)) {
    shareWbContent = shareWbContent + openShareUrl
  }
  if (tool.isAndroidWeb() && window.YDJSInterface) {
    setAppShareUrl(openShareUrl)
    if ('setMetaDataShareImgV2' in YDJSInterface && sharePicUrl != '') {
      window.YDJSInterface.setMetaDataShareImgV2(
        shareQzoneTitle,
        shareQzoneContent,
        shareIcon,
        shareWbContent,
        sharePicUrl,
        openShareUrl,
      )
      return
    }
    if ('setMetaDataShareInfoExv2' in YDJSInterface) {
      window.YDJSInterface.setMetaDataShareInfoExv2(
        shareTitle,
        shareContent,
        shareIcon,
        shareWxCircle,
        shareQqTitle,
        shareQqContent,
        shareQzoneContent,
        shareWbContent,
        shareQzoneTitle,
      )
      return
    }
  }
  var shareObj = new Object()
  shareObj['shareTitle'] = shareTitle
  shareObj['shareContent'] = shareContent
  shareObj['shareIcon'] = shareIcon
  shareObj['shareUrl'] = openShareUrl
  shareObj['sharePicUrl'] = sharePicUrl
  shareObj['shareWxCircle'] = shareWxCircle
  shareObj['shareQqTitle'] = shareQqTitle
  shareObj['shareQqContent'] = shareQqContent
  shareObj['shareQzoneTitle'] = shareQzoneTitle
  shareObj['shareQzoneContent'] = shareQzoneContent
  shareObj['shareWbContent'] = shareWbContent
  if (sharePicUrl != '') {
    shareObj['shareType'] = 1
    shareObj['sharePlatforom'] = -2
  }
  shareObj = initShareObj(shareObj)
  screenShotsFlag = Boolean(screenShotsFlag)
  if (tool.isIosWeb()) {
    var strAction = 'share_params'
    var imgBase64Url1 =
      'iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAIAAADZ8fBYAAADlElEQVR4AX2VA6xEVxCGv3/OuYvajdPGSRvUCGvFKsPGZuPGbsyaQW3btm27T6s70+Ttnpzcfcrd3Tl435n7z73z6+ifjnfkmGOx+V3jemmnpRIvE7LCTUY44GCCAOEgsAAAc8JwAHBhQYlRYBgKwh0MENmYDwwKmvoXNcRRWepuq0NjQdvklhQMddA1Vsk63FSWVLYJgrJTm3HhEoRgK1p41LvuoKOjW02OAM/CjSKoMLaia1y0LmgKGrrSKxse1DMDwNqYtbBU63p1ZyBl9TporNStng/hh9the9u+jiCBxeY3JGSQyqSBJeU/fPWt2VeFsJC01A2spDyL9lAdcNEel4ASKalJpKwmKSVy33o99QwzWcL20ODyf657LT5p1LcAFd0MN9zCNQ/wxuzt6RsfTz4imMVsFtPyPXNaQRvt/DLs5dH7d208NbBkFML8EmG4yU2LhUSEpk+OHpsx0SKDACD6m7kbMilhLe1VK3eObZwKpKI755S4Z+lr//yt8es9NRRoQ+6rb1KSGTaw/hPrL786e3doqUsoXCMs3KIsbAbZeGr02L/+j2ECwZ5pj6xkmKGs9G/73/Wrd6SEEQtcVEltwVJI5Uy58Eb6nZ+fHz3dKAU+tMFQA6GEmWyg3p2rD3/pX/dltiCGVCTFTaVuFrF0O31LL06e+XH2fU/Nfmkfk6XNq0fz7fSH2zfuG6Sssr9kGlXfeggddBYb+u+R9fv3SfsMNLR5slhWvmXltr/4I4sqaLkUMZfRl5sLbuUdydJP/i1EVmoR0Kj39ujdx8dPDHMDtXNWggi0zXtBmGuBJtqzhudNfRJEwkAe7Y3/3Ti1UcOwZABROoPmsazmr/pIGGFEG+Mj0pGnDs+cxHjNV5Py0IZPrT/55uy1oWWjrY+BlghR+lks9y0nepEu2OvSfdP+q6ystav7pf3/bf+5ZeX6nDACgvD6X932VvVdMoKJT88cXHDy8LRxjBr1xj6KiHtWbvvGP+/nPR1XbO8yHb+owpe4p/T79Psr/risxR21ES3+1uzNYWrA6/0t9WuVghsx37e8gL3XvjCLcNKiEcuS9bOyF4uB4jI4wqNawVzf7ZxN9JWbjp/LwXF1+nVxGTpaF7/YUakaa3c/7hJq3XZGd51tB3QnuVK3Io1sobVYfuABbbH6wFS3KTAVP55zqzTb1lfU1KSuVXff4LIpC7eAKuKOT6WqXLGTIGWb/ge7OXDlEvWZtQAAAABJRU5ErkJggg=='
    var url =
      '/local_call?local_action=' +
      strAction +
      '&arg0=' +
      encodeURIComponent(shareTitle) +
      '&arg1=' +
      encodeURIComponent(shareContent) +
      '&arg2=' +
      encodeURIComponent(shareIcon) +
      '&arg3=' +
      encodeURIComponent(openShareUrl) +
      '&arg4=' +
      encodeURIComponent(JSON.stringify(shareObj)) +
      '&arg6=' +
      encodeURIComponent(screenShotsFlag) +
      '&arg7=' +
      encodeURIComponent(imgBase64Url1) +
      '&arg8=' +
      encodeURIComponent(sharePicUrl)
    iosIframeLocalCall(url)
    return
  }
  if ('setShareMetaInfo' in YDJSInterface && window.YDJSInterface) {
    window.YDJSInterface.setShareMetaInfo(
      shareTitle,
      shareContent,
      shareIcon,
      openShareUrl,
      JSON.stringify(shareObj),
    )
  }
}
// ios 如果我们连续 2 个 js 调 native，连续2次改document.location的话，在app中，
// 只能截获后面那次请求，前一次请求由于很快被替换掉，所以被忽略掉了，前一次请求返回数据丢失。
// 故换成iframe 来实现调用
function iosIframeLocalCall(url) {
  var iFrame
  iFrame = document.createElement('iframe')
  iFrame.setAttribute('src', url)
  iFrame.setAttribute('style', 'display:none;')
  iFrame.setAttribute('height', '0px')
  iFrame.setAttribute('width', '0px')
  iFrame.setAttribute('frameborder', '0')
  document.body.appendChild(iFrame)
  // 发起请求后这个 iFrame 就没用了，所以把它从 dom 上移除掉
  iFrame.parentNode.removeChild(iFrame)
  iFrame = null
}

function setAppShareUrl(url) {
  if (window.YDJSInterface && 'setPageShareUrl' in YDJSInterface) {
    window.YDJSInterface.setPageShareUrl(url)
  }
}
function initAppShareType(sharePlatforom) {
  //web和ios sharePlatforom -1:分享面板 0:新浪微博 1:微信聊天 2:微信朋友圈 4:QQ聊天 5:QQ空间
  //android 安卓分享面板类型：微信：0，朋友圈：1，微博:2, QQ：3，QQ空间：4
  switch (sharePlatforom) {
    case 0:
      sharePlatforom = 2
      break
    case 1:
      sharePlatforom = 0
      break
    case 2:
      sharePlatforom = 1
      break
    case 4:
      sharePlatforom = 3
      break
    case 5:
      sharePlatforom = 4
      break
  }
  return sharePlatforom
}
function androidShareByType(shareObj) {
  var shareType = shareObj['shareType']
  var sharePlatforom = shareObj['sharePlatforom']
  var shareTitle = shareObj['shareTitle']
  var shareContent = shareObj['shareContent']
  var shareIcon = shareObj['shareIcon']
  var shareUrl = shareObj['shareUrl']
  var sharePic = shareObj['sharePicUrl']
  var shareWxCircle = dealCheck(shareContent, shareObj['shareWxCircle'])
  var shareQqTitle = dealCheck(shareTitle, shareObj['shareQqTitle'])
  var shareQqContent = dealCheck(shareContent, shareObj['shareQqContent'])
  var shareQzoneTitle = dealCheck(shareTitle, shareObj['shareQzoneTitle'])
  var shareQzoneContent = dealCheck(shareContent, shareObj['shareQzoneContent'])
  var shareWbContent = dealCheck(shareContent, shareObj['shareWbContent'])

  if (
    window.YDJSInterface &&
    'setMetaDataShareImgExtra' in YDJSInterface &&
    shareType == 1
  ) {
    //分享图片
    window.YDJSInterface.setMetaDataShareImgExtra(
      shareQzoneTitle,
      shareQzoneContent,
      shareIcon,
      shareWbContent,
      sharePic,
      shareUrl,
      sharePlatforom,
    )
    return
  }
  //分享链接
  sharePic = ''
  if (window.YDJSInterface && 'setMetaDataShareTlInfoExtra' in YDJSInterface) {
    window.YDJSInterface.setMetaDataShareTlInfoExtra(
      shareTitle,
      shareContent,
      shareIcon,
      shareWxCircle,
      shareQqTitle,
      shareQzoneTitle,
      shareQqContent,
      shareQzoneContent,
      shareWbContent,
      shareUrl,
      sharePlatforom,
    )
    return
  }
  ydShare()
}
/**
 * 把分享对象 转换成ios需要的样子
 * @param {Object} shareObj
 */
function initShareObj(sObj) {
  var shareType = sObj['shareType']
  var sharePlatforom = sObj['sharePlatforom']
  var shareTitle = sObj['shareTitle']
  var shareContent = sObj['shareContent']
  var shareIcon = sObj['shareIcon']
  var openShareUrl = sObj['shareUrl']
  var sharePic = sObj['sharePicUrl']
  var shareWxCircle = sObj['shareWxCircle']
  var shareQqTitle = sObj['shareQqTitle']
  var shareQqContent = sObj['shareQqContent']
  var shareQzoneTitle = sObj['shareQzoneTitle']
  var shareQzoneContent = sObj['shareQzoneContent']
  var shareWbContent = sObj['shareWbContent']
  if (shareType == 1 && sharePlatforom != 5) {
    shareIcon = sharePic
    openShareUrl = ''
  }
  var shareObj = new Object()
  shareObj['qq'] = {}
  shareObj['qq']['title'] = shareTitle
  shareObj['qq']['text'] = shareContent
  if (shareQqTitle != '') {
    shareObj['qq']['title'] = shareQqTitle
  }
  if (shareQqContent != '') {
    shareObj['qq']['text'] = shareQqContent
  }

  shareObj['qzone'] = {}
  shareObj['qzone']['title'] = shareTitle
  shareObj['qzone']['text'] = shareContent
  if (shareQzoneTitle != '') {
    shareObj['qzone']['title'] = shareQzoneTitle
  }
  if (shareQzoneContent != '') {
    shareObj['qzone']['text'] = shareQzoneContent
  }

  shareObj['wechat_session'] = {}
  if (shareTitle != '') {
    shareObj['wechat_session']['title'] = shareTitle
  }
  if (shareContent != '') {
    shareObj['wechat_session']['text'] = shareContent
  }

  //微信朋友圈title&content只有一个
  shareObj['wechat_timeline'] = {}
  shareObj['wechat_timeline']['title'] = shareTitle
  shareObj['wechat_timeline']['text'] = shareContent
  if (shareWxCircle != '') {
    shareObj['wechat_timeline']['title'] = shareWxCircle
    shareObj['wechat_timeline']['text'] = shareWxCircle
  }

  shareObj['sina'] = {}
  shareObj['sina']['title'] = shareTitle
  shareObj['sina']['text'] = shareContent
  if (shareWbContent != '') {
    //内容后面拼接链接 微博会自动识别链接。
    shareObj['sina']['text'] = shareWbContent + openShareUrl
  }

  if (shareIcon != '') {
    shareObj['qq']['image'] = shareIcon
    shareObj['qzone']['image'] = shareIcon
    shareObj['wechat_session']['image'] = shareIcon
    shareObj['wechat_timeline']['image'] = shareIcon
    shareObj['sina']['image'] = shareIcon
  }
  if (openShareUrl != '') {
    shareObj['qq']['url'] = openShareUrl
    shareObj['qzone']['url'] = openShareUrl
    shareObj['wechat_session']['url'] = openShareUrl
    shareObj['wechat_timeline']['url'] = openShareUrl
    shareObj['sina']['url'] = ''
  }
  return shareObj
}
function stopBubble(e) {
  if (e && e.stopPropagation) e.stopPropagation() //非IE
  else window.event.cancelBubble = true //IE
}
function ydShare(type, event) {
  if (event != null) {
    stopBubble(event)
  }
  if (null == type) {
    window.location.href = '/local_call?local_action=share'
  } else {
    window.location.href = '/local_call?local_action=share&type=' + type
  }
}
function onShare(that) {
  if (!tool.isYuedong()) {
    globalVue.toast('亲，请点击右上角分享按钮进行分享～')
  } else {
    ydShare()
  }
}
let shareCb = function () {}
//右上角分享 可以分享链接/图片/ios可分享截图
async function setSimpleShare(shareObj, cbFun) {
  await addWeixinShareSpecifyInfoV2(shareObj)
  updateShareMetaInfo(shareObj)
  if (cbFun) {
    shareCb = cbFun
  }
}
function onYdShareCb() {
  shareCb()
}
function GetWeixinTicket() {
  return $http.post('/invite/get_wx_web_token', {}).then((res) => {
    if (res.code == 0) {
      return res.ticket
    }
    return ''
  })
}

;(function () {
  window.MetaShareInfo = () => {
    MetaShareInfo()
  }
  window.onYdShare = () => {
    onYdShareCb()
  }
})()

export {
  iosIframeLocalCall,
  addWeixinShareSpecifyInfoV2,
  commonShare,
  onShare,
  setSimpleShare,
  MetaShareInfo,
  AccessWeixinShare,
  onYdShareCb,
}
