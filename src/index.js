const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Small Organisation Inventory</title>
<style>
:root{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#182230;background:#f4f7fb}
body{margin:0}.wrap{max-width:1050px;margin:auto;padding:28px 18px}
header{background:#153b5b;color:white;padding:24px;border-radius:16px;margin-bottom:20px}
h1{margin:0 0 8px;font-size:1.8rem} header p{margin:0;color:#d9e8f3}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
section{background:white;padding:18px;border-radius:14px;box-shadow:0 2px 10px #14263b0b}
h2{font-size:1.1rem;margin:0 0 14px}
label{display:block;font-size:.9rem;margin:10px 0 5px}
input,select,button{font:inherit;width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;box-sizing:border-box}
button{margin-top:12px;background:#176b87;color:white;border:0;font-weight:650;cursor:pointer}
button:hover{background:#10566e}.notice{margin:14px 0;padding:10px;border-radius:8px;background:#e6f4f1;color:#145c4d}
.error{background:#fff0f0;color:#9a2525}
.tablewrap{overflow-x:auto;margin-top:16px}table{border-collapse:collapse;width:100%;background:white}
th,td{text-align:left;padding:11px;border-bottom:1px solid #e5eaf0;font-size:.93rem}th{background:#edf3f8}
.muted{color:#637387;font-size:.9rem}.stock{font-weight:700}
</style>
</head>
<body><main class="wrap">
<header><h1>Small Organisation Inventory</h1><p>Cloudflare Workers web server + D1 database backend</p></header>
<div id="notice" aria-live="polite"></div>
<div class="grid">
<section><h2>Add a product</h2>
<form id="productForm">
<label for="name">Product name</label><input id="name" required maxlength="100" placeholder="e.g. Notebook">
<label for="sku">SKU / product code</label><input id="sku" required maxlength="40" placeholder="e.g. NOTE-001">
<label for="stock">Opening stock</label><input id="stock" type="number" min="0" step="1" value="0" required>
<button>Add product</button></form></section>
<section><h2>Record stock movement</h2>
<form id="movementForm">
<label for="product">Product</label><select id="product" required><option value="">Load products first</option></select>
<label for="type">Movement</label><select id="type"><option value="receipt">Receipt (stock in)</option><option value="delivery">Delivery (stock out)</option></select>
<label for="quantity">Quantity</label><input id="quantity" type="number" min="1" step="1" required value="1">
<label for="note">Note (optional)</label><input id="note" maxlength="200" placeholder="Vendor receipt / customer order">
<button>Save movement</button></form></section>
</div>
<section style="margin-top:16px"><h2>Current products</h2><p class="muted">Stock is loaded from the backend database.</p>
<div class="tablewrap"><table><thead><tr><th>ID</th><th>Product</th><th>SKU</th><th>Stock</th><th>Created</th></tr></thead><tbody id="products"><tr><td colspan="5">Loading…</td></tr></tbody></table></div></section>
<section style="margin-top:16px"><h2>Recent stock movements</h2><div class="tablewrap"><table><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>Note</th></tr></thead><tbody id="movements"><tr><td colspan="5">Loading…</td></tr></tbody></table></div></section>
<p class="muted">Coursework demo only. No user authentication is configured.</p>
</main>
<script>
const $ = id => document.getElementById(id);
function message(text, bad=false){$('notice').innerHTML='';const d=document.createElement('div');d.className='notice'+(bad?' error':'');d.textContent=text;$('notice').appendChild(d);}
async function api(path, options={}){const r=await fetch(path,{headers:{'Content-Type':'application/json'},...options});const data=await r.json().catch(()=>({error:'Unexpected server response'}));if(!r.ok)throw new Error(data.error||'Request failed');return data;}
async function refresh(){
 const [p,m]=await Promise.all([api('/api/products'),api('/api/movements')]);
 $('products').innerHTML=p.length?p.map(x=>`<tr><td>${x.id}</td><td>${esc(x.name)}</td><td>${esc(x.sku)}</td><td class="stock">${x.stock}</td><td>${esc(x.created_at)}</td></tr>`).join(''):'<tr><td colspan="5">No products yet.</td></tr>';
 $('product').innerHTML='<option value="">Choose product</option>'+p.map(x=>`<option value="${x.id}">${esc(x.name)} (${esc(x.sku)}) — stock ${x.stock}</option>`).join('');
 $('movements').innerHTML=m.length?m.map(x=>`<tr><td>${esc(x.created_at)}</td><td>${esc(x.product_name)}</td><td>${x.movement_type}</td><td>${x.quantity}</td><td>${esc(x.note||'')}</td></tr>`).join(''):'<tr><td colspan="5">No movements yet.</td></tr>';
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
$('productForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('/api/products',{method:'POST',body:JSON.stringify({name:$('name').value.trim(),sku:$('sku').value.trim(),stock:Number($('stock').value)})});e.target.reset();$('stock').value=0;message('Product saved to the database.');await refresh();}catch(err){message(err.message,true);}});
$('movementForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('/api/movements',{method:'POST',body:JSON.stringify({product_id:Number($('product').value),movement_type:$('type').value,quantity:Number($('quantity').value),note:$('note').value.trim()})});e.target.reset();$('quantity').value=1;message('Stock movement saved. Inventory has been updated.');await refresh();}catch(err){message(err.message,true);}});
refresh().catch(err=>message(err.message,true));
</script></body></html>`;

function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
async function readBody(request) {
  try { return await request.json(); } catch { return null; }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
    }
    try {
      if (path === "/" && request.method === "GET") {
        return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
      }
      if (path === "/api/health" && request.method === "GET") {
        await env.DB.prepare("SELECT 1").first();
        return json({ ok: true, database: "connected" });
      }
      if (path === "/api/products" && request.method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT id, name, sku, stock, created_at FROM products ORDER BY id DESC"
        ).all();
        return json(results);
      }
      if (path === "/api/products" && request.method === "POST") {
        const body = await readBody(request);
        if (!body || typeof body.name !== "string" || !body.name.trim() ||
            typeof body.sku !== "string" || !body.sku.trim() ||
            !Number.isInteger(body.stock) || body.stock < 0) {
          return json({ error: "Provide a product name, SKU, and non-negative whole-number opening stock." }, 400);
        }
        const result = await env.DB.prepare(
          "INSERT INTO products (name, sku, stock) VALUES (?, ?, ?)"
        ).bind(body.name.trim(), body.sku.trim(), body.stock).run();
        return json({ ok: true, id: result.meta.last_row_id }, 201);
      }
      if (path === "/api/movements" && request.method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT m.id, m.movement_type, m.quantity, m.note, m.created_at, p.name AS product_name, p.sku FROM stock_movements m JOIN products p ON p.id = m.product_id ORDER BY m.id DESC LIMIT 100"
        ).all();
        return json(results);
      }
      if (path === "/api/movements" && request.method === "POST") {
        const body = await readBody(request);
        if (!body || !Number.isInteger(body.product_id) || body.product_id < 1 ||
            !["receipt", "delivery"].includes(body.movement_type) ||
            !Number.isInteger(body.quantity) || body.quantity < 1 ||
            (body.note !== undefined && typeof body.note !== "string")) {
          return json({ error: "Provide a product, movement type (receipt/delivery), and positive whole-number quantity." }, 400);
        }
        const product = await env.DB.prepare("SELECT id, stock FROM products WHERE id = ?").bind(body.product_id).first();
        if (!product) return json({ error: "Product not found." }, 404);
        const newStock = body.movement_type === "receipt" ? product.stock + body.quantity : product.stock - body.quantity;
        if (newStock < 0) return json({ error: "Delivery exceeds available stock." }, 400);
        await env.DB.batch([
          env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(newStock, body.product_id),
          env.DB.prepare("INSERT INTO stock_movements (product_id, movement_type, quantity, note) VALUES (?, ?, ?, ?)")
            .bind(body.product_id, body.movement_type, body.quantity, (body.note || "").trim().slice(0, 200))
        ]);
        return json({ ok: true, stock: newStock }, 201);
      }
      return json({ error: "Not found" }, 404);
    } catch (error) {
      if (String(error).includes("UNIQUE constraint failed")) return json({ error: "That SKU already exists. Use a unique SKU." }, 409);
      return json({ error: "Server/database error. Confirm that the D1 tables exist and the DB binding is configured." }, 500);
    }
  }
};
