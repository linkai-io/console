import API from '../../api/api';
import Vue from 'vue';
import { handleErrors } from '../../data/errors.js';

// initial state
const state = {
  subscriptions: [],
  user_timezone: '',
  should_weekly_email: false,
  should_daily_email: false,
  events: {},
  markedReadEvents: [],
  isLoading: false,
  isLoadingSettings: false,
  userSubscriptions: [
    {
      type_id: 10,
      description: 'A new hostname has been detected (recommended)',
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 12,
      description: 'A new port was found open',
      subscribed_since: 0,
      subscribed: false
    },
    {
      type_id: 13,
      description: 'A previously open port was found closed',
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
      type_id: 102,
      disabled: false,
      description:
        "A web site's technology has been changed or updated (recommended)",
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
      type_id: 200,
      description: 'A DNS server is allowing DNS zone transfers (recommended)',
      subscribed_since: 0,
      subscribed: false
    },
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
      type_id: 11,
      disabled: true,
      description: 'A new DNS record has been detected (not recommended)',
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
      type_id: 103,
      disabled: true,
      description: "A web site's javascript has been changed (recommended)",
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
  userSubscriptions: state => state.userSubscriptions,
  hasSubscriptions: state =>
    state.userSubscriptions.find(evt => evt.subscribed === true) !== undefined,
  getMarkedRead: state => state.markedReadEvents,
  eventByTypeID: state => id =>
    state.eventSubscriptions.find(evt => evt.type_id === id),
  eventByGroupID: state => group_id => getEventByGroup(state, group_id),
  eventCountByGroupID: state => group_id =>
    getEventByGroup(state, group_id).length,
  shouldDailyEmail: state => state.should_daily_email,
  shouldWeeklyEmail: state => state.should_weekly_email,
  userTimezone: state => state.user_timezone,
  isLoading: state => state.isLoading,
  isUpdating: state => state.isUpdating,
  isLoadingEvents: state => state.isLoading,
  isLoadingSettings: state => state.isLoadingSettings
};

function getEventByGroup(state, group_id) {
  if (state.events[group_id] !== undefined) {
    return state.events[group_id];
  }
  return [];
}

// actions
const actions = {
  GET_GROUP_EVENTS({ dispatch, commit }, group_id) {
    commit('SET_IS_LOADING', true);
    API.get('/event/group/' + group_id + '/events?limit=10').then(
      resp => {
        commit('SET_GROUP_EVENTS', resp.data);
        commit('SET_IS_LOADING', false);
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
    if (details.type === 'all') {
      eventIDs = state.events[details.group_id].map(evt => evt.notification_id);
    }
    if (eventIDs.length === 0) {
      return;
    }
    API.patch('/event/group/' + details.group_id + '/events', {
      notification_ids: eventIDs
    }).then(
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
          dispatch('GET_GROUP_EVENTS', details.group_id);
        }
      },
      err => {
        commit('SET_IS_UPDATING', false);
        handleErrors(dispatch, 'mark events as read', err);
      }
    );
  },
  GET_SETTINGS({ dispatch, commit }) {
    commit('SET_IS_LOADING_SETTINGS', true);
    API.get('/event/settings').then(
      resp => {
        commit('SET_SETTINGS', resp.data);
        commit('SET_IS_LOADING_SETTINGS', false);
      },
      err => {
        commit('SET_IS_LOADING_SETTINGS', false);
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
        handleErrors(dispatch, 'update settings', err);
      }
    );
  }
};

// mutations
const mutations = {
  SET_MARKED_READ(state, notification) {
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
  SET_IS_LOADING_SETTINGS(state, value) {
    state.isLoadingSettings = value;
  },
  SET_SUBSCRIPTIONS(state, details) {
    for (let i = 0; i < state.userSubscriptions.length; i++) {
      if (state.userSubscriptions[i].type_id == details.type_id) {
        state.userSubscriptions[i].subscribed = details.value;
      }
    }
  },
  SET_SETTINGS(state, settings) {
    Vue.set(state, 'user_timezone', settings.user_timezone);
    Vue.set(state, 'should_daily_email', settings.should_daily_email);
    Vue.set(state, 'should_weekly_email', settings.should_weekly_email);
    if (
      settings.subscriptions === null ||
      settings.subscriptions === undefined
    ) {
      return;
    }

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
  SET_GROUP_EVENTS(state, value) {
    Vue.set(state.events, value.group_id, {});
    Vue.set(
      state.events,
      value.group_id,
      (state.events[value.group_id] = value.events)
    );
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
