<template>
  <div>
    <div v-if="!hasGroups" class="col-md-6">
      <p>You have no groups, create one now.</p>
    </div>
    <div v-else class="row" v-for="(value, key) in groups" :key="key">
      <scan-group-card :group="value"></scan-group-card>
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ScanGroupCard from './ScanGroupCard.vue';

export default {
  components: {
    ScanGroupCard
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('scangroup', ['groups']),
    hasGroups() {
      return this.groups !== {};
    }
  },
  watch: {
    groups(newVal, oldVal) {
      console.log(newVal);
    }
  },
  methods: {},
  created() {}
};
</script>
<style>
</style>
