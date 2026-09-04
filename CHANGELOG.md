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

