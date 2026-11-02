<template>
  <div v-if="peer.book_memberships?.length" class="book-aliases">
    <div v-for="entry in peer.book_memberships" :key="entry.row_id">
      <strong>{{ entry.alias || entry.connection_address }}</strong>
      <div class="book-context">{{ entry.collection_name || T('MyAddressBook') }} · #{{ entry.user_id }}</div>
    </div>
  </div>
  <span v-else>—</span>
</template>
<script setup>
import { T } from '@/utils/i18n'
defineProps({ peer: { type: Object, required: true } })
</script>
<style scoped>
.book-aliases { display: grid; gap: 8px; text-align: left; overflow-wrap: anywhere; }
.book-context { font-size: 12px; opacity: .7; }
</style>
