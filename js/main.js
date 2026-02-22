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
    const metaBox = document.getElementById("metaInfo");
    if (metaBox) {
      metaBox.textContent =
        `Version ${meta.version} | Last Updated: ${meta.lastUpdated} | Review Cycle: ${meta.reviewCycle}`;
    }
  });


// ==========================
// LOAD PILLARS
// ==========================

fetch("./data/pillars.json")
  .then(res => res.json())
  .then(pillars => {

    const container = document.getElementById("pillarContainer");
    if (!container) return;

    container.innerHTML = "";

    pillars.forEach(p => {

      const section = document.createElement("section");
      section.dataset.pillarId = p.id;

      // ---------- TIERS ----------
      const tiersHtml = p.tiers.map(tier => {
      
        const itemsHtml = tier.items.map(item => {
      
          const obj = typeof item === "string"
            ? {
                text: item,
                status: "Proposed",
                lead: "",
                impact: 3,
                feasibility: 3,
                startDate: "",
                reviewDate: "",
                metric: ""
              }
            : item;
      
          return `
            <li class="plan-item">
              
              <div class="editable item-text">${obj.text || ""}</div>
            
              <div class="plan-item-controls">
            
                <select class="item-status" disabled>
                  ${["Proposed","Approved","Active","Complete","Retired"]
                    .map(s => `<option value="${s}" ${obj.status === s ? "selected" : ""}>${s}</option>`)
                    .join("")}
                </select>
            
                <input class="item-lead"
                       type="text"
                       value="${obj.lead || ""}"
                       placeholder="Lead"
                       disabled>
            
                <input class="item-impact"
                       type="number"
                       min="1"
                       max="5"
                       value="${obj.impact || 3}"
                       disabled>
            
                <input class="item-feasibility"
                       type="number"
                       min="1"
                       max="5"
                       value="${obj.feasibility || 3}"
                       disabled>
            
                <input class="item-start"
                       type="date"
                       value="${obj.startDate || ""}"
                       disabled>
            
                <input class="item-review"
                       type="date"
                       value="${obj.reviewDate || ""}"
                       disabled>
            
              <input class="item-metric"
                     type="text"
                     value="${obj.metric || ""}"
                     placeholder="Metric"
                     disabled>
            
              </div>
            
            </li>
          `;
      
        }).join("");
      
        return `
          <div class="tier">
            <strong>${tier.name}</strong>
            <ul>
              ${itemsHtml}
            </ul>
          </div>
        `;
      
      }).join("");
    const notesHtml = p.notes
      ? `<div class="notes"><strong>Note</strong><div class="editable">${p.notes}</div></div>`
      : "";
      // ---------- SECTION HTML ----------
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
              ${(p.metrics || []).map(m => `<li class="editable">${m}</li>`).join("")}
            </ul>
      
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

  document.querySelectorAll(
    ".item-status, .item-lead, .item-impact, .item-feasibility, .item-start, .item-review, .item-metric"
  ).forEach(el => {
    el.disabled = !adminMode;
  });

  if (exportBtn) {
    exportBtn.style.display = adminMode ? "inline-block" : "none";
  }

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
    const title = section.querySelector("summary strong")?.textContent.trim() || "";
    const goal = section.querySelector(".goal")?.textContent.trim() || "";

    // ---------- TIERS EXPORT ----------
    const tiers = Array.from(section.querySelectorAll(".tier")).map(tierDiv => {

      const name = tierDiv.querySelector("strong")?.textContent.trim() || "";


      const items = Array.from(tierDiv.querySelectorAll("li.plan-item")).map(li => ({
        text: li.querySelector(".item-text")?.textContent.trim() || "",
        status: li.querySelector(".item-status")?.value || "Proposed",
        lead: li.querySelector(".item-lead")?.value.trim() || "",
        impact: parseInt(li.querySelector(".item-impact")?.value) || 3,
        feasibility: parseInt(li.querySelector(".item-feasibility")?.value) || 3,
        startDate: li.querySelector(".item-start")?.value || "",
        reviewDate: li.querySelector(".item-review")?.value || "",
        metric: li.querySelector(".item-metric")?.value.trim() || ""
      }));

      return { name, items };
    });

    // ---------- METRICS ----------
    const metrics = Array.from(section.querySelectorAll(".metrics li"))
      .map(li => li.textContent.trim());

    const notesEl = section.querySelector(".notes div");
    const notes = notesEl ? notesEl.textContent.trim() : undefined;

    // ---------- GOVERNANCE ----------


    const pillarObj = {
      id,
      title,
      goal,
      tiers,
      metrics
    };

    if (notes) pillarObj.notes = notes;

    updatedPillars.push(pillarObj);
  });

  if (jsonOutput) {
    jsonOutput.value = JSON.stringify(updatedPillars, null, 2);
    modal.style.display = "flex";
  }
});


// ==========================
// COPY JSON
// ==========================

copyBtn?.addEventListener("click", () => {
  navigator.clipboard.writeText(jsonOutput.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy", 1000);
});

closeBtn?.addEventListener("click", () => {
  modal.style.display = "none";
});


// ==========================
// ENTER / BACKSPACE CONTROL
// ==========================

document.addEventListener("keydown", function (e) {

  if (!adminMode) return;

  const active = document.activeElement;

  // ENTER creates new structured item
  if (e.key === "Enter" && active?.classList?.contains("item-text")) {

    if (e.shiftKey) return;

    e.preventDefault();

    const li = active.closest("li.plan-item");
    if (!li) return;
    
    const newLi = document.createElement("li");
    newLi.className = "plan-item";
    newLi.innerHTML = `
      <div class="editable item-text"></div>
    
      <div class="plan-item-controls">
    
        <select class="item-status">
          ${["Proposed","Approved","Active","Complete","Retired"]
            .map(s => `<option value="${s}">${s}</option>`).join("")}
        </select>
    
        <input class="item-lead" type="text" placeholder="Lead">
    
        <input class="item-impact" type="number" min="1" max="5" value="3">
    
        <input class="item-feasibility" type="number" min="1" max="5" value="3">
    
        <input class="item-start" type="date">
    
        <input class="item-review" type="date">
    
        <input class="item-metric" type="text" placeholder="Metric">
    
      </div>
    `;

    li.parentNode.insertBefore(newLi, li.nextSibling);

    newLi.querySelector(".item-text").contentEditable = true;
    newLi.querySelector(".item-status").disabled = false;
    newLi.querySelector(".item-lead").disabled = false;
    newLi.querySelector(".item-impact").disabled = false;
    newLi.querySelector(".item-feasibility").disabled = false;
    newLi.querySelector(".item-start").disabled = false;
    newLi.querySelector(".item-review").disabled = false;
    newLi.querySelector(".item-notes").disabled = false;

    newLi.querySelector(".item-text").focus();
  }

  // BACKSPACE removes empty item
  if (e.key === "Backspace" && active?.classList?.contains("item-text")) {

    if (active.textContent.trim() !== "") return;

    const li = active.closest("li.plan-item");
    if (!li) return;

    const prev = li.previousElementSibling?.querySelector(".item-text");
    li.remove();
    prev?.focus();

    e.preventDefault();
  }
});
