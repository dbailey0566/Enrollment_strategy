// ==========================
// PRINT
// ==========================

document.getElementById("printBtn")?.addEventListener("click", () => {
  window.print();
});

// ==========================
// LOAD META
// ==========================

fetch("./data/meta.json")
  .then(res => res.json())
  .then(meta => {
    document.getElementById("metaInfo").textContent =
      `Version ${meta.version} | Last Updated: ${meta.lastUpdated} | Review Cycle: ${meta.reviewCycle}`;
  });

// ==========================
// LOAD PILLARS
// ==========================

fetch("./data/pillars.json")
  .then(res => res.json())
  .then(pillars => {

    const container = document.getElementById("pillarContainer");
    container.innerHTML = "";

    pillars.forEach(p => {

      const section = document.createElement("section");
      section.dataset.pillarId = p.id;

      const tiersHtml = p.tiers.map(tier => `
        <div class="tier">
          <strong>${tier.name}</strong>
          <ul>
            ${tier.items.map(item => `<li class="editable">${item}</li>`).join("")}
          </ul>
        </div>
      `).join("");

      const notesHtml = p.notes
        ? `<div class="notes"><strong>Note</strong><div class="editable">${p.notes}</div></div>`
        : "";

      section.innerHTML = `
        <details open>
          <summary><strong>${p.title}</strong></summary>
          <div class="card">

            <strong>Goal</strong>
            <div class="editable goal">${p.goal}</div>

            ${tiersHtml}

            ${notesHtml}
            
            <strong>Metrics</strong>
            <ul class="metrics">
              ${p.metrics.map(m => `<li class="editable">${m}</li>`).join("")}
            </ul>
            
            <div class="governance">
              <hr style="margin:16px 0;">
              <strong>Strategy Governance</strong>

              <div style="margin-top:8px;">
                <label>Status</label>
                <select class="gov-status">
                  ${["Proposed","Approved","Pilot","Active","Retired"]
                    .map(s => `<option value="${s}" ${p.governance?.status===s?"selected":""}>${s}</option>`)
                    .join("")}
                </select>

                <label style="margin-left:10px;">Impact</label>
                <input type="number" min="1" max="5" class="gov-impact" value="${p.governance?.impact || 3}">

                <label style="margin-left:10px;">Feasibility</label>
                <input type="number" min="1" max="5" class="gov-feasibility" value="${p.governance?.feasibility || 3}">
              </div>

              <div style="margin-top:8px;">
                <label>Lead</label>
                <input type="text" class="gov-lead" value="${p.governance?.lead || ""}" placeholder="Faculty or staff lead">

                <label style="margin-left:10px;">Start</label>
                <input type="date" class="gov-start" value="${p.governance?.startDate || ""}">

                <label style="margin-left:10px;">Review</label>
                <input type="date" class="gov-review" value="${p.governance?.reviewDate || ""}">
              </div>

              <div style="margin-top:8px;">
                <label>Notes</label>
                <div class="editable gov-notes">${p.governance?.notes || ""}</div>
              </div>

            </div>

          </div>
        </details>
      `;

      container.appendChild(section);
    });

  });

// ==========================
// ADMIN MODE
// ==========================

let adminMode = false;

const adminToggle = document.getElementById("adminToggle");
const exportBtn = document.getElementById("exportJsonBtn");

adminToggle?.addEventListener("click", () => {

  adminMode = !adminMode;

  document.querySelectorAll(".editable").forEach(el => {
    el.contentEditable = adminMode;
  });

  document.querySelectorAll(".gov-status, .gov-impact, .gov-feasibility, .gov-lead, .gov-start, .gov-review")
    .forEach(el => el.disabled = !adminMode);

  if (exportBtn) exportBtn.style.display = adminMode ? "inline-block" : "none";

  adminToggle.textContent = adminMode ? "Exit Admin Mode" : "Admin Mode";
});

// ==========================
// EXPORT UPDATED JSON
// ==========================

const modal = document.getElementById("jsonModal");
const jsonOutput = document.getElementById("jsonOutput");
const copyBtn = document.getElementById("copyJsonBtn");
const closeBtn = document.getElementById("closeModalBtn");

exportBtn?.addEventListener("click", () => {

  const sections = document.querySelectorAll("#pillarContainer section");
  const updatedPillars = [];

  sections.forEach(section => {

    const id = section.dataset.pillarId;
    const title = section.querySelector("summary strong").textContent.trim();
    const goal = section.querySelector(".goal").textContent.trim();

    const tiers = Array.from(section.querySelectorAll(".tier")).map(tierDiv => ({
      name: tierDiv.querySelector("strong").textContent.trim(),
      items: Array.from(tierDiv.querySelectorAll("li")).map(li => li.textContent.trim())
    }));

    const metrics = Array.from(section.querySelectorAll(".metrics li"))
      .map(li => li.textContent.trim());

    const notesEl = section.querySelector(".notes div");
    const notes = notesEl ? notesEl.textContent.trim() : undefined;

    const governance = {
      status: section.querySelector(".gov-status")?.value || "Proposed",
      impact: parseInt(section.querySelector(".gov-impact")?.value) || 3,
      feasibility: parseInt(section.querySelector(".gov-feasibility")?.value) || 3,
      lead: section.querySelector(".gov-lead")?.value || "",
      startDate: section.querySelector(".gov-start")?.value || "",
      reviewDate: section.querySelector(".gov-review")?.value || "",
      notes: section.querySelector(".gov-notes")?.textContent.trim() || ""
    };

    const pillarObj = {
      id,
      title,
      goal,
      tiers,
      metrics,
      governance
    };

    if (notes) pillarObj.notes = notes;

    updatedPillars.push(pillarObj);
  });

  jsonOutput.value = JSON.stringify(updatedPillars, null, 2);
  modal.style.display = "flex";
});

// ==========================
// COPY JSON
// ==========================

copyBtn?.addEventListener("click", () => {
  navigator.clipboard.writeText(jsonOutput.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy", 1000);
});

// ==========================
// CLOSE MODAL
// ==========================

closeBtn?.addEventListener("click", () => {
  modal.style.display = "none";
});

// ==========================
// ENTER / BACKSPACE LIST CONTROL
// ==========================

document.addEventListener("keydown", function (e) {

  if (!adminMode) return;

  const active = document.activeElement;

  if (e.key === "Enter" && active?.tagName === "LI") {

    if (e.shiftKey) return;

    e.preventDefault();

    const newLi = document.createElement("li");
    newLi.classList.add("editable");
    newLi.contentEditable = true;
    active.parentNode.insertBefore(newLi, active.nextSibling);
    newLi.focus();
  }

  if (e.key === "Backspace" && active?.tagName === "LI") {
    if (active.textContent.trim() === "") {
      const prev = active.previousElementSibling;
      active.remove();
      if (prev) prev.focus();
      e.preventDefault();
    }
  }
});
