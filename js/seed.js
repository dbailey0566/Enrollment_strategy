import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

function buildItems(list) {
  return list.map(text => ({
    text,
    status: "Proposed",
    lead: "",
    impact: "Moderate",
    feasibility: "Moderate",
    startDate: "",
    reviewDate: "",
    metric: ""
  }));
}

const fullPlan = [

  {
    id: "pillar1",
    title: "Relationship Driven Enrollment",
    goal: "Make relational capital the primary enrollment engine through intentional, structured outreach.",
    items: buildItems([
      "Formal student ambassador program",
      "Ambassador branding and recognition model",
      "Alumni engagement group",
      "Bring a Future Leader referral recognition program",
      "Alumni impact map",
      "Annual alumni spotlight campaign",
      "Student testimonial video series",
      "Future Doctor pathway for APSU master’s students",
      "Early EdD seminar invitations for master’s students",
      "Collaboration pipeline with MSL and statistics programs",
      "Expand transfer credit beyond AAPN and MSL where feasible",
      "District partnership cohorts",
      "Clarksville-Montgomery County Schools cohort model",
      "Fort Campbell partnership pipeline",
      "Tennessee community college targeting strategy",
      "Adjunct and higher ed professional pipeline targeting",
      "Conference presence strategy by concentration",
      "Superintendent and district leadership meeting engagement",
      "Guest lectures at community colleges and campus organizations",
      "Faculty representation at career fairs and district events"
    ])
  },

  {
    id: "pillar2",
    title: "Funding and Financial Leverage",
    goal: "Remove financial barriers while aligning funding structures with enrollment growth and completion.",
    items: buildItems([
      "Pro forma modeling requirement for scholarship proposals",
      "Completion driven funding formula alignment",
      "Enrollment growth tied scholarship strategy",
      "Micro scholarships for recruitment",
      "Dissertation completion mini grants",
      "District tuition sharing agreements",
      "Employer reimbursement alignment strategy",
      "Differential tuition reinvestment model",
      "Expand summer GA coverage",
      "Centralized COE assistantship pool",
      "Cross campus assistantship placements",
      "Grant funded GA integration",
      "Federal grant integration with stipend lines",
      "State shortage initiative alignment",
      "Grow Your Own district leadership funding",
      "Foundation funded thematic fellowships",
      "Named cohort donor scholarship model",
      "Retired educator donor campaign",
      "Dedicated structure to assist students in applying for external fellowships"
    ])
  },

  {
    id: "pillar3",
    title: "Brand Positioning and Market Clarity",
    goal: "Position the program as future oriented, regionally anchored, and professionally elevating.",
    items: buildItems([
      "Unified professional identity narrative",
      "Leadership for the New South positioning",
      "Rural and small district innovation emphasis",
      "Military connected leadership focus",
      "Community anchored transformation focus",
      "Concentration level messaging clarity",
      "Highlight microcredentials and CEUs",
      "Emphasize wellbeing and professional growth",
      "APSU Leadership Lab digital showcase",
      "Student innovation project features",
      "Faculty thought leadership briefs",
      "EdD podcast series",
      "Alumni leadership spotlight series",
      "30 second student story videos",
      "Day in the life EdD reels",
      "Faculty short explainer videos",
      "Dissertation success clips",
      "AI concentration development",
      "Study abroad pilot",
      "Exchange partnerships",
      "Stackable micro credentials feeding into EdD",
      "Signature pedagogy framework"
    ])
  },

  {
    id: "pillar4",
    title: "Digital Conversion and System Responsiveness",
    goal: "Convert interest to enrollment through structured communication and responsive systems.",
    items: buildItems([
      "Information session redesign",
      "Embed student panel in sessions",
      "Add dissertation transparency component",
      "24 hour faculty response expectation",
      "Clear COGS to faculty handoff protocol",
      "Designated faculty inquiry lead",
      "Personalized automated email sequences",
      "Barrier based messaging campaigns",
      "Prospect nurturing flow in SLATE",
      "One way text optimization",
      "Doctoral preview nights",
      "Sit in on a live class opportunity",
      "Dissertation demystification workshop",
      "Mobile optimized website enhancements",
      "Strong calls to action on landing pages",
      "Short video embedded on landing page"
    ])
  },

  {
    id: "pillar5",
    title: "Targeted Recruitment Segments",
    goal: "Strategically expand into high potential enrollment segments.",
    items: buildItems([
      "Military credit articulation expansion",
      "Military leadership bridge certificate",
      "GTA and scholarship leverage for veterans",
      "Fort Campbell recruitment events",
      "International GTA and scholarship leverage",
      "SSCT concentration targeted outreach",
      "Grant funded international recruitment",
      "Adjunct faculty pipeline targeting",
      "Community college leadership targeting",
      "Higher education administrator targeting",
      "District succession planning alignment",
      "AI concentration targeted campaign",
      "Academic advising certificate cross marketing"
    ])
  },

  {
    id: "pillar6",
    title: "Access and Structural Onboarding",
    goal: "Reduce structural barriers to entry and early persistence.",
    items: buildItems([
      "Clarify prior learning credit policies",
      "Expand transfer credit articulation",
      "Statistics course equivalency review",
      "Structured onboarding module",
      "Welcome package addressing imposter syndrome",
      "Cohort introduction experience",
      "Certificate to EdD ladder model",
      "Master’s to doctorate bridge model"
    ])
  },

  {
    id: "pillar7",
    title: "Retention as Revenue Strategy",
    goal: "Treat persistence and completion as primary revenue drivers.",
    items: buildItems([
      "Mid program review structure",
      "Optional master’s exit credential",
      "Transparent dissertation timeline model",
      "Graduation rate target establishment",
      "Writing bootcamps",
      "Peer accountability pods",
      "Structured mentoring model",
      "Dissertation funding mini grants",
      "Track promotion and leadership outcomes",
      "Publicize dissertation impact stories"
    ])
  }

];

async function seed() {
  try {
    console.log("Seeding full strategic framework...");
    await setDoc(doc(db, "strategy", "pillars"), { data: fullPlan });
    console.log("Seed complete.");
  } catch (error) {
    console.error("Seed failed:", error);
  }
}

seed();