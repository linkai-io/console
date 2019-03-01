// initial state
const state = {
  showHome: 0
};

// getters
const getters = {
  shouldShowHome: state => state.showHome
};

// actions
const actions = {
  INIT({ commit }) {
    commit('SET_INITIALIZED');
  },
  UPDATE_SHOW_HOME({ commit }, details) {
    commit('SET_SHOW_HOME', details);
  }
};

// mutations
const mutations = {
  // 0 is the index, -1 means don't show
  SET_INITIALIZED(state) {
    let showHome = localStorage.getItem('dashboard.showHome');
    if (showHome === null) {
      state.showHome = 0;
      return;
    }
    state.showHome = showHome === 'true' ? 0 : -1;
  },
  SET_SHOW_HOME(state, value) {
    localStorage.setItem('dashboard.showHome', value);
    state.showHome = value === true ? 0 : -1;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
