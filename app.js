/* ====== المتاجر ======
   links: استبدلها بروابط الأفلييت الخاصة بك. about: نبذة قصيرة. */
const STORES = {
  "noon-egypt":   { name: "نون مصر", color: "#b8860b", about: "منصة تسوق إلكتروني متاحة في مصر، تضم الإلكترونيات والموضة والمنزل والمزيد.",
    links: [{ label: "نون مصر", url: "https://www.noon.com/egypt-ar/" }] },
  "noon-ksa-uae": { name: "نون السعودية والإمارات", color: "#a37900", about: "نون في السعودية والإمارات. اختر الدولة الصحيحة قبل استخدام الكود.",
    links: [{ label: "نون السعودية", url: "https://www.noon.com/saudi-ar/" }, { label: "نون الإمارات", url: "https://www.noon.com/uae-ar/" }] },
  "noon-gcc":     { name: "نون الخليج", color: "#8f6a00", about: "أكواد مخصصة لمتجر نون في دول الخليج.",
    links: [{ label: "نون الإمارات", url: "https://www.noon.com/uae-ar/" }] },
  "defacto":      { name: "ديفاكتو", color: "#0f4c81", about: "علامة أزياء تقدم ملابس للرجال والنساء والأطفال.",
    links: [{ label: "ديفاكتو", url: "https://www.defacto.com.eg/ar-eg" }] },
  "namshi":       { name: "نمشي", color: "#b3123b", about: "متجر إلكتروني للأزياء والجمال والأحذية في المنطقة.",
    links: [{ label: "نمشي", url: "https://www.namshi.com/" }] },
  "mumzworld":    { name: "ممزورلد", color: "#d63a74", about: "متجر متخصص في مستلزمات الأمهات والأطفال.",
    links: [{ label: "ممزورلد", url: "https://www.mumzworld.com/ar" }] }
};

let allCodes = [], activeStore = "all", query = "";
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtDate = iso => { const d = new Date(iso + "T00:00:00"); return isNaN(d) ? "—" : d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }); };
const daysLeft = iso => Math.ceil((new Date(iso + "T23:59:59") - new Date()) / 86400000);
const linksOf = c => c.url ? [{ label: STORES[c.store]?.name || "المتجر", url: c.url }] : (STORES[c.store]?.links || []);

async function loadCodes() {
  try {
    const res = await fetch("codes.json", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    allCodes = (await res.json()).filter(c => !c.expiry || daysLeft(c.expiry) >= 0);
  } catch (e) {
    $("cards").innerHTML = `<p class="empty">تعذّر تحميل الأكواد. حدّث الصفحة وحاول مرة أخرى.</p>`;
    return;
  }
  $("statCodes").textContent = allCodes.length;
  $("statStores").textContent = new Set(allCodes.map(c => c.store)).size;
  const p = new URLSearchParams(location.search);
  if (p.get("q")) { query = p.get("q"); $("q").value = query; }
  if (STORES[p.get("store")]) activeStore = p.get("store");
  renderStoreGrids();
  setStore(activeStore, false);
  registerWebMCP();
}

function storeCard(slug, goTop) {
  const s = STORES[slug], n = allCodes.filter(c => c.store === slug).length;
  const b = document.createElement("button");
  b.className = "store-card"; b.type = "button";
  b.style.setProperty("--store", s.color);
  b.innerHTML = `<strong>${esc(s.name)}</strong><span>${n} كود</span>`;
  b.addEventListener("click", () => { setStore(slug); $("codes").scrollIntoView({ behavior: "smooth" }); });
  return b;
}
function renderStoreGrids() {
  $("storeGrid").replaceChildren(...Object.keys(STORES).map(storeCard));
  $("footStores").innerHTML = Object.entries(STORES).map(([k, s]) => `<li><a href="?store=${k}">${esc(s.name)}</a></li>`).join("");
}

function setStore(slug, scrollSync = true) {
  activeStore = slug;
  document.querySelectorAll(".filter").forEach(b => {
    const on = b.dataset.store === slug;
    b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on);
  });
  const s = STORES[slug];
  $("codesTitle").textContent = s ? `أكواد خصم ${s.name}` : "كل أكواد الخصم";
  document.title = s ? `أكواد خصم ${s.name} 2026 | توفير هب` : "توفير هب | أكواد خصم نون مصر وديفاكتو ونمشي وممزورلد نوفمبر 2026";
  $("pageTitle").textContent = s ? `أكواد خصم ${s.name}` : "أكواد خصم نون وديفاكتو ونمشي وممزورلد";
  $("aboutTitle").textContent = s ? `عن ${s.name}` : "عن المتاجر";
  $("aboutText").textContent = s ? s.about : "اختر متجرًا من القائمة لعرض معلومات سريعة عنه.";
  const a = $("aboutLink");
  if (s) { a.hidden = false; a.href = s.links[0].url; a.style.setProperty("--store", s.color); } else a.hidden = true;
  // المتاجر المشابهة: كل المتاجر عدا الحالي
  $("similarGrid").replaceChildren(...Object.keys(STORES).filter(k => k !== slug).slice(0, 5).map(storeCard));
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
  const l = linksOf(c);
  return l.map(x => {
    const t = l.length > 1 ? `اذهب إلى ${x.label}` : "اذهب إلى المتجر";
    return `<a class="btn btn-store" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer sponsored" aria-label="${esc(t)} (يفتح في نافذة جديدة)">🛒 ${esc(t)}</a>`;
  }).join("");
}

function render() {
  const list = filtered(), box = $("cards");
  $("resultCount").textContent = `عدد الأكواد المعروضة: ${list.length}`;
  box.innerHTML = "";
  if (!list.length) box.innerHTML = `<p class="empty">لا توجد نتائج. جرّب كلمة أخرى أو اختر «الكل».</p>`;
  list.forEach((c, i) => {
    const s = STORES[c.store], left = c.expiry ? daysLeft(c.expiry) : null, soon = left !== null && left <= 7;
    const exp = c.expiry ? (soon ? `ينتهي خلال ${left} يوم` : `ينتهي: ${fmtDate(c.expiry)}`) : "";
    const el = document.createElement("article");
    el.className = "coupon" + (c.featured ? " featured" : "");
    el.style.setProperty("--store", s?.color || "#5b21b6");
    el.innerHTML = `
      <div class="c-side"><span class="c-val">${esc(c.discount || "كود")}</span><span class="c-lbl">${c.discount ? "خصم" : "خصم"}</span></div>
      <div class="c-body">
        <div class="c-meta">
          <span class="badge">${esc(s?.name || c.store)}</span>
          ${exp ? `<span class="expiry${soon ? " soon" : ""}">${esc(exp)}</span>` : ""}
          ${c.verified ? `<span class="verified">✓ تم التحقق ${esc(fmtDate(c.verified))}</span>` : ""}
        </div>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.description)}${c.terms ? ` <span class="muted">(${esc(c.terms)})</span>` : ""}</p>
        <div class="c-actions">
          <div class="code-box"><span class="code" aria-label="الكود ${esc(c.code)}">${esc(c.code)}</span><button class="btn-copy" type="button">نسخ</button></div>
          ${storeButtons(c)}
        </div>
      </div>`;
    const cp = el.querySelector(".btn-copy");
    cp.addEventListener("click", () => { copyCode(c.code); cp.textContent = "تم ✓"; setTimeout(() => cp.textContent = "نسخ", 1800); });
    el.querySelectorAll(".btn-store").forEach(a => a.addEventListener("click", () => copyCode(c.code, "تم نسخ الكود وفتح المتجر: ")));
    box.appendChild(el);
  });
  // جدول الملخص
  $("summaryBox").hidden = !list.length;
  $("summaryBody").innerHTML = list.map(c => `<tr><td class="mono">${esc(c.code)}</td><td>${esc(STORES[c.store]?.name || c.store)}</td><td>${esc(c.discount || "—")}</td><td>${c.expiry ? esc(fmtDate(c.expiry)) : "—"}</td></tr>`).join("");
}

function copyCode(code, prefix = "تم نسخ الكود: ") {
  const done = () => toast(prefix + code);
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(done, () => fallbackCopy(code, done));
  else fallbackCopy(code, done);
}
function fallbackCopy(code, done) {
  const t = document.createElement("textarea");
  t.value = code; t.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(t); t.select();
  try { document.execCommand("copy"); } catch (_) {}
  t.remove(); done();
}
let tt;
function toast(m) { const t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2400); }

/* WebMCP: أداة بحث الأكواد لوكلاء الذكاء الاصطناعي (لو المتصفح يدعمها) */
function registerWebMCP() {
  const mc = document.modelContext || navigator.modelContext;
  if (!mc?.registerTool) return;
  try {
    mc.registerTool({
      name: "search_coupon_codes",
      description: "البحث في أكواد الخصم الحالية حسب المتجر أو كلمة بحث، ويرجع الكود والمتجر وتاريخ الانتهاء ورابط المتجر.",
      inputSchema: { type: "object", properties: {
        query: { type: "string", description: "كلمة بحث اختيارية" },
        store: { type: "string", enum: ["all", ...Object.keys(STORES)], description: "معرّف المتجر" } } },
      async execute({ query: q = "", store = "all" } = {}) {
        const out = filtered(q, store).map(c => ({ code: c.code, store: STORES[c.store]?.name, expiry: c.expiry, url: linksOf(c)[0]?.url }));
        return { content: [{ type: "text", text: JSON.stringify(out) }] };
      }
    });
  } catch (_) {}
}

$("q").addEventListener("input", e => { query = e.target.value; render(); });
$("clearSearch").addEventListener("click", () => { $("q").value = ""; query = ""; render(); });
document.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => setStore(b.dataset.store)));
loadCodes();
