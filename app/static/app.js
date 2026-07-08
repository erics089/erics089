// imondu Sales-Dashboard – Frontend-Logik (Vanilla JS, kein Build nötig)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const api = async (url, opts = {}) => {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" }, ...opts,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { msg = (await res.json()).detail || msg; } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
};
const toast = (msg) => {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 2600);
};
const fmtDate = (ts) => ts ? new Date(ts * 1000).toLocaleString("de-DE",
  { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDay = (ts) => ts ? new Date(ts * 1000).toLocaleDateString("de-DE",
  { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";
const esc = (s) => (s ?? "").toString().replace(/[&<>"]/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let META = { statuses: [], segments: [] };
let CURRENT_VIEW = "pipeline";

// --------------------------------------------------------------------------
// Navigation
// --------------------------------------------------------------------------
$$(".nav-item").forEach(btn => btn.addEventListener("click", () => {
  $$(".nav-item").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const view = btn.dataset.view;
  CURRENT_VIEW = view;
  $$(".view").forEach(v => v.hidden = true);
  $("#view-" + view).hidden = false;
  if (view === "pipeline") loadLeads();
  if (view === "followups") loadFollowups();
  if (view === "leadgen") loadJobs();
  if (view === "settings") loadSettings();
}));

// --------------------------------------------------------------------------
// Meta + KPIs
// --------------------------------------------------------------------------
async function loadMeta() {
  META = await api("/api/meta");
  const fs = $("#filter-status");
  fs.innerHTML = '<option value="alle">Alle Status</option>' +
    META.statuses.map(s => `<option value="${s}">${statusLabel(s)}</option>`).join("");
  renderKpis(META.stats);
  $("#nav-due").textContent = META.stats.due_followups || "";
}
function statusLabel(s) {
  return { neu: "Neu", kontaktiert: "Kontaktiert", wiedervorlage: "Wiedervorlage",
    interessiert: "Interessiert", termin: "Termin", gewonnen: "Gewonnen",
    verloren: "Verloren", nicht_anrufen: "Nicht anrufen" }[s] || s;
}
function renderKpis(stats) {
  const bs = stats.by_status || {};
  const items = [
    { val: stats.total, label: "Leads gesamt", cls: "accent" },
    { val: bs.neu || 0, label: "Neu / unbearbeitet", cls: "" },
    { val: stats.due_followups || 0, label: "Wiedervorlagen fällig", cls: "warn" },
    { val: bs.interessiert || 0, label: "Interessiert", cls: "" },
    { val: bs.termin || 0, label: "Termine", cls: "good" },
    { val: bs.gewonnen || 0, label: "Gewonnen", cls: "good" },
  ];
  $("#kpis").innerHTML = items.map(i =>
    `<div class="kpi ${i.cls}"><div class="kpi-val">${i.val}</div><div class="kpi-label">${i.label}</div></div>`
  ).join("");
}

// --------------------------------------------------------------------------
// Pipeline / Leads-Tabelle
// --------------------------------------------------------------------------
let searchTimer;
$("#search").addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadLeads, 250); });
["#filter-status", "#filter-type", "#sort"].forEach(s => $(s).addEventListener("change", loadLeads));

async function loadLeads() {
  const params = new URLSearchParams({
    status: $("#filter-status").value,
    lead_type: $("#filter-type").value,
    sort: $("#sort").value,
  });
  const search = $("#search").value.trim();
  if (search) params.set("search", search);
  const leads = await api("/api/leads?" + params);
  const body = $("#leads-body");
  $("#leads-empty").hidden = leads.length > 0;
  $("#lead-count").textContent = `${leads.length} Leads`;
  body.innerHTML = leads.map(rowHtml).join("");
  $$("#leads-body tr").forEach(tr => tr.addEventListener("click", () => openDrawer(tr.dataset.id)));
}
function scoreClass(s) { return s >= 70 ? "hot" : s >= 50 ? "warm" : "cold"; }
function rowHtml(l) {
  const title = esc(l.company_name || l.contact_name || "Unbenannt");
  const sub = l.company_name && l.contact_name ? esc(l.contact_name) : esc(l.segment || "");
  return `<tr data-id="${l.id}">
    <td><span class="score ${scoreClass(l.score)}">${l.score}</span></td>
    <td><div class="cell-main">${title}</div><div class="cell-sub">${sub}</div></td>
    <td>${esc(l.segment || "—")}</td>
    <td>${esc(l.city || "—")}</td>
    <td>${esc(l.phone || "—")}</td>
    <td><span class="chip ${l.status}">${statusLabel(l.status)}</span></td>
    <td>${l.next_followup_at ? fmtDay(l.next_followup_at) : "—"}</td>
  </tr>`;
}

// --------------------------------------------------------------------------
// Wiedervorlagen
// --------------------------------------------------------------------------
async function loadFollowups() {
  const leads = await api("/api/leads?due=true&sort=followup");
  $("#followups-empty").hidden = leads.length > 0;
  $("#followups-body").innerHTML = leads.map(l => `<tr data-id="${l.id}">
    <td><span class="score ${scoreClass(l.score)}">${l.score}</span></td>
    <td><div class="cell-main">${esc(l.company_name || l.contact_name)}</div>
        <div class="cell-sub">${esc(l.contact_name || "")}</div></td>
    <td>${esc(l.phone || "—")}</td>
    <td>${fmtDate(l.next_followup_at)}</td>
    <td>${esc(l.disposition || "—")}</td></tr>`).join("");
  $$("#followups-body tr").forEach(tr => tr.addEventListener("click", () => openDrawer(tr.dataset.id)));
}

// --------------------------------------------------------------------------
// Lead-Detail Drawer
// --------------------------------------------------------------------------
async function openDrawer(id) {
  const l = await api("/api/leads/" + id);
  const enr = l.enrichment || {};
  const isBadB2C = l.lead_type === "b2c" && !l.consent;
  const drawer = $("#drawer");
  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <h2>${esc(l.company_name || l.contact_name || "Lead")}</h2>
        <div class="muted">${esc(l.segment || "")} ${l.city ? "· " + esc(l.city) : ""}
          · <span class="chip ${l.status}">${statusLabel(l.status)}</span></div>
      </div>
      <button class="close-x" id="drawer-close">×</button>
    </div>
    ${isBadB2C ? `<div class="warn-banner">⚠️ Privatkontakt ohne Einwilligung –
       Telefon-Kaltakquise unzulässig (§7 UWG). Erst nach Opt-in anrufen.</div>` : ""}
    <div class="drawer-meta">
      <span>👤 ${esc(l.contact_name || "—")}${enr.role ? " · " + esc(enr.role) : ""}</span>
      <span>📞 ${esc(l.phone || "—")}</span>
      <span>✉️ ${esc(l.email || "—")}</span>
      ${l.website ? `<span>🌐 <a href="${esc(l.website)}" target="_blank" rel="noopener">${esc(l.website.replace(/^https?:\/\//, ""))}</a></span>` : ""}
    </div>

    <div class="section">
      <h4>Warum passt dieser Lead?</h4>
      <ul class="fit-list">${(l.fit_reasons || []).map(r => `<li>${esc(r)}</li>`).join("") || "<li>—</li>"}</ul>
    </div>

    <div class="section">
      <h4>Ausgelesene Infos (Enrichment)</h4>
      <dl class="kv">
        ${enr.property_type ? `<dt>Objekt</dt><dd>${esc(enr.property_type)}</dd>` : ""}
        ${enr.potential ? `<dt>Potenzial</dt><dd>${esc(enr.potential)}</dd>` : ""}
        ${enr.employees ? `<dt>Mitarbeiter</dt><dd>${esc(enr.employees)}</dd>` : ""}
        ${enr.founded ? `<dt>Gegründet</dt><dd>${esc(enr.founded)}</dd>` : ""}
        <dt>Quelle</dt><dd>${esc(l.source || "—")}</dd>
        <dt>PLZ / Ort</dt><dd>${esc(l.postal_code || "")} ${esc(l.city || "")}</dd>
      </dl>
    </div>

    <div class="section">
      <h4>Anruf-Script</h4>
      <div class="row">
        <select id="script-engine">
          <option value="auto">Auto (KI wenn Key, sonst Template)</option>
          <option value="template">Template</option>
          <option value="ki">KI (Claude)</option>
        </select>
        <button class="btn primary sm" id="btn-gen-script">Script generieren</button>
        <button class="btn sm" id="btn-copy-script">Kopieren</button>
      </div>
      <div class="script-box" id="script-box">${esc(l.script) || "Noch kein Script generiert. Klick auf „Script generieren“."}</div>
    </div>

    <div class="section">
      <h4>Anruf protokollieren / Wiedervorlage</h4>
      <div class="field"><label>Ergebnis</label>
        <select id="call-outcome">
          <option value="">– wählen –</option>
          <option>Erreicht – Interesse</option>
          <option>Erreicht – kein Interesse</option>
          <option>Mailbox / nicht erreicht</option>
          <option>Rückruf gewünscht</option>
          <option>Termin vereinbart</option>
          <option>Falsche Nummer</option>
        </select></div>
      <div class="field"><label>Neuer Status</label>
        <select id="call-status">
          <option value="">(unverändert)</option>
          ${META.statuses.map(s => `<option value="${s}">${statusLabel(s)}</option>`).join("")}
        </select></div>
      <div class="field"><label>Wiedervorlage am</label>
        <input type="datetime-local" id="call-followup"></div>
      <div class="field"><label>Notiz</label>
        <textarea id="call-notes" placeholder="Gesprächsnotizen…"></textarea></div>
      <button class="btn primary" id="btn-log-call">Speichern</button>
    </div>

    ${(l.call_logs && l.call_logs.length) ? `<div class="section">
      <h4>Verlauf</h4>
      ${l.call_logs.map(c => `<div class="job"><span>${fmtDate(c.created_at)}</span>
        <b>${esc(c.outcome || "—")}</b> <span class="muted">${esc(c.notes || "")}</span></div>`).join("")}
    </div>` : ""}

    <div class="section">
      <button class="btn danger sm" id="btn-delete-lead">Lead löschen</button>
    </div>
  `;
  drawer.hidden = false; $("#drawer-overlay").hidden = false;

  $("#drawer-close").onclick = closeDrawer;
  $("#btn-gen-script").onclick = () => genScript(id);
  $("#btn-copy-script").onclick = () => {
    navigator.clipboard.writeText($("#script-box").textContent); toast("Script kopiert");
  };
  $("#btn-log-call").onclick = () => logCall(id);
  $("#btn-delete-lead").onclick = () => deleteLead(id);
}
function closeDrawer() { $("#drawer").hidden = true; $("#drawer-overlay").hidden = true; }
$("#drawer-overlay").addEventListener("click", closeDrawer);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

async function genScript(id) {
  const btn = $("#btn-gen-script"); btn.disabled = true; btn.textContent = "Generiere…";
  try {
    const prefer = $("#script-engine").value;
    const res = await api(`/api/leads/${id}/script`, { method: "POST", body: JSON.stringify({ prefer }) });
    $("#script-box").textContent = res.script;
    toast("Script erstellt (" + res.engine + ")");
  } catch (e) { toast("Fehler: " + e.message); }
  finally { btn.disabled = false; btn.textContent = "Script generieren"; }
}
async function logCall(id) {
  const fuVal = $("#call-followup").value;
  const payload = {
    outcome: $("#call-outcome").value || null,
    status: $("#call-status").value || null,
    disposition: $("#call-outcome").value || null,
    notes: $("#call-notes").value || null,
    followup_at: fuVal ? new Date(fuVal).getTime() / 1000 : null,
  };
  await api(`/api/leads/${id}/calls`, { method: "POST", body: JSON.stringify(payload) });
  toast("Gespeichert");
  closeDrawer(); await loadMeta();
  CURRENT_VIEW === "followups" ? loadFollowups() : loadLeads();
}
async function deleteLead(id) {
  if (!confirm("Diesen Lead wirklich löschen?")) return;
  await api("/api/leads/" + id, { method: "DELETE" });
  toast("Lead gelöscht"); closeDrawer(); await loadMeta(); loadLeads();
}

// --------------------------------------------------------------------------
// Lead-Generierung / Workflows
// --------------------------------------------------------------------------
$("#btn-generate").addEventListener("click", () => runWorkflow("auto", {
  count: +$("#gen-count").value, region: $("#gen-region").value || null,
}, $("#btn-generate")));
$("#btn-scrape").addEventListener("click", () => {
  const cats = $$("#osm-cats input:checked").map(c => c.value);
  runWorkflow("osm", {
    city: $("#osm-city").value, categories: cats, count: +$("#osm-count").value,
  }, $("#btn-scrape"));
});

async function runWorkflow(source, params, btn) {
  btn.disabled = true; const orig = btn.textContent; btn.textContent = "Läuft…";
  const logBox = $("#workflow-log"); logBox.hidden = false;
  logBox.textContent = "⏳ Workflow läuft…";
  try {
    const res = await api("/api/workflows/run", {
      method: "POST", body: JSON.stringify({ source, ...params }),
    });
    logBox.textContent = `✅ Fertig: ${res.imported} neu importiert, ${res.skipped} übersprungen `
      + `(von ${res.found} gefunden)\n\n` + (res.log || []).join("\n");
    toast(`${res.imported} neue Leads`);
    await loadMeta(); loadJobs();
  } catch (e) { logBox.textContent = "❌ Fehler: " + e.message; toast("Fehler: " + e.message); }
  finally { btn.disabled = false; btn.textContent = orig; }
}
async function loadJobs() {
  const jobs = await api("/api/jobs");
  $("#jobs-list").innerHTML = jobs.map(j => {
    const r = j.result || {};
    return `<div class="job"><span class="dot ${j.status}"></span>
      <span>${fmtDate(j.created_at)}</span>
      <b>${esc(j.source)}</b>
      <span class="muted">${r.imported != null ? r.imported + " importiert" : j.status}</span></div>`;
  }).join("") || '<div class="muted">Noch keine Läufe.</div>';
}

// --------------------------------------------------------------------------
// Import / manueller Lead
// --------------------------------------------------------------------------
$("#btn-import").addEventListener("click", async () => {
  const file = $("#csv-file").files[0];
  if (!file) return toast("Bitte CSV wählen");
  const fd = new FormData(); fd.append("file", file);
  const box = $("#import-result"); box.hidden = false; box.textContent = "⏳ Importiere…";
  try {
    const res = await fetch("/api/import/csv", { method: "POST", body: fd });
    const data = await res.json();
    box.textContent = `✅ ${data.imported} importiert, ${data.skipped} übersprungen\n\n` + (data.log || []).join("\n");
    toast(`${data.imported} Leads importiert`); await loadMeta();
  } catch (e) { box.textContent = "❌ " + e.message; }
});
$("#btn-manual").addEventListener("click", async () => {
  const payload = {
    lead_type: $("#ml-type").value,
    company_name: $("#ml-company").value || null,
    contact_name: $("#ml-contact").value || null,
    phone: $("#ml-phone").value || null,
    email: $("#ml-email").value || null,
    city: $("#ml-city").value || null,
    consent: $("#ml-consent").checked ? 1 : 0,
  };
  if (!payload.company_name && !payload.contact_name) return toast("Firma oder Name nötig");
  try {
    await api("/api/leads", { method: "POST", body: JSON.stringify(payload) });
    toast("Lead angelegt");
    ["ml-company", "ml-contact", "ml-phone", "ml-email", "ml-city"].forEach(i => $("#" + i).value = "");
    $("#ml-consent").checked = false; await loadMeta();
  } catch (e) { toast("Fehler: " + e.message); }
});

// --------------------------------------------------------------------------
// Einstellungen
// --------------------------------------------------------------------------
async function loadSettings() {
  const s = await api("/api/settings");
  $("#set-rep").value = s.sales_rep_name || "";
  $("#set-company").value = s.sales_company || "imondu";
  $("#set-region").value = s.default_region || "";
  $("#set-tone").value = s.script_tone || "";
  $("#set-model").value = s.script_model || "claude-opus-4-8";
  $("#set-apikey").value = "";
  $("#set-apikey").placeholder = s._has_api_key ? "Key hinterlegt (" + s.anthropic_api_key + ")" : "sk-ant-…";
  $("#apikey-status").textContent = s._has_api_key
    ? "✓ API-Key hinterlegt – KI-Scripts aktiv."
    : "Kein Key – es wird das Template genutzt (funktioniert vollständig ohne Key).";
}
$("#btn-save-settings").addEventListener("click", async () => {
  const payload = {
    sales_rep_name: $("#set-rep").value, sales_company: $("#set-company").value,
    default_region: $("#set-region").value, script_tone: $("#set-tone").value,
    script_model: $("#set-model").value,
  };
  const key = $("#set-apikey").value.trim();
  if (key) payload.anthropic_api_key = key;
  await api("/api/settings", { method: "PATCH", body: JSON.stringify(payload) });
  const saved = $("#settings-saved"); saved.hidden = false; setTimeout(() => saved.hidden = true, 2000);
  toast("Einstellungen gespeichert"); loadSettings(); loadMeta();
});

// --------------------------------------------------------------------------
// Init
// --------------------------------------------------------------------------
(async () => { await loadMeta(); await loadLeads(); })();
