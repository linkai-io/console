<template>
  <card class="card-stats" :show-footer-line="true">
    <div class="row">
      <div class="col-5" v-if="$slots.icon || icon">
        <div class="info-icon text-center" :class="`icon-${type}`">
          <slot name="icon"> 
            <div v-if="link !== ''"><router-link :to="link"><i :class="icon"></i></router-link></div>
            <div v-else><i :class="icon"></i> </div>
            </slot>
        </div>
      </div>
      <div class="col-7" v-if="$slots.content || title || subTitle">
        <div class="numbers">
          <slot>
            <p v-if="subTitle" class="card-category">{{ subTitle }}</p>
            <h3 v-if="title" class="card-title">{{ title }}</h3>
          </slot>
        </div>
      </div>
    </div>
    <div class="stats" slot="footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </card>
</template>
<script>
import Card from './Card.vue';

export default {
  name: 'stats-card',
  components: {
    Card
  },
  props: {
    type: {
      type: String,
      default: 'primary'
    },
    icon: String,
    link: {
      type: String,
      default: ''
    },
    title: String,
    subTitle: String
  }
};
</script>
<style>

</style>
