<template>
  <base-table :data="events" thead-classes="text-primary">
    <template slot-scope="{ row }">
      <td>
        <base-checkbox v-on:input="markRead(row, $event)" :key="row.notification_id"></base-checkbox>
      </td>
      <td>
        <p class="title">{{ formatTimestamp(row.event_timestamp) }} - {{ formatTitle(row) }}</p>
        <div class="notification-text">{{ formatNotification(row) }}</div>
      </td>
    </template>
  </base-table>
</template>
<script>
import { BaseTable } from '@/components';
import { mapGetters } from 'vuex';
import { unixNanoToMinMonthDay } from '../../data/time.js';

export default {
  name: 'event-notifications',
  components: {
    BaseTable
  },
  computed: {
    ...mapGetters('event', ['events', 'eventByTypeID'])
  },
  methods: {
    markRead(id, value) {
      this.$store.dispatch('event/ADD_READ', {id: id.notification_id, value: value});
    },
    formatTitle(row) {
      switch (row.type_id) {
        case 1:
          return 'A scan group analysis was completed';
        case 2:
          return 'The maximum number of hostnames have been reached for this pricing plan';
        case 10:
          return 'New host names have been detected';
        case 11:
          return 'The following new DNS record(s) has been detected';
        case 100:
          return 'The following new web site(s) have been detected';
        case 101:
          return "The following web site's HTML has been updated";
        case 102:
          return "The following web site's technology has been changed";
        case 103:
          return "The following web site's javascript has been changed";
        case 150:
          return "The following web site's certificate will expire soon";
        case 151:
          return "The following web site's certificate has expired";
        case 200:
          return 'The following DNS server(s) allow zone transfers (AXFR)';
        case 201:
          return 'The following DNS server(s) are configured with NSEC records';
      }
      return 'N/A';
    },
    formatTimestamp(ts) {
      return unixNanoToMinMonthDay(ts);
    },
    formatNotification(row) {
      let val = '';
      switch (row.type_id) {
        case 1:
          break;
        case 2:
          break;
        case 10:
          return row.data.join(', ');
        case 11:
          return row.data.join(', ');
        case 100:
          if (row.data.length % 2 != 0) {
            return 'unknown data returned';
          }
          for (let i = 0; i < row.data.length; i += 2) {
            val += row.data[i] + ' on port ' + row.data[i + 1] + ' ';
          }
          return val;
        case 101:
          return row.data.join(', ');
        case 102:
          break;
        case 103:
          break;
        case 150:
          if (row.data.length % 3 != 0) {
            return 'unknown data returned';
          }
          for (let i = 0; i < row.data.length; i += 3) {
            val +=
              'Host ' +
              row.data[i] +
              ' on port ' +
              row.data[i + 1] +
              ' expires in ' +
              row.data[i + 2];
          }
          return val;
        case 151:
          return row.data.join(', ');
        case 200:
          return row.data.join(', ');
        case 201:
          return row.data.join(', ');
      }
      if (row.data === null || row.data === undefined) {
        return '';
      }
      return row.data.join(', ');
    }
  },
  data() {
    return {};
  }
};
</script>
<style>
.notification-text {
  color: rgba(255, 255, 255, 0.6);
}
</style>
