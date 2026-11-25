/* ====== المتاجر ======
   links: استبدلها بروابط الأفلييت الخاصة بك. about: نبذة قصيرة. */
const LOGOS = {"noon-egypt": "logos/noon.webp", "noon-ksa-uae": "logos/noon.webp", "noon-gcc": "logos/noon.webp", "defacto": "logos/defacto.svg", "namshi": "logos/namshi.svg", "mumzworld": "logos/mumzworld.svg"};
const logoImg = (slug, cls = "ava") => `<img class="${cls}" src="${LOGOS[slug] || "logo.svg"}" alt="" width="48" height="48" loading="lazy" decoding="async">`;
const STORES = {
  "noon-egypt":   { name: "نون مصر", color: "#a16207", about: "منصة تسوق إلكتروني متاحة في مصر، تضم الإلكترونيات والموضة والمنزل والمزيد.",
    links: [{ label: "نون مصر", url: "https://www.noon.com/egypt-ar/" }] },
  "noon-ksa-uae": { name: "نون السعودية والإمارات", color: "#a16207", about: "نون في السعودية والإمارات. اختر الدولة الصحيحة قبل استخدام الكود.",
    links: [{ label: "نون السعودية", url: "https://www.noon.com/saudi-ar/" }, { label: "نون الإمارات", url: "https://www.noon.com/uae-ar/" }] },
  "noon-gcc":     { name: "نون الخليج", color: "#a16207", about: "أكواد مخصصة لمتجر نون في دول الخليج.",
    links: [{ label: "نون الإمارات", url: "https://www.noon.com/uae-ar/" }] },
  "defacto":      { name: "ديفاكتو", color: "#0f4c81", about: "علامة أزياء تقدم ملابس للرجال والنساء والأطفال.",
    links: [{ label: "ديفاكتو", url: "https://www.defacto.com.eg/ar-eg" }] },
  "namshi":       { name: "نمشي", color: "#a3173a", about: "متجر إلكتروني للأزياء والجمال والأحذية في المنطقة.",
    links: [{ label: "نمشي", url: "https://www.namshi.com/" }] },
  "mumzworld":    { name: "ممزورلد", color: "#be3a6e", about: "متجر متخصص في مستلزمات الأمهات والأطفال.",
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
  try { renderHeroTicket(); } catch (_) {}
  setStore(activeStore, false);
  registerWebMCP();
}


function storeCard(slug) {
  const s = STORES[slug], n = allCodes.filter(c => c.store === slug).length;
  const b = document.createElement("button");
  b.className = "store-card"; b.type = "button";
  b.style.setProperty("--store", s.color);
  b.innerHTML = `${logoImg(slug)}<span><strong>${esc(s.name)}</strong><small>${n} كود</small></span>`;
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
  document.title = s ? `أكواد خصم ${s.name} 2026 | توفير هب` : "توفير هب | أكواد خصم نون مصر وديفاكتو ونمشي وممزورلد";
  $("pageTitle").textContent = s ? `أكواد خصم ${s.name}` : "أكواد خصم نون وديفاكتو ونمشي وممزورلد";
  $("aboutTitle").textContent = s ? `عن ${s.name}` : "عن المتاجر";
  $("aboutText").textContent = s ? s.about : "اختر متجرًا من القائمة لعرض معلومات سريعة عنه.";
  const a = $("aboutLink");
  if (s) { a.hidden = false; a.href = s.links[0].url; a.style.setProperty("--store", s.color); } else a.hidden = true;
  render();
