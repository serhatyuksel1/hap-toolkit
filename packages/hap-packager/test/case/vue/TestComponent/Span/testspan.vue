<template>
  <div class="container">
    <text>
      <span style="color: red; text-decoration: underline;">hello</span>
    </text>
    <a href="http://baidu.com">
      <span style="color: red;"></span>
      <span style="color: red; text-decoration: line-through;"></span>
      <span style="color: red; text-decoration: underline;"></span>
    </a>
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
