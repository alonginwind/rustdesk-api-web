<template>
  <component v-if="appStore.setting.appConfigLoaded" :is="enabled ? Enhanced : Legacy" :peer="props.peer" :scope="props.scope" @success="emit('success')" @cancel="emit('cancel')" />
</template>
<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/app'
import { deviceAddressBooksEnabled } from '@/utils/peerBooks.mjs'
import Enhanced from './createABFormEnhanced.vue'
import Legacy from './createABFormLegacy.vue'
const props = defineProps({ peer: Object, scope: String })
const emit = defineEmits(["success", "cancel"])
const appStore = useAppStore()
const enabled = computed(() => deviceAddressBooksEnabled(appStore.setting.appConfig))
</script>
