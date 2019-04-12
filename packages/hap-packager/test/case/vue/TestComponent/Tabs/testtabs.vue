<template>
  <tabs class="container" index="1" onchange="changeActive">
    <tab-bar>
      <text></text>
      <text></text>
      <text></text>
    </tab-bar>
    <tab-content scrollable="true">
      <div></div>
      <refresh></refresh>
      <list>
        <list-item></list-item>
        <list-item></list-item>
        <list-item></list-item>
      </list>
    </tab-content>
  </tabs>
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
    data: {},
    changeActive: function(e) {
      // {index: indexValue}
    }
  }
</script>