import Vue from 'vue';
import { unixNanoToMinMonthDay } from '../../data/time.js';
import API from '../../api/api';

// initial state
const state = {
  userSettings: {
    subscriptions: [],
    should_email_weekly: false,
    should_email_daily: false
  },
  events: [],
  userSubscriptions: [],
  isLoading: false,
  eventSubscriptions: [
    {
      type_id: 1,
      description: 'The scan group analysis has been completed'
    },
    {
      type_id: 2,
      description:
        'The maximum number of hostnames have been reached for this pricing plan'
    },
    {
      type_id: 10,
      description: 'A new hostname has been detected (recommended)'
    },
    {
      type_id: 11,
      description: 'A new DNS record has been detected (not recommended)'
    },
    {
      type_id: 100,
      description: 'A new website has been detected'
    },
    {
      type_id: 101,
      description: "A website's HTML has been updated "
    },
    {
      type_id: 102,
      description: "A website's technology has been changed"
    },
    {
      type_id: 103,
      description: "A website's javascript has been changed (recommended)"
    },
    {
      type_id: 150,
      description: "A website's certificate will expire soon (recommended)"
    },
    {
      type_id: 151,
      description: "A website's certificate has expired (recommended)"
    },
    {
      type_id: 200,
      description: 'A DNS server is allowing DNS zone transfers (recommended)'
    },
    {
      type_id: 201,
      description: 'A DNS server is configured with NSEC records (recommended)'
    }
  ],
  isUpdating: false
};

// getters
const getters = {
  events: state => state.events,
  getSettings: state => state.userSettings,
  eventSubscriptionTypes: state => state.eventSubscriptions,
  getSubscriptions: state => state.userSettings.subscriptions,
  shouldEmailDaily: state => state.userSettings.should_email_daily,
  shouldEmailWeekly: state => state.userSettings.should_email_weekly,
  isLoading: state => state.isLoading,
  isUpdating: state => state.isUpdating
};

// actions
const actions = {
  GET_EVENTS({ dispatch, commit }) {
    API.get('/event/events').then(
      resp => {
        commit('SET_EVENTS', resp.data);
      },
      err => {
        commit('SET_IS_LOADING', false);
        dispatch(
          'notify/CREATE_NOTIFY_MSG',
          {
            msg: 'Failed to get user events: ' + err.message,
            msgType: 'danger'
          },
          { root: true }
        );
      }
    );
  },
  GET_SETTINGS({ dispatch, commit }) {
    commit('SET_IS_LOADING', true);
    API.get('/event/settings').then(
      resp => {
        commit('SET_IS_LOADING', false);
        commit('SET_SETTINGS', resp.data);
      },
      err => {
        commit('SET_IS_LOADING', false);
        dispatch(
          'notify/CREATE_NOTIFY_MSG',
          {
            msg: 'Failed to get user event settings: ' + err.message,
            msgType: 'danger'
          },
          { root: true }
        );
      }
    );
  },
  UPDATE_SETTINGS({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);

    API.patch('/event/settings', details).then(
      resp => {
        commit('SET_IS_UPDATING', false);

        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Successfully updated settings',
              msgType: 'success'
            },
            { root: true }
          );
          dispatch('GET_SETTINGS');
        }
      },
      err => {
        commit('SET_IS_UPDATING', false);

        if (err.response !== undefined && err.response.data !== undefined) {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: err.response.data.msg,
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
              msg: 'Failed to update settings: ' + err.response.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
          return;
        } else {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to update settings: ' + err.message,
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
  SET_IS_UPDATING(state, value) {
    state.isUpdating = value;
  },
  SET_IS_LOADING(state, value) {
    state.isLoading = value;
  },
  SET_SETTINGS(state, value) {
    state.userSettings = value;
  },
  SET_EVENTS(state, value) {
    state.events = value;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
