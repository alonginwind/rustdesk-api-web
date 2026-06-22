<template>
  <el-dropdown trigger="click" @command="handleCommand" :teleported="true">
    <el-button text circle class="mobile-actions-trigger">
      <el-icon :size="18"><MoreFilled/></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
            v-for="item in items"
            :key="item.command"
            :command="item.command"
            :divided="item.divided"
            :style="{ color: item.color || '' }"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
  import { MoreFilled } from '@element-plus/icons'

  defineProps({
    /**
     * Action items array
     * [{ label: '显示文字', command: '标识', divided?: boolean, color?: string }]
     */
    items: {
      type: Array,
      required: true,
    },
  })

  const emit = defineEmits(['command'])

  const handleCommand = (command) => {
    emit('command', command)
  }
</script>

<style scoped lang="scss">
.mobile-actions-trigger {
  padding: 8px;
}
</style>
