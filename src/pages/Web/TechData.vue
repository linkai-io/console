<template>
  <div class="container">
    <div v-if="itemCount === 0">No technologies identified</div>
    <div v-else>
      <div v-for="(data, idx) in tech_data.tech_categories" :key="data">
        <div>
          <el-tooltip
            :content="'This ' + formatCategory(data) +' was found '+ formatLocation(tech_data.tech_match_locations[idx])"
            effect="light"
            :open-delay="150"
            placement="left"
          >
            <base-button
              type="sm"
              class="mt-2"
              @click.native="openLink(tech_data.tech_websites[idx])"
            >
              <a :href="tech_data.tech_websites[idx]">
                <div v-if="tech_data.tech_icons[idx] !== ''"><img height="16" width="16" :src="'img/tech/'+tech_data.tech_icons[idx]">&nbsp;</div>
              </a>
              {{ tech_data.tech_names[idx] }}
              <div
                v-if="tech_data.tech_versions[idx] !== ''"
              >:&nbsp;{{tech_data.tech_versions[idx]}}</div>
            </base-button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'tech_data',
  components: {},
  computed: {
    itemCount() {
      if (
        this.tech_data.tech_categories.length === 0 ||
        (this.tech_data.tech_categories.length === 1 &&
          this.tech_data.tech_categories[0] === '')
      ) {
        return 0;
      }
      return this.tech_data.tech_categories.length;
    },
    names() {
      return this.tech_data.tech_names;
    }
  },
  props: {
    tech_data: {
      type: Object,
      default: function() {
        return {
          tech_categories: [],
          tech_names: [],
          tech_versions: [],
          tech_match_locations: [],
          tech_match_data: [],
          tech_icons: [],
          tech_websites: []
        };
      }
    }
  },
  methods: {
    openLink(link) {
      window.open(link, '_blank');
    },
    formatCategory(val) {
      switch (val) {
        case 'JavaScript Libraries':
          return 'JavaScript library';
        case 'Miscellaneous':
          return 'technology';
        case 'Font Scripts':
          return 'font script';
      }
      return val;
    },
    formatLocation(val) {
      switch (val) {
        case 'html':
          return 'in the response HTML';
        case 'script':
          return 'in an HTML script tag';
        case 'meta':
          return 'in an HTML meta tag';
        case 'header':
          return 'in the response headers';
        case 'javascript':
          return 'by executing javascript';
      }
      return 'in ' + val;
    }
  },
  data() {
    return {};
  },
  created() {},
  mounted() {}
};
</script>
<style lang="scss" scoped>
</style>
