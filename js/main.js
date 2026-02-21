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
