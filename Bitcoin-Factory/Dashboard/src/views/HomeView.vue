<template>
<div v-if="load"  ><center><h1>Data is being fetched, please wait</h1></center>   </div>

  <br />
  <br />
  <div class="container-fluid">
    <div class="row">
      <div class="col-4">Page Refresh Count : {{ data.test }}</div>
      <div class="col-4">Number of Working Clients : {{ data.running }}</div> 
      <div  class="col-4">URL :<input type="text" v-model="url"> </div> 
    </div>
  </div>
  <br />
  <br />
  <br />
  <div class="container-fluid">
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>userProfile</th>
          <th>instance</th>
          <th>clientVersion</th>
          <th>requestsCount</th>
          <th>requestNextTestCaseCount</th>
          <th>lastSeen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="value in data.clint" :key="value">
          <td>{{ value[0] }}</td>
          <td>{{ value[1].userProfile }}</td>
          <td>{{ value[1].instance }}</td>
          <td>{{ value[1].clientVersion }}</td>
          <td>{{ value[1].requestsCount }}</td>
          <td>{{ value[1].requestNextTestCaseCount }}</td>
          <td>{{ value[1].lastSeen }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
export default {
 
  setup() {
    let url=ref("http://99.81.83.180:31248/Stats/Machine%20Learning");
    let data = ref("");
    let i = 0;
    let time = 5000;
    let load=ref(true);
     
    setInterval( () => {
     load.value=false;
      axios
        .get(url.value)
        .then((response) => {
          data.value = {
            running: response.data.networkClients.length,
            clint: response.data.networkClients,
            test: i
          };
          i++;
        })
        .catch((error) => {
          console.log(error);
        });
    }, time);
    return {
      data,
      load,
      url
    };
  },
};
</script>


