<template>
  <div class="container">
    <div class="col-md-12">
      <form class="form-horizontal">
        <card>
          <div class="row">
            <div class="col-md">
              <div class="iframe-container">
                <iframe src="agreement.html"></iframe>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm">
              <base-checkbox type="primary" nativeType="checkbox" v-model="hasAgreed">By clicking Accept, you acknowledge that for the period of this beta test, must provide domains that your organization, to the best of your knowledge, has control over (Section 3.1d).</base-checkbox>
            </div>
            </div>
          <div class="row">
            <div class="col-sm text-center">
              <base-button type="primary" @click.native="accept" :disabled="!hasAgreed">Accept</base-button>
            </div>
            <div class="col-sm">
              <base-button type="danger" @click.native="decline">Decline</base-button>
            </div>
          </div>
        </card>
      </form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      hasAgreed: false,
    }
  }, 
  
  methods: {
    accept() {
      let details = {
        accept: true
      };
      this.$store.dispatch('user/UPDATE_AGREEMENT', details);
    },
    decline() {
      window.location = '/auth/logout';
    }
  }
};
</script>
<style scoped>
.iframe-container {
  overflow: hidden;
  padding-top: 56.25%;
  position: relative;
}

.iframe-container iframe {
  border: 0;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
</style>