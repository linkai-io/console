import API from '../../api/api';
import Vue from 'vue';

// initial state
const state = {
  cid: '',
  status: '',
  email: '',
  subscription_plan: '',
  payment_required_timestamp: 0,
  billing_plan_type: '',
  billing_plan_id: '',
  is_beta_plan: true,
  plans: [],
  billing_subscription_id: '',
  isUpdating: false
};

// getters
const getters = {
  orgCID: state => state.cid,
  status: state => state.status,
  email: state => state.email,
  subscriptionPlan: state => state.subscription_plan,
  paymentRequiredTime: state => state.payment_required_timestamp,
  billingType: state => state.billing_plan_type,
  billingPlan: state => state.billing_plan_id,
  isBetaPlan: state => state.is_beta_plan,
  plans: state => state.plans,
  subscriptionID: state => state.billing_subscription_id,
  isUpdating: state => state.isUpdating
};

// actions
const actions = {
  GET_BILLING({ dispatch, commit }) {
    API.get('/org/billing').then(
      resp => {
        commit('SET_BILLING', resp.data);
      },
      err => {
        handleError(
          commit,
          dispatch,
          'failure getting organization billing details ',
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
  SET_BILLING(state, details) {
    state.cid = details.org_cid;
    state.status = details.org_status;
    state.email = details.owner_email;
    state.subscription_plan = details.subscription_plan;
    state.payment_required_timestamp = details.payment_required_timestamp;
    state.billing_plan_type = details.billing_plan_type;
    state.billing_plan_id = details.billing_plan_id;
    state.is_beta_plan = details.is_beta_plan;
    //state.plans = details.plans;
    Vue.set(state, 'plans', details.plans);
    state.billing_subscription_id = details.billing_subscription_id;
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
