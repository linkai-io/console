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
      v-on:click="purchase"
      :id="'checkout-button-'+plan.id"
      role="link"
      round
      type="primary"
      class="btn-just-icon"
    >Get started</base-button>
    <base-button
      v-else
      slot="footer"
      v-on:click="contactUs"
      :id="'checkout-button-'+plan.id"
      type="primary"
      round
      class="btn-just-icon"
    ><a href='mailto:support@linkai.io'>Contact Us</a></base-button>
    <div id="error-message"></div>
  </card>
  <!--
    <h4 slot="header" class="title mt-2">{{ plan.nickname }}</h4>
    <div class="row">
      <p class="col">{{tlds(plan)}}</p>
    </div>
    <div class="row">
      <p class="col">{{hosts(plan)}}</p>
    </div>
    <div class="row">
      <p class="col">{{hours(plan)}}</p>
    </div>
     <div class="row">
      <p class="col">Port scanning included</p>
    </div>
    <div class="row">
      <p class="col">{{ currency(plan) }}</p>
    </div>
   
    <div class="row">
      <div class="col">
        <button
          v-on:click="purchase"
          style="background-color:#f3c;color:#FFF;padding:8px 12px;border:0;border-radius:4px;font-size:1em"
          :id="'checkout-button-'+plan.id"
          role="link"
        >Subscribe</button>
      </div>
    </div>
    <div id="error-message"></div>
  -->
</template>
<script>
let stripe = Stripe('pk_test_ngMPkGB1t6niVqL1eXmF53ht'); //Stripe('pk_live_ZfyiPCBoZtT09A1cn1K25yGh'),
//elements = stripe.elements({ locale: 'auto' })

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
        return ' ';
      }
      let msg = ' Top Level Domains (TLDs)';
      if (plan.metadata.tlds === '1') {
        msg = ' Top Level Domain (TLD)';
      }
      return plan.metadata.tlds + msg;
    },
    hosts(plan) {
      if (plan.metadata.size === 'enterprise') {
        return ' ';
      }
      return plan.metadata.hosts + ' hosts';
    },
    hours(plan) {
      if (plan.metadata.size === 'enterprise') {
        return ' ';
      }
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
        console.log('enterprise currency');
        return 'Contact Us';
      }

      if (printType === 'number') {
        return plan.amount / 100;
      }

      let amount = plan.amount / 100;
      return (
        amount.toLocaleString('en-US', {
          style: 'currency',
          currency: plan.currency
        }) + '/mo'
      );
    },
    purchase: function() {
      stripe
        .redirectToCheckout({
          items: [{ plan: this.plan, quantity: 1 }],
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