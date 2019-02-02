<template>
  <div class="row">
    <card>
      <div class="card-header mb-5">
        <h5 class="card-category">Hakken</h5>
        <h3 class="card-title">Home</h3>
      </div>
      <div class="card-body">
        <p>Welcome to the Hakken asset management and discovery system.</p>
      </div>
    </card>
    <!-- Stats Cards -->
    <div class="col-lg-3 col-md-6">
      <router-link to="/groups/new">
      <stats-card title="Create Group" type="warning" icon="tim-icons icon-single-copy-04">
        <div slot="footer"></div>
      </stats-card>
      </router-link>
    </div>

    <div class="col-lg-3 col-md-6">
      <router-link to="/groups/list">
      <stats-card title="Review Group" type="info" icon="tim-icons icon-single-copy-04">
        <div slot="footer"></div>
      </stats-card>
      </router-link>
    </div>
    <div class="col-lg-3 col-md-6">
      <router-link to="/addresses">
      <stats-card title="Review Addresses" type="info" icon="tim-icons icon-vector">
        <div slot="footer"></div>
      </stats-card>
      </router-link>
    </div>
    <div class="col-lg-3 col-md-6">
      <router-link to="/webdata">
      <stats-card title="Review Web Results" type="info" icon="tim-icons icon-globe-2">
        <div slot="footer"></div>
      </stats-card>
      </router-link>
    </div>
  </div>
</template>
<script>
import StatsCard from 'src/components/Cards/StatsCard';

export default {
  components: {
    StatsCard
  },
  data() {
    return {};
  },
  computed: {},
  methods: {},
  created() {
    
  },
  mounted() {
    this.i18n = this.$i18n;
    if (this.enableRTL) {
      this.i18n.locale = 'ar';
      this.$rtl.enableRTL();
    }
  },
  beforeDestroy() {
    if (this.$rtl.isRTL) {
      this.i18n.locale = 'en';
      this.$rtl.disableRTL();
    }
  }
};
</script>
<style></style>
