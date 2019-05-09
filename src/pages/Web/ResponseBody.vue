<template>
  <collapse accordion >
    <collapse-item title="" @click.native="printResponseData()">
      <pre class="ml-3 data">{{ responseBodyData }}</pre>
    </collapse-item>
    <hr>
  </collapse>
</template>
<script>
import axios from 'axios';
import {Collapse, CollapseItem} from 'src/components'

export default {
  components: {
    Collapse,
    CollapseItem
  },
   props: {
     url: {
       type: String
     }
   },
   data() {
     return {
       responseBodyData: 'Loading...',
     }
   },
   methods: {
     async printResponseData() {
       const http = axios.create({
          baseURL: process.env.VUE_APP_ROOT_API,
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
      });
      try {
        let response = await http.get('data/'+this.url);
        this.responseBodyData = response.data; 
      } catch(err) {
        let msg = 'Error getting raw response data: ' + err;
        if (err.data !== undefined && err.data.msg !== undefined) {
          msg = err.data.msg;
        }
        
        this.$store.dispatch(
          'notify/CREATE_NOTIFY_MSG',
          {
            msg: msg,
            msgType: 'danger'
          },
          { root: true }
        );
        return err;
      }
    },
   },
   mounted() {
     //this.printResponseData();
   }
}
</script>
<style>
.data p, .data span, .data tr, .data td {
 white-space: pre; 
 white-space: pre-line;    
}
hr{ 
  height: 1px;
  color: #e14eca;
  background-color: #e14eca;
  border: none;
}
</style>
