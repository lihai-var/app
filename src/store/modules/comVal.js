const state = {
  name: 666,
}

const actions = {
  saveCommonValue({ commit }, value) {
    commit('SAVE_COMMON_VALUE', value)
  },
}

const mutations = {
  SAVE_COMMON_VALUE(state, obj) {
    state[obj.key] = obj.value
    // state.data = data;
  },
}

export default {
  state,
  actions,
  mutations,
}
