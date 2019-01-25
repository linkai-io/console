// import router from '../../routes/router';
import Vue from 'vue';
import API from '../../api/api';

// initial state
const state = {
  addressCounts: {},
  isUploading: false
};

// getters
const getters = {
  addrCounts() {
    return state.addressCounts;
  },
  getCountByID: state => id => {
    return state.addressCounts[id] === undefined
      ? 0
      : state.addressCounts[id].count;
  }
};

// actions
const actions = {
  GET_ADDRESS_COUNT({ commit }, group_id) {
    API.get('/address/group/' + group_id + '/count').then(
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
  UPLOAD_ADDRESSES({ dispatch, commit }, details) {
    commit('SET_IS_UPLOADING', true);
    API.put(
      '/address/group/' + details.group_id + '/initial',
      details.addresses
    ).then(
      resp => {
        commit('SET_IS_UPLOADING', false);
        console.log(resp.data);
        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Successfully uploaded addresses to group',
              msgType: 'success'
            },
            { root: true }
          );
          dispatch('GET_ADDRESS_COUNT', details.group_id);
        }
      },
      err => {
        commit('SET_IS_UPLOADING', false);
        if (err.data !== undefined) {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: err.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
        } else if (err.response.data !== undefined) {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to upload to group: ' + err.response.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
        } else {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to upload to group: ' + err.message,
              msgType: 'danger'
            },
            { root: true }
          );
        }
      }
    );
  }
};

// mutations
const mutations = {
  SET_IS_UPLOADING(state, details) {
    this.isUploading = details;
  },
  SET_ADDRESS_COUNT(state, details) {
    Vue.set(state.addressCounts, details.group_id, details);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
