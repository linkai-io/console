// import router from '../../routes/router';
import Vue from 'vue';
import API from '../../api/api';
import { fileDownloader } from '../../data/downloader.js';

// initial state
const state = {
  isUpdating: false,
  responses: {},
  snapshots: {},
  certificates: {}
};

// getters
const getters = {
  isUpdating: state => state.isUpdating
};

// actions
const actions = {
  EXPORT_ADDRESSES({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.post('/address/group/' + details.group_id + '/download', details, {
      responseType: 'blob'
    }).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data !== undefined) {
          console.log('downloading file');
          fileDownloader(
            resp.data,
            'addresses.' + details.group_id + '.json',
            'application/octet-stream'
          );
        }
      },
      err => {
        handleError(commit, dispatch, err);
      }
    );
  },

  GET_RESPONSES({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.patch('/address/group/' + details.group_id + '/ignore', {
      address_ids: details.address_ids,
      ignore_value: details.ignore_value
    }).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Successfully ignored addresses',
              msgType: 'success'
            },
            { root: true }
          );
        }
      },
      err => {
        handleError(commit, dispatch, err);
      }
    );
  }
};

function handleError(commit, dispatch, err) {
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
  } else if (err.response !== undefined && err.response.data !== undefined) {
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

// mutations
const mutations = {
  SET_IS_UPLOADING(state, details) {
    state.isUploading = details;
  },
  SET_IS_UPDATING(state, details) {
    state.isUpdating = details;
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
