<template>
  <div class="col-sm-12">
    <div class="card mb-4 col-md-12">
      <div class="card-header">
        <h3 class="card-title">Billing Details</h3>
      </div>
      <h4 class="description"></h4>
      <div class="row">
        <div class="col text-left">
          <p>Your account is: <span class="ml-2 mt-2 mr-2 mb-2">{{accountStatus}}</span></p>
          <p>Your current plan: {{planName}}</p>

          <div v-if="isBetaPlan && !hasPlan">
            <p>Your beta trial will expire in: {{ betaComplete }}</p>
          </div>
          <div v-else-if="hasPlan">
            <p>Your next scheduled payment is in: {{ paymentDue }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="card mb-4 col-md-12 ml-auto mr-auto text-center">
      <h1 v-if="!hasPlan" class="title mt-2">Pick the best plan for your organization</h1>
      <h1 v-else class="title mt-2">Upgrade or change your plan</h1>
      <h4 class="description"></h4>
      <div class="row">
        <div v-for="(plan, index) in currentPlans" :key="index">
          <billing-plan v-bind:org_cid="orgCID" v-bind:plan="plan" v-bind:owner_email="email"></billing-plan>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { BaseAlert } from 'src/components/index';
import BillingPlan from 'src/pages/UserProfile/BillingPlan.vue';
import { mapGetters } from 'vuex';
import moment from 'moment';

export default {
  components: {
    BaseAlert,
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
      'status',
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
    hasPlan() {
      return this.subscriptionPlan !== '';
    },
    currentPlans() {
      let plans = this.plans.slice().sort(function(c, n) {
        return c.metadata.hosts - n.metadata.hosts;
      });
      let contactPlan = {
        metadata: {
          size: 'enterprise',
          tlds: 'Negotiable',
          hosts: 'Negotiable',
          hours: '1'
        },
        nickname: 'Enterprise'
      };
      plans.push(contactPlan);
      return plans;
    },
    currentPlan() {
      if (this.subscriptionPlan === '') {
        return 'No active subscription';
      }
      return this.subscriptionPlan;
    },
    betaComplete() {
      return this.paymentDue;
    },
    planName() {
      let plans = this.plans.slice().filter(e => e.id === this.subscriptionID);
      if (plans.length !== 1) {
        return 'None';
      }
      return this.plans[0].nickname;
    },
    paymentDue() {
      let now = moment();
      let paymentMs = this.paymentRequiredTime / 1000000;
      let due = moment(paymentMs);
      //Get Days and add from now
      return due.diff(moment(), 'days');
    },
    accountStatus() {
      if (this.status === 1000) {
        return 'Active';
      }
      return 'Paused';
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
