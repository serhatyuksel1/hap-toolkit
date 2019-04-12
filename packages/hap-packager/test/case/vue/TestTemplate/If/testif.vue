<template>
  <div class="container">
    <div>
      <text v-if="{{condition==1}}">if</text>
      <text v-else-if="{{condition==2}}">elif</text>
      <text v-else>else</text>
    </div>
    <div>
      <text v-if="{{testCondition}}">if</text>
      <text v-else-if="{{testCondition}}">elif1</text>
      <text v-else-if="{{testCondition}}">elif2</text>
      <text v-else-if="{{testCondition}}">elif3</text>
      <text v-else>else</text>
    </div>
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
      condition: -1
    }
  }
</script>