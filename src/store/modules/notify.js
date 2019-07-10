// initial state
const state = {
  notifyMsg: '',
  notifyMsgType: '',
  notifyMsgTimeout: 4000,
  notifyID: 0
};

// getters
const getters = {
  getMsg: state => state.notifyMsg,
  getMsgType: state => state.notifyMsgType,
  getMsgTimeout: state => state.notifyMsgTimeout,
  getMsgID: state => state.notifyID
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
    state.notifyID = new Date().getMilliseconds();
    if (details.msgTimeout !== undefined) {
      state.notifyMsgTimeout = details.msgTimeout;
    }
  },
  CLEAR_NOTIFY_MSG(state) {
    state.notifyMsg = '';
    state.notifyMsgType = '';
    state.notifyID = 0;
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
