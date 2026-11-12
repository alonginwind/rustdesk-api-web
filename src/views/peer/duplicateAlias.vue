<template>
  <div>
    <el-card v-if="teamModeOn" class="list-body" shadow="hover">
      <el-alert class="list-tip" type="warning" show-icon :closable="false"
                :title="T('DuplicateAliasTip', { count: String(listRes.total) })">
      </el-alert>
      <el-table :data="listRes.list" v-loading="listRes.loading" border size="small">
        <el-table-column prop="id" label="ID" align="center" width="120">
          <template #default="{row}">
            <span>{{ row.id }} <el-icon @click="handleClipboard(row.id, $event)"><CopyDocument/></el-icon></span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" prop="cpu" label="CPU" align="center" width="80" show-overflow-tooltip/>
        <el-table-column prop="hostname" :label="T('Hostname')" align="center" width="120" show-overflow-tooltip/>
        <el-table-column v-if="!isMobile" prop="memory" :label="T('Memory')" align="center" width="80"/>
        <el-table-column prop="os" :label="T('Os')" align="center" width="120" show-overflow-tooltip/>
        <el-table-column prop="last_online_time" :label="T('LastOnlineTime')" align="center" min-width="120">
          <template #default="{row}">
            <div class="last_oline_time">
              <span> {{ row.last_online_time ? timeAgo(row.last_online_time * 1000) : '-' }}</span> <span class="dot" :class="{red: timeDis(row.last_online_time) >= 60, green: timeDis(row.last_online_time)< 60}"></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="last_online_ip" :label="T('LastOnlineIp')" align="center" width="120"/>
        <el-table-column prop="username" :label="T('Username')" align="center" width="120" show-overflow-tooltip/>
        <el-table-column prop="group_id" :label="T('Group')" align="center" width="40">
          <template #default="{row}">
            <span v-if="row.group_id"> <el-tag>{{ groupListRes.list?.find(g => g.id === row.group_id)?.name }} </el-tag> </span>
            <span v-else> - </span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" prop="uuid" :label="T('Uuid')" align="center" width="100" show-overflow-tooltip/>
        <el-table-column prop="version" :label="T('Version')" align="center" width="80"/>
        <el-table-column prop="alias" :label="T('Alias')" align="center" width="240" show-overflow-tooltip/>
        <el-table-column v-if="!isMobile" prop="created_at" :label="T('CreatedAt')" align="center" width="150"/>
        <el-table-column v-if="!isMobile" prop="updated_at" :label="T('UpdatedAt')" align="center" width="150"/>
        <el-table-column :label="T('Actions')" align="center" class-name="table-actions" :width="isMobile ? 80 : 260" fixed="right">
          <template #default="{row}">
            <MobileActions v-if="isMobile" :items="peerActions(row)" @command="(cmd) => handlePeerAction(cmd, row)" />
            <template v-else>
              <el-button type="success" @click="connectByClient(deviceAddress(row))">{{ T('Link') }}</el-button>
              <el-button v-if="appStore.setting.appConfig.web_client" type="success" @click="toWebClientLink(row)">Web Client</el-button>
              <el-button @click="toView(row)">{{ T('View') }}</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card v-if="teamModeOn" class="list-page" shadow="hover">
      <el-pagination background
                     layout="prev, pager, next, sizes, jumper"
                     :page-sizes="[10,20,50,100]"
                     :pager-count="isMobile ? 5 : 7"
                     v-model:page-size="listQuery.page_size"
                     v-model:current-page="listQuery.page"
                     :total="listRes.total">
      </el-pagination>
    </el-card>

    <el-card v-if="!teamModeOn && appStore.setting.appConfigLoaded" class="list-body" shadow="hover">
      <el-empty :description="T('TeamModeOnly')"/>
    </el-card>

    <el-dialog v-model="viewFormVisible" :title="T('Information')" :width="isMobile ? '95%' : 800" :style="{ textAlign: 'center' }">
      <el-form class="dialog-form" :model="viewFormData" label-width="120px">
        <el-form-item label="ID" prop="id">
          <el-input v-model="viewFormData.id" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Username')" prop="username">
          <el-input v-model="viewFormData.username" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Hostname')" prop="hostname">
          <el-input v-model="viewFormData.hostname" disabled></el-input>
        </el-form-item>
        <el-form-item label="CPU" prop="cpu">
          <el-input v-model="viewFormData.cpu" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Memory')" prop="memory">
          <el-input v-model="viewFormData.memory" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Os')" prop="os">
          <el-input v-model="viewFormData.os" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Uuid')" prop="uuid">
          <el-input v-model="viewFormData.uuid" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Version')" prop="version">
          <el-input v-model="viewFormData.version" disabled></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
  import { computed, onActivated, onMounted, reactive, ref, watch } from 'vue'
  import { duplicateAlias } from '@/api/peer'
  import { list as groupList } from '@/api/device_group'
  import { T } from '@/utils/i18n'
  import { timeAgo } from '@/utils/time'
  import { CopyDocument } from '@element-plus/icons'
  import { handleClipboard } from '@/utils/clipboard'
  import { useIsMobile } from '@/utils/useIsMobile'
  import { useAppStore } from '@/store/app'
  import { connectByClient } from '@/utils/peer'
  import { toWebClientLink } from '@/utils/webclient'
  import { connectionAddress, deviceAddressBooksEnabled, teamModeEnabled } from '@/utils/peerBooks.mjs'
  import MobileActions from '@/components/mobileActions.vue'

  const isMobile = useIsMobile()
  const appStore = useAppStore()
  const enhanced = computed(() => deviceAddressBooksEnabled(appStore.setting.appConfig))
  // This report is only meaningful in team mode, where every member shares the admin books.
  const teamModeOn = computed(() => appStore.setting.appConfigLoaded && teamModeEnabled(appStore.setting.appConfig))
  const deviceAddress = row => enhanced.value ? connectionAddress(row) : row.id

  const listRes = reactive({
    list: [], total: 0, loading: false,
  })
  const listQuery = reactive({
    page: 1,
    page_size: 10,
  })

  const getList = async () => {
    if (!teamModeOn.value) {
      return
    }
    listRes.loading = true
    const res = await duplicateAlias(listQuery).catch(_ => false)
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

  //group
  const groupListRes = reactive({
    list: [], total: 0, loading: false,
  })
  const getGroupList = async () => {
    groupListRes.loading = true
    const res = await groupList({ page: 1, page_size: 999 }).catch(_ => false)
    groupListRes.loading = false
    if (res) {
      groupListRes.list = res.data.list
      groupListRes.total = res.data.total
    }
  }

  const timeDis = (time) => {
    let now = new Date().getTime()
    let after = new Date(time * 1000).getTime()
    return (now - after) / 1000
  }

  // Actions are read-only: the device list itself owns adding to books and deleting.
  const peerActions = (row) => {
    const items = [
      { label: T('Link'), command: 'link' },
    ]
    if (appStore.setting.appConfig.web_client) {
      items.push({ label: 'Web Client', command: 'webClient' })
    }
    items.push({ label: T('View'), command: 'view' })
    return items
  }
  const handlePeerAction = (cmd, row) => {
    switch (cmd) {
      case 'link': connectByClient(deviceAddress(row)); break
      case 'webClient': toWebClientLink(row); break
      case 'view': toView(row); break
    }
  }

  const viewFormVisible = ref(false)
  const viewFormData = reactive({
    id: '',
    username: '',
    hostname: '',
    cpu: '',
    memory: '',
    os: '',
    uuid: '',
    version: '',
  })
  const toView = (row) => {
    viewFormVisible.value = true
    Object.keys(viewFormData).forEach(key => {
      viewFormData[key] = row[key]
    })
  }

  onMounted(getGroupList)
  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)
  watch(() => listQuery.page_size, handlerQuery)
  watch(teamModeOn, value => {
    if (value) {
      getList()
    }
  })
</script>

<style scoped lang="scss">
.list-tip {
  margin-bottom: 10px;
}

.last_oline_time {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  display: block;
  border-radius: 50%;
  margin-left: 10px;

  &.red {
    background-color: red;
  }

  &.green {
    background-color: green;
  }
}
</style>
