// 封装axios请求
import axios from 'axios'
import CryptoJS from 'crypto-js';
import {basePath} from '@/config/env'
let onGetSession = false; //是否正在请求sessionkey
const post = async (url, parms={}, isfromGetsskey) => {
	//这里是防止sessionkey接口很慢的情况下，其它正在排队的请求继续发送，导致短时间内多个重复请求（100ms一次）
	if(onGetSession && !isfromGetsskey){ 
		await _sleep(200); 
		return post(url, parms)
	}
	let instance = axios.create({
		timeout: 1000 * 10,
		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	});
	let sskey = tool.getYdUserKey("session_key");
	let userId = tool.getYdUserKey('user_id') || 0;
	let xyy = tool.getYdUserKey('xyy') || 'zachhe';
	if(!sskey && !isfromGetsskey){
		sskey = await tool.getSessionKey(userId, xyy);
	}
	parms = Object.assign({
		user_id: userId,
		xyy: xyy,
		platform: 'web',
		session_key: sskey,
		session_from: 1,
		timestamp: Date.parse(new Date())/1000 + tool.timeSpace + ''
	}, parms)

	parms.sign = _hamcSha(url,parms,sskey);
	let qs = require('qs');
	let reqUrl = url.indexOf('http') > -1 ? url : basePath + url;
	return instance.post(reqUrl, qs.stringify(parms)).then(async function(res){
		if(!res.data || res.data.code === undefined || !res.data.msg){
			tool.$throw('结构体异常', parms, url, res.data);
		}
		let data = Object.assign({code:-1001, msg:'网络出问题了~'}, res.data);
		if(data.code === 7007){ //sessionkey过期
			tool.$throw('sskey过期', parms, url);
			if(isfromGetsskey){
				_dealSessionExpire()
			} else {
				delete parms.session_key;
				if(!onGetSession){ //前面没有正在请求的sessionkey
					onGetSession = true;
					let returnSskey = await tool.getSessionKey(parms.user_id,parms.xyy);
					onGetSession = false;
					if(!returnSskey) return {}; //没有获取到sesskey时，停止后面的请求，常见的场景是xyy过期
					return post(url, parms, true)
				} else { //前面有在请求的sessionkey
					await _sleep(100); //排队等100毫秒再去请求
					return post(url, parms)
				}
			}
		}
		if(data.code !== 0 && data.code !== 4004 && data.code !== 7007){
			if(data.code === 1 && data.msg === '参数不合法'){ //将参数不合法的请求上报
				tool.$throw('参数不合法', parms, url);
				let timeSpace = 0;
				if(res.headers.server_time){
					timeSpace = parseInt(res.headers.server_time) - parms.timestamp;
				}
				if(Math.abs(timeSpace) > 300){ //本地和服务器时间超过五分钟导致的参数不合法
					tool.timeSpace = timeSpace;
					delete parms.timestamp;
					return post(url, parms)
				} 
				if(globalVue) globalVue.$message('服务异常，请稍后重试')
			} else if(globalVue){
				globalVue.$message(data.msg)
			}
		}
		if(data.code === 4004){ //user_id和xyy不匹配，最常见的是用户被设置成了广告用户，xyy发生变化
			tool.$throw('登录过期', parms, url); 
			tool.toLogin();
		}
		return data;
	}).catch(res=>{
		tool.$throw(res, parms, reqUrl); 
		if(isfromGetsskey){ //获取sessionkey超时
			tool.fetchSKtime++;
			if(tool.fetchSKtime < 3){ //最多请求三次，不行就出提示弹窗，常见场景有：1获取sessionkey超时，2按钮跳转时的事件上报（弱网下事件上报没完成页面就直接跳转走了，导致请求abort）
				return post(url, parms, true)
			} else {
				_dealSessionExpire()
			}
		} else if(globalVue){ //弱网下按钮跳转的事件上报被cancel时，不用出$message弹窗
			globalVue.$message('当前网络不给力，请稍后重试');
		}
		return {code: -1002, msg:'网络出问题了~'};
	});
}

//不带默认参数的请求，主要用于错误上报等
const postOnly = async (url, parms={}, headers={}) => {
	let instance = axios.create({
		timeout: 1000 * 10,
		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	});
	let qs = require('qs');
	return instance.post(url, qs.stringify(parms)).then(function(res){
		return res.data;
	}).catch(res=>{
		let errObj = JSON.parse(parms.data);
		if(errObj.err_msg && window.ydStorage){
			ydStorage.setItem(errObj.err_msg, errObj, 3600*24*7, true);
		}
	})
}

const get = (url, parms={},headers={}) => {
	url += '?';
	for(let key in parms){
		url += key + '=' + parms[key] + '&';
	}
	let option = Object.assign({},headers);
	let instance = axios.create({
		timeout: 1000 * 10,
		headers: option
	});

	return instance.get(url).then(function(res){
		return res.data;
	}).catch(res=>{
		console.log('error',res);
	});
}

export default () => {
	if (typeof window.$http == 'undefined') {
		window.$http = {
			post: post,
			postOnly: postOnly,
			get: get
		}
	}
}

function _sortArgs(data){
    var args;
    var argsArr = [];
    for(args in data){
        if(data[args]==null || data[args]==undefined){
            data[args] = ""
        }
        if (args != "xyy" && args != "sign" && args != "content" && args != "feeling" && args != "nick" && args != "alipay_name"){
            argsArr.push(args);
        }
    }
    argsArr.sort();
    var argStr = "";
    for (var i = 0; i < argsArr.length;i++){
        var item = argsArr[i];
        argStr = argStr + item + "=" + data[item] + '&';
	}
    argStr=argStr.substring(0, argStr.length-1);
	argStr = encodeURIComponent(argStr);
	argStr = argStr.replace(/\(/g,"%28").replace(/\)/g,"%29").replace(/!/g, '%21').replace(/~/g, '%7E').replace(/\*/g, '%2A').replace(/'/g, '%27');
    return argStr
}
function _hamcSha(uri,data,sectionKoken){
    var url = encodeURIComponent(uri);
    var paramsStr = _sortArgs(data);
    var args = "POST&" + url + "&" + paramsStr;
    var hash = CryptoJS.HmacSHA1(args, sectionKoken);
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    return hashInBase64
}

function _dealSessionExpire() {
	if(window.globalVue){
		globalVue.$confirm('很抱歉，访问出现错误', '提示', {
            confirmButtonText: '刷新页面',
            cancelButtonText: '重新登录',
            type: 'warning'
        }).then(() => {
            window.location.reload();
        }).catch(() => {
            tool.toLogin();        
        });
	} else {
		tool.toLogin();
	}
}
function _sleep(interval) {
	return new Promise(resolve => {
		setTimeout(resolve, interval);
	})
}
