//import router from '../../routes/router';
import API from '../../api/api';
// initial state
const state = {
  scangroups: [],
  currentGroup: {},
  isCreating: false
};

// getters
const getters = {
  scanGroups() {
    return state.scanGroups;
  }
};

// actions
const actions = {
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
    API.get('/scangroup/group/' + name).then(
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
    this.$notify({
      message: 'Group Successfully Created',
      timeout: 3000,
      icon: 'tim-icons icon-bell-55',
      horizontalAlign: 'top',
      verticalAlign: 'center',
      type: 'success'
    });
    /*
    API.post('/scangroup/groups/' + group.group_name).then(
      resp => {
        commit('SET_IS_CREATING', false);
        if (resp.data.status == 'OK') {
          this.$notify({
            message: 'Group Successfully Created',
            timeout: 3000,
            icon: 'tim-icons icon-bell-55',
            horizontalAlign: 'top',
            verticalAlign: 'center',
            type: 'success'
          });
        }
      },
      err => {
        console.log(err);
        commit('SET_IS_CREATING', false);
      }
    );
    */
  }
};

// mutations
const mutations = {
  SET_INITIALIZED(state) {},
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
