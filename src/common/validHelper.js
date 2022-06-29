/**
 * @描述     表单校验
 * @开发     Zach he
 * @时间     2019-05-05
 * @param  {object}   
 *         options: {
 *         		container:'className', 父容器class name 
 *         }
 * 
 * @result {pass:false, msg:validObj.msg, dom:tempDom};
 *         
 * type枚举值与reg.js一致
 */
import reg from '@/common/reg.js'   //引入正则表达式

const ValidHelper = (options) => {
	let doms = document.querySelectorAll('.' + options.container);
	if (doms == null || doms.length == 0) return {pass:true,msg:'未能查找到容器'};

	for (var i = 0; i < doms.length; i++) {
		let dom = doms[i];
		let validDomArray = dom.querySelectorAll('.valid');

		for (var j = 0; j < validDomArray.length; j++) {
			let d = validDomArray[j];
			let validStr = d.dataset['valid'];
			if(d.className.indexOf('el-input')>-1){
				validStr = d.querySelector('.el-input__inner').dataset['valid'];
			}
			if (validStr) {
				let validStrArray = validStr.split(',');
				let obj = {};

				validStrArray.forEach((line)=>{
					let attrArray = line.split(':');
					obj[attrArray[0]] = attrArray[1];
				}); 
                 
				let result = check(d, obj); 
				if (!result.pass) { 
					return result;
				}
			} else{       //只是纯input输入框校验空值
				if (d.attributes.type == undefined) {
					d = d.querySelector("input");
				}
                let val = d.value;
				if(!val){
					return {pass: false, msg: '请' + d.getAttribute('placeholder'), dom: d};
				}
			}
		}
	}
	return {pass:true};
}


function check(tempDom,validObj) {
	let tipWord="";
	let val = "";
	if (validObj.type.indexOf('select') != -1) {  //下拉框
		tempDom=tempDom.querySelectorAll('.el-input__inner')[0];
		tipWord=validObj.msg;
		val = tempDom.value;
	} else {
		tipWord=tempDom.tagName == 'DIV' ? tempDom.querySelector('input').getAttribute('placeholder') : tempDom.getAttribute('placeholder');
		tipWord = '请' + tipWord;
		val = tempDom.className.indexOf('el-input') != -1 ?  tempDom.querySelector('input').value : tempDom.value;
	} 
	if(!val){
        return {pass:false,msg:tipWord,dom:tempDom};
	}
	if (validObj.type.indexOf('phone') != -1) {   //校验手机
		if (reg.phone.test(val)) return {pass:true}
		else return {pass:false, msg:validObj.msg, dom:tempDom};
	}
	if (validObj.type.indexOf('vfCode') != -1) {  //校验验证码
		if (reg.vfCode.test(val)) return {pass:true}
		else return {pass:false, msg:validObj.msg, dom:tempDom};
	} 
	return {pass:true}
}

const handle = (validResult,isHandle) => {	 
	if(isHandle){                     //校验不通过时添加class
		let d = validResult.dom.tagName == "DIV" ? validResult.dom.querySelector('input') : validResult.dom;
		let classVal=d.getAttribute('class');
		if(classVal.indexOf('valid-red')=='-1'){
			classVal=classVal.concat(' valid-red');
			d.setAttribute('class',classVal);
		}
		globalVue.$message({type:'info',message:validResult.msg,duration: 1500});	
	} else{                          //输入框获取焦点时移除class
		let classVal=validResult.getAttribute('class');
		classVal=classVal.replace('valid-red',"");
		validResult.setAttribute('class',classVal);
	}

	// 添加事件 
	if (validResult.dom) {
		let d = validResult.dom.tagName == "DIV" ? validResult.dom.querySelector('input') : validResult.dom;
		d.addEventListener('focus',(e)=>{ 
			let target = e.srcElement || e.target;
			handle(target);
		}); 
	}
}

if (typeof window.$ValidHelper == "undefined"){
	window.$ValidHelper = {};
	window.$ValidHelper.check = ValidHelper;
	window.$ValidHelper.handle = handle;
} 
	