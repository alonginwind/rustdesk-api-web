<template>
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="80px">
        <el-form-item :label="T('Peer')">
          <el-input v-model="listQuery.peer_id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="T('FromPeer')">
          <el-input v-model="listQuery.from_peer" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlerQuery">{{ T('Filter') }}</el-button>
          <el-button type="danger" @click="toBatchDelete">{{ T('BatchDelete') }}</el-button>
          <el-button type="success" @click="toExport">{{ T('Export') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <el-table :data="listRes.list" v-loading="listRes.loading" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" width="50"/>
        <el-table-column prop="id" label="ID" align="center" width="100"/>
        <el-table-column :label="T('Peer')" prop="peer_id" align="center" width="120"/>
        <el-table-column :label="T('FromPeer')" prop="from_peer" align="center" width="120"/>
        <el-table-column :label="T('FromName')" prop="from_name" align="center" width="120"/>
        <el-table-column :label="T('Ip')" prop="ip" align="center" width="120"/>
        <el-table-column prop="type" :label="T('Type')" align="center" width="120">
          <template #default="{row}">
            <el-tag :type="connTypeTag[row.type] ?? 'info'">{{ connTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="T('AuthMethod')" align="center" width="180">
          <template #default="{row}">
            <div class="auth-tags">
              <el-tag v-for="(text, i) in connAuthTexts(row)" :key="i" size="small" type="info">
                {{ text }}
              </el-tag>
            </div>
            <span v-if="!row.primary_auth && !row.two_factor">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="conn_id" :label="T('ConnId')" align="center" width="90"/>
        <el-table-column prop="uuid" label="uuid" align="center" width="120" show-overflow-tooltip/>
        <el-table-column prop="created_at" :label="T('CreatedAt')" align="center"/>
        <el-table-column :label="T('CloseTime')" prop="close_time" align="center"/>
        <el-table-column :label="T('Actions')" align="center" width="150">
          <template #default="{row}">
            <el-button type="danger" @click="del(row)">{{ T('Delete') }}</el-button>
          </template>
        </el-table-column>
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
  import { onActivated, onMounted, ref, watch } from 'vue'
  import { useRepositories } from '@/views/audit/reponsitories'
  import { T } from '@/utils/i18n'
  import { useIsMobile } from '@/utils/useIsMobile'
  const isMobile = useIsMobile()

  // The controlled side reports the session kind and how it was authorized, the
  // codes being the ones in its connection audit. An unmapped code still shows
  // its number, so a kind added later is visible rather than read as a desktop
  // session or as a connection nobody authenticated. Zero is the absence of a
  // report, which is why it maps to nothing below and not to "#0".
  const connTypeKey = { 0: 'RemoteDesktop', 1: 'File', 2: 'PortForward', 3: 'Rdp', 4: 'ViewCamera', 5: 'Terminal' }
  const connTypeTag = { 0: 'primary', 1: 'warning', 2: 'info', 3: 'success', 4: 'danger', 5: '' }
  const connAuthKey = { 1: 'AuthClick', 2: 'OncePassword', 3: 'FixedPassword', 4: 'AuthSwitchSides' }
  const connTwoFactorKey = { 1: 'Totp', 2: 'TrustedDevice' }
  const connTypeText = (type) => connTypeKey[type] ? T(connTypeKey[type]) : `#${type}`
  const connAuthTexts = (row) => {
    return [[connAuthKey, row.primary_auth], [connTwoFactorKey, row.two_factor]]
      .filter(([, code]) => code)
      .map(([map, code]) => map[code] ? T(map[code]) : `#${code}`)
  }

  const {
    listRes,
    listQuery,
    getList,
    handlerQuery,
    del,
    batchdel,
    toExport,
  } = useRepositories()

  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)

  watch(() => listQuery.page_size, handlerQuery)
  const multipleSelection = ref([])
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  const toBatchDelete = () => {
    if (multipleSelection.value.length === 0) {
      return
    }
    batchdel(multipleSelection.value)
  }
</script>

<style scoped lang="scss">
  .auth-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
  }
</style>
