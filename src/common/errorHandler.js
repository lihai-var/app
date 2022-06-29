import Vue from 'vue'
import {logFlag} from '@/config/env'
export default () =>{
    const errorHandler = (err, vm, info) => {
        // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
        let compName = "";
        if (vm) {
            compName = _formatComponentName(vm);
            compName = compName.replace(/\\/g, "/");
        }
        let obj = {
            component: compName, 
            hook: info, 
            err_msg: err + ''
        }
        let hosts = location.host;
        if((hosts.indexOf("localhost") > -1 || hosts.indexOf("test") > -1)){
            console.table(obj);
        }
        tool.$throwJS(obj);
    }
    Vue.config.errorHandler = errorHandler;
}

//获取当前组件的路径
function _formatComponentName(vm) {
    if (vm.$root === vm) return 'root';
    let name = vm._isVue
        ? (vm.$options && vm.$options.name) ||
        (vm.$options && vm.$options._componentTag)
        : vm.name;
    return (
        (name ? 'component <' + name + '>' : 'anonymous component') +
        (vm._isVue && vm.$options && vm.$options.__file
            ? ' at ' + (vm.$options && vm.$options.__file)
            : '')
    );
}
