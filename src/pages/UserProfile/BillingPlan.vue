<template>
  <card
    type="pricing"
    :class="cardClasses(plan.metadata.size)"
    footer-classes="text-center mb-3 mt-3"
  >
    <h1
      :class="plan.metadata.size === 'small' ? 'card-title' : 'card-title-black'"
    >{{ plan.metadata.size }}</h1>
    <ul class="list-group">
      <li class="list-group-item">{{tlds(plan)}}</li>
      <li class="list-group-item">{{hosts(plan)}}</li>
      <li class="list-group-item">{{hours(plan)}}</li>
      <li class="list-group-item">Port scanning included</li>
    </ul>
    <div class="card-prices">
      <h3 class="text-on-front">{{ currency(plan, 'currency') }}</h3>
      <h5 class="text-on-back">{{ currency(plan, 'number') }}</h5>
      <p class="plan">{{ plan.nickname }}</p>
    </div>
    <base-button
      v-if="plan.metadata.size !== 'enterprise'"
      slot="footer"
      v-on:click="purchase(plan.id)"
      :id="'checkout-button-'+plan.id"
      role="link"
      round
      type="primary"
      class="btn-just-icon"
    >Get started</base-button>
    <base-button
      v-else
      slot="footer"
      type="primary"
      simple
      link
      round
      class="btn-just-icon"
    ><a style='font-size: 2em' href='mailto:support@linkai.io'>Contact Us</a></base-button>
    <div id="error-message"></div>
  </card>
</template>
<script>
let stripe = Stripe('pk_test_ngMPkGB1t6niVqL1eXmF53ht'); //Stripe('pk_live_ZfyiPCBoZtT09A1cn1K25yGh'),

export default {
  name: 'billing-plan',
  props: {
    plan: {
      type: Object,
      default: function() {
        return {};
      }
    },
    org_cid: {
      type: String,
      default: ''
    },
    owner_email: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      user: {}
    };
  },
  mounted: function() {},
  methods: {
    cardClasses(size) {
      switch (size) {
        case 'small':
          return 'card-primary';
        case 'medium':
          return 'card-warning card-raised card-white';
        case 'large':
          return 'card-danger card-white';
      }
      return 'card-danger card-white';
    },
    tlds(plan) {
      if (plan.metadata.size === 'enterprise') {
        return 'Hundreds of TLDs ';
      }
      let msg = ' Top Level Domains (TLDs)';
      if (plan.metadata.tlds === '1') {
        msg = ' Top Level Domain (TLD)';
      }
      return plan.metadata.tlds + msg;
    },
    hosts(plan) {
      if (plan.metadata.size === 'enterprise') {
        return 'Thousands of hosts';
      }
      return plan.metadata.hosts + ' hosts';
    },
    hours(plan) {
      return (
        'Analysis every ' +
        plan.metadata.hours +
        ' hour' +
        (plan.metadata.hours > 1 ? 's' : '')
      );
    },
    currency(plan, printType) {
      if (plan.metadata.size === 'enterprise' && printType === 'number') {
        return 'N/A';
      } else if (
        plan.metadata.size === 'enterprise' &&
        printType === 'currency'
      ) {
        return 'Contact Us';
      }

      if (printType === 'number') {
        return plan.amount / 100;
      }

      let amount = plan.amount / 100;
      return (
        amount.toLocaleString('en-US', {
          style: 'currency',
          currency: plan.currency,
          maximumFractionDigits: 0,
          minimumFractionDigits: 0
        }) + '/mo'
      );
    },
    purchase: function(planID) {
      stripe
        .redirectToCheckout({
          items: [{ plan: planID, quantity: 1 }],
          successUrl: 'https://console.linkai.io/incoming/success',
          cancelUrl: 'https://console.linkai.io/incoming/canceled',
          billingAddressCollection: 'required',
          clientReferenceId: this.org_cid,
          customerEmail: this.owner_email
        })
        .then(function(result) {
          if (result.error) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, display the localized error message to your customer.
            var displayError = document.getElementById('error-message');
            displayError.textContent = result.error.message;
          }
        });
    }
  }
};
</script>
<style>
.card-pricing ul {
  list-style: none;
  padding: 0;
  max-width: 240px;
  margin: 40px auto 40px;
}
</style>