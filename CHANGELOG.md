# CHANGELOG

## Emoji Cheatsheet
- :pencil2: doc updates
- :bug: when fixing a bug
- :rocket: when making general improvements
- :white_check_mark: when adding tests
- :arrow_up: when upgrading dependencies
- :tada: when adding new features

## Version History

### Pending Release

- :tada: `API`: Documents are now tracked in a `docs` table (migration `0040`) and stored on S3 in a flat `docs/<uuid><ext>` structure, following the CloudTAK v11.0.0 profile file migration. Folders exist only in the database, so renaming or moving a document or an entire folder tree never touches S3. DEPLOY NOTE: the `migrations/docs-uuid` script must be run after deploying and the resultant `migration.sql` applied to the database - existing `documents/` objects are copied, not moved, so a rollback remains possible
- :tada: `API`: `GET /doc` is searchable - `filter` matches file & folder names without being treated as a regular expression, `recursive` includes everything beneath `path`, and the listing is paged & sortable with folders first. The folder being listed is returned as `folder` and a missing folder is a `404`
- :rocket: `API`: Docs are addressed by UUID - add `GET /doc/:docid`, `PATCH /doc/:docid` (rename/move), `DELETE /doc/:docid` (recursive for folders), `GET /doc/:docid/raw` & `POST /doc/:docid/convert`, replacing `GET /doc/download`, `GET /doc/convert` & `DELETE /doc?file=`. `POST /doc` & `POST /doc/folder` take a `path`, return the created doc, and uploading over an existing name replaces its contents while keeping its UUID. PDF previews are recorded as a `.preview.pdf` artifact
- :bug: `API`: Doc write routes required `Doc:Manage`, a level the `Doc` IAM group does not define, so only server admins could ever manage documents. They now require `Doc:Admin`
- :bug: `API`: The token handed to the PDF conversion service carried the user id and was accepted as a 30 minute session for that user. It is now scoped to the single doc being converted. Only images & PDFs are served inline, everything else is forced to download, and the preview upload is awaited instead of being fired and forgotten
- :tada: `UI`: Documents search covers the current folder and everything beneath it, showing the folder of each result. Files & folders can be renamed or moved, folder deletion (previously a no-op) works and requires typing the folder name, and the folder & open file live in the URL so the browser back button & shared links work
- :bug: `API`: `PATCH /application/:applicationid` was missing its permission check and could be called without logging in. It now requires `Application:Manage`
- :bug: `UI`: Paging was broken on every list after the `@tak-ps/vue-tabler` upgrade - `TablerPager` is now a controlled component and `TableFooter` never passed it the current page, so the highlight never moved, the first page could not be returned to and later pages were unreachable. Lists also return to the first page when their filters change
- :tada: `API`: Application lifecycle - applications carry a `status` (submitted, reviewing, interview, accepted, onboarded, declined, withdrawn, closed) in place of `archived`, a `cohort` in place of `group`, an `assigned` reviewer and the `user_id` of the member they became. Form answers move from `meta` to `answers` and are returned nested instead of being flattened onto the application
- :tada: `API`: Add `GET /application/:applicationid/event` - status, reviewer, cohort, member link & edit changes are recorded as timeline events, and the assigned reviewer is notified of status changes
- :rocket: `API`: `POST /application` remains the only public application route. Applicants can no longer set their own `group`, lifecycle fields are ignored, applicants are emailed a confirmation and applications sharing an email or phone are flagged as possible duplicates
- :rocket: `API`: `GET /application` filters by `status` (or the `active`, `inactive` & `all` groupings), `cohort` & `assigned`, searches name, email & phone without treating the filter as a regular expression, and returns per status `counts`
- :rocket: `API`: Migration `0039` unwraps string encoded answers & form snapshots, strips NULL bytes, removes `group` from the application form, and backfills `status` - archived applications matching exactly one member by email or phone become `onboarded` and are linked, the rest become `closed`
- :tada: `UI`: Applications list gains status tabs with counts, cohort & reviewer filters and reviewer, comment count & last activity columns
- :tada: `UI`: Application page gains a lifecycle panel (next step actions with an optional note, reviewer, cohort, linked member, possible duplicates), a single timeline of comments & events, and a `Create Member` action that prefills the new user form and marks the application onboarded
- :bug: `API`: Remove the `express-minify` runtime minifier. Its clean-css pass stripped the empty `--lightningcss-dark` custom properties that Vite emits for Tabler's `light-dark()` colours, turning every card & surface transparent in production. Vite already minifies the build
- :arrow_up: `API`: Production image now builds and runs on Node.js 26
- :rocket: `API`: Drop the `username` paradigm - users are identified by `email` alone. `POST /login` & `POST /login/forgot` take `email`, `username` is removed from user create/update bodies & all user/assignment responses, and the `login_username_label` branding key becomes `login_email_label` (migrated in place)
- :rocket: `UI`: Remove the Username field from the new/edit user forms & profile page; the login and forgot-password forms ask for an email
- :tada: `API`: Add Issue Tags (`/issue-tag`) with the same SVG logo & badge colours as Mission/Training Tags; issues carry `tags`, `tags_id`, `assigned_ids` & a `comments` count and accept `tags` on create/update
- :tada: `API`: `GET /issue` gains `tag`, `author` & `poll` filters, `status=all`, and text search across title & body
- :tada: `UI`: Add an Issue Tags admin section, tag pickers on the new/edit issue pages and inline tag management on the issue page
- :rocket: `UI`: Redesign the Issues list as filterable cards with status, tag, assignee & author filters synced to the URL, and restyle the issue page & comments to match Missions
- :tada: `API`: `GET /mission` gains rich filtering - text search across title, body, location & mission number, plus `tag`, `team`, `agency`, `user` (attendees), `status`, `geom`, `incidents`, `people`, `users_min` & `users_max`. `team` now accepts a comma separated list
- :tada: `UI`: New Missions search & filter panel with quick filters, date presets, tag/team/agency badge pickers, attendee search, personnel range, map-location filter, sort options and removable filter chips
- :rocket: `UI`: Mission filters are synced to the URL for shareable links and drive the Mission Heat Map so map and list always agree
- :tada: `API`: Mission & Training Tags gain an SVG logo (`icon`) and badge colours (`colour_bg`, `colour_txt`), returned inline on Mission & Training `tags`
- :tada: `UI`: Redesigned Mission & Training Tag admin pages - tags are listed as the badges they render as and edited in a modal with name, SVG logo upload, colour pickers, a swatch palette and live preview
- :rocket: `UI`: Tags render as coloured badges with their logo on Mission & Training pages, list items and the tag pickers on the edit pages
- :rocket: `UI`: Equipment Type schemas are now edited with the visual TablerSchemaBuilder, with a raw JSON mode retained for advanced schemas. Existing schemas load unchanged and unknown keys are preserved on save
- :tada: `API`: Server branding can now be configured at the server level - application title, logo, large login-page brand logo, login background colour, username label and account request contact are stored as public server config
- :tada: `API`: Add `GET /config/brand` returning the resolved branding (with defaults) for unauthenticated consumers
- :tada: `UI`: Branding is applied across the application header, the login page and the public application form
- :rocket: `UI`: Redesign the Server Settings page into collapsible Organisation, Branding, Login & Single Sign-On and Slack sections that mirror the CloudTAK AdminConfig components with per-section edit/save/cancel
- :rocket: `UI`: The login page "Contact Us" link is now driven by the configurable account request contact and hidden when unset
- :tada: `API`: Rolodex items now carry a type (person, place or thing), title, organization, website, address, tags, map location and author
- :tada: `API`: Rolodex items can have a photo attached via `POST /rolodex/:id/profile` (stored in Spaces alongside equipment & user photos)
- :tada: `API`: Rolodex items can be shared with one or more agencies; members only see items shared with their agencies (or shared org-wide)
- :tada: `API`: Add `DELETE /rolodex/:id`, `GET /rolodex/tags`, and type/tag/agency/archived filters on `GET /rolodex`
- :tada: `UI`: Rolodex list gains a grid view with photos, plus type, agency, tag and archived filters
- :tada: `UI`: Dedicated Rolodex view page and a fuller edit page with photo upload, tags, agency sharing and a map location picker
- :rocket: `API`: Replace Swagger UI with Scalar API Reference served from the web build at `/docs`, backed by `/api/openapi`

### v1.1.2

- :bug: `API`: Fix Calendar Token usage

### v1.1.1

- :rocket: `API`: Set X-Frame-Options to Same-Origin to allow document viewer

### v1.1.0

- :rocket: `UI`: Add `attendance` option for showing the viewing user's attendance if true for Mission Card
- :rocket: `UI`: Add `attendance` option for showing the viewing user's attendance if true for Training Card

