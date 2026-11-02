<template>
  <el-card shadow="never" v-loading="loading">
    <template #header>{{ T('SessionSettings') }}</template>
    <el-alert v-if="loadError" type="error" :closable="false" :title="T('SessionConfigUnavailable')" />
    <template v-else-if="policy">
      <el-alert v-if="!policy.writable" type="info" :closable="false" :title="T(policy.environment_managed ? 'SessionConfigEnv' : 'SessionConfigReadOnly')" />
      <el-form label-position="top" style="max-width: 680px; margin-top: 20px" @submit.prevent="save">
        <el-form-item :label="T('SessionLifetime') + ' (app.token-expire)'">
          <el-input v-model="duration" :disabled="!policy.writable || saving" :placeholder="policy.effective_duration" />
        </el-form-item>
        <p>{{ T('SessionConfigHelp') }}</p>
        <p>{{ T('SessionEffective') }}: <strong>{{ policy.effective_duration }}</strong></p>
        <p>{{ T('SessionChangeHelp') }}</p>
        <el-button @click="load" :disabled="saving">{{ T('Refresh') }}</el-button>
        <el-button type="primary" :disabled="!policy.writable || !duration.trim()" :loading="saving" @click="save">{{ T('Save') }}</el-button>
      </el-form>
    </template>
  </el-card>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sessionPolicy, saveSessionPolicy } from '@/api/config'
import { T } from '@/utils/i18n'
const policy = ref(null)
const duration = ref('')
const loading = ref(false)
const saving = ref(false)
const loadError = ref(false)
const load = async () => {
  loading.value = true
  const res = await sessionPolicy().catch(() => false)
  loadError.value = !res
  policy.value = res ? res.data : null
  duration.value = policy.value?.duration || ''
  loading.value = false
}
const save = async () => {
  if (!policy.value?.writable || !duration.value.trim()) return
  saving.value = true
  const res = await saveSessionPolicy({ duration: duration.value.trim(), revision: policy.value.revision }).catch(() => false)
  saving.value = false
  if (res) {
    policy.value = res.data
    duration.value = res.data.duration
    ElMessage.success(T('OperationSuccess'))
  }
}
onMounted(load)
</script>
