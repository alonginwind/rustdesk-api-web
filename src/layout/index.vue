<template>
  <el-config-provider :locale="appStore.setting.locale.value">
    <el-container :style="{'--sideBarWidth': sideBarWidth}">
      <!-- Desktop sidebar -->
      <el-aside v-if="!isMobile" :width="leftWidth" class="app-left">
        <g-aside></g-aside>
      </el-aside>
      <!-- Mobile drawer sidebar -->
      <el-drawer
          v-if="isMobile"
          v-model="drawerVisible"
          direction="ltr"
          :size="sideBarWidth"
          :show-close="false"
          :with-header="false"
          class="mobile-drawer"
      >
        <g-aside :force-collapse="false"></g-aside>
      </el-drawer>
      <el-container class="app-container ">
        <el-header class="app-header">
          <el-icon v-if="isMobile" class="mobile-menu-btn" @click="drawerVisible = true">
            <el-icon-expand></el-icon-expand>
          </el-icon>
          <g-header></g-header>
        </el-header>
        <div class="header-tags">
          <tags></tags>
        </div>

        <el-main class="app-main">
          <router-view v-slot="{ Component }">
            <transition mode="out-in" name="el-fade-in-linear">
              <keep-alive :include="cachedTags">
                <component :is="Component"/>
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
  import { useAppStore } from '@/store/app'
  import { useTagsStore } from '@/store/tags'
  import { ref, computed, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import Tags from '@/layout/components/tags/index.vue'
  import GAside from '@/layout/components/aside.vue'
  import GHeader from '@/layout/components/header.vue'
  import { useIsMobile } from '@/utils/useIsMobile'

  const appStore = useAppStore()
  const tagStore = useTagsStore()
  const isMobile = useIsMobile()
  const sideBarWidth = computed(() => appStore.setting.locale.sideBarWidth)
  const leftWidth = computed(() => appStore.setting.sideIsCollapse ? '64px' : 'var(--sideBarWidth)')

  const drawerVisible = ref(false)

  // Auto-collapse sidebar on mobile and close drawer on route change
  const route = useRoute()
  watch(isMobile, (val) => {
    if (val) {
      appStore.setting.sideIsCollapse = true
    } else {
      appStore.setting.sideIsCollapse = false
    }
  }, { immediate: true })

  watch(() => route.path, () => {
    if (isMobile.value) {
      drawerVisible.value = false
    }
  })

  const cachedTags = ref([])

  cachedTags.value = tagStore.cached
</script>

<style lang="scss" scoped>
.app-header {
  background-color: #3f454b;
  color: var(--basicWhite);
  display: flex;
  height: 50px;
  align-items: center;
}

.header-tags {
  height: auto;
  border-bottom: 1px solid #eee;
  display: flex;
  padding: 0;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.app-left {
  transition: width 0.5s;
}

.app-container {
  min-height: 100vh;
}

.mobile-menu-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 10px;
  display: flex;
  align-items: center;
  color: #fff;
  flex-shrink: 0;
}
</style>

<style lang="scss">
/* Fix mobile drawer sidebar scrolling */
.mobile-drawer {
  .el-drawer__body {
    padding: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .scroll-sidebar {
    height: auto !important;
    min-height: 100%;
  }

  .scroll-sidebar > .el-scrollbar__wrap {
    height: auto !important;
    overflow: visible;
  }

  .scroll-sidebar > .el-scrollbar__wrap > .el-scrollbar__view {
    position: static !important;
    height: auto !important;
    overflow: visible !important;
  }
}
</style>


