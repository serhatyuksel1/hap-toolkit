<template>
  <div class="container">
    <div str="{{`message:${message}`}}"></div>
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
  data: {
    message: 'hell world'
  }
}
</script>