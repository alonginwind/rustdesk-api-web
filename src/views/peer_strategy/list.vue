<template>
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="listQuery.peer_id" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlerQuery">{{ T('Filter') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-body" shadow="hover">
      <el-table :data="tableData" v-loading="listRes.loading" border>
        <el-table-column prop="peer_id" label="ID" align="center" width="200">
          <template #default="{row}">
            <span v-if="row.peer_id">{{ row.peer_id }}</span>
            <span v-else>{{ T('DefaultStrategy') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="peer_alias" :label="T('Alias')" align="center" width="150" show-overflow-tooltip>
          <template #default="{row}">
            <span>{{ row.peer_alias || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="T('ConfigOptions')" align="center" min-width="300" show-overflow-tooltip>
          <template #default="{row}">
            <span v-if="row.config_options && Object.keys(row.config_options).length">
              {{ formatConfigOptions(row.config_options) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="modified_at" :label="T('ModifiedAt')" align="center" width="180">
          <template #default="{row}">
            {{ row.modified_at ? formatTime(row.modified_at) : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="T('Actions')" align="center" :width="isMobile ? 100 : 200" fixed="right">
          <template #default="{row}">
            <MobileActions v-if="isMobile" :items="getMobileActions(row)" @command="(cmd) => handleAction(cmd, row)" />
            <template v-else>
              <el-button type="primary" @click="toEdit(row)">{{ T('Edit') }}</el-button>
              <el-button v-if="row.peer_id" type="danger" @click="del(row)">{{ T('Delete') }}</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="list-page" shadow="hover" v-if="!isDefaultOnly">
      <el-pagination background
                     layout="prev, pager, next, sizes, jumper"
                     :page-sizes="[10,20,50,100]"
                     :pager-count="isMobile ? 5 : 7"
                     v-model:page-size="listQuery.page_size"
                     v-model:current-page="listQuery.page"
                     :total="listRes.total">
      </el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" :title="T('Edit')" :width="isMobile ? '95%' : 600">
      <el-form class="dialog-form" :label-width="isMobile ? '80px' : '120px'">
        <el-form-item label="ID">
          <el-input v-model="editForm.peer_id" disabled />
        </el-form-item>

        <el-divider content-position="left">{{ T('ConfigOptions') }}</el-divider>

        <div v-for="(item, index) in editConfigOptions" :key="index" class="config-option-row">
          <el-input v-model="item.key" :placeholder="T('OptionKey')" style="width: 180px" />
          <el-input v-model="item.value" :placeholder="T('OptionValue')" style="width: 180px" />
          <el-button type="danger" :icon="Delete" circle @click="removeEditOption(index)" />
        </div>
        <el-form-item>
          <el-button type="primary" @click="addEditOption" :icon="Plus">{{ T('AddOption') }}</el-button>
        </el-form-item>

        <el-form-item>
          <el-button @click="editDialogVisible = false">{{ T('Cancel') }}</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitting">{{ T('Save') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
  import { onMounted, reactive, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import { list as strategyList, update, remove, getDefault, updateDefault } from '@/api/peer_strategy'
  import { T } from '@/utils/i18n'
  import { useIsMobile } from '@/utils/useIsMobile'
  import MobileActions from '@/components/mobileActions.vue'

  const isMobile = useIsMobile()

  const listRes = reactive({
    list: [],
    total: 0,
    loading: false,
  })
  const listQuery = reactive({
    page: 1,
    page_size: 10,
    peer_id: '',
  })

  const defaultStrategy = ref(null)
  const isDefaultOnly = ref(false)

  // 获取表格数据（默认策略 + 列表）
  const tableData = ref([])

  const getList = async () => {
    listRes.loading = true

    // 获取默认策略
    const defaultRes = await getDefault().catch(_ => false)
    if (defaultRes && defaultRes.data) {
      defaultStrategy.value = defaultRes.data
    } else {
      defaultStrategy.value = null
    }

    // 获取列表
    const res = await strategyList(listQuery).catch(_ => false)
    listRes.loading = false
    if (res) {
      listRes.list = res.data.list || []
      listRes.total = res.data.total || 0

      // 组合数据：默认策略在前
      tableData.value = []
      if (defaultStrategy.value) {
        tableData.value.push(defaultStrategy.value)
      }
      tableData.value = tableData.value.concat(listRes.list)
    }
  }

  const handlerQuery = () => {
    if (listQuery.page === 1) {
      getList()
    } else {
      listQuery.page = 1
    }
  }

  const formatConfigOptions = (opts) => {
    if (typeof opts === 'string') {
      try {
        opts = JSON.parse(opts)
      } catch (e) {
        return opts
      }
    }
    if (typeof opts === 'object') {
      return Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join(', ')
    }
    return String(opts)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // 移动端操作
  const getMobileActions = (row) => {
    const items = [{ label: T('Edit'), command: 'edit' }]
    if (row.peer_id) {
      items.push({ label: T('Delete'), command: 'delete', color: '#F56C6C' })
    }
    return items
  }

  const handleAction = (cmd, row) => {
    switch (cmd) {
      case 'edit': toEdit(row); break
      case 'delete': del(row); break
    }
  }

  // 编辑
  const editDialogVisible = ref(false)
  const editForm = reactive({
    id: 0,
    peer_id: '',
  })
  const editConfigOptions = ref([])
  const submitting = ref(false)

  const toEdit = (row) => {
    editForm.id = row.id || 0
    editForm.peer_id = row.peer_id || ''
    editConfigOptions.value = []

    let opts = row.config_options || {}
    if (typeof opts === 'string') {
      try { opts = JSON.parse(opts) } catch (e) { opts = {} }
    }
    Object.keys(opts).forEach(key => {
      editConfigOptions.value.push({ key, value: opts[key] })
    })
    editDialogVisible.value = true
  }

  const addEditOption = () => {
    editConfigOptions.value.push({ key: '', value: '' })
  }

  const removeEditOption = (index) => {
    editConfigOptions.value.splice(index, 1)
  }

  const submitEdit = async () => {
    submitting.value = true
    const configOptions = {}
    editConfigOptions.value.forEach(item => {
      if (item.key) {
        configOptions[item.key] = item.value
      }
    })

    let res
    if (!editForm.peer_id) {
      // 默认策略
      res = await updateDefault({ config_options: configOptions }).catch(_ => false)
    } else {
      // 更新普通策略
      res = await update({
        id: editForm.id,
        peer_id: editForm.peer_id,
        config_options: configOptions,
      }).catch(_ => false)
    }
    submitting.value = false
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      editDialogVisible.value = false
      getList()
    }
  }

  // 删除
  const del = async (row) => {
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('Delete') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) return

    const res = await remove({ id: row.id }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      getList()
    }
  }

  onMounted(getList)
  watch(() => listQuery.page, getList)
  watch(() => listQuery.page_size, handlerQuery)
</script>

<style scoped lang="scss">
.list-query .el-select {
  --el-select-width: 160px;
}

.config-option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  margin-left: 20px;
}

@media (max-width: 1024px) {
  .config-option-row {
    flex-wrap: wrap;
    margin-left: 0;
  }
  .config-option-row .el-input {
    width: 100% !important;
  }
}
</style>
