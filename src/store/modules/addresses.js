// import router from '../../routes/router';
import API from '../../api/api';

// initial state
const state = {
  addressCounts: [],
  isUploading: false,
  uploadMsg: '',
  uploadMsgType: ''
};

// getters
const getters = {
  addressCounts() {
    return state.addressCounts;
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
          commit('SET_UPLOADING_MSG', {
            group_id: details.group_id,
            msg: 'Successfully uploaded addresses to group',
            msgType: 'success'
          });
          dispatch('GET_ADDRESS_COUNT', details.group_id);
        }
      },
      err => {
        commit('SET_IS_UPLOADING', false);
        if (err.data !== undefined) {
          commit('SET_UPLOADING_MSG', {
            group_id: details.group_id,
            msg: err.data.msg,
            msgType: 'danger'
          });
          return;
        }
        if (err.response.data !== undefined) {
          commit('SET_UPLOADING_MSG', {
            group_id: details.group_id,
            msg: 'Failed to upload to group: ' + err.response.data.msg,
            msgType: 'danger'
          });
          return;
        }
        commit('SET_UPLOADING_MSG', {
          group_id: details.group_id,
          msg: 'Failed to upload to group: ' + err.message,
          msgType: 'danger'
        });
      }
    );
  }
};

// mutations
const mutations = {
  SET_IS_UPLOADING(state, details) {
    this.isUploading = details;
  },
  SET_UPLOADING_MSG(state, details) {
    state.uploadMsg = details.msg;
    state.uploadMsgType = details.msgType;
  },
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
