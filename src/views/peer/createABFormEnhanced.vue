<template>
  <el-form label-position="top" @submit.prevent="submit">
    <el-form-item v-if="scope === 'admin'" :label="T('Owner')" required>
      <el-select v-model="form.user_id" @change="loadCollections">
        <el-option v-for="user in allUsers" :key="user.id" :value="user.id" :label="user.username" />
      </el-select>
    </el-form-item>
    <el-form-item :label="T('AddressBookName')" required>
      <el-select v-model="form.collection_ids" multiple style="width: 100%" :loading="loading">
        <el-option :value="0" :label="T('MyAddressBook')" />
        <el-option v-for="book in collections.filter(c => c.id !== 0)" :key="book.id" :value="book.id" :label="book.name" />
      </el-select>
    </el-form-item>
    <el-form-item label="RustDesk ID"><el-input :model-value="peer.id" disabled /></el-form-item>
    <el-form-item :label="T('ConnectionAddress')" required><el-input v-model="form.id" /></el-form-item>
    <el-form-item :label="T('Alias')"><el-input v-model="form.alias" /></el-form-item>
    <p>{{ T('CopyToBooksHelp') }}</p>
    <el-button @click="$emit('cancel')">{{ T('Cancel') }}</el-button>
    <el-button type="primary" :loading="saving" @click="submit">{{ T('AddToAddressBook') }}</el-button>
  </el-form>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { loadAllUsers } from '@/global'
import { useUserStore } from '@/store/user'
import { list as adminCollections } from '@/api/address_book_collection'
import { list as myCollections } from '@/api/my/address_book_collection'
import { batchCreateFromPeers as adminCopy } from '@/api/address_book'
import { batchCreateFromPeers as myCopy } from '@/api/my/address_book'
import { T } from '@/utils/i18n'
import { connectionAddress, bookCopyPayload } from '@/utils/peerBooks.mjs'
const props = defineProps({ peer: { type: Object, required: true }, scope: { type: String, default: 'admin' } })
const emit = defineEmits(['cancel', 'success'])
const userStore = useUserStore()
const { allUsers, getAllUsers } = loadAllUsers()
const form = reactive({ user_id: userStore.id, collection_ids: [], id: connectionAddress(props.peer), alias: props.peer.alias || props.peer.hostname || '', tags: [] })
const collections = ref([])
const loading = ref(false)
const saving = ref(false)
const loadCollections = async () => {
  form.collection_ids = []
  collections.value = []
  if (props.scope === 'admin' && !form.user_id) return
  loading.value = true
  const res = await (props.scope === 'admin' ? adminCollections : myCollections)({ user_id: form.user_id, page: 1, page_size: 9999 }).catch(() => false)
  if (res) collections.value = res.data.list || []
  loading.value = false
}
onMounted(async () => {
  if (props.scope === 'admin') {
    await getAllUsers()
    form.user_id = allUsers.value.find(u => u.username === userStore.username)?.id
  }
  await loadCollections()
})
const submit = async () => {
  if (!form.collection_ids.length || !form.id.trim() || (props.scope === 'admin' && !form.user_id)) {
    ElMessage.error(T('ParamRequired', { param: T('AddressBookName') + ' / ' + T('ConnectionAddress') }))
    return
  }
  saving.value = true
  const res = await (props.scope === 'admin' ? adminCopy : myCopy)(bookCopyPayload(props.peer, { ...form, id: form.id.trim() })).catch(() => false)
  saving.value = false
  if (res) { ElMessage.success(T('OperationSuccess')); emit('success') }
}
</script>
