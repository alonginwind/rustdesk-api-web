# Peer address/book development

## Deployment capability

The API deployment controls the scheme with `app.device-address-books: true`
(or `RUSTDESK_API_APP_DEVICE_ADDRESS_BOOKS=true`). It defaults to false.
The panel reads `device_address_books` from `/api/admin/config/app`; this is
read-only and shared by every account. There is no browser/user toggle.

When false, missing (older backend), or unavailable, the panel uses the original
peer/book forms, single-book selection, ID labels, global aliases and registered
ID links. New device-address editing and association selectors are hidden; book
forms do not fetch the new association inventory or send new-mode fields.
New-mode personal forms wait for configuration before mounting. Turning the
option on shows the enhanced scheme described below.

`npm run test:browser` runs both the enhanced and legacy contracts, including
explicit false, missing capability and failed configuration. These synthetic
browser tests exercise single-book submission and prove that disabled forms
do not call the new editor or load association inventory. Backend tests cover
both schemes independently; no production data is used.

The enhanced mode requires the matching backend with database version 275 and the deployment capability enabled. Older backends use the legacy UI.

The peer table shows all accessible book aliases, with book/owner context, and a separately editable connection address. Empty device defaults use the registered RustDesk ID. Adding to books copies that address into independent contact records; later book edits do not change the device default or other books.

The admin form selects an owner and multiple books; the personal form has no owner selector. Repeating a copy preserves existing local destinations/aliases. The existing batch selection supports multiple books as well. Book contact destination fields are labelled Connection address. An optional Linked device selection associates legacy direct-address contacts with a device without rewriting their destination.

New strings have Russian and English wording; other supported languages use English for the new strings until translated. Existing translations are preserved.

## Local checks

```powershell
npm install --no-audit --no-fund
npm test
npm run build
node tests/serve-built.cjs
```

In another terminal, set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is not available by normal Node resolution, and optionally `UI_EVIDENCE` to an existing folder for screenshots. Then run:

```powershell
npm run test:browser
```

The static server binds only loopback port 18888, does not proxy APIs and does not open a browser. Override `UI_PORT` and matching `UI_URL` if needed. The smoke test intercepts API requests with synthetic data and a fixture token. It verifies both peer views, all aliases, editable default address, multi-book selection, default book 0, independent book address edits, and JavaScript errors. It never connects a RustDesk session or uses real credentials.

Backend HTTP/SQLite tests independently verify authorization and persistence. Production/client acceptance remains a separate step after packaging a matched backend/frontend release and a protected backup.
