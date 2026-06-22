<template>
  <el-scrollbar class="scroll-sidebar" height="100vh">
    <menus :force-collapse="forceCollapse"></menus>
  </el-scrollbar>
</template>
<script>
  import Menus from '@/layout/components/menu/index.vue'
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'GAside',
    components: { Menus },
    props: {
      forceCollapse: {
        type: [Boolean, null],
        default: null,
      },
    },
  })
</script>

<style scoped lang="scss">
.scroll-sidebar {
  background-color: #2d3a4b;
}
</style>
