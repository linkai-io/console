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
  EXPORT_RESPONSES({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.post(
      '/webdata/group/' + details.group_id + '/responses/download',
      details,
      {
        responseType: 'blob'
      }
    ).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data !== undefined) {
          console.log('downloading file');
          fileDownloader(
            resp.data,
            'responses.' + details.group_id + '.json',
            'application/octet-stream'
          );
        }
      },
      err => {
        handleError(commit, dispatch, err);
      }
    );
  },

  EXPORT_WEBSITES({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.post(
      '/webdata/group/' + details.group_id + '/snapshots/download',
      details,
      {
        responseType: 'blob'
      }
    ).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data !== undefined) {
          console.log('downloading file');
          fileDownloader(
            resp.data,
            'websites.' + details.group_id + '.json',
            'application/octet-stream'
          );
        }
      },
      err => {
        handleError(commit, dispatch, err);
      }
    );
  },
  EXPORT_CERTIFICATES({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.post(
      '/webdata/group/' + details.group_id + '/certificates/download',
      details,
      {
        responseType: 'blob'
      }
    ).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data !== undefined) {
          console.log('downloading file');
          fileDownloader(
            resp.data,
            'certificates.' + details.group_id + '.json',
            'application/octet-stream'
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
