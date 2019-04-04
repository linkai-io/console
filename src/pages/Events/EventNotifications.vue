<template>
  <base-table :data="events" thead-classes="text-primary">
    <template slot-scope="{ row }">
      <td>
        <base-checkbox v-on:input="markRead(row, $event)" :key="row.notification_id"></base-checkbox>
      </td>
      <td>
        <p class="title">{{ formatTimestamp(row.event_timestamp) }} - {{ formatTitle(row) }}</p>
        <div v-if="row.type_id === 100">
          <div v-for="(data, index) in formatEventLinks(row.data)" :key="index">
            <a :href="data.url">{{data.url}}</a>
            on port {{data.port}}
            <br>
          </div>
        </div>
        <div v-else class="notification-text">{{ formatNotification(row) }}</div>
      </td>
    </template>
  </base-table>
</template>
<script>
import moment from 'moment';
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
      this.$store.dispatch('event/ADD_READ', {
        id: id.notification_id,
        value: value
      });
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
    formatEventLinks(data) {
      if (data.length % 2 !== 0) {
        return [{ url: 'unknown data returned', port: 0 }];
      }
      var results = [];

      for (let i = 0; i < data.length; i += 2) {
        if (!data[i].startsWith('http')) {
          results.push({ url: 'http://' + data[i], port: data[i + 1] });
        } else {
          results.push({ url: data[i], port: data[i + 1] });
        }
      }
      return results;
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
          if (row.data.length % 2 !== 0) {
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
          if (row.data.length % 3 !== 0) {
            return 'unknown data returned';
          }

          for (let i = 0; i < row.data.length; i += 3) {
            let then = moment(row.data[i + 2], 'sec');
            val +=
              'Host ' +
              row.data[i] +
              ' on port ' +
              row.data[i + 1] +
              ' expires in ' +
              this.formatTimeDifference(then);
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
    },
    formatTimeDifference(then) {
      var duration = moment.duration(then.diff(moment()));

      //Get Days and subtract from duration
      var days = duration.asDays();
      duration.subtract(moment.duration(days, 'days'));

      //Get hours and subtract from duration
      var hours = duration.hours();
      duration.subtract(moment.duration(hours, 'hours'));

      let difference = '';
      if (days > 0) {
        difference += days + ' days ';
      }
      if (hours > 0) {
        difference += hours + ' hours';
      }
      return difference;
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
