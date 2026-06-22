<template>
  <el-icon v-if="!isMobile" class="ex-icon" @click="expandOrFoldSlider">
    <el-icon-expand v-if="setting.sideIsCollapse"></el-icon-expand>
    <el-icon-fold v-else></el-icon-fold>
  </el-icon>
  <div class="header-logo">
    <img :src="setting.logo" alt="" class="logo">
    <div v-if="!isMobile" class="title">{{setting.title}}</div>
  </div>
  <Setting :isMobile="isMobile"></Setting>
</template>

<script>
  import { defineComponent, computed } from 'vue'
  import HeaderMenu from '@/layout/components/menu/index.vue'
  import Setting from '@/layout/components/setting/index.vue'
  import { useAppStore } from '@/store/app'
  import GTags from '@/layout/components/tags/index.vue'
  import { useIsMobile } from '@/utils/useIsMobile'

  export default defineComponent({
    name: 'LayerHeader',
    created () {
    },
    components: { HeaderMenu, Setting, GTags },
    watch: {},
    setup (props) {
      const appStore = useAppStore()
      const setting = computed(() => appStore.setting)
      const isMobile = useIsMobile()
      const expandOrFoldSlider = () => {
        appStore.sideCollapse()
      }
      return {
        setting,
        isMobile,
        expandOrFoldSlider,
      }
    },

  })
</script>

<style scoped lang="scss">
  .ex-icon {
    height: 100%;
    display: flex;
    align-items: center;
    margin-right: 10px;
    font-size: 16px;
    cursor: pointer;
  }

  .header-logo {
    display: flex;
    height: 100%;
    align-items: center;
    overflow: hidden;

    .title {
      display: block;
      margin-left: 10px;
      white-space: nowrap;
    }

    .logo {
      display: block;
      width: 30px;
      height: 30px;
      flex-shrink: 0;
    }
  }


</style>
<style lang="scss">

</style>
