<template>
  <base-table :data="tableData" thead-classes="text-primary">
    <template slot-scope="{ row }">
      <td><base-checkbox :id="row"></base-checkbox></td>
      <td>
        <p class="title">{{ row.data }}</p>
        <p class="text-muted">{{ formatNotification(row) }}</p>
      </td>
      <td class="td-actions text-right">
        <el-tooltip
          content="Edit task"
          effect="light"
          :open-delay="300"
          placement="top"
        >
          <base-button type="link">
            <i class="tim-icons icon-pencil"></i>
          </base-button>
        </el-tooltip>
      </td>
    </template>
  </base-table>
</template>
<script>
import { BaseTable } from '@/components';
import { mapGetters } from 'vuex';

export default {
  name: 'event-notifications',
  components: {
    BaseTable
  },
  computed: {
    ...mapGetters('event', ['events'])
  },
  methods: {
    formatNotification(row) {
      switch (row.type_id) {
        case 1:
        break;
        case 2:
        break;
        case 10:
        break;
        case 11:
        break;
        case 100:
        break;
        case 101:
        break;
        case 102:
        break;
        case 103:
        break;
        case 150:
        break;
        case 151:
        break;
        case 200:
        break;
        case 201:
        break;
      }
      return 'huh';
    }
  },
  data() {
    return {
      tableData: this.events
    };
  }
};
</script>
<style></style>
