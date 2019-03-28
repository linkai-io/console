import API from '../../api/api';
import Vue from 'vue';

// initial state
const state = {
  userSettings: {
    subscriptions: [],
    should_email_weekly: false,
    should_email_daily: false
  },
  events: [],
  markedReadEvents: [],
  isLoading: false,
  userSubscriptions: [
    {
      type_id: 1,
      disabled: true,
      description: 'The scan group analysis has been completed',
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 2,
      disabled: true,
      description:
        'The maximum number of hostnames has been reached for this pricing plan',
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 10,
      description: 'A new hostname has been detected (recommended)',
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 11,
      disabled: true,
      description: 'A new DNS record has been detected (not recommended)',
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 100,
      description: 'A new web site has been detected',
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 101,
      disabled: true,
      description: "A web site's HTML has been updated",
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 102,
      disabled: true,
      description: "A web site's technology has been changed",
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 103,
      disabled: true,
      description: "A web site's javascript has been changed (recommended)",
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 150,
      description: "A web site's certificate will expire soon (recommended)",
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 151,
      disabled: true,
      description: "A web site's certificate has expired (recommended)",
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 200,
      description: 'A DNS server is allowing DNS zone transfers (recommended)',
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 201,
      disabled: true,
      description: 'A DNS server is configured with NSEC records (recommended)',
      subscribed_since: 0,
      subscribed: false
    }
  ],
  isUpdating: false
};

// getters
const getters = {
  events: state => state.events,
  getSettings: state => state.userSettings,
  userSubscriptions: state => state.userSubscriptions,
  getMarkedRead: state => state.markedReadEvents,
  eventByTypeID: state => id =>
    state.eventSubscriptions.find(evt => evt.type_id === id),
  shouldEmailDaily: state => state.userSettings.should_email_daily,
  shouldEmailWeekly: state => state.userSettings.should_email_weekly,
  isLoading: state => state.isLoading,
  isUpdating: state => state.isUpdating
};

// actions
const actions = {
  GET_EVENTS({ dispatch, commit }) {
    API.get('/event/events?limit=10').then(
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
  EDIT_SUBSCRIPTION({ commit }, details) {
    commit('SET_SUBSCRIPTIONS', details);
  },
  ADD_READ({ commit }, details) {
    commit('SET_MARKED_READ', details);
  },
  MARK_READ({ dispatch, commit }, details) {
    commit('SET_IS_UPDATING', true);
    let eventIDs = state.markedReadEvents;
    if (details === 'all') {
      eventIDs = state.events.map(evt => evt.notification_id);
    }
    API.patch('/event/events', { notification_ids: eventIDs }).then(
      resp => {
        commit('SET_IS_UPDATING', false);

        if (resp.data.status == 'OK') {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Successfully read messages',
              msgType: 'success'
            },
            { root: true }
          );
          dispatch('GET_EVENTS');
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
              msg: 'Failed to mark messages as read: ' + err.response.data.msg,
              msgType: 'danger'
            },
            { root: true }
          );
          return;
        } else {
          dispatch(
            'notify/CREATE_NOTIFY_MSG',
            {
              msg: 'Failed to mark messages as read: ' + err.message,
              msgType: 'danger'
            },
            { root: true }
          );
        }
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
    let settings = details;
    settings.subscriptions = [];
    for (let i = 0; i < state.userSubscriptions.length; i++) {
      let sub = state.userSubscriptions[i];
      settings.subscriptions.push({
        type_id: sub.type_id,
        subscribed: sub.subscribed,
        subscribed_since: sub.subscribed_since
      });
    }
    API.patch('/event/settings', settings).then(
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
  SET_MARKED_READ(state, notification) {
    console.log(notification);
    if (notification.value === false) {
      state.markedReadEvents = state.markedReadEvents.filter(
        ele => ele !== notification.id
      );
      return;
    }

    if (
      state.markedReadEvents.length === 0 ||
      state.markedReadEvents.indexOf(notification.id) === -1
    ) {
      state.markedReadEvents.push(notification.id);
    }
  },
  SET_IS_UPDATING(state, value) {
    state.isUpdating = value;
  },
  SET_IS_LOADING(state, value) {
    state.isLoading = value;
  },
  SET_SUBSCRIPTIONS(state, details) {
    for (let i = 0; i < state.userSubscriptions.length; i++) {
      if (state.userSubscriptions[i].type_id == details.type_id) {
        state.userSubscriptions[i].subscribed = details.value;
      }
    }
  },
  SET_SETTINGS(state, settings) {
    state.userSettings = settings;
    for (let i = 0; i < state.userSubscriptions.length; i++) {
      for (let j = 0; j < settings.subscriptions.length; j++) {
        if (
          settings.subscriptions[j].type_id ==
            state.userSubscriptions[i].type_id &&
          settings.subscriptions[j].subscribed === true
        ) {
          state.userSubscriptions[i].subscribed;
          state.userSubscriptions[i].subscribed = true;
          state.userSubscriptions[i].subscribed_since =
            settings.subscriptions[j].subscribed_since;
          // force vue to update the subscription value by force setting it back to itself UGH
          Vue.set(
            state.userSubscriptions,
            i,
            (state.userSubscriptions[i] = state.userSubscriptions[i])
          ); //force update
        }
      }
    }
  },
  SET_EVENTS(state, value) {
    state.markedReadEvents = [];
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
