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

    pillars.forEach(p => {
      const section = document.createElement("section");

      section.innerHTML = `
        <details open>
          <summary><strong>${p.title}</strong></summary>
          <div class="card">
            <strong>Goal</strong>
            <div class="editable">${p.goal}</div>

            <strong>Actions</strong>
            <ul>
              ${p.actions.map(a => `<li class="editable">${a}</li>`).join("")}
            </ul>

            <strong>Metrics</strong>
            <ul>
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

document.getElementById("adminToggle").addEventListener("click", () => {
  adminMode = !adminMode;

  document.querySelectorAll(".editable").forEach(el => {
    el.contentEditable = adminMode;
  });

  document.getElementById("adminToggle").textContent =
    adminMode ? "Exit Admin Mode" : "Admin Mode";
});

const exportBtn = document.getElementById("exportJsonBtn");
const modal = document.getElementById("jsonModal");
const jsonOutput = document.getElementById("jsonOutput");
const copyBtn = document.getElementById("copyJsonBtn");
const closeBtn = document.getElementById("closeModalBtn");

// Show export button only in admin mode
document.getElementById("adminToggle").addEventListener("click", () => {
  exportBtn.style.display = adminMode ? "inline-block" : "none";
});

// Generate JSON
exportBtn.addEventListener("click", () => {

  const sections = document.querySelectorAll("#pillarContainer section");

  const updatedPillars = [];

  sections.forEach(section => {

    const title = section.querySelector("summary strong").textContent.trim();

    const goal = section.querySelector(".card div.editable").textContent.trim();

    const lists = section.querySelectorAll(".card ul");

    const actions = Array.from(lists[0].querySelectorAll("li"))
      .map(li => li.textContent.trim());

    const metrics = Array.from(lists[1].querySelectorAll("li"))
      .map(li => li.textContent.trim());

    updatedPillars.push({
      title,
      goal,
      actions,
      metrics
    });
  });

  jsonOutput.value = JSON.stringify(updatedPillars, null, 2);
  modal.style.display = "flex";
});

// Copy JSON
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(jsonOutput.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy", 1000);
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});
