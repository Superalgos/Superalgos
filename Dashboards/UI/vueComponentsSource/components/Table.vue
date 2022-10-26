<template>
    <table id="Table" class="table table-sm table-striped table-hover">
        <thead>
            <tr>
                <!-- loop through each value of the fields to get the table header -->
                <th v-for="field in fields"> 
                    {{field}}
                </th>
            </tr>
        </thead>
        <tbody>
            <!-- Loop through the list of data -->
            <tr v-for="item in data">
               <td v-for="(cell) in item">{{cell}}</td>
            </tr>
        </tbody>
    </table> 
</template>
<script>
export default {
name: 'Table',
props:{
    data:{
        type: Array,
    },
    fields:{
        type: Array,
    }
},
computed: {

} 
}
</script>