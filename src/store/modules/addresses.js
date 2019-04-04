// import router from '../../routes/router';
import Vue from 'vue';
import { unixNanoToMinMonthDay } from '../../data/time.js';
import API from '../../api/api';
import { fileDownloader } from '../../data/downloader.js';

// initial state
const state = {
  addressCounts: {},
  isUploading: false,
  isUpdating: false,
  isLoadingStats: false,
  addressStats: []
};

// getters
const getters = {
  isLoadingAddressStats: state => state.isLoadingStats,
  addrStats: state => state.addressStats,
  totalConfident: state =>
    state.addressStats.reduce((acc, group) => acc + group.confident_total, 0),
  totalAssetsDay() {
    let all = mergeAggregates(state.addressStats, 'discovery_trihourly');
    if (all.length === 0 || all[1] === undefined || all[1] === 0) {
      return 0;
    }
    let len = all[1].length;
    let sum = 0;
    let assetsPerDay = 8; // 3h * 8 = 24
    all[1].splice(0, assetsPerDay).forEach(v => (sum += v));
    return sum;
  },
  totalTrihourlyDiscovered() {
    return mergeAggregates(state.addressStats, 'discovery_trihourly');
  },
  totalTrihourlySeen() {
    return mergeAggregates(state.addressStats, 'seen_trihourly');
  },
  totalTrihourlyScanned() {
    return mergeAggregates(state.addressStats, 'scanned_trihourly');
  },
  isUpdating: state => state.isUpdating,
  addrCounts() {
    return state.addressCounts;
  },
  getCountByID: state => id => {
    return state.addressCounts[id] === undefined
      ? 0
      : state.addressCounts[id].count;
  },
  discoveredBy() {
    let sum = {};
    state.addressStats
      .map(group => group.discovered_by)
      .forEach(v => {
        if (v === null || v === undefined) {
          return;
        }
        Object.keys(v).forEach(o => {
          if (o === null || o === undefined) {
            return;
          }
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
  return stats.reduce((acc, group) => (acc += group[key]));
}

function mergeAggregates(stats, key) {
  if (stats.length === 0) {
    return [0, 0];
  }
  let times = [];
  let counts = [];
  for (let i = 0; i < stats.length; i++) {
    if (
      stats[i].aggregates === null ||
      stats[i].aggregates[key] === undefined ||
      stats[i].aggregates[key] === null
    ) {
      continue;
    }
    times = times.concat(
      stats[i].aggregates[key].time.map(val => {
        return unixNanoToMinMonthDay(val);
      })
    );
    counts = counts.concat(stats[i].aggregates[key].count);
  }
  return [times.reverse(), counts.reverse()];
}

// actions
const actions = {
  LOAD_ADDRESS_STATS({ commit }) {
    commit('SET_LOADING_STATS', true);
    API.get('/address/stats').then(
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
  GET_ADDRESS_COUNT({ commit }, group_id) {
    API.get('/address/group/' + group_id + '/count').then(
      resp => {
        if (resp.data.status === 'OK') {
          commit('SET_ADDRESS_COUNT', resp.data);
        }
      },
      err => {
        console.log(err);
      }
    );
  },
  EXPORT_HOSTS({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.get('/address/group/' + details.group_id + '/hosts/download', {
      responseType: 'blob'
    }).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data !== undefined) {
          fileDownloader(
            resp.data,
            'hosts.' + details.group_id + '.json',
            'application/octet-stream'
          );
        }
      },
      err => {
        handleError(commit, dispatch, 'export hosts', err);
      }
    );
  },
  EXPORT_ADDRESSES({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.post('/address/group/' + details.group_id + '/download', details, {
      responseType: 'blob'
    }).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data !== undefined) {
          fileDownloader(
            resp.data,
            'addresses.' + details.group_id + '.json',
            'application/octet-stream'
          );
        }
      },
      err => {
        handleError(commit, dispatch, 'export addresses', err);
      }
    );
  },
  DELETE_ADDRESSES({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.patch('/address/group/' + details.group_id + '/delete', {
      address_ids: details.address_ids
    }).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Successfully deleted addresses',
              msgType: 'success'
            },
            { root: true }
          );
        }
      },
      err => {
        handleError(commit, dispatch, 'delete addresses', err);
      }
    );
  },
  IGNORE_ADDRESSES({ dispatch, commit }, details) {
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
        handleError(commit, dispatch, 'ignore addresses', err);
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
        if (
          err.response.data !== undefined &&
          err.response.data.errors !== undefined
        ) {
          commit('SET_IS_UPLOADING', false);

          let errorText = '';

          for (let i = 0; i < err.response.data.errors.length; i++) {
            let parserError = err.response.data.errors[i];
            errorText +=
              'line number: ' +
              parserError.line_number +
              ' line:' +
              parserError.line +
              ' error: ' +
              parserError.error +
              '\n';
          }
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to upload to group: ' + errorText,
              msgType: 'danger',
              msgTimeout: 8000
            },
            { root: true }
          );
          return;
        }

        handleError(commit, dispatch, 'upload to group', err);
      }
    );
  }
};

function handleError(commit, dispatch, action, err) {
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
        msg: 'Failed to ' + action + ': ' + err.response.data.msg,
        msgType: 'danger',
        msgTimeout: 8000
      },
      { root: true }
    );
  } else {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: 'Failed to ' + action + ': ' + err.message,
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
    state.addressStats = details;
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
