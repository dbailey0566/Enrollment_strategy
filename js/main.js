// ==========================
// FIREBASE IMPORTS (MUST BE FIRST)
// ==========================
import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { getFirestore, doc, getDoc, setDoc }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==========================
// FIREBASE INIT
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyBsOymwzWb8cJfqfmW96Dc4RcsWrU8zpKs",
  authDomain: "apsu-edd-strategy.firebaseapp.com",
  projectId: "apsu-edd-strategy",
  storageBucket: "apsu-edd-strategy.firebasestorage.app",
  messagingSenderId: "687117441644",
  appId: "1:687117441644:web:2678e67d519cc6ef3e9649"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  })
  .catch(err => console.error("Error loading meta.json:", err));

// ==========================
// LOAD PILLARS
// ==========================
async function loadPillars() {
  try {
    const snap = await getDoc(doc(db, "strategy", "pillars"));

    if (!snap.exists()) {
      console.error("No strategy document found.");
      return;
    }

    const pillars = snap.data().data;
    const container = document.getElementById("pillarContainer");
    if (!container) return;

    container.innerHTML = "";

    pillars.forEach(p => {
      const section = document.createElement("section");
      section.dataset.pillarId = p.id;

      const itemsHtml = (p.items || []).map(item => {

        const obj = typeof item === "string"
          ? {
              text: item,
              status: "Proposed",
              lead: "",
              impact: "Low",
              feasibility: "Complex",
              startDate: "",
              reviewDate: "",
              metric: ""
            }
          : item;

        return `
          <div class="plan-item-block">

            <div class="editable item-text">${obj.text || ""}</div>

            <div class="plan-item-controls">

              <select class="item-status" disabled>
                ${["Proposed","Approved","Active","Complete","Retired"]
                  .map(s => `<option value="${s}" ${obj.status === s ? "selected" : ""}>${s}</option>`)
                  .join("")}
              </select>

              <input class="item-lead" type="text"
                value="${obj.lead || ""}"
                placeholder="Lead"
                disabled>

              <select class="item-impact" disabled>
                ${["Low","Moderate","High","Transformational"]
                  .map(level => `<option value="${level}" ${obj.impact === level ? "selected" : ""}>${level} Impact</option>`)
                  .join("")}
              </select>

              <select class="item-feasibility" disabled>
                ${["Complex","Moderate","Easy"]
                  .map(level => `<option value="${level}" ${obj.feasibility === level ? "selected" : ""}>${level}</option>`)
                  .join("")}
              </select>

              <input class="item-start" type="date"
                value="${obj.startDate || ""}"
                disabled>

              <input class="item-review" type="date"
                value="${obj.reviewDate || ""}"
                disabled>

              <input class="item-metric" type="text"
                value="${obj.metric || ""}"
                placeholder="Enrollment KPI"
                disabled>

            </div>
          </div>
        `;
      }).join("");

      const notesHtml = p.notes
        ? `<div class="notes"><strong>Note</strong><div class="editable">${p.notes}</div></div>`
        : "";

      section.innerHTML = `
        <details open>
          <summary><strong>${p.title}</strong></summary>
          <div class="card">

            <strong>Goal</strong>
            <div class="editable goal">${p.goal || ""}</div>



            <div class="pillar-items">
              ${itemsHtml}
            </div>

            ${notesHtml}

          </div>
        </details>
      `;

      container.appendChild(section);
    });

  } catch (err) {
    console.error("Error loading pillars:", err);
  }
}

// Load pillars AND enable drag after render

let sortables = [];
loadPillars().then(enableSorting);


function enableSorting() {

  if (typeof Sortable === "undefined") {
    console.error("SortableJS not loaded.");
    return;
  }

  if (sortables.length > 0) {
    sortables.forEach(instance => {
      instance.option("disabled", !adminMode);
    });
    return;
  }

  document.querySelectorAll(".pillar-items").forEach(container => {

    const sortable = new Sortable(container, {
      animation: 150,
      disabled: !adminMode,
      ghostClass: "drag-ghost",
      chosenClass: "drag-chosen",
      draggable: ".plan-item-block"
    });

    sortables.push(sortable);
  });
}

  // Otherwise initializ



// ==========================
// ADMIN MODE
// ==========================
let adminMode = false;

const adminToggle = document.getElementById("adminToggle");
const exportBtn = document.getElementById("exportJsonBtn");

adminToggle?.addEventListener("click", () => {

  adminMode = !adminMode;

  document.body.classList.toggle("admin-mode", adminMode);

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

	// Activate / deactivate drag
	enableSorting();

	adminToggle.textContent = adminMode ? "Exit Admin Mode" : "Admin Mode";
});

// ==========================
// EXPORT UPDATED JSON
// ==========================
exportBtn?.addEventListener("click", async () => {

  const sections = document.querySelectorAll("#pillarContainer section");
  const updatedPillars = [];

  sections.forEach(section => {

    const id = section.dataset.pillarId || "";
    const title = section.querySelector("summary strong")?.textContent.trim() || "";
    const goal = section.querySelector(".goal")?.textContent.trim() || "";

    const items = Array.from(
      section.querySelectorAll(".plan-item-block")
    ).map(block => ({
      text: block.querySelector(".item-text")?.textContent.trim() || "",
      status: block.querySelector(".item-status")?.value || "Proposed",
      lead: block.querySelector(".item-lead")?.value.trim() || "",
	  impact: block.querySelector(".item-impact")?.value || "Low",
	  feasibility: block.querySelector(".item-feasibility")?.value || "Complex",
      startDate: block.querySelector(".item-start")?.value || "",
      reviewDate: block.querySelector(".item-review")?.value || "",
      metric: block.querySelector(".item-metric")?.value.trim() || ""
    }));

    const notesEl = section.querySelector(".notes div");
    const notes = notesEl ? notesEl.textContent.trim() : undefined;

    const pillarObj = { id, title, goal, items };
    if (notes) pillarObj.notes = notes;

    updatedPillars.push(pillarObj);
  });

  try {
    await setDoc(doc(db, "strategy", "pillars"), { data: updatedPillars });
    alert("Strategic Plan Updated Successfully.");
  } catch (err) {
    console.error("Update failed:", err);
    alert("Update failed. Check console.");
  }
});

// ==========================
// ENTER / BACKSPACE CONTROL
// ==========================
document.addEventListener("keydown", function (e) {

  if (!adminMode) return;

  const active = document.activeElement;
  if (!active?.classList?.contains("item-text")) return;

  const block = active.closest(".plan-item-block");
  if (!block) return;

  const section = active.closest("section");
  const itemsContainer = section?.querySelector(".pillar-items");
  if (!itemsContainer) return;

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    const newBlock = document.createElement("div");
    newBlock.className = "plan-item-block";

    newBlock.innerHTML = `
      <div class="editable item-text"></div>

		<div class="plan-item-controls">
		  <select class="item-status">
			${["Proposed","Approved","Active","Complete","Retired"]
			  .map(s => `<option value="${s}">${s}</option>`).join("")}
		  </select>

		  <input class="item-lead" type="text" placeholder="Lead">

		  <select class="item-impact">
			${["Low","Moderate","High","Transformational"]
			  .map(level => `<option value="${level}">${level} Impact</option>`).join("")}
		  </select>

		  <select class="item-feasibility">
			${["Complex","Moderate","Easy"]
			  .map(level => `<option value="${level}">${level}</option>`).join("")}
		  </select>

		  <input class="item-start" type="date">
		  <input class="item-review" type="date">
		  <input class="item-metric" type="text" placeholder="Enrollment KPI">
		</div>
    `;

    itemsContainer.insertBefore(newBlock, block.nextSibling);

    newBlock.querySelector(".item-text").contentEditable = true;
    newBlock.querySelector(".item-text").focus();
    return;
  }

  if (e.key === "Backspace") {
    if ((active.textContent || "").trim() !== "") return;

    const prevText = block.previousElementSibling?.querySelector(".item-text");
    block.remove();
    prevText?.focus();

    e.preventDefault();
  }
});

// ==========================
// AI STRATEGY EXPLORER
// ==========================

const aiInput = document.getElementById("aiStrategyInput");
const promptButtons = document.querySelectorAll(".ai-prompt-buttons button");

promptButtons.forEach(button => {

  const originalLabel = button.textContent;

  button.addEventListener("click", async () => {

    const strategyText = aiInput?.value.trim();

    if (!strategyText) {
      alert("Please paste a strategy first.");
      return;
    }

    const promptTemplate = button.dataset.prompt || "";

    const combinedPrompt =
`${promptTemplate}

Strategy:
${strategyText}

Provide a structured, professional response suitable for academic leadership planning.
`;

    try {

      // Write
      await navigator.clipboard.writeText(combinedPrompt);

      // Read back for confirmation
      const clipboardText = await navigator.clipboard.readText();

      const promptIncluded = clipboardText.includes(promptTemplate);
      const strategyIncluded = clipboardText.includes(strategyText);

      if (promptIncluded && strategyIncluded) {
        button.textContent = "Copied ✔ Prompt + Strategy";
      } else {
        button.textContent = "Copied (verify manually)";
      }

      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalLabel;
        button.disabled = false;
      }, 1500);

    } catch (err) {
      console.error("Clipboard verification failed:", err);
      alert("Clipboard access blocked. Must use HTTPS or localhost.");
    }

  });

});

// ==========================
// STRATEGIC PLAN CONTRIBUTION → GOOGLE SHEET
// ==========================

const submitBtn = document.getElementById("submitFeedbackBtn");
const feedbackStatus = document.getElementById("feedbackStatus");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzH0FjRqX8GwuzoIJpGevRu-Lm2ApXKXCXVvS02BMGvHIJ0LvXt3QLOSB4dZLbCC1dMlQ/exec";

submitBtn?.addEventListener("click", async () => {

  const contributorName = document.getElementById("contributorNameInput")?.value.trim();
  const newStrategy = document.getElementById("newStrategyInput")?.value.trim();
  const editRecommendation = document.getElementById("editRecommendationInput")?.value.trim();
  const pageImprovement = document.getElementById("pageImprovementInput")?.value.trim();

  if (!contributorName) {
    feedbackStatus.textContent = "Please provide your name.";
    return;
  }

  if (!newStrategy && !editRecommendation && !pageImprovement) {
    feedbackStatus.textContent = "Please enter at least one contribution.";
    return;
  }

  feedbackStatus.textContent = "Submitting...";

  const formData = new URLSearchParams();
  formData.append("contributorName", contributorName);
  formData.append("newStrategy", newStrategy);
  formData.append("editRecommendation", editRecommendation);
  formData.append("pageImprovement", pageImprovement);

  try {

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.text();

    if (result === "success") {

      feedbackStatus.textContent = "Contribution submitted successfully.";

      document.getElementById("contributorNameInput").value = "";
      document.getElementById("newStrategyInput").value = "";
      document.getElementById("editRecommendationInput").value = "";
      document.getElementById("pageImprovementInput").value = "";

    } else {
      feedbackStatus.textContent = "Submission failed. Please try again.";
    }

  } catch (error) {
    console.error("Submission error:", error);
    feedbackStatus.textContent = "Error submitting. Check connection.";
  }




});