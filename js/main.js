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
            <ul>
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
            
                <label style="margin-left:10px;">Impact (1-5)</label>
                <input type="number" min="1" max="5" class="gov-impact" value="${p.governance?.impact || 3}">
            
                <label style="margin-left:10px;">Feasibility (1-5)</label>
                <input type="number" min="1" max="5" class="gov-feasibility" value="${p.governance?.feasibility || 3}">
              </div>
            
              <div style="margin-top:8px;">
                <label>Lead</label>
                <input type="text" class="gov-lead editable" value="${p.governance?.lead || ""}" placeholder="Faculty or staff lead">
            
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

document.addEventListener("keydown", function (e) {

  if (!adminMode) return;

  const active = document.activeElement;

  if (e.key === "Enter" && active && active.tagName === "LI") {

    // Allow Shift+Enter to create line break inside same item
    if (e.shiftKey) return;

    e.preventDefault();

    const newLi = document.createElement("li");
    newLi.classList.add("editable");
    newLi.contentEditable = true;
    newLi.innerHTML = "";

    active.parentNode.insertBefore(newLi, active.nextSibling);
    newLi.focus();
  }

});

document.addEventListener("keydown", function (e) {

  if (!adminMode) return;

  const active = document.activeElement;

  if (e.key === "Backspace" && active && active.tagName === "LI") {

    if (active.textContent.trim() === "") {

      const prev = active.previousElementSibling;
      active.remove();

      if (prev) prev.focus();

      e.preventDefault();
    }
  }

});

// ==========================
// AI STRATEGY EXPLORER
// ==========================

const aiInput = document.getElementById("aiStrategyInput");

if (aiInput) {

  document.querySelectorAll(".ai-prompt-buttons button").forEach(button => {

    const originalText = button.textContent;

    button.addEventListener("click", () => {

      const strategyText = aiInput.value.trim();

      if (!strategyText) {
        alert("Paste a strategy first.");
        return;
      }

      const structuredPrompt = button.getAttribute("data-prompt");
      const combinedText = strategyText + "\n\n" + structuredPrompt;

      navigator.clipboard.writeText(combinedText)
        .then(() => {
          button.textContent = "Copied!";
          setTimeout(() => {
            button.textContent = originalText;
          }, 1200);
        })
        .catch(() => {
          alert("Clipboard copy failed.");
        });

    });

  });

}



// ==========================
// FEEDBACK SUBMISSION
// ==========================

// Optional: Keep Google Sheet integration
// Replace with your current Web App URL if desired

const WEB_APP_URL = "YOUR_GOOGLE_SCRIPT_URL_HERE";

const submitBtn = document.getElementById("submitFeedbackBtn");
const statusBox = document.getElementById("feedbackStatus");

if (submitBtn) {

  submitBtn.addEventListener("click", async () => {

    const newStrategy = document.getElementById("newStrategyInput")?.value.trim() || "";
    const editRecommendation = document.getElementById("editRecommendationInput")?.value.trim() || "";
    const pageImprovement = document.getElementById("pageImprovementInput")?.value.trim() || "";

    if (!newStrategy && !editRecommendation && !pageImprovement) {
      statusBox.textContent = "Please enter at least one contribution.";
      return;
    }

    statusBox.textContent = "Submitting...";

    try {

      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          newStrategy,
          editRecommendation,
          pageImprovement
        })
      });

      statusBox.textContent = "Contribution recorded.";

      document.getElementById("newStrategyInput").value = "";
      document.getElementById("editRecommendationInput").value = "";
      document.getElementById("pageImprovementInput").value = "";

    } catch (error) {
      statusBox.textContent = "Submission failed.";
    }

  });

}

