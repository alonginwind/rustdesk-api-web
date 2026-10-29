# Peer address/book development

Branch: `feat/peer-address-books`. Local only; no PR submitted. Requires the matching backend branch from `korsun009/rustdesk-api`, database version 275. Do not install this frontend alone on the unmodified v4.1.8 backend.

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
