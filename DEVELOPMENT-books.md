# Independent peer addresses and address books

Requires the matching API changes with database schema 275. A new frontend must be installed together with the matching backend.

The peer table shows every readable book alias with its book/owner context and a separately editable connection address. Empty device defaults use the registered RustDesk ID. Adding a device copies its effective address into independent contacts; editing a contact does not change the device default or other books.

Administrators can choose an owner and several books. Personal forms always use the authenticated owner. Repeated copies preserve existing local addresses and aliases. The batch form also supports multiple books. Contact destination fields are labelled Connection address; the actual registered ID remains separate. An optional Linked device selection lets an existing direct-address contact appear among that device's aliases without rewriting its destination.

New strings include Russian/English wording; other supported languages use English for these new strings until translated. Existing translations are preserved.

## Checks

Run `npm install`, `npm test`, and `npm run build`.
For the synthetic browser check, run `node tests/serve-built.cjs`, then `npm run test:browser` in another terminal. Set `PLAYWRIGHT_MODULE` to an installed Playwright module if normal Node resolution does not find it; `UI_EVIDENCE` selects the screenshot folder.

The test server binds only loopback, does not proxy APIs and does not open a browser. The Playwright test uses synthetic responses and no real credentials. It covers both peer views, all aliases, editing the default address, copying to several books including book 0, and independent contact edits. Server authorization/persistence is tested separately by the matching backend HTTP/SQLite suite.
