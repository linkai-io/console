<template>
  <div>
    <div class="row d-flex justify-content-center">
      <div class="col-md-2 mr-auto">
      <base-button
        type="primary"
        @click="createGroup"
        size="sm"
        >Create New Group</base-button>
      </div>
      </div>
    <div class="row d-flex justify-content-center">
      <div class="col-md-12">
        <scan-group-list></scan-group-list>
      </div>
   </div>
   </div>
</template>

<script>
import ScanGroupList from 'src/pages/ScanGroups/ScanGroupList.vue';

export default {
  components: {
    ScanGroupList
  },
  methods: {
    createGroup(evt) {
      this.$router.push('/groups/new');
    }
  }
};
</script>

<style>
</style>
