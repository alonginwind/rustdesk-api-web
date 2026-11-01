<template>
  <component v-if="appStore.setting.appConfigLoaded" :is="enabled ? Enhanced : Legacy" />
</template>
<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { deviceAddressBooksEnabled } from '@/utils/peerBooks.mjs'
import Enhanced from './indexEnhanced.vue'
import Legacy from './indexLegacy.vue'

const appStore = useAppStore()
const enabled = computed(() => deviceAddressBooksEnabled(appStore.setting.appConfig))
</script>
