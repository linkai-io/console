import router from '../../routes/router';
import API from '../../api/api';

// initial state
const state = {
  accepted: false,
  isUpdating: false,
  portScanEnabled: false,
  hostLimitReached: false,
  user: {}
};

// getters
const getters = {
  hasAccepted: state => state.accepted,
  updating: state => state.isUpdating,
  canPortScan: state => state.portScanEnabled,
  maxHostsReached: state => state.hostLimitReached
};

// actions
const actions = {
  GET_USER({ dispatch, commit }) {
    API.get('/user/details').then(
      resp => {
        commit('SET_USER', resp.data);
      },
      err => {
        handleError(commit, dispatch, 'failure getting user ', err);
      }
    );
  },
  UPDATE_AGREEMENT({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    API.patch('/user/accept', {
      accept: details.accept
    }).then(
      resp => {
        commit('SET_IS_UPDATING', false);
        if (resp.data.status == 'OK') {
          commit('SET_ACCEPTED');
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Agreement Accepted, Thank you for Beta Testing Hakken',
              msgType: 'success'
            },
            { root: true }
          );
          router.push('dashboard');
        }
      },
      err => {
        handleError(
          commit,
          dispatch,
          'failure in beta testing acceptance ',
          err
        );
      }
    );
  }
};

function handleError(commit, dispatch, message, err) {
  commit('SET_IS_UPDATING', false);
  if (err.response !== undefined && err.response.data !== undefined) {
    let msg = err.response.data.msg;
    if (msg === undefined || msg === '') {
      msg = err.response.statusText;
    }
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: message + msg,
        msgType: 'danger'
      },
      { root: true }
    );
  } else if (err.data !== undefined) {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: message + err.data.msg,
        msgType: 'danger'
      },
      { root: true }
    );
  } else {
    dispatch(
      'notify/CREATE_NOTIFY_MSG',
      {
        msg: message + err.message,
        msgType: 'danger'
      },
      { root: true }
    );
  }
}

// mutations
const mutations = {
  SET_IS_UPDATING(state, details) {
    state.isUpdating = details;
  },
  SET_USER(state, details) {
    state.user = details;
    state.accepted = details.agreement_accepted;
    state.portScanEnabled = details.port_scan_enabled;
    state.hostLimitReached = details.limit_hosts_reached;
    if (state.accepted === false) {
      router.push('/agreement');
    }
  },
  SET_ACCEPTED(state) {
    state.accepted = true;
  },
  SET_INITIALIZED(state) {}
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
