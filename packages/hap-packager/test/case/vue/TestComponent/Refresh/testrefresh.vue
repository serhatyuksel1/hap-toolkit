<template>
  <div class="container">
    <refresh onrefresh="refresh" refreshing="{{is_refreshing}}">
      <test></test>
    </refresh>
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
      is_refreshing: false
    },
    refresh: function(e){
      var that_ = this;
      that_.is_refreshing = e.refreshing; // 更新刷新状态
      setTimeout(function(){
        that_.is_refreshing = "false";  //关闭刷新状态
      },3000)
    }
  }
</script>