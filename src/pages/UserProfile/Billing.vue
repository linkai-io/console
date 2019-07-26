<template>
  <div class="col-sm-12">
    <div class="card mb-4 col-md-12 ml-auto mr-auto text-center">
      <h1 class="title mt-2">Pick the best plan for your organization</h1>
        <h4 class="description">
        </h4>
      <div class="row">
        <div v-for="(plan, index) in currentPlans" :key="index">
          <billing-plan v-bind:org_cid="orgCID" v-bind:plan="plan" v-bind:owner_email="email"></billing-plan>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import BillingPlan from 'src/pages/UserProfile/BillingPlan.vue';
import { mapGetters } from 'vuex';

export default {
  components: {
    BillingPlan
  },
  data() {
    return {
      user: {}
    };
  },
  computed: {
    ...mapGetters('org', [
      'plans',
      'orgCID',
      'email',
      'subscriptionPlan',
      'paymentRequiredTime',
      'billingType',
      'billingPlan',
      'isBetaPlan',
      'subscriptionID',
      'isUpdating'
    ]),
    currentPlans() {
      let plans = this.plans.slice().sort(function(c, n) {
        return c.metadata.hosts - n.metadata.hosts;
      });
      let contactPlan = {
        metadata: {
          size: 'enterprise',
          tlds: 'Negotiable',
          hosts: 'Negotiable',
          hours: '1',
        },
        nickname: 'enterprise'
      }
      plans.push(contactPlan)
      return plans;
    }

  },
  mounted: function() {
    this.$store.dispatch('org/GET_BILLING');
  },
  methods: {}
};
</script>
<style>
</style>
