// ==========================
// PRINT
// ==========================

document.getElementById("printBtn").addEventListener("click", () => {
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

adminToggle.addEventListener("click", () => {

  adminMode = !adminMode;

  document.querySelectorAll(".editable").forEach(el => {
    el.contentEditable = adminMode;
  });

  exportBtn.style.display = adminMode ? "inline-block" : "none";

  adminToggle.textContent = adminMode ? "Exit Admin Mode" : "Admin Mode";
});

// ==========================
// EXPORT UPDATED JSON
// ==========================

const modal = document.getElementById("jsonModal");
const jsonOutput = document.getElementById("jsonOutput");
const copyBtn = document.getElementById("copyJsonBtn");
const closeBtn = document.getElementById("closeModalBtn");

exportBtn.addEventListener("click", () => {

  const sections = document.querySelectorAll("#pillarContainer section");

  const updatedPillars = [];

  sections.forEach(section => {

    const id = section.dataset.pillarId;
    const title = section.querySelector("summary strong").textContent.trim();
    const goal = section.querySelector(".goal").textContent.trim();

    const tierDivs = section.querySelectorAll(".tier");
    const tiers = [];

    tierDivs.forEach(tierDiv => {

      const tierName = tierDiv.querySelector("strong").textContent.trim();

      const items = Array.from(tierDiv.querySelectorAll("li"))
        .map(li => li.textContent.trim());

      tiers.push({
        name: tierName,
        items: items
      });

    });

    const metrics = Array.from(
      section.querySelectorAll(".metrics li")
    ).map(li => li.textContent.trim());

    const notesEl = section.querySelector(".notes div");
    const notes = notesEl ? notesEl.textContent.trim() : undefined;

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

  jsonOutput.value = JSON.stringify(updatedPillars, null, 2);
  modal.style.display = "flex";
});

// ==========================
// COPY JSON
// ==========================

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(jsonOutput.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy", 1000);
});

// ==========================
// CLOSE MODAL
// ==========================

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});
