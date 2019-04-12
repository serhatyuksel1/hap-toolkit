<template>
  <div class="container">
    <div v-for="{{list}}">
      <text>{{$idx}}</text>
      <text>{{$item.id}}</text>
    </div>

    <div v-for="{{list}}" tid="id">
      <text>{{$idx}}</text>
      <text>{{$item.id}}</text>
    </div>

    <div v-for="list" tid="id">
      <text>{{$idx}}</text>
      <text>{{$item.id}}</text>
    </div>

    <div v-for="item in list" tid="id">
      <text>{{$idx}}</text>
      <text>{{item.id}}</text>
    </div>

    <div v-for="(index, item) in list" tid="id">
      <text>{{index}}</text>
      <text>{{item.id}}</text>
    </div>
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
      list: [{id:1}, {id:2}]
    }
  }
</script>