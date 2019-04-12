<template>
  <div class="container">
    <progress type="horizontal" percent="80" style="stroke-width: 100px;color: red"></progress>
    <progress type="circular" style="color: red"></progress>
    <progress type="circular" style="color: yellow"/>
  </div>
</template>

<style>
  .container {
    flex:1;
    flex-direction: column;
    background-color: #FFFFFF;
  }
</style>

<script>
  export default {
    data: {}
  }
</script>