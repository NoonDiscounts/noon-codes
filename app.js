/* ====== إعدادات المتاجر ======
   links: روابط الذهاب للمتجر. استبدلها بروابط الأفلييت الخاصة بك.
   لو كود معين له رابط خاص، أضف "url" في codes.json لهذا الكود. */
const STORES = {
  "noon-egypt":   { name: "نون مصر", color: "#d4a000",
    links: [{ label: "نون مصر", url: "https://www.noon.com/egypt-ar/" }] },
  "noon-ksa-uae": { name: "نون السعودية والإمارات", color: "#c99a00",
    links: [
      { label: "نون السعودية", url: "https://www.noon.com/saudi-ar/" },
      { label: "نون الإمارات", url: "https://www.noon.com/uae-ar/" }
    ] },
  "noon-gcc":     { name: "نون الخليج", color: "#b88a00",
    links: [{ label: "نون الإمارات", url: "https://www.noon.com/uae-ar/" }] },
  "defacto":      { name: "ديفاكتو", color: "#0f4c81",
    links: [{ label: "ديفاكتو", url: "https://www.defacto.com.eg/ar-eg" }] },
  "namshi":       { name: "نمشي", color: "#b3123b",
    links: [{ label: "نمشي", url: "https://www.namshi.com/" }] },
  "mumzworld":    { name: "ممزورلد", color: "#e0457b",
    links: [{ label: "ممزورلد", url: "https://www.mumzworld.com/ar" }] }
};

let allCodes = [];
let activeStore = "all";
let query = "";

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const fmtDate = iso => { const d = new Date(iso + "T00:00:00"); return isNaN(d) ? "—" : d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }); };
const daysLeft = iso => Math.ceil((new Date(iso + "T23:59:59") - new Date()) / 86400000);

async function loadCodes() {
  try {
    const res = await fetch("codes.json", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    // إخفاء الأكواد المنتهية تلقائيًا
    allCodes = data.filter(c => !c.expiry || daysLeft(c.expiry) >= 0);
  } catch (e) {
    $("cards").innerHTML = `<p class="empty">تعذّر تحميل الأكواد. حدّث الصفحة وحاول مرة أخرى.</p>`;
    return;
  }
  const stores = new Set(allCodes.map(c => c.store)).size;
  $("statCodes").textContent = allCodes.length;
  $("statStores").textContent = stores;
  const q = new URLSearchParams(location.search).get("q");
  if (q) { query = q; $("q").value = q; }
  renderStores();
  render();
  registerWebMCP();
}

function renderStores() {
  const grid = $("storeGrid");
  grid.innerHTML = "";
  Object.entries(STORES).forEach(([slug, s]) => {
    const count = allCodes.filter(c => c.store === slug).length;
    const b = document.createElement("button");
    b.className = "store-card";
    b.type = "button";
    b.style.setProperty("--store", s.color);
    b.innerHTML = `<strong>${esc(s.name)}</strong><span>${count} كود</span>`;
    b.addEventListener("click", () => { setStore(slug); $("codes").scrollIntoView({ behavior: "smooth" }); });
    grid.appendChild(b);
  });
}

function setStore(slug) {
  activeStore = slug;
  document.querySelectorAll(".filter").forEach(btn => {
    const on = btn.dataset.store === slug;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", on);
  });
  render();
}

function filtered(q = query, store = activeStore) {
  q = q.trim().toLowerCase();
  return allCodes.filter(c => {
    if (store !== "all" && c.store !== store) return false;
    if (!q) return true;
    const s = STORES[c.store];
    return [c.code, c.title, c.description, s?.name, c.store].join(" ").toLowerCase().includes(q);
  });
}

function storeButtons(c) {
  const s = STORES[c.store];
  const links = c.url ? [{ label: s?.name || "المتجر", url: c.url }] : (s?.links || []);
  return links.map((l, i) => {
    const text = links.length > 1 ? `اذهب إلى ${l.label}` : "اذهب إلى المتجر";
    return `<a class="btn btn-store" data-go="${i}" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer sponsored" aria-label="${esc(text)} (يفتح في نافذة جديدة)">🛒 ${esc(text)}</a>`;
  }).join("");
}

function render() {
  const list = filtered();
  const box = $("cards");
  $("resultCount").textContent = `عدد الأكواد المعروضة: ${list.length}`;
  box.innerHTML = "";
  if (!list.length) {
    box.innerHTML = `<p class="empty">لا توجد نتائج. جرّب كلمة أخرى أو اختر «الكل».</p>`;
    return;
  }
  list.forEach(c => {
    const s = STORES[c.store];
    const left = c.expiry ? daysLeft(c.expiry) : null;
    const soon = left !== null && left <= 7;
    const expiryTxt = c.expiry ? (soon ? `ينتهي خلال ${left} يوم` : `ينتهي: ${fmtDate(c.expiry)}`) : "";
    const el = document.createElement("article");
    el.className = "card";
    el.style.setProperty("--store", s?.color || "#5b21b6");
    el.innerHTML = `
      <div class="card-top">
        <span class="badge">${esc(s?.name || c.store)}</span>
        <span class="expiry${soon ? " soon" : ""}">${esc(expiryTxt)}</span>
      </div>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.description)}</p>
      ${c.verified ? `<span class="verified">✓ تم التحقق: ${esc(fmtDate(c.verified))}</span>` : ""}
      <div class="code" dir="ltr" aria-label="الكود ${esc(c.code)}">${esc(c.code)}</div>
      <div class="actions">
        <button class="btn btn-copy" type="button">📋 نسخ الكود</button>
        ${storeButtons(c)}
      </div>`;
    el.querySelector(".btn-copy").addEventListener("click", () => copyCode(c.code));
    // الذهاب للمتجر ينسخ الكود تلقائيًا ثم يفتح المتجر
    el.querySelectorAll(".btn-store").forEach(a =>
      a.addEventListener("click", () => copyCode(c.code, "تم نسخ الكود وفتح المتجر: ")));
    box.appendChild(el);
  });
}

function copyCode(code, prefix = "تم نسخ الكود: ") {
  const done = () => toast(prefix + code);
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(code).then(done, () => fallbackCopy(code, done));
  } else fallbackCopy(code, done);
}
function fallbackCopy(code, done) {
  const t = document.createElement("textarea");
  t.value = code; t.style.position = "fixed"; t.style.opacity = "0";
  document.body.appendChild(t); t.select();
  try { document.execCommand("copy"); } catch (_) {}
  t.remove(); done();
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* WebMCP: يعرض أداة بحث الأكواد لوكلاء الذكاء الاصطناعي (لو المتصفح يدعمها) */
function registerWebMCP() {
  const mc = document.modelContext || navigator.modelContext;
  if (!mc?.registerTool) return;
  try {
    mc.registerTool({
      name: "search_coupon_codes",
      description: "البحث في أكواد الخصم الحالية حسب المتجر أو كلمة بحث. يرجع الكود والمتجر وتاريخ الانتهاء ورابط المتجر.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "كلمة بحث اختيارية" },
          store: { type: "string", enum: ["all", ...Object.keys(STORES)], description: "معرّف المتجر" }
        }
      },
      async execute({ query: q = "", store = "all" } = {}) {
        const out = filtered(q, store).map(c => ({
          code: c.code, store: STORES[c.store]?.name, expiry: c.expiry,
          url: (c.url || STORES[c.store]?.links?.[0]?.url)
        }));
        return { content: [{ type: "text", text: JSON.stringify(out) }] };
      }
    });
  } catch (_) {}
}

$("q").addEventListener("input", e => { query = e.target.value; render(); });
$("clearSearch").addEventListener("click", () => { $("q").value = ""; query = ""; render(); });
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => setStore(btn.dataset.store)));
loadCodes();
