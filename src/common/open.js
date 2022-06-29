
function ajax(options){
    var xhr = null;
    var params = formsParams(options.data);
    //创建对象
    if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest()
    } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    // 连接
    if(options.type == "GET"){
        xhr.open(options.type,options.url + "?"+ params,options.async);
        xhr.send(null)
    } else if(options.type == "POST"){
        xhr.open(options.type,options.url,options.async);
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.send(params);
    }
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status == 200){
            options.success(xhr.responseText);
        }
    }
    function formsParams(data){
        var arr = [];
        for(var prop in data){
            arr.push(prop + "=" + data[prop]);
        }
        return arr.join("&");
    }

}

ajax({
    url : "a.php",  // url---->地址
    type : "POST",   // type ---> 请求方式
    async : true,   // async----> 同步：false，异步：true
    data : {        //传入信息
        name : "张三",
        age : 18
    },
    success : function(data){   //返回接受信息
        console.log(data);
    }
})

function reg_one(){

    var a = document.querySelector("#form-step-1 > ti-form-element:nth-child(2) > ti-password-validator").shadowRoot.querySelector("ti-password").shadowRoot.querySelector("div > input[type=password]")

    var b  = document.querySelector("#form-step-1 > ti-form-element:nth-child(3) > ti-password > input[type=password]");

    var aa = document.querySelector("#form-step-1 > ti-form-element:nth-child(2) > ti-password-validator").shadowRoot.querySelector("ti-password");
    var bb = document.querySelector("#form-step-1 > ti-form-element:nth-child(3) > ti-password")

    var em = document.querySelector("#form-step-1 > ti-form-element:nth-child(1) > input[type=email]");
    var co = document.querySelector("#form-step-1 > ti-form-element:nth-child(5) > input[type=text]");


    window.inputValue = function (dom, st) {
        var evt = new InputEvent('input', {
            inputType: 'insertText',
            data: st,
            dataTransfer: null,
            isComposing: false
        });
        dom.value =st;
        dom.dispatchEvent(evt);
    }

    inputValue(a,'sfYDnsdiY11');

    inputValue(b,'sfYDnsdiY11');

    inputValue(bb,'sfYDnsdiY11');

    inputValue(aa,'sfYDnsdiY11');

    inputValue(em,'hruztr@hotmail.com');

    inputValue(co,'518000');


    setTimeout(function(){
        var btn = document.querySelector("#continueBtn").shadowRoot.querySelector("button");
        btn.click();

    },1000);

}




reg_one();


setTimeout(function(){

    reg_two();

},3000);



function reg_two(){


    //第二步填写

    var r_name = document.querySelector("#form-step-2 > ti-form-element:nth-child(1) > input[type=text]");

    inputValue(r_name,"xiaochun");

    var xe = document.querySelector("#form-step-2 > ti-form-element:nth-child(2) > input[type=text]");

    inputValue(xe,"he");

    var cu  =  document.querySelector("#form-step-2 > ti-form-element:nth-child(3) > input[type=text]");

    inputValue(cu,"广东大学");


    var sf = document.querySelector("#form-step-2 > ti-form-element:nth-child(4) > select");
    sf.selectedIndex = 1;


    var ly = document.querySelector("#appAreaFormElement > select");


    ly.selectedIndex  = 1;

    var e_name = document.querySelector("#cnjpInputs > ti-form-element:nth-child(3) > input[type=text]");
    inputValue(e_name,'xiaochun');


    var e_he = document.querySelector("#cnjpInputs > ti-form-element:nth-child(4) > input[type=text]");

    inputValue(e_he,"he");


    var e_cou =  document.querySelector("#cnjpInputs > ti-form-element:nth-child(5) > input[type=text]");

    inputValue(e_cou,'GDDX');

    var box = document.querySelector("#form-step-2 > div:nth-child(8) > ti-checkbox");
    box.click();

    var ph  = document.querySelector("#cnjpInputs > ti-form-element:nth-child(1) > ti-phone-input").shadowRoot.querySelector("div > input");
    inputValue(ph,'13147083749');
    var yph = document.querySelector("#cnjpInputs > ti-form-element:nth-child(1) > ti-phone-input");
    yph.setAttribute("area-code","131");
    yph.setAttribute("phone-number","47083749");
    yph.setAttribute("is-valid","")

    var s_yph = document.querySelector("#cnjpInputs > ti-form-element:nth-child(1)");
    s_yph.setAttribute('class',"ti-form-element ti-form-element-is-required hydrated");
    s_yph.setAttribute('required','');


    setTimeout(function(){

        //按钮强行变化
        var r_btn = document.querySelector("#registerBtn");
        r_btn.removeAttribute("disabled");
        r_btn.click();

    },1000);

}
























