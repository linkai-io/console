<template>
  <div>
    <div class="row">
      <card>
        <div class="card-header mb-5">
          <h5 class="card-category">Hakken</h5>
          <h3 class="card-title">Scan Groups</h3>
        </div>
        <div class="card-body">
          <p>Review settings, current activity, update settings, and pause resume individual groups.</p>
          <br>
          <h6>Adding hosts</h6>
          <p>Hosts can be in the form of: hostnames, IP addresses, CIDR ranges or URLs, one per line.</p>
          <p>You can add hosts to your scan group in one of two ways.<p>
            <ul>
              <li>Upload a list of hosts</li>
              <li>Type into the Add hosts text box</li>
            </ul>
            <p>When typing in to the text box, be sure to add only a single hostname / range / address per line.</p>
            <p><span style="color: red">Warning:</span> When uploading IP addresses, if they can be resolved, they will be resolved and the hostname or domain that is returned will be added to your list of assets.</p>
          <div class="mr-auto">
            <base-button type="primary" @click="createGroup" size="sm">Create New Group</base-button>
          </div>
        </div>
      </card>
    </div>

    <div v-if="isLoading" class="col-md-6">
      <h4>Loading...</h4>
    </div>
    <div v-else-if="!hasGroups" class="col-md-6">
      <p>You have no groups, create one now.</p>
    </div>
    <div v-else class="row" v-for="value in groups" :key="value.group_id">
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
    ...mapGetters('scangroup', ['groups', 'isLoading']),
    hasGroups() {
      return Object.entries(this.groups).length !== 0;
    }
  },
  methods: {
    createGroup(evt) {
      this.$router.push('/groups/new');
    }
  },
  created() {}
};
</script>
<style>
</style>
