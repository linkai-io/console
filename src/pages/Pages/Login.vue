<template>
  <div class="container">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <form @submit.prevent>
        <card class="card-login card-white">
          <template slot="header">
            <img src="img/card-primary.png" alt="" />
            <h1 class="card-title">Log in</h1>
          </template>

          <div>
            <base-input
              placeholder="Email"
              addon-left-icon="tim-icons icon-email-85"
            >
            </base-input>

            <base-input
              placeholder="Password"
              addon-left-icon="tim-icons icon-lock-circle"
            >
            </base-input>
          </div>

          <div slot="footer">
            <base-button type="primary" class="mb-3" size="lg" block>
              Get Started
            </base-button>
            <div class="pull-left">
              <h6>
                <router-link class="link footer-link" to="/register">
                  Create Account
                </router-link>
              </h6>
            </div>

            <div class="pull-right">
              <h6><a href="#pablo" class="link footer-link">Need Help?</a></h6>
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
      model: {
        email: '',
        password: '',
        subscribe: true
      }
    };
  }
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
