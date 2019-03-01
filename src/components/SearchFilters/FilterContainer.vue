<template>
    <div class="">
      <div class="card" id="searchFilter">
        <div class="card-header">
          Filters
        </div>
        <div class="card-body">
          <div v-for="(filter, index) in filters" :key="filter.name">

          </div>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'filters',
  props: {
    type: {

    }
  },
  data() {
    return {
      filters: []
    };
  },
  methods: {
    addFilter(filter) {
      const index = this.$slots.default.indexOf(filter.$vnode);
      this.filters.splice(index, 0, filter);
    },
    removeFilter(filter) {
      const filters = this.filters;
      const index = filters.indexOf(filter);
      if (index > -1) {
        filters.splice(index, 1);
      }
    }
  }
  
}