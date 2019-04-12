<template>
  <div class="container">
    <image data-data1="abc" src="/Common/home.png"></image>
    <image data-data2="{{attrData}}" src="./Common/home.png"></image>
    <image data-data1-data2="abc" src="../Common/home.png"></image>
    <image src="{{imgSrc}}" oncomplete="completeFn" @error="erroreFn"></image>
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