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

