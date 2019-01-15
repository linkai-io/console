<template>
  <div>
    <div v-if="!hasGroups" class="col-md-6">
      <p>You have no groups, create one now.</p>
    </div>
    <div v-else class="row" v-for="scangroup in scangroups" :key="scangroup.group_id">
      <scan-group-card :scangroup="scangroup"></scan-group-card>
    </div>
    
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ScanGroupCard from './ScanGroupCard.vue';

export default {
  components: {
    ScanGroupCard
  },
  data() {
    return {};
  },
  computed: {
    ...mapState('scangroup', ['scangroups', 'currentGroup']),
    groupLen() {
      return this.scangroups.length;
    },
    hasGroups() {
      return this.scangroups.length > 0;
    }
  },
  methods: {},
  created() {
    this.$store.dispatch('scangroup/GET_GROUPS');
  }
};
</script>
<style>
</style>
