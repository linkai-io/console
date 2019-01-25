// initial state
const state = {
  notifyMsg: '',
  notifyMsgType: ''
};

// getters
const getters = {
  getMsg: state => state.notifyMsg,
  getMsgType: state => state.notifyMsgType
};

// actions
const actions = {
  CREATE_NOTIFY_MSG({ commit }, details) {
    commit('SET_NOTIFY_MSG', details);
  }
};

// mutations
const mutations = {
  SET_NOTIFY_MSG(state, details) {
    state.notifyMsg = details.msg;
    state.notifyMsgType = details.msgType;
  },
  CLEAR_NOTIFY_MSG(state) {
    state.notifyMsg = '';
    state.notifyMsgType = '';
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
