<template>
  <div></div>
</template>
<script>

export default {
  data() {
    return {
      load_instance: null
    };
  },
  props: {
    loading: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    this.load_instance = this.$loading({fullscreen: false,  target: 'div#loading_menu', text: 'Loading', background: 'rgba(0, 0, 0, 0.4)', customClass: 'loading-menu'});
  },
  watch: {
    loading(val) {
      if (val === false) {
        this.load_instance.close();
      } 
    }
  }
};
</script>
<style>
.loading-menu {
  color: #f3c;
}

.loading-menu .el-loading-spinner .path {
  stroke: #f3c !important;
}

.loading-menu .el-loading-text {
  color: #f3c !important;
}

.loading-menu .el-loading-mask {
  background: 'rgba(0, 0, 0, 0.7)';
}
</style>
