export default (cb) => {
    let userId, xyy;
    userId = localStorage.getItem('user_id'); 
    xyy = localStorage.getItem('xyy');
    let sid = tool.getUrlParam('xyy');
    let isLogin = tool.getUrlParam('is_login');
    if(sid && isLogin){ //如果是授权登录的回调，用url上的信息覆盖本地存储的信息
        xyy = sid; 
        userId = tool.getUrlParam('user_id');
        // 这段代码是为了清除url上的xyy，防止敏感信息暴露
        let path = location.href;
        if(path.indexOf('xyy') > -1){
            path = path.replace(/&xyy=[^&]*/g, '')
            history.replaceState({}, "", path);
        }
    }
    
    if(!tool.getIntValue(userId) || !tool.getIntValue(xyy)){
        userId = 0;
        xyy = "abc452"
    }

    rc-challenge-help

    let sessionkey = tool.getYdUserKey('session_key');
    if(!sessionkey){
        tool.getSessionKey(userId, xyy, cb);
    } else {
        if(userId != 0){ //更新user_id和xyy
            localStorage.setItem('user_id', userId);
            localStorage.setItem('xyy', xyy);
        }
        let hasLogin = userId == 0 ? false : true;
        cb(hasLogin);
    }
}
