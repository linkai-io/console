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
      <div v-if="isLoading" class="col-md-6">
        <h4>Loading... </h4>
      </div>
      <div v-else-if="!hasGroups" class="col-md-6">
        <p>You have no groups, create one first.</p>
      </div>
      <div v-else class="row" v-for="(value, key) in groups" :key="key">
        <card>
        <div class="card-header mb-5">
          <h3 class="card-title">{{ value.group_name }}</h3>
        </div>
        <div class="card-body">
          <div class="row">
          <div class="col-sm">
            <router-link :to="'/webdata/sites/'+ value.group_id">
            <stats-card title="Web Sites" type="info" class="results-card" icon="tim-icons icon-components">
              <div slot="footer">Snapshots of the top page of your assets along with the HTML</div>
            </stats-card>
            </router-link>
          </div>

          <div class="col-sm">
            <router-link :to="'/webdata/responses/'+ value.group_id">
            <stats-card title="Web Responses" type="info"  class="results-card" icon="tim-icons icon-credit-card">
              <div slot="footer">All captured network traffic for each asset identified</div>
            </stats-card>
            </router-link>
          </div>

          <div class="col-sm">
            <router-link :to="'/webdata/urls/'+ value.group_id">
            <stats-card title="URL List" type="info"  class="results-card" icon="tim-icons icon-paper">
              <div slot="footer">List of URLs requested during loading of each asset in a browser.</div>
            </stats-card>
            </router-link>
          </div>

          <div class="col-sm">
            <router-link :to="'/webdata/certificates/'+ value.group_id">
            <stats-card title="Certificates" type="info" class="results-card" icon="tim-icons icon-lock-circle">
              <div slot="footer">All captured certificates directly from websites</div>
            </stats-card>
            </router-link>
          </div>
          </div>
        </div>
        </card>
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
    ...mapGetters('scangroup', ['groups', 'isLoading']),
    hasGroups() {
      return Object.entries(this.groups).length !== 0;
    }
  },
  methods: {},
  created() {},
  mounted() {}
};
</script>
<style lang="scss">
.results-card {
  background-color: lighten(#222a42, 4%);
}
</style>

