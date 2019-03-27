<template>
  <card>
    <h5 slot="header" class="title">Edit Settings</h5>
    <form @submit.prevent="updateSettings">
      
      <div class="row">
        <div class="col-md-2">
            <p class="category mt-2">Weekly Emails</p>
                <base-switch
                  v-model="settings.should_email_weekly"
                  type="primary"
                  on-text="ON"
                  off-text="OFF"
                ></base-switch>

                <p class="category mt-2">Daily Emails</p>
                <base-switch
                  v-model="settings.should_email_daily"
                  type="primary"
                  on-text="ON"
                  off-text="OFF"
                ></base-switch>
        </div>
        
        <div class="col-md-5">
          <h5 slot="header" class="title">Edit Event Subscriptions</h5>
          <p>Configure which notifications you would like to be alerted about:</p>
        <base-table :data="eventSubscriptionTypes" thead-classes="text-primary">
          <template slot-scope="{ row }">
            <td><base-checkbox :checked="isSubscribed(row.type_id)"></base-checkbox></td>
            <td>
              <p class="title">{{ row.title }}</p>
              <p class="text-muted">{{ row.description }}</p>
            </td>
            
          </template>
        </base-table>
        </div>
      </div>

      <base-button native-type="submit" type="primary" :disabled="isUpdating" class="btn-fill">
        Save
      </base-button>
    </form>
  </card>
</template>
<script>
import { BaseTable, BaseSwitch } from 'src/components/index';
import { mapState, mapGetters } from 'vuex';

export default {
  components: {
    BaseSwitch,
    BaseTable
  },
  computed: {
    ...mapGetters('event', ['shouldEmailDaily', 'shouldEmailWeekly', 'eventSubscriptionTypes','getSubscriptions', 'isLoading','isUpdating']),
  },
  data() {
    return {
      settings: {
        weekly_report_day: 0,
        should_email_weekly: this.shouldEmailWeekly,
        daily_report_hour: 0,
        should_email_daily: this.shouldEmailDaily,
        user_timezone: ''
      },
      subscriptions: this.eventSubscriptionTypes
    };
  },
  methods: {    
    updateSettings() {
      
    },
    isSubscribed(type_id) {
      for (let i = 0; i < this.getSubscriptions.length; i++) {
        if (this.getSubscriptions[i].type_id === type_id) {
          return this.getSubscriptions[i].subscribed;
        }
      }
      return false;
    }
  },
  mounted() {
    this.$store.dispatch('event/GET_SETTINGS');
  }
};
</script>
<style>
</style>
