<template>
  <el-sub-menu v-if="route.children&&route.children.filter(c=>!c.meta?.hide).length>1&&route.children.some(r => !r.meta?.hide)"
               :key="route.name"
               :index="route.name"
  >
    <template #title>
      <el-icon v-if="route.meta?.icon">
        <component :is="iconComponent(route.meta.icon)"></component>
      </el-icon>
      <span>{{ T(route.meta?.title) || T(route.name) }}</span>
    </template>
    <menu-item v-for="(_route,_index) in route.children"
               :route="_route"
               :key="_route.name">
    </menu-item>
  </el-sub-menu>
  <el-menu-item v-else-if="!parseRoute(route).meta?.hide" :route="parseRoute(route)" :index="parseRoute(route).name">
    <el-icon v-if="parseRoute(route).meta?.icon">
      <component :is="iconComponent(parseRoute(route).meta.icon)"></component>
    </el-icon>
    <span>{{ T(parseRoute(route).meta?.title) || T(parseRoute(route).name) }}</span>
  </el-menu-item>
</template>

<script>
  import { defineComponent, markRaw } from 'vue'
  import { T } from '@/utils/i18n'
  import * as ElementIcons from '@element-plus/icons'

  // Pre-resolve and markRaw all icons to prevent reactive proxy issues
  const resolvedIcons = {}
  for (const name in ElementIcons) {
    resolvedIcons[name] = markRaw(ElementIcons[name])
  }

  export default defineComponent({
    name: 'MenuItem',
    props: {
      route: {},
    },
    mounted () {
    },
    setup (props) {
      //判断仅有一个子项的route
      const parseRoute = (route) => {
        if (route.children && route.children.filter(c => !c.meta?.hide).length === 1) {
          return route.children.filter(c => !c.meta?.hide)[0]
        } else {
          return route
        }
      }
      const iconComponent = (name) => name ? resolvedIcons[name] : null
      return {
        parseRoute,
        iconComponent,
        T,
      }
    },
  })
</script>

<style lang="scss" scoped>
</style>
