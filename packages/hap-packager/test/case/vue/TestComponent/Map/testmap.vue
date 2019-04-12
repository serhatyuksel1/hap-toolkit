<template>
  <div class="container">
    <map />
    <map longitude="90" latitude="90" coordtype="wgs84" scale="4" rotate="90" markers="{{markers}}" showmylocation="false" polylines="" circles="" controls="" groundoverlays="" includepoints=""/>
    <map onloaded="loaded" onregionchange="regionchange" ontap="tap" onmarkertap="markertap" oncallouttap="callouttap" oncontroltap="controltap"/>
  </div>
</template>

<style>
  .container {
    flex: 1;
    flex-direction: column;
    background-color: #FFFFFF;
  }
</style>

<script>
  export default {
    data: {
      markers: [{
        id: 1,
        longitude: 90,
        latitude: 90
      }]
    },
    loaded: function () {
    },
    regionchange: function (e) {
    },
    tap: function (e) {
    },
    markertap: function (e) {
    },
    callouttap: function (e) {
    },
    controltap: function (e) {
    }
  }
</script>