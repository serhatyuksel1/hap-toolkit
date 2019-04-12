<template>
  <div class="container">
    <richtext type="mix">{{native}}</richtext>
    <richtext type="ux">{{native}}</richtext>
    <richtext type="html">{{html}}</richtext>
    <richtext type="mix" value="{{native}}"></richtext>
    <richtext type="ux" value="{{native}}"></richtext>
    <richtext type="html" value="{{html}}"></richtext>
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
      native: '<div><text>native组件</text></div>',
      html: '<div><p>type = html</p></div>'
    }
  }
</script>