<template>
  <div class="doc-page">
    <!-- 1. 测试嵌套的if -->
    <div class="doc-row" v-if="{{level1True}}">
      <text if="{{level2True}}">1. visible</text>
      <text if="{{level2False}}">2. invisible</text>
    </div>

    <!-- 2. 测试嵌套的if/elif -->
    <div class="doc-row" v-if="{{level1False}}">
      <text>3. invisible</text>
    </div>
    <div class="doc-row" v-else-if="{{level1True}}">
      <text v-if="{{level2False}}">4. invisible</text>
      <div v-else-if="{{level2True}}">
        <text v-if="{{level3False}}">5. invisible</text>
        <text v-else-if="{{level3True}}">6. visible</text>
      </div>
    </div>

    <!-- 3. 测试嵌套的if/else -->
    <div class="doc-row" v-if="{{level1True}}">
      <text v-if="{{level2False}}">7. invisible</text>
      <text v-else>8. visible</text>
    </div>
    <div class="doc-row" v-else>
      <!-- 虽然下面text的if条件是true, 但父级else分支是不可见的  -->
      <text v-if="{{level2True}}">9. invisible</text>
      <text v-else>10. invisible</text>
    </div>

    <!-- 4. 测试嵌套的if/elif/else -->
    <div class="doc-row" v-if="{{level1False}}">
      <text>11. invisible</text>
    </div>
    <div class="doc-row" v-else-if="{{level1True}}">
      <text v-if="{{level2False}}">12. invisible</text>
      <text v-else-if="{{level2True}}">13. visible</text>
      <text v-else>14. invisible</text>
    </div>
    <div v-else>
      <text>15. invisible</text>
    </div>

    <!-- 5. 混合各种情况的例子 -->
    <div class="doc-row" v-if="{{level1False}}">
      <text>16. invisible</text>
    </div>
    <div class="doc-row" v-else-if="{{level1True===true}}">
      <text v-if="{{level2False==false}}">17. visible</text>

      <div class=doc-row v-else-if="{{level2True}}">
        <text>18. visible</text>
      </div>
      <div v-else>
        <text>19. invisible</text>
      </div>
    </div>
  </div>
</template>

<style>
  .doc-page, .doc-row {
    flex-direction: column;
  }
</style>

<script>
  export default {
    data: {
      level1True: true,
      level1False: false,
      level2True: true,
      level2False: false,
      level3True: true,
      level3False: false
    }
  }
</script>