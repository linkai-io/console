// initial state
const state = {
  notifyMsg: '',
  notifyMsgType: '',
  notifyMsgTimeout: 4000
};

// getters
const getters = {
  getMsg: state => state.notifyMsg,
  getMsgType: state => state.notifyMsgType,
  getMsgTimeout: state => state.notifyMsgTimeout
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
    if (details.msgTimeout !== undefined) {
      state.notifyMsgTimeout = details.msgTimeout;
    }
  },
  CLEAR_NOTIFY_MSG(state) {
    state.notifyMsg = '';
    state.notifyMsgType = '';
    state.notifyMsgTimeout = 4000;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
