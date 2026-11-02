<template>
  <div class="address-cell">
    <span>{{ connectionAddress(peer) }}</span>
    <el-button link type="primary" @click="open">{{ T('Edit') }}</el-button>
  </div>
  <el-dialog v-model="visible" :title="T('ConnectionAddress')" width="min(95vw, 560px)" append-to-body>
    <el-form label-position="top" @submit.prevent="save">
      <el-form-item label="RustDesk ID"><el-input :model-value="peer.id" disabled /></el-form-item>
      <el-form-item :label="T('ConnectionAddress')"><el-input v-model="address" :placeholder="peer.id" /></el-form-item>
      <p>{{ T('ConnectionAddressHelp') }}</p>
      <el-button @click="visible = false">{{ T('Cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="save">{{ T('Save') }}</el-button>
    </el-form>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { T } from '@/utils/i18n'
import { connectionAddress } from '@/utils/peerBooks.mjs'
const props = defineProps({ peer: { type: Object, required: true }, scope: { type: String, default: 'admin' } })
const emit = defineEmits(['saved'])
const visible = ref(false)
const saving = ref(false)
const address = ref('')
const open = () => { address.value = connectionAddress(props.peer); visible.value = true }
const save = async () => {
  saving.value = true
  const res = await request({ url: props.scope === 'my' ? '/my/peer/connectionAddress' : '/peer/connectionAddress', method: 'post', data: { row_id: props.peer.row_id, connection_address: address.value.trim() } }).catch(() => false)
  saving.value = false
  if (res) { visible.value = false; ElMessage.success(T('OperationSuccess')); emit('saved') }
}
</script>
<style scoped>
.address-cell { overflow-wrap: anywhere; }
</style>
