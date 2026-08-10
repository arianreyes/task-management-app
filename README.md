# Client Project Tracker

A simple project tracker for a digital agency — project managers can track client projects, monitor progress, and manage priorities. Built with Laravel, Inertia.js, and React.

## Technology Choices

| Layer | Choice | Why |
|---|---|---|
| Backend | Laravel 13 (PHP 8.3) | Expressive ORM (Eloquent), built-in validation, and a REST-friendly routing layer with minimal boilerplate. |
| Frontend | React 19 via [Inertia.js](https://inertiajs.com) | Gives an SPA-like experience (no full page reloads, client-side form handling) without building and maintaining a separate API-consuming client just for page routing. |
| Styling | Tailwind CSS v4 | Utility-first styling, fast to iterate on a small UI like this. |
| Database | SQLite | Zero-config, file-based — appropriate for the scope of this project; no separate DB server to install. |
| Testing | PHPUnit (Feature tests) | Ships with Laravel; used to test validation, search, filtering, and sorting against the live API. |

**Two ways into the same data**: the app exposes a genuine JSON REST API under `/api/projects` (`GET/POST/PUT/DELETE`) as specified in the requirements, *and* a separate set of web routes that power the Inertia/React UI. Both share the same `Project` model, Form Requests, and query scopes (search/filter/sort), so validation and business logic live in one place — the API isn't just a byproduct of the UI, and the UI isn't a thin wrapper over the API either; each uses the response shape (JSON vs. Inertia page/redirect) that's idiomatic for its purpose.

## Setup Instructions

**Prerequisites:**
- PHP 8.3+
- Composer
- Node.js 20.19+ or 22.12+ (Vite 8's bundler requires this; older versions can hit a native-binding install bug)
- npm

**Steps:**

```bash
# 1. Install PHP dependencies
composer install

# 2. Copy the environment file and generate an app key
cp .env.example .env
php artisan key:generate

# 3. Install JS dependencies
npm install

# 4. Create the SQLite database file and run migrations + seed sample data
php artisan migrate --seed

# 5. Build frontend assets
npm run build
```

The seeder loads its sample projects from `test_data.json` in the project root.

## How to Run the Application

**Development** (with hot-reload):

Run these in two separate terminals:

```bash
php artisan serve      # Laravel app at http://127.0.0.1:8000
npm run dev             # Vite dev server (asset hot-reload)
```

> **Note (Windows):** this repo's `composer run dev` script bundles `php artisan serve`, a queue listener, `php artisan pail` (log viewer), and `npm run dev` together via `concurrently`. `pail` requires the `pcntl` PHP extension, which isn't available on Windows PHP builds, so that combined script will fail on Windows — run `php artisan serve` and `npm run dev` separately instead, as shown above. On macOS/Linux, `composer run dev` works as-is.

Then open **http://127.0.0.1:8000**.

**Production-style run** (no hot-reload):

```bash
npm run build
php artisan serve
```

**Running tests:**

```bash
php artisan test
```

## Features

- Full CRUD for projects (client name, project name, description, status, priority, start/due dates) via both the web UI and the REST API.
- Validation: required client/project name, valid status/priority enums, due date can't precede start date — with meaningful error messages surfaced inline in the form.
- Bonus: search (client/project name), filter by status, filter by priority, and click-to-sort table columns — all backed by shared, reusable query scopes and covered by feature tests.

## Assumptions Made

- **No authentication.** The requirements list auth as optional bonus; this is treated as a single-user internal tool with no login.
- **`PUT` means full replace, not partial update.** Matches the literal `PUT /projects/:id` requirement — the edit form always sends the complete set of fields, not a partial patch.
- **Status and priority are fixed, not user-configurable.** They're implemented as backed PHP enums (`ProjectStatus`, `ProjectPriority`) matching the exact values from the requirements, rather than an editable lookup table — no requirement suggested these lists need to change at runtime.
- **`test_data.json` is the canonical seed data**, used as-is instead of randomly generated fixtures, so the app has consistent, realistic sample data out of the box.
- **Search matches client name or project name** (case-insensitive substring match); description isn't included, since the requirement only specifies searching/filtering as a bonus without detailing the exact fields.
- **Sorting is restricted to an allow-list of columns** (client name, project name, status, priority, start date, due date) to prevent arbitrary/unsafe column names from reaching the query builder.
