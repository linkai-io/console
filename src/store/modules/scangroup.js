//import router from '../../routes/router';
import Vue from 'vue';
import API from '../../api/api';

// initial state
const state = {
  scangroups: {},
  groupStats: {},
  groupCreated: false,
  isCreating: false,
  isUpdating: false,
  isLoading: false,
  isLoadingStats: false
};

// getters
const getters = {
  groups: state => state.scangroups,
  groupStats: state => state.groupStats,
  getGroupByID: state => id => {
    return state.scangroups[id] === undefined ? {} : state.scangroups[id];
  },
  isUpdating: state => state.isUpdating,
  isLoading: state => state.isLoading,
  isLoadingStats: state => state.isLoadingStats
};

// actions
const actions = {
  UNSET_CREATED({ commit }) {
    commit('CLEAR_CREATED');
  },
  GET_GROUPS({ dispatch, commit }) {
    commit('SET_IS_LOADING', true);
    API.get('/scangroup/groups').then(
      resp => {
        commit('SET_IS_LOADING', false);
        commit('SET_GROUPS', resp.data);
      },
      err => {
        commit('SET_IS_LOADING', false);
        dispatch(
          'notify/CREATE_NOTIFY_MSG',
          {
            msg: 'Failed to get group data: ' + err.message,
            msgType: 'danger'
          },
          { root: true }
        );
      }
    );
  },
  GET_GROUP_STATS({ dispatch, commit }) {
    commit('SET_IS_LOADING', true);
    API.get('/scangroup/groups/stats').then(
      resp => {
        commit('SET_IS_LOADING_STATS', false);
        commit('SET_GROUPS_STATS', resp.data.group_stats);
      },
      err => {
        commit('SET_IS_LOADING_STATS', false);
        dispatch(
          'notify/CREATE_NOTIFY_MSG',
          {
            msg: 'Failed to get group activity: ' + err.message,
            msgType: 'danger'
          },
          { root: true }
        );
      }
    );
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
  CREATE_GROUP({ dispatch, commit }, group) {
    commit('SET_IS_CREATING', true);
    API.post('/scangroup/name/' + group.group_name, group).then(
      resp => {
        commit('SET_IS_CREATING', false);
        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Group created successfully',
              msgType: 'success'
            },
            { root: true }
          );
          commit('SET_CREATED');
          dispatch('GET_GROUPS');
        }
      },
      err => {
        commit('SET_IS_CREATING', false);
        if (err.response.data !== undefined) {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to create group: ' + err.response.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
        } else {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to create group: ' + err.message,
              msgType: 'danger'
            },
            { root: true }
          );
        }
      }
    );
  },
  UPDATE_GROUP({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);

    API.patch('/scangroup/name/' + details.original_name, details.updates).then(
      resp => {
        commit('SET_IS_UPDATING', false);

        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Successfully updated group',
              msgType: 'success'
            },
            { root: true }
          );
          dispatch('GET_GROUPS');
        }
      },
      err => {
        commit('SET_IS_UPDATING', false);

        if (err.data !== undefined) {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: err.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
          return;
        }

        if (err.response !== undefined && err.response.data !== undefined) {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to update group: ' + err.response.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
          return;
        } else {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to update group: ' + err.message,
              msgType: 'danger'
            },
            { root: true }
          );
        }
      }
    );
  },
  UPDATE_GROUP_STATUS({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.patch(
      '/scangroup/name/' + details.group_name + '/status',
      details
    ).then(
      resp => {
        commit('SET_IS_UPDATING', false);

        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Successfully ' + details.status + 'd' + ' group',
              msgType: 'success'
            },
            { root: true }
          );
          dispatch('GET_GROUPS');
        }
      },
      err => {
        commit('SET_IS_UPDATING', false);

        if (err.data !== undefined) {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: err.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
          return;
        } else {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to update group: ' + err.message,
              msgType: 'danger'
            },
            { root: true }
          );
        }
      }
    );
  },
  DELETE_GROUP({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);

    API.delete('/scangroup/name/' + details.group_name).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Successfully deleted group',
              msgType: 'success'
            },
            { root: true }
          );
          dispatch('GET_GROUPS');
        }
      },
      err => {
        commit('SET_IS_UPDATING', false);

        if (err.data !== undefined) {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: err.data.msg,
              msgType: 'success'
            },
            { root: true }
          );
        } else {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to delete group: ' + err.message,
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
  CLEAR_CREATED(state) {
    state.groupCreated = false;
  },
  SET_CREATED(state) {
    state.groupCreated = true;
  },
  SET_IS_CREATING(state, details) {
    state.isCreating = details;
  },
  SET_IS_UPDATING(state, value) {
    state.isUpdating = value;
  },
  SET_IS_LOADING(state, value) {
    state.isLoading = value;
  },
  SET_IS_LOADING_STATS(state, value) {
    state.isLoadingStats = value;
  },
  SET_GROUPS(state, details) {
    state.scangroups = {};
    for (let i = 0; i < details.length; i++) {
      Vue.set(state.scangroups, details[i].group_id, details[i]);
    }
  },
  SET_GROUPS_STATS(state, details) {
    state.groupStats = {};
    for (let id in details) {
      if (details.hasOwnProperty(id)) {
        Vue.set(state.groupStats, id, details[id]);
      }
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
