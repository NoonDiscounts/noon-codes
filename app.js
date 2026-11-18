const STORES = {
  "noon-egypt": { name: "نون مصر", short: "NOON EGYPT" },
  "noon-ksa-uae": { name: "نون السعودية والإمارات", short: "NOON KSA-UAE" },
  "noon-gcc": { name: "نون الخليج", short: "NOON GCC" },
  "defacto": { name: "ديفاكتو", short: "DEFACTO" },
  "namshi": { name: "نمشي", short: "NAMSHI" },
  "mumzworld": { name: "ممزورلد", short: "MUMZWORLD" }
};

let allCodes = [];
let activeStore = "all";
let query = "";

async function loadCodes() {
  const res = await fetch("codes.json", { cache: "no-store" });
  allCodes = await res.json();
  renderStores();
  render();
}

function renderStores() {
  const grid = document.getElementById("storeGrid");
  grid.innerHTML = "";
  Object.entries(STORES).forEach(([slug, s]) => {
    const count = allCodes.filter(c => c.store === slug).length;
    const b = document.createElement("button");
    b.className = "store-card";
    b.type = "button";
    b.innerHTML = `<strong>${s.name}</strong><span>${count} كود</span>`;
    b.addEventListener("click", () => {
      setStore(slug);
      document.getElementById("codes").scrollIntoView({ behavior: "smooth" });
    });
    grid.appendChild(b);
  });
}

function setStore(slug) {
  activeStore = slug;
  document.querySelectorAll(".filter").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.store === slug);
  });
  render();
}

function filtered() {
  const q = query.trim().toLowerCase();
  return allCodes.filter(c => {
    const storeOk = activeStore === "all" || c.store === activeStore;
    if (!storeOk) return false;
    if (!q) return true;
    const storeName = (STORES[c.store]?.name || "") + " " + (STORES[c.store]?.short || "");
    return (c.code + " " + c.title + " " + c.description + " " + storeName).toLowerCase().includes(q);
  });
}

function render() {
  const list = filtered();
  const box = document.getElementById("cards");
  const count = document.getElementById("resultCount");
  count.textContent = `عدد الأكواد المعروضة: ${list.length}`;
  box.innerHTML = "";
  if (!list.length) {
    box.innerHTML = `<p class="muted">لا توجد نتائج. جرّب كلمة أخرى أو اختر متجرًا مختلفًا.</p>`;
    return;
  }
  list.forEach(c => {
    const store = STORES[c.store]?.name || c.store;
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="card-top">
        <span class="badge">${store}</span>
        <span class="expiry">ينتهي: ${c.expiry || "—"}</span>
      </div>
      <h3>${c.title}</h3>
      <p>${c.description || ""}</p>
      <div class="code-row">
        <span class="code" dir="ltr">${c.code}</span>
        <button class="copy" type="button">نسخ الكود</button>
      </div>
    `;
    el.querySelector(".copy").addEventListener("click", () => copyCode(c.code));
    box.appendChild(el);
  });
}

async function copyCode(code) {
  try {
    await navigator.clipboard.writeText(code);
  } catch (e) {
    const t = document.createElement("textarea");
    t.value = code;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  toast(`تم نسخ الكود: ${code}`);
}

let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

document.getElementById("q").addEventListener("input", e => {
  query = e.target.value;
  render();
});
document.getElementById("clearSearch").addEventListener("click", () => {
  document.getElementById("q").value = "";
  query = "";
  render();
});
document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => setStore(btn.dataset.store));
});

loadCodes();
