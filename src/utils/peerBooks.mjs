// Missing capability (including older backends) always selects legacy behavior.
export const deviceAddressBooksEnabled = (config) => config?.device_address_books === true

// Team mode pins every member to the admin's books, so member-level batch book operations are hidden.
export const teamModeEnabled = (config) => config?.team_mode === true

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
