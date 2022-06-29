export default class menuMethod {	
	static matchMenu(menu,path) {
		if(path=='/'){
			jumpUrl(menu);
		} else{
			let permission=find(menu,path);
			if(!permission){
				globalVue.$router.push({path:'/'});
				globalVue.$alert('抱歉，找不到该页面', '标题名称', {
					confirmButtonText: '确定',
					callback: () => {
						jumpUrl(menu);
					}
				});
			}
		}
	}
}

// 匹配查找，看是否有访问当前url的权限
function find(menu,path) {
	for(let i=0;i<menu.length;i++){
		if(menu[i].children){
		let result=find(menu[i].children,path);
			if(result) return true;
		} else if(menu[i].path==path){
			return true;
		}
	}
}
// 路由跳转
function jumpUrl(menu){
	if(menu[0].path){
		globalVue.$router.push({path:menu[0].path});
	} else {
		if(menu[0].children[0].children){
			globalVue.$router.push({path:menu[0].children[0].children[0].path});
		} else {
			globalVue.$router.push({path:menu[0].children[0].path});
		}
	}
}

 