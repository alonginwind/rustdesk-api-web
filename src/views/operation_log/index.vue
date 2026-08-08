<template>
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="80px">
        <el-form-item :label="T('Operator')">
          <el-input v-model="listQuery.username" clearable></el-input>
        </el-form-item>
        <el-form-item :label="T('Resource')">
          <el-input v-model="listQuery.resource" clearable></el-input>
        </el-form-item>
        <el-form-item :label="T('Op')">
          <el-input v-model="listQuery.op" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlerQuery">{{ T('Filter') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <el-table :data="listRes.list" v-loading="listRes.loading" border>
        <el-table-column prop="id" label="ID" align="center" width="70"/>
        <el-table-column :label="T('Operator')" prop="username" align="center" width="100"/>
        <el-table-column :label="T('Description')" min-width="300">
          <template #default="{row}">
            <span>{{ formatDesc(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="T('Ip')" prop="ip" align="center" width="130"/>
        <el-table-column prop="created_at" :label="T('CreatedAt')" align="center" width="170"/>
      </el-table>
    </el-card>
    <el-card class="list-page" shadow="hover">
      <el-pagination background
                     layout="prev, pager, next, sizes, jumper"
                     :page-sizes="[10,20,50,100]"
                     :pager-count="isMobile ? 5 : 7"
                     v-model:page-size="listQuery.page_size"
                     v-model:current-page="listQuery.page"
                     :total="listRes.total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
  import { onActivated, onMounted, reactive, watch } from 'vue'
  import { list } from '@/api/operation_log'
  import { T } from '@/utils/i18n'
  import { useIsMobile } from '@/utils/useIsMobile'
  const isMobile = useIsMobile()

  const listRes = reactive({
    list: [], total: 0, loading: false,
  })
  const listQuery = reactive({
    page: 1,
    page_size: 10,
    username: '',
    resource: '',
    op: '',
  })

  const getList = async () => {
    listRes.loading = true
    const res = await list(listQuery).catch(_ => false)
    listRes.loading = false
    if (res) {
      listRes.list = res.data.list
      listRes.total = res.data.total
    }
  }

  const handlerQuery = () => {
    if (listQuery.page === 1) {
      getList()
    } else {
      listQuery.page = 1
    }
  }

  const resourceMap = {
    user: T('ResUser'), group: T('ResGroup'), device_group: T('ResDeviceGroup'), tag: T('ResTag'),
    peer: T('ResPeer'), address_book: T('ResAddressBook'), address_book_collection: T('ResAddressBookCollection'),
    address_book_collection_rule: T('ResAddressBookCollectionRule'), oauth: T('ResOauth'),
    login_log: T('ResLoginLog'), audit_conn: T('ResAuditConn'), audit_file: T('ResAuditFile'),
    user_token: T('ResUserToken'), share_record: T('ResShareRecord'), rustdesk: T('ResRustdesk'),
    config: T('ResConfig'), peer_strategy: T('ResPeerStrategy'),
  }
  const opMap = {
    create: T('OpCreate'), update: T('OpUpdate'), delete: T('OpDelete'),
    batch_delete: T('OpBatchDelete'), batch_create: T('OpBatchCreate'), batch_update: T('OpBatchUpdate'),
    change_cur_pwd: T('OpChangeCurPwd'), change_pwd: T('OpChangePwd'), update_password: T('OpUpdatePassword'),
    send_cmd: T('OpSendCmd'), cmd_create: T('OpCmdCreate'), cmd_delete: T('OpCmdDelete'), cmd_update: T('OpCmdUpdate'),
    bind: T('OpBind'), unbind: T('OpUnbind'), confirm: T('OpConfirm'),
    to_bind: T('OpToBind'), bind_confirm: T('OpBindConfirm'),
    share_by_web_client: T('OpShareByWebClient'), batch_create_from_peers: T('OpBatchCreateFromPeers'),
    batch_update_tags: T('OpBatchUpdateTags'), default_update: T('OpDefaultUpdate'),
  }

  const formatDesc = (row) => {
    const r = resourceMap[row.resource] || row.resource
    const o = opMap[row.op] || row.op
    let desc = `${r} ${o}`
    if (row.detail) {
      try {
        const d = JSON.parse(row.detail)
        const parts = []
        if (d.id) parts.push(`ID:${d.id}`)
        if (d.row_id) parts.push(`ID:${d.row_id}`)
        if (d.ids) parts.push(`ID:${d.ids.join(',')}`)
        if (d.name) parts.push(`${T('DetailName')}:${d.name}`)
        if (d.alias) parts.push(`${T('DetailAlias')}:${d.alias}`)
        if (d.username) parts.push(`${T('DetailUsername')}:${d.username}`)
        if (d.hostname) parts.push(`${T('DetailHostname')}:${d.hostname}`)
        if (d.collection_id) parts.push(`${T('DetailCollectionId')}:${d.collection_id}`)
        if (parts.length) desc += ` (${parts.join(', ')})`
      } catch (_) { /* ignore */ }
    }
    return desc
  }

  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)
  watch(() => listQuery.page_size, handlerQuery)
</script>

<style scoped lang="scss">
.list-query .el-input {
  --el-input-width: 150px;
}
</style>
