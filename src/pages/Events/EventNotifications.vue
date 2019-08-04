<template>
  <card type="notifications" :header-classes="'text-right'">
    <template slot="header">
      <h6 class="title d-inline">notifications</h6>
      <p class="card-category d-inline"></p>
      <base-button type="danger" icon size="sm" @click="closeNotifications" class="btn-link">
        <i class="tim-icons icon-simple-remove"></i>
      </base-button>
      <base-dropdown
        menu-on-left
        tag="div"
        title-classes="btn btn-link btn-icon"
        class="float-left"
      >
        <i slot="title" class="tim-icons icon-settings-gear-63"></i>

        <a class="dropdown-item" @click="sendOnlyMarkedRead">Mark selected as read</a>
        <a class="dropdown-item" @click="sendAllRead">Mark all as read</a>
        <a class="dropdown-item" @click="configureNotifications">Configure notifications</a>
      </base-dropdown>
    </template>

    <div class="table-full-width table-responsive table-notifications">
      <base-table :data="eventByGroupID(group_id)" thead-classes="text-primary">
        <template slot-scope="{ row }">
          <td>
            <base-checkbox v-on:input="markRead(row, $event)" :key="row.notification_id"></base-checkbox>
          </td>
          <td>
            <p class="title">{{ formatTimestamp(row.event_timestamp) }} - {{ formatTitle(row) }}</p>
            <div v-if="row.type_id === 100">
              <div v-for="(data, index) in formatNewSite(row, 3)" :key="index">
                <a :href="data.url">{{data.url}}</a>
                <span v-if="data.url+'/' !== data.redirect">
                  &nbsp;redirected to
                  <a :href="data.redirect">{{data.redirect}}</a>
                </span>
                &nbsp;on port {{data.port}}
                <br />
              </div>
            </div>
            <div v-else-if="row.type_id === 102">
              <div v-for="(data, index) in formatNewTechEvent(row, 5)" :key="index">
                <a :href="data.url">{{data.url}}</a>
                <span v-if="data.url+'/' !== data.redirect">
                  &nbsp;redirected to
                  <a :href="data.redirect">{{data.redirect}}</a>
                </span>
                on port {{data.port}} is running {{data.tech}} {{ data.version }}
                <br />
              </div>
            </div>
            <div v-else-if="row.type_id === 12">
              <div v-for="(data, index) in formatPorts(row, 'open', 4)" :key="index">
                Host {{data.host}} ({{data.ips}}) has newly opened ports: {{data.open_ports}}
                <br />
              </div>
            </div>
            <div v-else-if="row.type_id === 13">
              <div v-for="(data, index) in formatPorts(row, 'closed')" :key="index">
                Host {{data.host}} ({{data.ips}}) has newly closed ports: {{data.closed_ports}}
                <br />
              </div>
            </div>
            <div v-else-if="row.type_id === 150">
              <div v-for="(data, index) in formatCertExpiring(row)" :key="index">
                Host {{data.host}} ({{data.ips}}) has newly closed ports: {{data.closed_ports}}
                <br />
              </div>
            </div>
            <div v-else-if="row.type_id === 200">
              <div v-for="(data, index) in formatServers(row)" :key="index">
                Server {{data.servers}} is allowing DNS zone transfers.
                <br />
              </div>
            </div>
          </td>
        </template>
      </base-table>
    </div>
  </card>
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
  data() {
    return {};
  },
  computed: {
    ...mapGetters('event', ['eventByTypeID', 'eventByGroupID'])
  },
  props: {
    group_id: {
      type: Number
    }
  },
  methods: {
    closeNotifications() {
      this.$emit('close');
    },
    sendAllRead() {
      this.$store.dispatch('event/MARK_READ', {
        group_id: this.group_id,
        type: 'all'
      });
    },
    sendOnlyMarkedRead() {
      this.$store.dispatch('event/MARK_READ', {
        group_id: this.group_id,
        type: 'marked_only'
      });
    },
    markRead(id, value) {
      this.$store.dispatch('event/ADD_READ', {
        id: id.notification_id,
        value: value
      });
    },
    configureNotifications() {
      this.$router.push('/settings');
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
        case 12:
          return 'The following ports were recently found open';
        case 13:
          return 'The following ports were recently found closed';
        case 100:
          return 'The following new web site(s) have been detected';
        case 101:
          return "The following web site's HTML has been updated";
        case 102:
          return "The following web site's technology has been changed or updated";
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
    formatNewSite(row, offset) {
      if (row.json_data !== undefined) {
        return JSON.parse(row.json_data);
      }
      // blech, old style
      if (row.data.length % offset !== 0) {
        return [
          {
            url: 'unknown data returned',
            redirect: 'unknown data returned',
            port: 0
          }
        ];
      }
      var results = [];

      for (let i = 0; i < row.data.length; i += offset) {
        if (!row.data[i].startsWith('http')) {
          results.push({ url: 'http://' + row.data[i], port: row.data[i + 1] });
        } else {
          results.push({ url: row.data[i], port: row.data[i + 1] });
        }
      }
      return results;
    },
    formatNewTechEvent(row, offset) {
      if (row.json_data !== undefined) {
        return JSON.parse(row.json_data);
      }
      if (row.data.length % offset !== 0) {
        return [{ url: 'unknown data returned', port: 0 }];
      }
      var results = [];

      for (let i = 0; i < row.data.length; i += offset) {
        if (!row.data[i].startsWith('http')) {
          results.push({
            url: 'http://' + row.data[i],
            redirect: row.data[i + 1],
            port: row.data[i + 2],
            tech: row.data[i + 3],
            version: row.data[i + 4]
          });
        } else {
          results.push({
            url: row.data[i],
            redirect: row.data[i + 1],
            port: row.data[i + 2],
            tech: row.data[i + 3],
            version: row.data[i + 4]
          });
        }
      }
      return results;
    },
    formatPorts(row, rowType) {
      if (row.json_data !== undefined) {
        console.log(JSON.parse(row.json_data));
        return JSON.parse(row.json_data);
      }
      let results = [];
      if (row.data.length % 4 !== 0) {
        return 'unknown data returned';
      }
      for (let i = 0; i < row.data.length; i += 4) {
        let ips = row.data[i + 1] + ') previously (' + row.data[i + 2];
        if (row.data[i + 1] === row.data[i + 2]) {
          ips = row.data[i + 1];
        }
        let result = { host: row.data[i], ips: ips };
        if (rowType === 'open') {
          result.open_ports = row.data[i + 3];
        } else {
          result.closed_ports = row.data[i + 3];
        }
        results.push(result);
      }
      return results;
    },
    formatCertExpiring(row) {
      if (row.json_data !== undefined ) {
        return JSON.parse(row.json_data);
      }

      if (row.data.length % 3 !== 0) {
        return 'unknown data returned';
      }
      let val = '';
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
    },
    formatServers(row) {
      if (row.json_data !== undefined) {
        return JSON.parse(row.json_data);
      }
      return row.data.join(',');
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
  mounted() {}
};
</script>
<style>
.notification-text {
  color: rgba(255, 255, 255, 0.6);
}
</style>
