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
          <base-table :data="userSubscriptions" thead-classes="text-primary">
            <template slot-scope="{ row, $index }">
              <td>
                <!-- "  -->
                <base-checkbox :checked="row.subscribed" :disabled="row.disabled" v-on:input="subscribe(row, $event)" :key="row.type_id"></base-checkbox>
              </td>
              <td>
                 <el-tooltip v-if="row.disabled"
                  content="This option is not currently implemented"
                  effect="light"
                  :open-delay="150"
                  placement="top"
                >
                  <p class="text-muted">Disabled</p>
                </el-tooltip>
                <p class="title">{{ row.title }}</p>
                <div class="notification-text">{{ row.description }}</div>
              </td>
            </template>
          </base-table>
        </div>
      </div>

      <base-button native-type="submit" type="primary" :disabled="isUpdating" class="btn-fill">Save</base-button>
    </form>
  </card>
</template>
<script>
import { BaseTable, BaseSwitch } from 'src/components/index';
import { mapGetters } from 'vuex';

export default {
  components: {
    BaseSwitch,
    BaseTable
  },
  computed: {
    ...mapGetters('event', [
      'shouldEmailDaily',
      'shouldEmailWeekly',
      'eventByTypeID',
      'userSubscriptions',
      'isLoading',
      'isUpdating'
    ])
  },
  data() {
    return {
      settings: {
        weekly_report_day: 0,
        should_email_weekly: this.shouldEmailWeekly,
        daily_report_hour: 0,
        should_email_daily: this.shouldEmailDaily,
        user_timezone: ''
      }
    };
  },
  methods: {
    updateSettings() {
      this.$store.dispatch('event/UPDATE_SETTINGS', this.settings);
    },
    isSubscribed(type_id) {},
    
    subscribe(row, value) {
      this.$store.dispatch('event/EDIT_SUBSCRIPTION', {type_id: row.type_id, value: value});
    }
  },

  mounted() {
    this.$store.dispatch('event/GET_SETTINGS');
  }
};
</script>
<style>
.notification-text {
  color: rgba(255, 255, 255, 0.6);
}
</style>