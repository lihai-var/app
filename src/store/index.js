import Vue from 'vue'
import Vuex from 'vuex'
import comVal from './modules/comVal'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    comVal,
  },
})
