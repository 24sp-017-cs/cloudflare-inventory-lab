# Cloudflare Inventory Web App (Lab 03, Task 2)

A small inventory website deployed as a **Cloudflare Worker**, with a **Cloudflare D1 (SQLite) database** in the backend. The Worker serves the website and the API; D1 persists products and stock movements.

## Features
- Add products
- View products and current stock
- Record stock receipts (inbound)
- Record deliveries (outbound)
- Store every movement in D1
- JSON API endpoints for demonstration

## Files
- `src/index.js` — web page + backend API
- `schema.sql` — D1 tables
- `wrangler.jsonc` — Worker settings and D1 binding
- `package.json` — deploy scripts

## Prerequisites
- A Cloudflare account
- A GitHub account
- A D1 database created in Cloudflare
- A Git repository containing these files

## A. Create the D1 database (dashboard, no terminal required)
1. Sign in at https://dash.cloudflare.com/
2. Open **Workers & Pages** → **D1 SQL Database** (or **Storage & databases** → **D1**; labels can vary).
3. Choose **Create database** and name it `inventory-db`.
4. Open the database's **Settings/Overview** and copy its database ID.
5. In this repository, open `wrangler.jsonc` and replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` with the real ID. Keep the database name `inventory-db` and binding name `DB`.
6. Commit and push the change to GitHub.

## B. Create the database tables
1. Open the `inventory-db` database in Cloudflare.
2. Open **Console** / **Query**.
3. Paste the contents of `schema.sql` and run it.
4. Confirm that the `products` and `stock_movements` tables appear.

Run the schema only once for a fresh database. It uses `CREATE TABLE IF NOT EXISTS`, so rerunning it will not delete existing data.

## C. Connect the GitHub repository and deploy
1. Push this folder's contents to the root of a GitHub repository (not just the ZIP file).
2. In Cloudflare Dashboard, open **Workers & Pages** → **Create application** → **Get started** next to **Import a repository**.
3. Connect GitHub if prompted, authorize Cloudflare, and select the repository.
4. Choose the production branch (usually `main`).
5. Because this is a Worker project using `wrangler.jsonc`, use the repository's Wrangler configuration. No frontend build step is required. If the UI asks for a build command, leave it blank; if it requires an output directory, do not configure this as a static Pages project—choose the Worker/Git integration flow.
6. Select **Save and Deploy**.
7. Open the generated `https://<worker-name>.<your-subdomain>.workers.dev` URL.

Cloudflare's dashboard labels may change slightly. If the first build starts before the D1 ID is configured, fix `wrangler.jsonc` and push a new commit.

## D. Test the app
1. Open the Worker URL in a browser.
2. Add a product (e.g. `Notebook`, SKU `NOTE-001`, starting stock `20`).
3. Record a receipt of 10 units. The stock should increase to 30.
4. Record a delivery of 5 units. The stock should decrease to 25.
5. Refresh the page. The product and stock should remain, proving that data is stored in D1.
6. Optional API checks:
   - `GET /api/products` — list products
   - `POST /api/products` — add a product
   - `POST /api/movements` — record a receipt or delivery
   - `GET /api/movements` — list stock movements

## E. Upload this project to GitHub using the website
1. Create a new repository on https://github.com/.
2. Open the repository and select **Add file** → **Upload files**.
3. Extract this ZIP on your computer first, then upload the files and folders inside `cloudflare-inventory-lab` (the files should be at the repository root).
4. Commit the upload.
5. After editing `wrangler.jsonc` with your D1 database ID, commit that change too.

## What to show for the lab evidence
- The GitHub repository containing the source files
- Cloudflare D1 database and its two tables
- The live `workers.dev` website URL
- A product before/after receipt and delivery showing stock changes
- The movement history showing inbound/outbound records

## Important
This is a coursework demonstration, not a production inventory system. It has no login or role-based access control. Do not store private or sensitive data in it.
