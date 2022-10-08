<template>
    <Tabs :tabList="tabList">
        <template v-slot:tabPanel-1>   
            <div v-for="(objs) in getGlobals">
                <ExpandableTree v-for="(value, name) in objs" :value="value" :name="name" :key="name" :depth="0"></ExpandableTree>
            </div> 
            <div class="empty" v-if="globalsObj.length === 0"> Run the Platform App to Send Data to this Dashboard!</div>
        </template>
        <template v-slot:tabPanel-2>
            <div v-for="(objs) in getRaw">
                <ExpandableTree v-for="(value, name) in objs" :value="value" :name="name" :key="name" :depth="0"></ExpandableTree>
            </div> 
            <div class="empty" v-if="rawObj.length === 0"> Run the Platform App to Send Data to this Dashboard!</div>
        </template>
    </Tabs>
</template>

<script>
    import ExpandableTree from "../components/expandableTree.vue";
    import Tabs from "../components/Tabs.vue";
    export default {
        props: ["incomingData"],
        components: { Tabs, ExpandableTree },
        data() {
            return {
                tabList: ["Globals", "Raw Data"],
                dataKey: 'Platform-Globals',
                globalsObj: [],
                rawObj: [],
            };
        },
        computed: {
            getGlobals () {
                this.globalsObj = []
                // If we find the right key, proceed to call for expected data objects
                if (this.dataKey in this.incomingData) {
                // Grab data Objects from the array assocated with the data Key
                // For example: Plaform-Globals key holds an array of globals objects
                    for(let dataObject of this.incomingData[this.dataKey]) {
                        this.globalsObj.push(dataObject)
                    }
                }
                // Return all received data objects
                return this.globalsObj
            },
            getRaw () {
                this.rawObj = []
                // Grab all incoming Data and assign it to rawObj
                for(let objKey in this.incomingData) {
                    let newObj = {}
                    newObj[objKey] = this.incomingData[objKey]
                    this.rawObj.push(newObj)
                }
                // Return all received data objects
                return this.rawObj
            }
        }
    };
</script>

<style scoped>
    .empty {
        text-align: center;
    }
</style>