<template>
  <div>
    <div class="row">
      <card>
        <div class="card-header mb-5">
          <h5 class="card-category">Hakken</h5>
          <h3 class="card-title">Web Results</h3>
        </div>
        <div class="card-body">
          <p>Review all collected web data from your asset list here.</p>
        </div>
      </card>
    </div>

      <div v-if="!hasGroups" class="col-md-6">
        <p>You have no groups, create one first.</p>
      </div>
      <div v-else class="row" v-for="(value, key) in groups" :key="key">
          <div class="col-sm">
            <router-link :to="'/web/sites/'+ value.group_id">
            <stats-card title="Web Sites" type="info" icon="tim-icons icon-components">
              <div slot="footer">Snapshots of the top page of your assets along with the HTML</div>
            </stats-card>
            </router-link>
          </div>

          <div class="col-sm">
            <router-link :to="'/web/responses'+ value.group_id">
            <stats-card title="Web Responses" type="info" icon="tim-icons icon-credit-card">
              <div slot="footer">All captured network traffic for each asset identified</div>
            </stats-card>
            </router-link>
          </div>

          <div class="col-sm">
            <router-link :to="'/web/certificates'+ value.group_id">
            <stats-card title="Certificates" type="info" icon="tim-icons icon-lock-circle">
              <div slot="footer">All captured certificates directly from websites</div>
            </stats-card>
            </router-link>
          </div>
      </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { Tabs, TabPane } from 'src/components';
import StatsCard from 'src/components/Cards/StatsCard';

export default {
  components: {
    Tabs,
    TabPane,
    StatsCard
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('scangroup', ['groups']),
    hasGroups() {
      return Object.entries(this.groups).length !== 0;
    }
  },
  methods: {},
  created() {},
  mounted() {}
};
</script>
<style>
</style>
