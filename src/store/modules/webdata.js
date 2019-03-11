// import router from '../../routes/router';
import Vue from 'vue';
import API from '../../api/api';
import { fileDownloader } from '../../data/downloader.js';

// initial state
const state = {
  isUpdating: false,
  responses: {},
  snapshots: {},
  certificates: {},
  isLoadingStats: false,
  webDataStats: []
};

// getters
const getters = {
  isLoadingWebDataStats: state => state.isLoadingStats,
  webStats: state => state.webDataStats,
  isUpdating: state => state.isUpdating,
  totalCertsFifteen: state =>
    sumFields(state.webDataStats, 'expiring_certs_15'),
  totalCertsThirty: state => sumFields(state.webDataStats, 'expiring_certs_30'),
  totalUniqueWebServers: state =>
    sumFields(state.webDataStats, 'unique_web_servers'),
  totalWebServerTypes() {
    let sum = {};
    state.webDataStats
      .map(group => group.server_types)
      .forEach(v => {
        Object.keys(v).forEach(o => {
          if (sum[o] === undefined) {
            sum[o] = 0;
          }
          sum[o] += v[o];
        });
      });
    return [Object.keys(sum), Object.values(sum)];
  }
};

function sumFields(stats, key) {
  if (stats.length === 0) {
    return 0;
  }
  let sum = 0;
  stats.forEach(group => (sum += group[key]));
  return sum;
}
// actions
const actions = {
  LOAD_WEB_STATS({ commit }) {
    commit('SET_LOADING_STATS', true);
    API.get('/webdata/stats').then(
      resp => {
        commit('SET_LOADING_STATS', false);
        if (resp.data.status === 'OK') {
          commit('SET_STATS', resp.data.stats);
        }
      },
      err => {
        console.log(err);
        commit('SET_LOADING_STATS', false);
      }
    );
  },
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
  SET_LOADING_STATS(state, details) {
    state.isLoadingStats = details;
  },
  SET_STATS(state, details) {
    state.webDataStats = details;
  },
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
