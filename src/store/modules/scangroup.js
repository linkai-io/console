//import router from '../../routes/router';
import API from '../../api/api';
// initial state
const state = {
  scangroups: [],
  currentGroup: {},
  isCreating: false,
  creationMsg: '',
  updateID: -1,
  updateGroups: [] // {id: ..., updating: true|false, msg: '', msgType: 'success'|'danger'}
};

// getters
const getters = {
  scanGroups() {
    return state.scanGroups;
  },
  isUpdating: state => group_id => {
    for (let i = 0; i < state.updateGroups.length; i++) {
      if (state.updateGroups[i].group_id == group_id) {
        return state.updateGroups[i].updating;
      }
    }
    return false;
  }
};

// actions
const actions = {
  CLEAR_CREATION_MSG({ commit }) {
    commit('SET_CREATION_MSG', '');
  },
  INIT_GROUP_STATE({ commit }, group_id) {
    console.log('initing group state for ' + group_id);
    commit('SET_GROUP_STATE', group_id);
  },
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
    API.get('/scangroup/name/' + name).then(
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
    API.post('/scangroup/name/' + group.group_name, group).then(
      resp => {
        commit('SET_IS_CREATING', false);
        if (resp.data.status == 'OK') {
          commit('SET_CREATION_MSG', 'success');
        }
      },
      err => {
        commit('SET_IS_CREATING', false);
        console.log(err);
        if (err.response.data !== undefined) {
          commit(
            'SET_CREATION_MSG',
            'Failed to create group: ' + err.response.data.msg
          );
          return;
        }
        commit('SET_CREATION_MSG', 'Failed to create group: ' + err.message);
      }
    );
  },
  UPDATE_GROUP({ dispatch, commit }, details) {
    console.log(details);
    commit('SET_IS_UPDATING', { group_id: details.group_id, value: true });
    API.patch('/scangroup/name/' + details.original_name, details.updates).then(
      resp => {
        if (resp.data.status == 'OK') {
          commit('SET_UPDATING_MSG', {
            group_id: details.group_id,
            msg: 'Successfully updated group',
            msgType: 'success'
          });
          dispatch('GET_GROUPS');
        }
      },
      err => {
        commit('SET_IS_UPDATING', { group_id: details.group_id, value: false });
        if (err.data !== undefined) {
          commit('SET_UPDATING_MSG', {
            group_id: details.group_id,
            msg: err.data.msg,
            msgType: 'danger'
          });
          return;
        }
        console.log(err);
        for (let x in err) {
          console.log(x + ' ' + err[x]);
        }

        if (err.response.data !== undefined) {
          commit('SET_UPDATING_MSG', {
            group_id: details.group_id,
            msg: 'Failed to update group: ' + err.response.data.msg,
            msgType: 'danger'
          });
          return;
        }
        commit('SET_UPDATING_MSG', {
          group_id: details.group_id,
          msg: 'Failed to update group: ' + err.message,
          msgType: 'danger'
        });
      }
    );
  },
  UPDATE_GROUP_STATUS({ dispatch, commit }, details) {
    console.log(details);
    commit('SET_IS_UPDATING', { group_id: details.group_id, value: true });
    API.patch(
      '/scangroup/name/' + details.group_name + '/status',
      details
    ).then(
      resp => {
        commit('SET_IS_UPDATING', { group_id: details.group_id, value: false });
        if (resp.data.status == 'OK') {
          commit('SET_UPDATING_MSG', {
            group_id: details.group_id,
            msg: 'Successfully ' + details.status + 'd' + ' group',
            msgType: 'success'
          });
          dispatch('GET_GROUPS');
        }
      },
      err => {
        commit('SET_IS_UPDATING', { group_id: details.group_id, value: false });
        if (err.data !== undefined) {
          commit('SET_UPDATING_MSG', {
            group_id: details.group_id,
            msg: err.data.msg,
            msgType: 'danger'
          });
          return;
        }
        console.log(err);
        commit('SET_UPDATING_MSG', {
          group_id: details.group_id,
          msg: 'Failed to update group: ' + err.message,
          msgType: 'danger'
        });
      }
    );
  },
  DELETE_GROUP({ dispatch, commit }, details) {
    API.delete('/scangroup/name/' + details.group_name).then(
      resp => {
        commit('SET_IS_UPDATING', details.group_id, false);
        if (resp.data.status == 'OK') {
          commit('SET_UPDATING_MSG', {
            group_id: details.group_id,
            msg: 'Successfully deleted group',
            msgType: 'success'
          });
          dispatch('GET_GROUPS');
        }
      },
      err => {
        commit('SET_IS_UPDATING', { group_id: details.group_id, value: false });
        if (err.data !== undefined) {
          commit('SET_UPDATING_MSG', {
            group_id: details.group_id,
            msg: err.data.msg,
            msgType: 'danger'
          });
          return;
        }
        console.log(err);
        commit('SET_UPDATING_MSG', {
          group_id: details.group_id,
          msg: 'Failed to delete group: ' + err.message,
          msgType: 'danger'
        });
      }
    );
  }
};

// mutations
const mutations = {
  SET_INITIALIZED(state) {},
  SET_CREATION_MSG(state, details) {
    state.creationMsg = details;
  },
  SET_IS_CREATING(state, details) {
    state.isCreating = details;
  },
  SET_GROUP_STATE(state, group_id) {
    let initState = {
      group_id: group_id,
      updating: false,
      msg: '',
      msgType: ''
    };

    // clear update id
    state.updateID = -1;

    for (let i = 0; i < state.updateGroups.length; i++) {
      if (state.updateGroups[i].group_id == group_id) {
        state.updateGroups[i] = initState;
        return;
      }
    }

    state.updateGroups.push(initState);
  },
  SET_IS_UPDATING(state, { group_id, value }) {
    for (let i = 0; i < state.updateGroups.length; i++) {
      if (state.updateGroups[i].group_id == group_id) {
        state.updateGroups[i].updating = value;
        return;
      }
    }
  },
  SET_UPDATING_MSG(state, details) {
    console.log(
      'updating...' +
        details.group_id +
        ' ' +
        details.msg +
        ' ' +
        details.msgType
    );
    for (let i = 0; i < state.updateGroups.length; i++) {
      console.log(
        'updating ' + details.group_id + ' ' + state.updateGroups[i].group_id
      );
      if (state.updateGroups[i].group_id == details.group_id) {
        state.updateGroups[i] = {
          group_id: details.group_id,
          updating: false,
          msg: details.msg,
          msgType: details.msgType
        };
        state.updateID = details.group_id;
        return;
      }
    }
  },
  CLEAR_UPDATING_MSG(state, details) {
    for (let i = 0; i < state.updateGroups.length; i++) {
      if (state.updateGroups[i].group_id == details.group_id) {
        state.updateGroups[i] = {
          group_id: details.group_id,
          updating: false,
          msg: '',
          msgType: ''
        };
        return;
      }
    }
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
