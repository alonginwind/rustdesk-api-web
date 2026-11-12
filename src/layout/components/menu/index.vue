<template>
  <el-menu
          class="menus"
          :collapse="isCollapse"
          :default-active="activeIndex"
          background-color="#2d3a4b"
          text-color="#fff"
          active-text-color="#409eff"
          router
  >
    <menu-item v-for="(route,index) in routes" :key="route.name" :route="route"></menu-item>
  </el-menu>
</template>

<script>
  import { defineComponent, onMounted, watch, computed } from 'vue'
  import { useRouteStore } from '@/store/router'
  import MenuItem from '@/layout/components/menu/item.vue'
  import { useRoute } from 'vue-router'
  import { useAppStore } from '@/store/app'
  import { teamModeEnabled } from '@/utils/peerBooks.mjs'

  export default defineComponent({
    name: 'Menu',
    created () {
    },
    components: { MenuItem },
    props: {
      forceCollapse: {
        type: [Boolean, null],
        default: null,
      },
    },
    setup (props) {
      const route = useRoute()
      const app = useAppStore()
      const isCollapse = computed(() =>
        props.forceCollapse !== null ? props.forceCollapse : app.setting.sideIsCollapse
      )
      const activeIndex = computed(() => route.name)
      const teamModeOn = computed(() => teamModeEnabled(app.setting.appConfig))
      // Config-driven entries stay hidden until team mode is known to be on.
      const filterTeamModeRoutes = (routes) => routes
        .filter(r => !r.meta?.teamModeOnly || teamModeOn.value)
        .map(r => r.children?.length ? { ...r, children: filterTeamModeRoutes(r.children) } : { ...r })
      const routes = computed(() => filterTeamModeRoutes(useRouteStore().routes))
      return {
        routes,
        activeIndex,
        isCollapse,
      }
    },

  })
</script>

<style lang="scss" scoped>
  .menus {
    min-height: 100vh;
    border-right: none;
    &:not(.el-menu--collapse) {
      width: var(--sideBarWidth);
    }

  }
</style>
<style>
</style>
