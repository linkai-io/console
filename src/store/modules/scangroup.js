//import router from '../../routes/router';
import API from '../../api/api';
// initial state
const state = {
  scangroups: [],
  currentGroup: {},
  isCreating: false,
  creationMsg: ''
};

// getters
const getters = {
  scanGroups() {
    return state.scanGroups;
  }
};

// actions
const actions = {
  CLEAR_CREATION_MSG({ commit }) {
    commit('SET_CREATION_MSG', '');
  },
  GET_GROUPS({ commit }) {
    API.get('/scangroup/groups').then(
      resp => {
        commit('SET_GROUPS', resp.data);
      },
      err => {
        console.log(err);
      }
    );
    commit('SET_INITIALIZED');
  },
  GET_GROUP_BY_NAME({ commit }, name) {
    API.get('/scangroup/name/' + name).then(
      resp => {
        commit('SET_CURRENT_GROUP', resp.data);
      },
      err => {
        console.log(err);
      }
    );
  },
  CREATE_GROUP({ commit }, group) {
    commit('SET_IS_CREATING', true);
    API.post('/scangroup/name/' + group.group_name, group).then(
      resp => {
        commit('SET_IS_CREATING', false);
        if (resp.data.status == 'OK') {
          commit('SET_CREATION_MSG', 'success');
        }
      },
      err => {
        commit('SET_IS_CREATING', false);
        if (err.data !== undefined) {
          commit('SET_CREATION_MSG', err.data.msg);
          return;
        }
        console.log(err);
        commit('SET_CREATION_MSG', 'Failed to create group: ' + err.message);
      }
    );
  }
};

// mutations
const mutations = {
  SET_INITIALIZED(state) {},
  SET_CREATION_MSG(state, details) {
    state.creationMsg = details;
  },
  SET_IS_CREATING(state, details) {
    state.isCreating = details;
  },
  SET_GROUPS(state, details) {
    state.scangroups = details;
  },
  SET_CURRENT_GROUP(state, details) {
    state.currentGroup = details;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
