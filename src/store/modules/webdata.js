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
  isLoadingDeps: false,
  domainDependencies: [],
  webDataStats: []
};

// getters
const getters = {
  domainDependenciesByID: state => group_id => {
    return findDependencyByID(state.domainDependencies, group_id);
  },
  isLoadingDependencies: state => state.isLoadingDeps,
  isLoadingWebDataStats: state => state.isLoadingStats,
  webStats: state => state.webDataStats,
  isUpdating: state => state.isUpdating,
  certsFifteenByID: state => group_id =>
    findStatByID(state.webDataStats, group_id, 'expiring_certs_15'),
  certsThirtyByID: state => group_id =>
    findStatByID(state.webDataStats, group_id, 'expiring_certs_30'),
  totalCertsFifteen: state =>
    sumFields(state.webDataStats, 'expiring_certs_15'),
  totalCertsThirty: state => sumFields(state.webDataStats, 'expiring_certs_30'),
  totalUniqueWebServers: state =>
    sumFields(state.webDataStats, 'unique_web_servers'),
  uniqueWebServersByID: state => group_id =>
    findStatByID(state.webDataStats, group_id, 'unique_web_servers'),
  webServerTypesByID: state => group_id => {
    return findStatByID(state.webDataStats, group_id, 'server_types');
  },
  webServerTypeCountsByID: state => group_id => {
    return findStatByID(state.webDataStats, group_id, 'server_counts');
  },
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

function findDependencyByID(dep, group_id) {
  for (let i = 0; i < dep.length; i++) {
    if (dep[i].group_id == group_id) {
      return dep[i];
    }
  }
  return [];
}

function findStatByID(stats, group_id, key) {
  for (let i = 0; i < stats.length; i++) {
    if (stats[i].group_id == group_id) {
      return stats[i][key];
    }
  }
  return [];
}

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
  LOAD_DOMAIN_DEPENDENCIES({ dispatch, commit }, group_id) {
    commit('SET_LOADING_DEPS', true);
    API.get('/webdata/group/' + group_id + '/domains').then(
      resp => {
        commit('SET_LOADING_DEPS', false);
        if (resp.data.status === 'OK') {
          commit('SET_DOMAIN_DEPS', resp.data);
        }
      },
      err => {
        commit('SET_LOADING_DEPS', false);
        handleError(commit, dispatch, err);
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
  if (err.response !== undefined && err.response.data !== undefined) {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: 'Request failed: ' + err.response.data.msg,
        msgType: 'danger'
      },
      { root: true }
    );
  } else if (err.data !== undefined) {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: err.data.msg,
        msgType: 'danger'
      },
      { root: true }
    );
  } else {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: 'Request failed: ' + err.message,
        msgType: 'danger'
      },
      { root: true }
    );
  }
}

// mutations
const mutations = {
  SET_LOADING_DEPS(state, details) {
    state.isLoadingDeps = details;
  },
  SET_DOMAIN_DEPS(state, details) {
    state.domainDependencies.push(details);
  },
  SET_LOADING_STATS(state, details) {
    state.isLoadingStats = details;
  },
  SET_STATS(state, details) {
    for (let i = 0; i < details.length; i++) {
      Vue.set(state.webDataStats, i, details[i]);
    }
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
