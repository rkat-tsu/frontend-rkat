# Copilot / AI Agent Instructions for Sistem RKAT

Purpose: quick, actionable notes to help an AI code assistant be productive in this Laravel + Inertia + React codebase.

- **Big picture:** Backend is Laravel (models in `app/Models`, controllers in `app/Http/Controllers`). Frontend uses Inertia + React compiled by Vite (`resources/js` → `vite.config.js`, `package.json`). Data model centers on `rkat_headers` (document) → `rkat_details` (activities) → `rkat_rab_items` (line items). Approval history is in `log_persetujuans`.

- **Key files to inspect:**
  - `app/Http/Controllers/RkatController.php` — example of validation, transactions, and a debug JSON flow (`debug_payload`).
  - `routes/web.php` — central route mapping and middleware usage (auth, admin).
  - `vite.config.js` and `package.json` — frontend build/dev commands (`npm run dev`, `npm run build`).
  - `README.md` — domain overview and install/migration steps; copy canonical commands from here.

- **Developer workflows / commands:**
  - PHP deps: `composer install`
  - DB setup: copy `.env`, set DB_*, then `php artisan key:generate` and `php artisan migrate:fresh` (note: this wipes data)
  - Run tests: `php artisan test` or vendor pest if installed
  - Frontend dev: `npm install` then `npm run dev` (Vite)
  - Build assets: `npm run build`
  - Serve: `php artisan serve`

- **Patterns & conventions discovered here:**
  - Controllers validate request payloads heavily in-place (see `store()` in `RkatController`). Follow same validation style for new endpoints.
  - Database writes use explicit DB transactions (`DB::beginTransaction()` / `DB::commit()` / `DB::rollBack()`); replicate this pattern for multi-model writes.
  - Debugging helper: many controllers support returning JSON when request includes `debug_payload` — useful for automated checks and tests.
  - Models & columns use non-standard snake identifiers (e.g., `id_header`, `id_rkat_detail`, `id_proker`, `id_indikator`) — use the repository's column names rather than Laravel defaults when writing queries.
  - Inertia pages are rendered from controllers using `Inertia::render('...')` and expect props prepared server-side.

- **Integration points & external deps:**
  - Frontend: Vite + `laravel-vite-plugin` + React + Inertia.
  - Notifications / Mail: see `app/Mail` and `app/Notifications` for patterns on queued mail/notifications.
  - Middleware: routes use `auth`, `verified`, and a custom `admin` middleware in groups.

- **Examples to copy or reuse:**
  - Validation + transaction pattern: mirror `RkatController::store()` for complex create flows.
  - Logging for debugging: controllers use `\Log::debug()` / `\Log::error()` with payloads and traces — follow same structure.

- **When editing code:**
  - Keep controller validation and error handling consistent with existing controllers.
  - Add `debug_payload` behavior only if matching the pattern used in `RkatController`.
  - Update corresponding Inertia page props when changing controller outputs (`resources/js/app.jsx` and components).

If anything here is unclear or you want samples for a specific task (new route, migration, or component), tell me which area to expand.
