// import router from '../../routes/router';
import API from '../../api/api';

// initial state
const state = {
  addressCounts: []
};

// getters
const getters = {
  addressCounts() {
    return state.addressCounts;
  }
};

// actions
const actions = {
  GET_ADDRESS_COUNT({ commit }, id) {
    API.get('/address/group/' + id + '/count').then(
      resp => {
        if (resp.data.status == 'OK') {
          commit('SET_ADDRESS_COUNT', resp.data);
        }
      },
      err => {
        console.log(err);
      }
    );
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
  }
};

// mutations
const mutations = {
  SET_ADDRESS_COUNT(state, details) {
    for (let i = 0; i < state.addressCounts.length; i++) {
      if (state.addressCounts[i].group_id == details.group_id) {
        state.addressCounts[i] = details;
        console.log(state.addressCounts[i]);
        return;
      }
    }
    state.addressCounts.push(details);
    console.log(details);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
