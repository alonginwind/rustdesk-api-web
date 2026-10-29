export const connectionAddress = (peer) => peer.connection_address || peer.id

// Copy values, never bind a book's editable destination to the device default.
export const bookCopyPayload = (peer, form) => ({
  peer_ids: [peer.row_id],
  user_id: form.user_id,
  collection_ids: [...new Set(form.collection_ids)],
  connection_address: form.id || connectionAddress(peer),
  alias: form.alias,
  tags: [...(form.tags || [])],
})
