
const form = document.getElementById("organizationForm");

const backupsSelect = document.getElementById("backups");
const backupTestingSelect = document.getElementById("backupTesting");

// ==========================================
// BACKUP TESTING DEPENDENCY
// ==========================================

const backupTestingQuestion = backupTestingSelect.closest(".question");
const backupTestingExplanation = document.createElement("p");
backupTestingExplanation.id = "backupTestingExplanation";
backupTestingExplanation.className = "conditional-note";
backupTestingExplanation.setAttribute("role", "status");
backupTestingQuestion.before(backupTestingExplanation);
backupTestingSelect.setAttribute("aria-describedby", backupTestingExplanation.id);

function updateBackupTesting() {
    const status = backupsSelect.value;
    const enabled = status === "Yes";
    if (!enabled) backupTestingSelect.value = "";
    backupTestingSelect.disabled = !enabled;
    backupTestingSelect.required = enabled;
    backupTestingSelect.dataset.skipped = String(status === "No" || status === "Not Sure");
    backupTestingQuestion.hidden = !enabled;
    backupTestingExplanation.hidden = enabled;
    backupTestingExplanation.textContent = status === "No" ?
        "Question 18 is skipped: backup restoration testing only applies when backups exist." :
        status === "Not Sure" ? "Question 18 is skipped until your organization verifies whether backups exist." :
        "Answer Question 8 about backups to enable Question 18.";
}

backupsSelect.addEventListener("change", updateBackupTesting);
updateBackupTesting();


// Section navigation changes presentation only; answers and recommendation rules are retained.
const questionnaireSections = [...form.querySelectorAll(".question-section")];
const questionnaireFields = [...form.querySelectorAll("input, select")];
const sectionButtons = [...document.querySelectorAll(".section-link")];
const previousSectionButton = document.getElementById("previousSection");
const nextSectionButton = document.getElementById("nextSection");
const generateButton = document.getElementById("generateRecommendations");
let activeSection = 0;

function showQuestionnaireSection(index, focusHeading = true) {
    activeSection = Math.max(0, Math.min(index, questionnaireSections.length - 1));
    questionnaireSections.forEach((section, sectionIndex) => {
        section.hidden = sectionIndex !== activeSection;
    });
    sectionButtons.forEach((button, sectionIndex) => {
        if (sectionIndex === activeSection) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
    });
    document.getElementById("sectionPosition").textContent =
        "Section " + (activeSection + 1) + " of " + questionnaireSections.length;
    previousSectionButton.disabled = activeSection === 0;
    nextSectionButton.hidden = activeSection === questionnaireSections.length - 1;
    generateButton.hidden = activeSection !== questionnaireSections.length - 1;
    if (focusHeading) questionnaireSections[activeSection].querySelector("legend").focus();
}

function updateAssessmentProgress() {
    const applicable = questionnaireFields.filter(field => field.dataset.skipped !== "true");
    const answered = applicable.filter(field => field.value.trim() !== "").length;
    const skipped = questionnaireFields.length - applicable.length;
    document.getElementById("assessmentProgress").max = applicable.length;
    document.getElementById("assessmentProgress").value = answered;
    document.getElementById("progressPercent").textContent = Math.round(answered / applicable.length * 100) + "%";
    document.getElementById("progressText").textContent = answered + " of " + applicable.length + " applicable questions answered" + (skipped ? " · " + skipped + " skipped" : "");
    questionnaireSections.forEach((section, index) => {
        const fields = [...section.querySelectorAll("input, select")].filter(field => field.dataset.skipped !== "true");
        const complete = fields.filter(field => field.value.trim() !== "").length;
        sectionButtons[index].querySelector(".section-counter").textContent = complete + "/" + fields.length;
        sectionButtons[index].classList.toggle("is-complete", complete === fields.length);
    });
}

sectionButtons.forEach((button, index) => {
    button.addEventListener("click", () => showQuestionnaireSection(index));
});
previousSectionButton.addEventListener("click", () => showQuestionnaireSection(activeSection - 1));
nextSectionButton.addEventListener("click", () => showQuestionnaireSection(activeSection + 1));
form.addEventListener("input", updateAssessmentProgress);
form.addEventListener("change", updateAssessmentProgress);

// Native constraints remain intact. Reveal a hidden invalid field before reporting it.
// Without JavaScript the full form remains visible and uses native validation.
form.noValidate = true;
document.getElementById("assessmentSidebar").hidden = false;
document.getElementById("sectionPosition").hidden = false;
document.getElementById("sectionActions").hidden = false;
form.classList.add("has-section-navigation");
showQuestionnaireSection(0, false);
updateAssessmentProgress();
window.addEventListener("pageshow", () => { updateBackupTesting(); updateAssessmentProgress(); });

// ==========================================
// QUESTIONNAIRE SUBMISSION
// ==========================================

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const missingField = questionnaireFields.find(field => field.willValidate && !field.validity.valid);
    if (missingField) {
        const sectionIndex = questionnaireSections.indexOf(missingField.closest(".question-section"));
        showQuestionnaireSection(sectionIndex, false);
        missingField.focus();
        missingField.reportValidity();
        return;
    }

    // Collect the original 20 questionnaire answers
    const organizationData = {
        organizationName:
            document.getElementById("organizationName").value.trim(),

        employeeCount:
            document.getElementById("employeeCount").value,

        itSupport:
            document.getElementById("itSupport").value,

        emergencyContact:
            document.getElementById("emergencyContact").value.trim(),

        backups:
            document.getElementById("backups").value,

        criticalSystems:
            document.getElementById("criticalSystems").value,

        alternateContact:
            document.getElementById("alternateContact").value,

        reportingMethod:
            document.getElementById("reportingMethod").value,

        backupTesting:
            document.getElementById("backupTesting").value,

        mfa:
            document.getElementById("mfa").value,

        existingPlan:
            document.getElementById("existingPlan").value,

        employeeAwareness:
            document.getElementById("employeeAwareness").value,

        sensitiveData:
            document.getElementById("sensitiveData").value,

        deviceIsolation:
            document.getElementById("deviceIsolation").value,

        employeeTraining:
            document.getElementById("employeeTraining").value,

        securityMonitoring:
            document.getElementById("securityMonitoring").value,

        incidentSeverity:
            document.getElementById("incidentSeverity").value,

        responseExercises:
            document.getElementById("responseExercises").value,

        recoveryProcedures:
            document.getElementById("recoveryProcedures").value,

        recoveryCommunication:
            document.getElementById("recoveryCommunication").value,

        
    };




    // ==========================================
    // DISPLAY ORGANIZATION PROFILE
    // ==========================================

    const results = document.getElementById("results");
    const output = document.getElementById("profileOutput");

    output.replaceChildren();

    const fields = [
        ["Organization", organizationData.organizationName],
        ["Employees", organizationData.employeeCount],
        ["IT Support", organizationData.itSupport],
        ["Emergency Contact", organizationData.emergencyContact],
        ["Backups", organizationData.backups],
        ["Critical System", organizationData.criticalSystems],
        ["Alternate Contact", organizationData.alternateContact],
        ["Reporting Method", organizationData.reportingMethod],
        ["Backup Testing", organizationData.backups === "Yes" ? organizationData.backupTesting : "Skipped — " + (organizationData.backups === "No" ? "no backups" : "backup availability unverified")],
        ["MFA", organizationData.mfa],
        ["Existing Response Plan", organizationData.existingPlan],
        ["Employee Awareness", organizationData.employeeAwareness],
        ["Sensitive Data", organizationData.sensitiveData],
        ["Device Isolation", organizationData.deviceIsolation],
        ["Employee Training", organizationData.employeeTraining],
        ["Security Monitoring", organizationData.securityMonitoring],
        ["Incident Severity Assessment", organizationData.incidentSeverity],
        ["Response Exercises", organizationData.responseExercises],
        ["Recovery Procedures", organizationData.recoveryProcedures],
        ["Recovery Communication", organizationData.recoveryCommunication],
        
    ];

    fields.forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");

        strong.textContent = label + ": ";
        paragraph.append(
            strong,
            document.createTextNode(value)
        );

        output.appendChild(paragraph);
    });


    // ==========================================
    // NIST-ALIGNED RECOMMENDATION ENGINE
    // ==========================================

    const { recommendations } = evaluateReadiness(organizationData);

    // ==========================================
    // DISPLAY RECOMMENDATION SUMMARY AND RETAIN THIS SUBMITTED ASSESSMENT
    // ==========================================

    latestAssessmentReport = {
        organizationName: organizationData.organizationName,
        generatedAt: new Date(),
        answers: { ...organizationData },
        overview: fields.map(([label, value]) => [label, value]),
        recommendations: recommendations.map(rec => ({ ...rec }))
    };
    document.getElementById("organizationProfile").open = false;
    document.getElementById("reportStatus").textContent = "";
    const summary = document.getElementById("recommendationsOutput");
    summary.replaceChildren();
    ["High", "Medium", "Low"].forEach(priority => {
        const card = document.createElement("div");
        card.className = "priority-summary-card " + priority.toLowerCase();
        const count = document.createElement("strong");
        count.textContent = recommendations.filter(rec => rec.priority === priority).length;
        const label = document.createElement("span");
        label.textContent = priority + " priority";
        card.append(count, label);
        summary.append(card);
    });
    renderFirstSteps(recommendations, organizationData);


    // ==========================================
    // SHOW RESULTS
    // ==========================================

    results.hidden = false;

    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});

// Reports use a snapshot of the last valid submission, never unsubmitted field edits.
let latestAssessmentReport = null;

// Reuse the engine's priority order and the report's answer-aware guidance.
// Deduplicate only this preview; keep the original findings and counts intact.
function renderFirstSteps(recommendations, answers) {
    const list = document.getElementById("firstStepsList");
    const seen = new Set();
    const selected = recommendations.filter(rec => {
        const key = rec.category.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 3);

    list.replaceChildren();
    selected.forEach((rec, index) => {
        const card = document.createElement("li");
        card.className = "first-step-card";
        const number = document.createElement("span");
        number.className = "first-step-number";
        number.textContent = String(index + 1).padStart(2, "0");
        number.setAttribute("aria-hidden", "true");
        const priority = document.createElement("p");
        priority.className = "first-step-priority";
        priority.textContent = rec.priority + " priority";
        const title = document.createElement("h4");
        title.textContent = rec.category;
        const explanation = document.createElement("p");
        explanation.textContent = getRecommendationGuidance(rec, answers).steps;
        card.append(number, priority, title, explanation);
        list.append(card);
    });
    document.getElementById("firstSteps").hidden = selected.length === 0;
}

const resourceTitles = {
    incidentPlan: "Your Incident Response Plan — Draft",
    recommendations: "Cybersecurity Readiness Report",
    contacts: "Emergency Cybersecurity Contact Card",
    roadmap: "30/60/90-Day Cybersecurity Action Roadmap",
    tabletop: "Practice Your Response — 20-Minute Exercise"
};

document.getElementById("downloadReport").addEventListener("click", () => openPreparednessResource("recommendations"));

document.querySelectorAll("[data-resource]").forEach(button => {
    button.addEventListener("click", () => openPreparednessResource(button.dataset.resource));
});

function openPreparednessResource(kind) {
    if (!latestAssessmentReport || !resourceTitles[kind]) return;
    const reportWindow = window.open("", "_blank");
    const status = document.getElementById("reportStatus");
    if (!reportWindow) {
        status.textContent = "The resource window was blocked. Allow pop-ups for this site, then try again.";
        return;
    }
    reportWindow.opener = null;
    const snapshot = latestAssessmentReport;
    const reportDocument = reportWindow.document;
    reportDocument.title = "Antzecure — " + resourceTitles[kind];
    reportDocument.documentElement.lang = "en";
    const charset = reportDocument.createElement("meta");
    charset.charset = "UTF-8";
    const viewport = reportDocument.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    const stylesheet = reportDocument.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("style.css", document.baseURI).href;
    const styleReady = new Promise(resolve => {
        stylesheet.onload = () => resolve(true);
        stylesheet.onerror = () => resolve(false);
    });
    reportDocument.head.append(charset, viewport, stylesheet);
    reportDocument.body.className = "report-page resource-" + kind;
    // All assessment text and editable defaults use DOM text/value properties, never HTML.
    function element(tag, text, className) {
        const node = reportDocument.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }
    const toolbar = element("div", undefined, "report-toolbar");
    const printHelp = element("p", (kind === "contacts" ? "Fill in missing details, then print. Edits remain in this tab only. " : "") + "Choose Save as PDF in the print dialog. Disable browser headers and footers for a cleaner document.");
    const printButton = element("button", "Print / Save as PDF");
    printButton.type = "button";
    printButton.disabled = true;
    const report = element("main", undefined, "readiness-report");
    const header = element("header", undefined, "report-header");
    const logo = element("img");
    logo.src = new URL("public/assets/antzecure-logo.png", document.baseURI).href;
    logo.alt = "Antzecure";
    logo.width = 65;
    logo.height = 52;
    const title = element("div");
    title.append(element("p", "ANTZECURE", "report-brand"), element("h1", resourceTitles[kind]));
    header.append(logo, title);
    const metadata = element("div", undefined, "report-metadata");
    const date = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric" }).format(snapshot.generatedAt);
    metadata.append(element("h2", snapshot.organizationName), element("p", "Assessment generated: " + date));
    report.append(header, metadata);
    const context = { document: reportDocument, element, report, snapshot };
    if (kind === "recommendations") renderRecommendationsReport(context);
    if (kind === "contacts") renderContactCard(context);
    if (kind === "roadmap") renderRoadmap(context);
    if (kind === "tabletop") renderTabletop(context);
    if (kind === "incidentPlan") renderIncidentPlan(context);
    printButton.addEventListener("click", () => { syncPrintableFields(reportDocument); reportWindow.print(); });
    reportWindow.addEventListener("beforeprint", () => syncPrintableFields(reportDocument));
    toolbar.append(printHelp, printButton);
    reportDocument.body.append(toolbar, report);
    Promise.all([styleReady, logo.decode().then(() => true).catch(() => false)]).then(([stylesLoaded, logoLoaded]) => {
        if (!stylesLoaded || !logoLoaded) {
            printHelp.textContent = "Some document assets could not load. Reload the assessment and reopen this resource before printing.";
            return;
        }
        printButton.disabled = false;
    });
    status.textContent = resourceTitles[kind] + " opened in a new tab. Use Print / Save as PDF to download it.";
}

function renderRecommendationsReport(context) {
    const { element, report, snapshot } = context;
    const overview = element("section", undefined, "report-overview");
    overview.append(element("h2", "Organization overview"));
    const list = element("dl");
    snapshot.overview.forEach(([label, value]) => {
        const item = element("div");
        item.append(element("dt", label), element("dd", value));
        list.append(item);
    });
    overview.append(list);
    const summary = element("section", undefined, "report-priority-summary");
    summary.append(element("h2", "Recommendations by priority"));
    const counts = element("div", undefined, "report-counts");
    ["High", "Medium", "Low"].forEach(priority => {
        counts.append(element("p", priority + " priority: " + snapshot.recommendations.filter(rec => rec.priority === priority).length));
    });
    summary.append(counts);
    report.append(overview, summary);
    ["High", "Medium", "Low"].forEach(priority => {
        const group = element("section", undefined, "report-priority-group");
        group.append(element("h2", priority + "-priority recommendations"));
        const matches = snapshot.recommendations.filter(rec => rec.priority === priority);
        if (!matches.length) group.append(element("p", "No " + priority.toLowerCase() + "-priority recommendations were generated for these answers."));
        matches.forEach(rec => {
            const card = element("article", undefined, "report-recommendation " + priority.toLowerCase());
            const guidance = getRecommendationGuidance(rec, snapshot.answers);
            card.append(element("p", rec.priority + " priority", "report-priority"), element("h3", rec.category), element("p", rec.message));
            [["Why this matters:", guidance.why], ["What you should do:", guidance.steps]].forEach(([label, text]) => {
                const paragraph = element("p", undefined, "report-guidance");
                paragraph.append(element("strong", label + " "), report.ownerDocument.createTextNode(text));
                card.append(paragraph);
            });
            const details = element("details", undefined, "report-technical-reference");
            const toggle = element("summary");
            const chevron = element("span", "›", "reference-chevron");
            chevron.setAttribute("aria-hidden", "true");
            toggle.append(element("span", "Technical reference"), chevron);
            const references = element("div", undefined, "report-reference-content");
            recommendationReferences(rec).forEach(ref => {
                const item = element("p");
                item.append(element("strong", "NIST CSF 2.0: " + ref.code + " — " + ref.name), element("span", ref.explanation));
                references.append(item);
            });
            details.append(toggle, references);
            // A static print copy works even when native details are collapsed.
            // Print only one copy; PDF readers are not expected to support HTML controls.
            const printableReferences = references.cloneNode(true);
            printableReferences.classList.add("technical-reference-print");
            printableReferences.prepend(element("p", "Technical reference", "reference-print-label"));
            card.append(details, printableReferences);
            group.append(card);
        });
        report.append(group);
    });
    report.append(element("p", "Based on the organization's self-reported answers. General cybersecurity guidance, not a professional security assessment or a claim of NIST certification or compliance.", "disclaimer"));
}

// Unknown personnel, providers and systems are left blank, never fabricated.
function knownResourceValue(value) {
    return isKnownContact(value) && !["Yes", "No", "Not Sure", "Other", "Not Established", "Not Applicable"].includes(value) ? value : "";
}

function editableLine(context, labelText, value = "", className = "") {
    const { element } = context;
    const label = element("label", undefined, "resource-field " + className);
    const input = element("input");
    input.type = "text";
    input.value = value;
    input.placeholder = "To be completed";
    input.maxLength = 120;
    const printed = element("span", value || "To be completed", "print-field-value");
    label.append(element("span", labelText, "resource-label"), input, printed);
    input.addEventListener("input", () => { printed.textContent = input.value.trim() || "To be completed"; });
    return label;
}

function syncPrintableFields(doc) {
    doc.querySelectorAll(".resource-field").forEach(field => {
        field.querySelector(".print-field-value").textContent = field.querySelector("input").value.trim() || "To be completed";
    });
}

function renderContactCard(context) {
    const { element, report, snapshot } = context;
    const a = snapshot.answers;
    report.append(element("p", "Keep this card where employees can find it. Complete and verify missing details with your organization before use.", "resource-intro"));
    const fields = element("div", undefined, "contact-fields");
    [
        ["Organization name", a.organizationName],
        ["Primary incident contact", knownResourceValue(a.emergencyContact)],
        ["Primary contact phone number", ""],
        ["Alternate contact", ""],
        ["External IT provider", ""],
        ["External IT provider phone number", ""],
        ["Management contact", ""],
        ["Backup location or backup service", ""],
        ["Person responsible for backups", ""],
        ["Important systems or applications", knownResourceValue(a.criticalSystems)],
        ["Date last reviewed", ""]
    ].forEach(([label, value]) => fields.append(editableLine(context, label, value)));
    report.append(fields);
    const known = a.itSupport === "External IT Provider" ? "External IT support is reported; enter the provider's actual name and number above." : "IT support arrangement reported: " + a.itSupport + ". Enter any designated technical responder's details before use.";
    report.append(element("p", known, "resource-context"));
    const sequence = element("section", undefined, "contact-sequence");
    sequence.append(element("h2", "If suspicious activity occurs"));
    const steps = element("ol");
    ["Report the suspicious activity to the designated contact.", "Contact the alternate person if the primary contact is unavailable.", "Escalate to the external IT provider or designated technical responder.", "Follow approved containment instructions.", "Record the incident and actions taken."].forEach(text => steps.append(element("li", text)));
    sequence.append(steps);
    report.append(sequence);
}

// Planning estimates are conservative indicators, not prices or guaranteed delivery dates.
// stage: 0 = first 30 days, 1 = days 31–60, 2 = days 61–90.
const roadmapPlanning = {
    "Emergency Contact": { stage: 0, effort: "Low", cost: "Free", it: "No", order: 0 },
    "IT Support": { stage: 0, effort: "Medium", cost: "Needs IT Help", it: "Yes", order: 1 },
    "Data Backups": { stage: 0, effort: "High", cost: "Needs IT Help", it: "Yes", order: 2 },
    "Incident Reporting": { stage: 0, effort: "Low", cost: "Free", it: "No", order: 3 },
    "Incident Response Plan": { stage: 0, effort: "Medium", cost: "Needs IT Help", it: "Yes", order: 4, dependsOn: ["Emergency Contact", "IT Support", "Incident Reporting"] },
    "Authentication": { stage: 0, effort: "Medium", cost: "Needs IT Help", it: "Yes", order: 5 },
    "Critical Systems": { stage: 0, effort: "Low", cost: "Free", it: "No", order: 6 },
    "Sensitive Data": { stage: 0, effort: "Medium", cost: "Free", it: "No", order: 7 },
    "Alternate Contact": { stage: 1, effort: "Low", cost: "Free", it: "No", order: 8 },
    "Employee Awareness": { stage: 1, effort: "Low", cost: "Free", it: "No", order: 9 },
    "Employee Training": { stage: 1, effort: "Medium", cost: "Under $100", it: "No", order: 10 },
    "Security Monitoring": { stage: 1, effort: "High", cost: "Needs IT Help", it: "Yes", order: 11, dependsOn: ["Incident Reporting", "IT Support"] },
    "Device Isolation": { stage: 1, effort: "Medium", cost: "Needs IT Help", it: "Yes", order: 12, dependsOn: ["IT Support", "Incident Response Plan"] },
    "Incident Severity Assessment": { stage: 1, effort: "Medium", cost: "Needs IT Help", it: "Yes", order: 13, dependsOn: ["Incident Response Plan"] },
    "Recovery Procedures": { stage: 1, effort: "Medium", cost: "Needs IT Help", it: "Yes", order: 14, dependsOn: ["Data Backups", "IT Support"] },
    "Backup Testing": { stage: 1, effort: "Medium", cost: "Needs IT Help", it: "Yes", order: 15, dependsOn: ["Data Backups", "Recovery Procedures"] },
    "Response Coordination": { stage: 2, effort: "Low", cost: "Free", it: "No", order: 16 },
    "Recovery Communication": { stage: 2, effort: "Low", cost: "Free", it: "No", order: 17 },
    "Incident Response Exercises": { stage: 2, effort: "Medium", cost: "Needs IT Help", it: "Yes", order: 18, dependsOn: ["Incident Response Plan", "Emergency Contact", "Incident Reporting"] }
};
const roadmapStages = ["First 30 Days — Immediate Priorities", "Days 31–60 — Strengthen Security", "Days 61–90 — Practice and Improve"];

function buildRoadmap(snapshot) {
    const ranks = { High: 0, Medium: 1, Low: 2 };
    const actions = snapshot.recommendations.map(rec => {
        const planning = roadmapPlanning[rec.category];
        return { ...rec, ...planning, stage: rec.priority === "Low" ? 2 : planning.stage, dependsOn: [...(planning.dependsOn || [])] };
    });
    const ordered = [];
    const pending = actions.slice().sort((a, b) => a.stage - b.stage || ranks[a.priority] - ranks[b.priority] || a.order - b.order);
    // Only unmet supporting practices are dependencies; maintenance is not a prerequisite.
    while (pending.length) {
        const index = pending.findIndex(action => action.dependsOn.every(category => !pending.some(other => other.category === category && other.priority !== "Low")));
        if (index === -1) throw new Error("Roadmap dependency cycle");
        const action = pending.splice(index, 1)[0];
        const dependencies = ordered.filter(other => action.dependsOn.includes(other.category) && other.priority !== "Low");
        action.stage = Math.max(action.stage, ...dependencies.map(other => other.stage));
        // Limit early-stage workload; remaining high-priority work stays labelled High.
        if (action.stage === 0 && ordered.filter(other => other.stage === 0).length >= 4) action.stage = 1;
        if (action.stage === 1 && ordered.filter(other => other.stage === 1).length >= 6) action.stage = 2;
        action.prerequisites = dependencies.map(other => other.category);
        ordered.push(action);
    }
    return ordered.sort((a, b) => a.stage - b.stage);
}

function renderRoadmap(context) {
    const { element, report, snapshot } = context;
    report.append(element("p", "A rolling 90-day starting point. Adjust dates, workload and ownership to your resources. Staging does not lower a High priority; address active incidents immediately using your approved procedures. Effort and cost are rough planning indicators, not guaranteed prices. “Needs IT Help” means obtain a technical estimate; paid provider work is not assumed free.", "resource-intro"));
    const actions = buildRoadmap(snapshot);
    roadmapStages.forEach((title, stage) => {
        const section = element("section", undefined, "roadmap-stage");
        section.append(element("h2", title));
        const matches = actions.filter(action => action.stage === stage);
        if (!matches.length) section.append(element("p", "No additional actions from this assessment are assigned to this stage."));
        matches.forEach(action => {
            const card = element("article", undefined, "report-recommendation roadmap-action " + action.priority.toLowerCase());
            const check = element("label", undefined, "action-check");
            const checkbox = element("input"); checkbox.type = "checkbox";
            check.append(checkbox, element("span", action.category));
            card.append(check, element("p", action.message));
            card.append(element("p", "Priority: " + action.priority + " · Suggested timeframe: " + ["Days 1–30", "Days 31–60", "Days 61–90"][stage] + " · Effort: " + action.effort + " · Cost: " + action.cost + " · IT assistance needed: " + action.it, "action-estimates"));
            if (action.prerequisites.length) card.append(element("p", "Complete first: " + action.prerequisites.join(", ") + ".", "report-nist"));
            card.append(element("p", "NIST CSF 2.0: " + action.nist, "report-nist"), editableLine(context, "Person responsible"));
            section.append(card);
        });
        report.append(section);
    });
}

function buildTabletopScenario(answers) {
    const scenarios = {
        "Email": "An employee receives an unexpected email asking them to sign in. They then notice that they cannot access their email account. Discuss what you would do if someone else might have accessed the account.",
        "Financial Systems": "Someone notices a payment they do not recognize in the organization's financial system. They are unsure whether it was approved, and access to the system becomes unavailable. Discuss how to report and check the problem.",
        "Customer Records": "A person who normally uses the customer records system cannot open it and sees an unfamiliar sign-in notice. Discuss how to respond to possible access by someone who should not have it; do not assume information was exposed.",
        "Shared Files": "An employee tries to open important shared files, but the files are unavailable. They do not yet know why. Discuss how your team would report the problem and keep essential work going.",
        "Website": "Someone notices that the organization's website is showing an unexpected page instead of its normal content. Discuss how your team would check the report and respond while the website is unavailable."
    };
    return scenarios[answers.criticalSystems] || "Generic practice scenario — the assessment did not name a specific critical system. Imagine that an important work application is unavailable and an employee is unsure why. Choose an example together for this discussion; no particular application is assumed to exist in your organization.";
}

function buildExerciseComplication(answers) {
    const complications = {
        "Email": "The email account is still unavailable, and a colleague asks how to send an urgent update.",
        "Financial Systems": "The financial system is still unavailable, and someone needs to know how an important payment will be handled.",
        "Customer Records": "The records system is still unavailable, and someone asks whether any information was shared without permission; the team does not yet know.",
        "Shared Files": "The shared files are still unavailable, and an employee needs information from them to finish an important task.",
        "Website": "The website is still unavailable, and someone asks whether normal services are continuing."
    };
    const complication = complications[answers.criticalSystems] || "The work application remains unavailable, and someone asks for an update on an important task.";
    return complication + (answers.reportingMethod === "Email" ? " The usual email reporting route may also be affected; discuss which approved alternative you could use." : " Discuss how to give accurate updates without guessing when service will return.");
}

function renderTabletop(context) {
    const { element, report, snapshot } = context;
    const a = snapshot.answers;
    const scenario = element("section", undefined, "tabletop-scenario");
    scenario.append(element("h2", "Your practice scenario"), element("p", "This is a fictional practice situation, not a report of an actual incident."), element("p", buildTabletopScenario(a)));
    scenario.append(element("p", "Talk through your decisions only. Do not turn off real systems, change passwords, open suspicious links, or change work applications during this exercise. No special software or technical experience is needed.", "exercise-safety"));
    const details = element("dl", undefined, "exercise-context");
    const backupText = a.backups === "No" ? "No backups reported: do not assume that separate copies of files are available to restore." : a.backups === "Not Sure" ? "Backup availability is unknown: identify who will check whether separate copies of files exist." : "Backups reported: separate copies of important files are available according to the assessment; restoration testing was answered “" + a.backupTesting + "”. Discuss who would check that copies can actually be used.";
    const supportText = a.itSupport === "No IT Support" ? "No dedicated technology support reported. Discuss who can arrange qualified help; do not assume a provider is already available." : a.itSupport === "External IT Provider" ? "An outside technology-support provider is reported. Confirm how to reach the provider; no provider name or phone number was supplied in the assessment." : a.itSupport === "Internal IT Team" ? "An internal technology-support team is reported. Discuss who from that team should be contacted." : "The Office Manager is reported as responsible for technology support. Discuss when qualified technical help should be arranged.";
    const planText = a.existingPlan === "Yes" ? "A written incident response plan is reported: bring the guide describing what to do during a security problem." : a.existingPlan === "No" ? "No written incident response plan is reported: record unclear decisions as improvements rather than assuming instructions exist." : a.existingPlan === "Partially" ? "A written response guide is partly complete: use available instructions and note what is missing." : "It is not known whether a written response guide exists: identify who will check.";
    const reportingText = a.reportingMethod === "Not Established" ? "No reporting method has been established. Discuss how to agree one and record this as an improvement." : a.reportingMethod === "Other" ? "Other reporting method selected, without details. Ask the group to identify the actual method before relying on it." : a.reportingMethod;
    [["Important system selected", a.criticalSystems], ["Technology support", supportText], ["Emergency contact", knownResourceValue(a.emergencyContact) || "Not assigned or unknown — agree who should be contacted."], ["How to report the problem", reportingText], ["Backups — separate copies of files", backupText], ["Written response guide", planText]].forEach(([label, value]) => {
        const item = element("div");
        item.append(element("dt", label), element("dd", value));
        details.append(item);
    });
    scenario.append(details);
    if (a.sensitiveData === "Yes" || a.sensitiveData === "Not Sure") scenario.append(element("p", a.sensitiveData === "Yes" ? "Sensitive information is reported. Use made-up examples in this exercise; do not read out or copy real personal, customer, employee, or financial records." : "The assessment did not confirm whether sensitive information is held. Note who will check; do not assume that no personal or financial information is involved.", "exercise-privacy"));
    const facilitator = element("section", undefined, "facilitator-guide");
    facilitator.append(element("h2", "Simple facilitator guide — 20 minutes"), element("p", "Choose one person to guide the discussion and another to take notes. Read the scenario aloud, use a timer, and ask everyone for ideas. A critical system means a tool your organization needs for important work. Technology support means the people who help with computers and accounts. Record unknown information instead of guessing, and follow the four steps below."));
    const parts = [
        { title: "Step 1 — Understand the Problem (3 minutes)", questions: ["What happened?", "Which important system is affected?", "Who noticed the problem in this practice scenario?"] },
        { title: "Step 2 — Who Do We Contact? (5 minutes)", questions: ["Who should employees notify, using the contact details recorded above?", "How should the problem be reported?", a.itSupport === "No IT Support" ? "With no dedicated technology support, who could arrange qualified help and when should they do so?" : "When should the technology-support provider or designated technical responder be contacted?"] },
        { title: "Step 3 — What Happens Next? (7 minutes)", complication: buildExerciseComplication(a), questions: ["What if the system stays unavailable?", "How can essential operations continue using approved alternatives?", "Who should communicate updates, and what facts can they confirm?"] },
        { title: "Step 4 — What Did We Learn? (5 minutes)", questions: ["What went well?", "What was confusing?", "What needs improvement?", "Who will be responsible for each improvement?"] }
    ];
    parts.forEach(part => {
        const article = element("article", undefined, "exercise-part");
        article.append(element("h3", part.title));
        if (part.complication) article.append(element("p", "New development: " + part.complication, "exercise-complication"));
        const list = element("ul");
        part.questions.forEach(question => list.append(element("li", question)));
        article.append(list);
        facilitator.append(article);
    });
    const worksheet = element("section", undefined, "lessons-worksheet");
    worksheet.append(element("h2", "What We Learned"), element("p", "Organization: " + snapshot.organizationName), element("p", "Use the space below to record your discussion and agree on follow-up work."));
    ["What went well?", "What was confusing?", "What needs improvement?", "What action will we take next?", "Who will be responsible?", "Target completion date"].forEach(label => {
        const block = element("div", undefined, "worksheet-answer");
        block.append(element("h3", label), element("div", undefined, "writing-lines"));
        worksheet.append(block);
    });
    report.append(scenario, facilitator, worksheet);
}

// Central rule evaluator: no DOM dependencies, so findings can be exercised independently.
function isKnownContact(value) {
    return Boolean(value && !["i don't know", "idk", "unknown", "none", "n/a", "not sure", "not assigned", "not applicable"].includes(value.trim().toLowerCase()));
}
function evaluateReadiness(organizationData) {
    const recommendations = [];

    function addRecommendation(priority, category, message, nist) {
        recommendations.push({
            priority,
            category,
            message,
            nist
        });
    }


    // ==========================================
    // 1. ORGANIZATION SIZE — NIST GV.RR
    // ==========================================

    if (organizationData.employeeCount === "51+") {
        addRecommendation(
            "Medium",
            "Response Coordination",
            "Clearly document incident response roles, " +
            "responsibilities, and escalation procedures " +
            "for your organization.",
            "GV.RR"
        );
    } else {
        addRecommendation(
            "Low",
            "Response Coordination",
            "Keep incident response procedures simple and " +
            "assign responsibilities appropriate to your team size.",
            "GV.RR"
        );
    }


    // ==========================================
    // 2. CRITICAL SYSTEMS — NIST ID.AM
    // ==========================================

    if (organizationData.criticalSystems === "Not Sure") {
        addRecommendation(
            "High",
            "Critical Systems",
            "Identify the systems essential to daily operations " +
            "and establish recovery priorities.",
            "ID.AM"
        );
    } else {
        addRecommendation(
            "Medium",
            "Critical Systems",
            "Document recovery procedures and dependencies for " +
            organizationData.criticalSystems + ".",
            "ID.AM"
        );
    }


    // ==========================================
    // 3. IT SUPPORT — NIST GV.RR
    // ==========================================

    if (organizationData.itSupport === "No IT Support") {
        addRecommendation(
            "High",
            "IT Support",
            "Assign an incident response coordinator and arrange " +
            "qualified external technical assistance.",
            "GV.RR"
        );

    } else if (organizationData.itSupport === "External IT Provider") {
        addRecommendation(
            "Medium",
            "IT Support",
            "Confirm that your external IT provider can assist " +
            "during cybersecurity incidents and document " +
            "escalation procedures.",
            "GV.RR"
        );

    } else if (organizationData.itSupport === "Office Manager") {
        addRecommendation(
            "Medium",
            "IT Support",
            "Define the Office Manager's incident reporting role " +
            "and identify qualified technical support.",
            "GV.RR"
        );

    } else {
        addRecommendation(
            "Low",
            "IT Support",
            "Document the internal IT team's incident response duties.",
            "GV.RR"
        );
    }


    // ==========================================
    // 4. EMERGENCY CONTACT — NIST RS.CO
    // ==========================================

    const contact = organizationData.emergencyContact;



    if (
        !isKnownContact(contact)
    ) {
        addRecommendation(
            "High",
            "Emergency Contact",
            "Assign a primary cybersecurity incident reporting " +
            "contact and communicate this information to employees.",
            "RS.CO"
        );

    } else {
        addRecommendation(
            "Low",
            "Emergency Contact",
            "Confirm that employees know how to contact " +
            contact + " during a cybersecurity incident.",
            "RS.CO"
        );
    }


    // ==========================================
    // 5. DATA BACKUPS — NIST PR.DS
    // ==========================================

    if (organizationData.backups === "No") {
        addRecommendation(
            "High",
            "Data Backups",
            "Establish secure, protected backups for critical " +
            "organizational data.",
            "PR.DS"
        );

    } else if (organizationData.backups === "Not Sure") {
        addRecommendation(
            "High",
            "Data Backups",
            "Verify whether critical organizational data is backed up, where backups are stored, and who owns the backup process.",
            "PR.DS"
        );

    } else {
        addRecommendation(
            "Low",
            "Data Backups",
            "Maintain protected backups and periodically " +
            "review backup procedures.",
            "PR.DS"
        );
    }


    // ==========================================
    // 6. ALTERNATE CONTACT — NIST RS.CO
    // ==========================================

    if (organizationData.alternateContact === "No") {
        addRecommendation(
            "Medium",
            "Alternate Contact",
            "Assign and document an alternate emergency contact " +
            "in case the primary contact is unavailable.",
            "RS.CO"
        );

    } else if (organizationData.alternateContact === "Not Sure") {
        addRecommendation(
            "Medium",
            "Alternate Contact",
            "Verify whether an alternate emergency contact exists " +
            "and ensure employees know how to reach them.",
            "RS.CO"
        );
    }


    // ==========================================
    // 7. INCIDENT REPORTING — NIST RS.CO
    // ==========================================

    if (organizationData.reportingMethod === "Not Established") {
        addRecommendation(
            "High",
            "Incident Reporting",
            "Establish an official method for employees to report " +
            "suspected cybersecurity incidents.",
            "RS.CO"
        );

    } else {
        addRecommendation(
            "Low",
            "Incident Reporting",
            "Ensure employees understand the approved incident " +
            "reporting method: " +
            organizationData.reportingMethod + ".",
            "RS.CO"
        );
    }


    // ==========================================
    // 8. BACKUP TESTING — NIST RC.RP
    // ==========================================

    if (organizationData.backups === "Yes") {
        if (organizationData.backupTesting !== "Yes") {
            addRecommendation(
                "High",
                "Backup Testing",
                "Test backup restoration to verify that important " +
                "data can actually be recovered.",
                "RC.RP"
            );

        } else {
            addRecommendation(
                "Low",
                "Backup Testing",
                "Continue periodic backup restoration testing.",
                "RC.RP"
            );
        }
    }


    // ==========================================
    // 9. MULTI-FACTOR AUTHENTICATION — NIST PR.AA
    // ==========================================

    if (organizationData.mfa === "No") {
        addRecommendation(
            "High",
            "Authentication",
            "Implement multi-factor authentication for important " +
            "accounts, especially administrative and financial accounts.",
            "PR.AA"
        );

    } else if (organizationData.mfa === "Some Accounts") {
        addRecommendation(
            "Medium",
            "Authentication",
            "Expand multi-factor authentication to additional " +
            "important and privileged accounts.",
            "PR.AA"
        );

    } else if (organizationData.mfa === "Not Sure") {
        addRecommendation(
            "Medium",
            "Authentication",
            "Verify which accounts currently use " +
            "multi-factor authentication.",
            "PR.AA"
        );
    }


    // ==========================================
    // 10. INCIDENT RESPONSE PLAN — NIST RS.MA
    // ==========================================

    if (organizationData.existingPlan === "No") {
        addRecommendation(
            "High",
            "Incident Response Plan",
            "Develop a written incident response plan covering " +
            "reporting, escalation, containment, and recovery.",
            "RS.MA"
        );

    } else if (organizationData.existingPlan === "Partially") {
        addRecommendation(
            "Medium",
            "Incident Response Plan",
            "Complete the existing incident response plan and " +
            "document missing procedures and responsibilities.",
            "RS.MA"
        );

    } else if (organizationData.existingPlan === "Not Sure") {
        addRecommendation(
            "Medium",
            "Incident Response Plan",
            "Verify whether a written incident response plan " +
            "exists and where employees can access it.",
            "RS.MA"
        );

    } else {
        addRecommendation(
            "Low",
            "Incident Response Plan",
            "Review and maintain the existing incident response plan.",
            "RS.MA"
        );
    }


    // ==========================================
    // 11. EMPLOYEE AWARENESS — NIST PR.AT
    // ==========================================

    if (
        organizationData.employeeAwareness === "No" ||
        organizationData.employeeAwareness === "Some Employees"
    ) {
        addRecommendation(
            "Medium",
            "Employee Awareness",
            "Ensure all employees understand how to recognize " +
            "and report suspicious cybersecurity activity.",
            "PR.AT"
        );

    } else if (organizationData.employeeAwareness === "Not Sure") {
        addRecommendation(
            "Medium",
            "Employee Awareness",
            "Verify whether employees know how to recognize " +
            "and report suspicious cybersecurity activity.",
            "PR.AT"
        );
    }


    // ==========================================
    // 12. SENSITIVE DATA — NIST ID.AM / RS.AN
    // ==========================================

    if (organizationData.sensitiveData === "Yes") {
        addRecommendation(
            "Medium",
            "Sensitive Data",
            "Review how sensitive information is protected and " +
            "ensure procedures exist for reporting potential " +
            "data exposure.",
            "ID.AM / RS.AN"
        );

    } else if (organizationData.sensitiveData === "Not Sure") {
        addRecommendation(
            "Medium",
            "Sensitive Data",
            "Identify whether your organization stores, processes, or shares sensitive information. Review customer records, employee information, financial records, and third-party applications. Ask system owners what information is collected, who can access it, and where it is stored.",
            "ID.AM"
        );
    }


    // ==========================================
    // 13. DEVICE ISOLATION — NIST RS.MI
    // ==========================================

    if (organizationData.deviceIsolation === "No") {
        addRecommendation(
            "High",
            "Device Isolation",
            "Develop an approved procedure for isolating " +
            "potentially compromised devices, with guidance " +
            "from qualified IT personnel.",
            "RS.MI"
        );

    } else if (organizationData.deviceIsolation === "Not Sure") {
        addRecommendation(
            "Medium",
            "Device Isolation",
            "Confirm whether an approved device isolation " +
            "procedure exists.",
            "RS.MI"
        );
    }


    // ==========================================
    // 14. EMPLOYEE TRAINING — NIST PR.AT
    // ==========================================

    if (organizationData.employeeTraining === "No") {
        addRecommendation(
            "Medium",
            "Employee Training",
            "Introduce regular cybersecurity awareness and " +
            "incident response training for employees.",
            "PR.AT"
        );

    } else if (organizationData.employeeTraining === "Not Sure") {
        addRecommendation(
            "Medium",
            "Employee Training",
            "Review existing employee cybersecurity " +
            "training activities.",
            "PR.AT"
        );

    } else {
        addRecommendation(
            "Low",
            "Employee Training",
            "Continue employee training and periodically " +
            "practice incident response scenarios.",
            "PR.AT"
        );
    }


    // ==========================================
    // 15. SECURITY MONITORING — NIST DE.CM
    // ==========================================

    if (organizationData.securityMonitoring === "No") {
        addRecommendation(
            "High",
            "Security Monitoring",
            "Implement appropriate security monitoring tools " +
            "or services to help detect suspicious activity.",
            "DE.CM"
        );

    } else if (organizationData.securityMonitoring === "Partially") {
        addRecommendation(
            "Medium",
            "Security Monitoring",
            "Expand security monitoring to cover important " +
            "systems and accounts.",
            "DE.CM"
        );

    } else if (organizationData.securityMonitoring === "Not Sure") {
        addRecommendation(
            "Medium",
            "Security Monitoring",
            "Verify which systems and accounts are monitored " +
            "for suspicious activity.",
            "DE.CM"
        );
    }


    // ==========================================
    // 16. INCIDENT SEVERITY — NIST RS.AN / RS.MA
    // ==========================================

    if (organizationData.incidentSeverity === "No") {
        addRecommendation(
            "High",
            "Incident Severity Assessment",
            "Establish a process for evaluating and prioritizing " +
            "cybersecurity incidents based on their impact.",
            "RS.AN / RS.MA"
        );

    } else if (organizationData.incidentSeverity === "Partially") {
        addRecommendation(
            "Medium",
            "Incident Severity Assessment",
            "Complete the incident severity assessment process " +
            "and define escalation criteria.",
            "RS.AN / RS.MA"
        );

    } else if (organizationData.incidentSeverity === "Not Sure") {
        addRecommendation(
            "Medium",
            "Incident Severity Assessment",
            "Verify whether incident severity levels and " +
            "escalation procedures have been established.",
            "RS.AN / RS.MA"
        );
    }


    // ==========================================
    // 17. RESPONSE EXERCISES — NIST ID.IM
    // ==========================================

    if (organizationData.responseExercises === "No") {
        addRecommendation(
            "Medium",
            "Incident Response Exercises",
            "Conduct a tabletop exercise to practice reporting, " +
            "escalation, and incident response decisions.",
            "ID.IM / RS.MA"
        );

    } else if (organizationData.responseExercises === "Not Sure") {
        addRecommendation(
            "Medium",
            "Incident Response Exercises",
            "Verify whether incident response exercises have " +
            "been conducted and document the results.",
            "ID.IM / RS.MA"
        );

    } else {
        addRecommendation(
            "Low",
            "Incident Response Exercises",
            "Continue practicing incident response procedures " +
            "and document lessons learned.",
            "ID.IM"
        );
    }


    // ==========================================
    // 18. RECOVERY PROCEDURES — NIST RC.RP
    // ==========================================

    if (organizationData.recoveryProcedures === "No") {
        addRecommendation(
            "High",
            "Recovery Procedures",
            "Develop documented procedures for restoring " +
            "critical systems after a cybersecurity incident.",
            "RC.RP"
        );

    } else if (organizationData.recoveryProcedures === "Partially") {
        addRecommendation(
            "Medium",
            "Recovery Procedures",
            "Complete recovery procedures for critical systems " +
            "and identify recovery responsibilities.",
            "RC.RP"
        );

    } else if (organizationData.recoveryProcedures === "Not Sure") {
        addRecommendation(
            "Medium",
            "Recovery Procedures",
            "Verify whether documented system recovery " +
            "procedures exist.",
            "RC.RP"
        );
    }


    // ==========================================
    // 19. RECOVERY COMMUNICATION — NIST RC.CO
    // ==========================================

    if (organizationData.recoveryCommunication === "No") {
        addRecommendation(
            "Medium",
            "Recovery Communication",
            "Establish procedures for communicating recovery " +
            "progress to employees and affected stakeholders.",
            "RC.CO"
        );

    } else if (organizationData.recoveryCommunication === "Partially") {
        addRecommendation(
            "Medium",
            "Recovery Communication",
            "Complete recovery communication procedures and " +
            "identify who is responsible for updates.",
            "RC.CO"
        );

    } else if (organizationData.recoveryCommunication === "Not Sure") {
        addRecommendation(
            "Medium",
            "Recovery Communication",
            "Verify whether a recovery communication process " +
            "exists and who is responsible for it.",
            "RC.CO"
        );
    }




    // ==========================================
    // SORT RECOMMENDATIONS BY PRIORITY
    // ==========================================

    const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3
    };

    recommendations.sort((a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority]
    );


    return { recommendations };
}

// Optional reading aids live outside assessment data and never enter generated reports.
(() => {
    const toggle = document.getElementById("explainTerms");
    const preferenceKey = "antzecure.explainTerms";
    const explanations = {
        itSupport: "IT support means the people who help keep your computers, accounts, and other technology working safely.",
        criticalSystems: "Critical systems are the tools your organization relies on to do its work, such as email, payment software, or customer records.",
        sensitiveData: "Sensitive information is information that could harm someone if shared without permission, such as payroll details or customer addresses.",
        mfa: "Multi-factor authentication (MFA) adds another check when signing in, such as a code from an app as well as your password.",
        employeeTraining: "Cybersecurity training helps people spot risks and know what to do, such as reporting an unexpected request for money.",
        backups: "Backups are separate copies of important files that can help you get information back if the originals are lost or damaged.",
        securityMonitoring: "Security monitoring means using tools or services to watch for unusual activity, such as someone signing in from an unexpected place.",
        existingPlan: "An incident response plan is a written guide explaining who to contact and what to do when a security problem occurs.",
        deviceIsolation: "Device isolation is a containment step that limits a problem from spreading, such as disconnecting an affected computer when directed by your IT responder.",
        incidentSeverity: "Incident severity describes how serious a security problem is, such as whether it affects one person's email or stops the whole organization working.",
        responseExercises: "A response exercise lets your team practice discussing a made-up security problem before a real one happens.",
        backupTesting: "Backup testing means checking that saved copies can actually restore the information you need, rather than only checking that copies exist.",
        recoveryProcedures: "Recovery means safely getting important information and tools working again after a security problem, such as restoring files from a backup.",
        recoveryCommunication: "Recovery updates tell affected people what is working again, what is still unavailable, and when to expect more information."
    };
    const help = Object.entries(explanations).map(([id, text]) => {
        const field = document.getElementById(id);
        const note = document.createElement("p");
        note.id = id + "PlainLanguageHelp";
        note.className = "plain-language-help";
        note.textContent = text;
        field.after(note);
        return { field, note };
    });
    function updateExplanations() {
        help.forEach(({ field, note }) => {
            note.hidden = !toggle.checked;
            const descriptions = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
            if (toggle.checked) descriptions.add(note.id);
            else descriptions.delete(note.id);
            if (descriptions.size) field.setAttribute("aria-describedby", [...descriptions].join(" "));
            else field.removeAttribute("aria-describedby");
        });
    }
    try { toggle.checked = localStorage.getItem(preferenceKey) !== "off"; } catch { /* Explanations default on when storage is unavailable. */ }
    updateExplanations();
    document.getElementById("plainLanguageSetting").hidden = false;
    toggle.addEventListener("change", () => {
        updateExplanations();
        try { localStorage.setItem(preferenceKey, toggle.checked ? "on" : "off"); } catch { /* The toggle still works for this page. */ }
    });
})();

// Presentation guidance supplements existing findings; it never changes rules, priorities or mappings.
// Category names follow the NIST CSF 2.0 Core (NIST CSWP 29).
const technicalCategories = {
    "GV.RR": ["Roles, Responsibilities, and Authorities", "Decide who is responsible for cybersecurity decisions and work."],
    "ID.AM": ["Asset Management", "Understand the information, systems and services the organization relies on."],
    "PR.DS": ["Data Security", "Protect information against loss, damage and unauthorized access."],
    "RC.RP": ["Incident Recovery Plan Execution", "Carry out recovery activities and check that systems and information are restored safely."],
    "PR.AA": ["Identity Management, Authentication, and Access Control", "Check who is signing in and limit access to the people who need it."],
    "RS.MA": ["Incident Management", "Manage the response to a detected cybersecurity incident."],
    "PR.AT": ["Awareness and Training", "Help people understand cybersecurity risks and their responsibilities."],
    "RS.CO": ["Incident Response Reporting and Communication", "Report incidents and coordinate information with the people who need it."],
    "RS.AN": ["Incident Analysis", "Investigate an incident to understand what happened and its impact."],
    "RS.MI": ["Incident Mitigation", "Contain an incident and limit its effects."],
    "DE.CM": ["Continuous Monitoring", "Watch systems and activities for signs of potential cybersecurity problems."],
    "ID.IM": ["Improvement", "Use reviews, tests and experience to improve cybersecurity practices."],
    "RC.CO": ["Incident Recovery Communication", "Keep affected people informed while recovery work takes place."]
};

const recommendationGuidance = {
    "Response Coordination": ["When responsibilities are unclear, important decisions can be delayed while a security problem spreads.", "Write down who makes decisions, who contacts technical help, and who updates staff; keep a copy available if email stops working."],
    "Critical Systems": ["Losing access to an essential tool can stop payments, services or day-to-day work.", "List the tools staff need most, who manages each one, and an approved way to keep essential work going if a tool is unavailable."],
    "IT Support": ["Without a clear source of technical help, a small problem may take longer to investigate and contain.", "Agree who will provide technical assistance, record their contact details, and confirm how to reach them during an urgent incident."],
    "Emergency Contact": ["Staff may lose valuable time if they do not know whom to tell about a suspicious email, lost device or account problem.", "Confirm a primary contact and how to reach them, then share those details with staff in a place they can access without email."],
    "Data Backups": ["A lost laptop, damaged file or locked account can permanently remove information if there is no usable separate copy.", "List the information that must be protected, agree who owns the backup process, and ask a qualified responder how to keep separate protected copies."],
    "Alternate Contact": ["An incident can go unreported if the only designated contact is away or cannot be reached.", "Agree on a backup contact, confirm that person accepts the role, and tell staff when and how to contact them."],
    "Incident Reporting": ["A warning can be missed when staff use different or unreliable ways to report a problem.", "Choose a reporting method and an alternative if that method is unavailable, then give staff a short example of what to report and to whom."],
    "Backup Testing": ["A saved copy may be incomplete or unusable, and discovering that during an emergency can delay recovery.", "Ask a qualified technical responder to restore a small sample into a safe separate location, confirm the files open, and record the date and result."],
    "Authentication": ["A stolen password can let someone read email, access records or misuse financial accounts.", "Start with email and financial accounts; ask the account administrator or provider to enable a second sign-in check and explain secure account-recovery options."],
    "Incident Response Plan": ["Without an agreed response, staff may miss important steps or take actions that make the situation harder to resolve.", "Keep a short written guide covering whom to contact, how to report a problem, who approves protective actions, and how essential work will continue."],
    "Employee Awareness": ["Suspicious activity can go unnoticed when staff do not recognize common warning signs.", "Show staff examples of unexpected payment requests and sign-in alerts, and practice reporting them without opening suspicious links."],
    "Sensitive Data": ["Information about customers, staff or finances can harm people and the organization if it is lost or shared without permission.", "Ask the people responsible for customer, payroll and financial tools what information is held, where it is stored, and who can access or share it."],
    "Device Isolation": ["A compromised device may put other computers or shared files at risk if the problem spreads.", "Ask a qualified responder to document when and how a device should be disconnected, who can approve it, and what employees should avoid doing."],
    "Employee Training": ["Staff are less likely to make a costly mistake when they have practiced recognizing and reporting common risks.", "Use a short team session with a realistic example, explain the reporting contact, and record who attended and when to repeat the session."],
    "Security Monitoring": ["Unusual sign-ins or harmful activity may continue longer if nobody receives and reviews warning signs.", "Ask a qualified responder which important accounts and devices send alerts, who reviews those alerts, and how urgent warnings are escalated."],
    "Incident Severity Assessment": ["Staff can waste time or miss a serious problem if there is no shared way to decide how urgent it is.", "Agree on simple examples, such as one affected account versus unavailable essential services, and document who decides when more help is needed."],
    "Incident Response Exercises": ["Unclear roles and missing contact details are easier to fix before a real emergency happens.", "Set aside 20 minutes to discuss a fictional security problem, record unclear decisions, and assign an owner and target date to each improvement."],
    "Recovery Procedures": ["Even after a problem is contained, missing recovery instructions can leave essential work unavailable for longer.", "List the order in which important tools should be restored, who provides technical help, and who checks they are safe before staff use them again."],
    "Recovery Communication": ["Staff and affected people may make poor decisions if they do not know what is available or when another update is expected.", "Choose who provides recovery updates, agree which audiences need them, and use an approved communication method that still works during an outage."]
};

function getRecommendationGuidance(rec, answers) {
    const [why, defaultSteps] = recommendationGuidance[rec.category];
    let steps = defaultSteps;
    if (rec.category === "Data Backups" && answers.backups === "Not Sure") steps = "Ask the people who manage your files and applications whether backups exist, where the latest copies are kept, and who checks that the process is working.";
    if (rec.category === "Data Backups" && answers.backups === "Yes") steps = "Record who checks backup jobs, where protected copies are kept, and when the backup arrangements will next be reviewed.";
    if (rec.category === "Authentication" && answers.mfa === "Not Sure") steps = "List important accounts and ask each administrator or provider which already use a second sign-in check; record any gaps before deciding what to enable.";
    if (rec.category === "Incident Response Plan" && answers.existingPlan === "Not Sure") steps = "Ask the manager or technical provider whether a written response guide exists, check where staff can find it, and identify missing instructions together.";
    if (rec.priority === "Low") steps = "Keep this practice in place: " + (rec.category === "Backup Testing" ? "schedule the next safe sample restoration with your technical responder and record what was recovered." : rec.category === "Data Backups" ? "confirm backup checks still have an owner and review the arrangements when important files or systems change." : rec.category === "Incident Response Exercises" ? "schedule another discussion exercise and follow up on the actions from the last one." : "agree who owns it, review the current arrangements together, and set a date to check them again.");
    return { why, steps };
}

function recommendationReferences(rec) {
    return rec.nist.split("/").map(code => code.trim()).map(code => ({ code, name: technicalCategories[code][0], explanation: technicalCategories[code][1] }));
}

// Shared facts preserve unknown answers; both plan layouts use the same submitted data.
function getIncidentPlanDetails(snapshot) {
    const a = snapshot.answers;
    const contact = knownResourceValue(a.emergencyContact);
    const system = knownResourceValue(a.criticalSystems) || "Critical system not confirmed — identify before an emergency";
    const reported = value => value || "Not confirmed";
    const backup = a.backups === "Yes"
        ? "Backups reported available. A qualified responder must verify that copies are safe and usable before restoring."
        : a.backups === "No" ? "No backups reported. Do not plan to restore from backups that do not exist. Arrange qualified help to assess other recovery options; creating protected backups is a preparation gap."
        : "Backup availability is unconfirmed. Ask a qualified responder to check whether safe copies exist; do not assume restoration is possible.";
    const technical = a.itSupport === "No IT Support"
        ? "No dedicated IT support reported. Arrange qualified technical assistance; no responder is assumed available."
        : a.itSupport === "External IT Provider" ? "External IT provider reported; confirm the provider, named responder and urgent phone number."
        : a.itSupport === "Internal IT Team" ? "Internal IT team reported; confirm the named responder and urgent phone number."
        : "IT responsibility reported: " + reported(a.itSupport) + ". Confirm qualified technical assistance; this answer does not establish technical expertise.";
    return { a, contact, system, reported, backup, technical };
}

// Retained for future expansion; the download uses the three-step draft below.
function renderFullIncidentPlan(context) {
    const { element: el, report, snapshot } = context;
    const { a, contact, system, reported, backup, technical } = getIncidentPlanDetails(snapshot);
    const date = new Date(snapshot.generatedAt);
    const review = new Date(date);
    // Clamp leap-day anniversaries to the last day of February.
    review.setFullYear(date.getFullYear() + 1, date.getMonth(), 1);
    review.setDate(Math.min(date.getDate(), new Date(review.getFullYear(), review.getMonth() + 1, 0).getDate()));
    const fmt = d => new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(d);
    const text = (parent, value, cls) => parent.append(el("p", value, cls));
    function list(parent, items, checks = false) {
        const node = el("ul", undefined, checks ? "plan-checklist" : "");
        items.forEach(value => node.append(el("li", value)));
        parent.append(node);
    }
    function section(page, number, title) {
        const node = el("section", undefined, "plan-section");
        node.dataset.planSection = number;
        node.append(el("h2", number + ". " + title)); page.append(node); return node;
    }
    function table(parent, headings, rows, cls = "") {
        const node = el("table", undefined, "plan-table " + cls);
        const head = el("thead"), tr = el("tr");
        headings.forEach(value => { const th = el("th", value); th.scope = "col"; tr.append(th); });
        head.append(tr); node.append(head);
        const body = el("tbody");
        rows.forEach(row => { const tr = el("tr"); row.forEach(value => tr.append(el("td", value))); body.append(tr); });
        node.append(body); parent.append(node);
    }
    const pages = Array.from({ length: 5 }, (_, i) => {
        const page = el("article", undefined, "plan-sheet");
        const head = el("div", undefined, "plan-running-head");
        head.append(el("strong", "ANTZECURE · INCIDENT RESPONSE"), el("span", snapshot.organizationName));
        page.append(head);
        const body = el("div", undefined, "plan-sheet-body"); page.append(body);
        const footer = el("footer", "Version 1.0 · " + snapshot.organizationName + " · Page " + (i + 1) + " of 5", "plan-footer");
        page.append(footer); return { page, body };
    });
    // Replace only this resource's generic report heading; each printed sheet has its own header.
    report.replaceChildren(...pages.map(p => p.page));
    let s = section(pages[0].body, 1, "Your Plan and Items to Complete");
    text(s, snapshot.organizationName, "plan-org");
    text(s, "DURING AN INCIDENT: turn to page 3 for the first-hour checklist. Contacts and reporting: page 2.", "plan-emergency-guide");
    text(s, "STARTER PLAN — requires organizational review and approval. Version 1.0 · Generated " + fmt(date) + " · Next review " + fmt(review));
    text(s, "Plan owner: __________________  Approval / date: __________________");
    text(s, "Assessment reports an existing response plan: " + reported(a.existingPlan) + ". Reconcile this starter with any approved procedures before use.");
    s.append(el("h3", "Items to Complete Before an Emergency"));
    const prep = snapshot.recommendations.filter(r => r.priority === "High").map(r => r.category + ": " + r.message);
    if (!contact && !snapshot.recommendations.some(r => r.priority === "High" && r.category === "Emergency Contact")) prep.push("Assign and share a primary emergency reporting contact.");
    prep.push("Confirm the plan owner, coordinator and decision approver; record names and phone numbers on page 2.");
    if (a.alternateContact !== "Yes") prep.push("Confirm an alternate emergency contact (assessment: " + reported(a.alternateContact) + ").");
    else prep.push("Record the name and phone number of the reported alternate contact.");
    prep.push(a.itSupport === "External IT Provider" ? "Record the external IT provider's urgent phone number." : "Record the confirmed technical responder's urgent phone number.");
    if (a.backups === "Yes") prep.push("Record backup locations and the person responsible; the assessment does not collect these details.");
    list(s, [...new Set(prep)], true);
    s = section(pages[0].body, 2, "Purpose and What Counts as an Incident");
    text(s, "Use this plan to report a suspected security problem, get authorized help, limit harm and restore essential work. During an incident, start with page 3. Keep a printed copy somewhere staff can reach without email.");
    text(s, "An incident may involve a suspicious link being clicked, an account being taken over, locked files, a lost work laptop, an unexpected payment, or an unavailable system.");
    text(s, "Priority system reported: " + system + ". Unavailable service or unauthorized access to this system needs prompt review.");
    text(s, a.sensitiveData === "Yes" ? "Sensitive information is reported: unauthorized access to customer, employee or financial records may require urgent review." : a.sensitiveData === "No" ? "No sensitive information was reported. Check what information is affected rather than assuming no exposure is possible." : "Sensitive information handling is unconfirmed. Establish whether personal or financial information may be affected.");

    s = section(pages[1].body, 3, "Roles and Emergency Contacts");
    text(s, "Confirmed from assessment: primary reporting contact — " + (contact || "not confirmed") + "; alternate contact available — " + reported(a.alternateContact) + ". A reporting contact is not automatically the coordinator or decision approver.");
    text(s, technical);
    table(s, ["Role / responsibility", "Name and phone — complete before an emergency"], [
        ["Incident Coordinator — organizes response and updates", "Name: __________________  Phone: __________________"],
        ["Alternate Coordinator — takes over if unavailable", "Name: __________________  Phone: __________________"],
        ["Technical Responder — investigates; recommends safe actions", "Name: __________________  Phone: __________________"],
        ["Decision Approver — approves disruption and spending", "Name: __________________  Phone: __________________"],
        ["Primary reporting contact", (contact || "Not yet assigned — complete before an emergency") + " · Phone: __________________"],
        ["External IT Provider — if applicable", "Provider: ________________  Phone: __________________"],
        ["Bank Fraud Contact — if applicable", "Name: __________________  Phone: __________________"],
        ["Cyber Insurance Contact — if applicable", "Name: __________________  Phone: __________________"],
        ["Legal Advisor — if applicable", "Name: __________________  Phone: __________________"],
        ["Law enforcement — jurisdiction to confirm", "Local agency / phone: __________________  In the US: report internet crime at ic3.gov (FBI IC3); not an emergency service."]
    ]);
    s = section(pages[1].body, 4, "How to Report a Cybersecurity Problem");
    text(s, "Contact first: " + (contact || "Not yet assigned — complete before an emergency") + ". If unavailable, use the confirmed alternate contact; name / phone: __________________.");
    text(s, "Preferred reporting method (assessment): " + reported(a.reportingMethod) + ". " + (a.reportingMethod === "Not Established" || !a.reportingMethod || a.reportingMethod === "Not Sure" ? "Agree and share a reporting route before an emergency. " : "") + "Phone / address / reporting location: __________________.");
    text(s, "Backup route if email or the network is unavailable: phone or in person, subject to confirmation. Phone / safe meeting location: __________________. Do not use a suspected compromised account to coordinate the response.");
    list(s, ["What happened, and when did you notice it?", "Which computer, account or system is affected? Is it still happening?", "Preserve available screenshots or warning messages without reopening suspicious content."]);
    s.append(el("h3", "What NOT to Do"));
    list(s, ["Do not delete suspicious emails, messages or files, or investigate links or files yourself.", "Do not restart, shut down or disconnect equipment unless directed by the authorized responder, except where immediate safety requires action.", "Do not pay ransom or send money without authorized review.", "Do not discuss the incident publicly or share sensitive information."]);

    s = section(pages[2].body, 5, "Incident Severity Levels");
    text(s, "Suggested notification urgency, not an approved response-time policy. The coordinator and technical responder assess severity; the decision approver authorizes disruptive actions. If unsure, request prompt technical review.");
    table(s, ["Level / example", "Notify / urgency"], [
        ["LOW — suspicious email received but not opened", "Report through the normal reporting route."],
        ["MEDIUM — suspicious link clicked or unexpected sign-in", "Notify coordinator promptly; request technical review."],
        ["HIGH — locked files, " + system + " unavailable" + (a.sensitiveData === "Yes" ? ", or possible sensitive information exposure" : ", or possible information exposure"), "Contact coordinator and technical responder immediately; begin response."]
    ]);
    text(s, "Severity assessment process reported: " + reported(a.incidentSeverity) + ". " + (a.incidentSeverity === "Yes" ? "Use the approved process and confirm escalation contacts." : "Confirm severity examples and who escalates; this suggested guide requires approval."));
    s = section(pages[2].body, 6, "What to Do During the First Hour");
    s.classList.add("plan-first-hour");
    const phases = [
        ["FIRST 0–10 MINUTES · NOTICE AND REPORT", ["Stop interacting with anything suspicious. Record what happened and when.", "Contact " + (contact || "the designated emergency contact — assignment required") + "; use the backup route on page 2 if needed.", "Preserve messages and available evidence without opening suspicious content."]],
        ["10–20 MINUTES · ASSESS", ["Coordinator: identify affected systems or accounts; decide Low, Medium or High with technical help.", "Request qualified technical review. " + (a.itSupport === "No IT Support" ? "No dedicated IT support is reported: arrange help; do not investigate yourself." : "Confirm the technical responder can assist."), "Start the incident log on page 5."]],
        ["20–40 MINUTES · CONTAIN", ["Authorized technical responder: recommend safe steps; obtain approval before disconnecting critical systems or taking disruptive actions.", "Restrict access or isolate equipment only when directed by authorized personnel. Record actions and approvals.", "Device isolation procedures reported: " + reported(a.deviceIsolation) + ". " + (a.deviceIsolation === "Yes" ? "Use confirmed approved instructions." : "Procedures need confirmation; do not improvise disconnections.")]],
        ["40–60 MINUTES · PLAN RECOVERY AND COMMUNICATION", ["Identify affected services. Priority system: " + system + ".", backup, "Decide what staff need to know; assign owners and next steps. Recovery procedures: " + reported(a.recoveryProcedures) + "; backup testing: " + (a.backups === "Yes" ? reported(a.backupTesting) : "not applicable until backup availability is established") + ". Confirm details on page 4."]]
    ];
    phases.forEach(([title, items]) => { const block = el("div", undefined, "plan-phase"); block.append(el("h3", title)); list(block, items, true); s.append(block); });
    text(s, "These are suggested checkpoints, not guarantees that containment or recovery can be completed within an hour.");

    s = section(pages[3].body, 7, "Recovering the Critical System");
    text(s, "Priority system to recover: " + system, "plan-org");
    text(s, "Coordinator: __________________ organizes recovery. Technical responder: __________________ performs technical work. Decision approver: __________________ approves service interruption and return to use.");
    text(s, technical); text(s, backup);
    text(s, a.backups === "Yes" ? "Backup location / service: __________________. Backup owner: __________________. Restoration testing reported: " + reported(a.backupTesting) + ". " + (a.backupTesting === "Yes" ? "Confirm the latest test date, scope and result; this does not establish that current copies are safe." : "Do not assume restoration will work; qualified help must verify usability safely.") : "Backup location and restoration testing: not established for recovery. " + (a.backups === "No" ? "Assign an owner to create protected copies before a future emergency; do not copy potentially compromised files without technical review." : "Verify availability, location, owner and test results before considering restoration."));
    text(s, "Recovery procedures reported: " + reported(a.recoveryProcedures) + ". " + (a.recoveryProcedures === "Yes" ? "Locate and validate approved instructions with the responder." : a.recoveryProcedures === "Partially" ? "Complete missing recovery steps with qualified help before relying on them." : "Document safe recovery steps with qualified help; no complete procedure is assumed."));
    const workarounds = { "Customer Records": "an approved paper intake process with restricted access and secure storage to protect personal information", "Email": "an approved alternate phone or in-person communication method", "Financial Systems": "an approved temporary transaction-recording process with authorization checks", "Shared Files": "an approved way to access verified safe essential documents", "Website": "an approved alternate way for customers to contact the organization" };
    text(s, "Suggested temporary workaround — requires approval, not an existing policy: " + (workarounds[a.criticalSystems] || "agree a safe way to continue essential work without the affected system") + ". Owner / approval: __________________.");
    list(s, ["Technical responder: determine what happened and address the cause before bringing systems back.", "Verify safe system configuration, account access and any recovery copies; restore only under qualified direction.", "Test essential tasks and check that information is accurate. Coordinator and approver confirm return to service; monitor for further problems and log the result."], true);
    s = section(pages[3].body, 8, "Communicating During an Incident");
    text(s, "Recovery communication process reported: " + reported(a.recoveryCommunication) + ". " + (a.recoveryCommunication === "Yes" ? "Confirm the approved process and current contacts." : a.recoveryCommunication === "Partially" ? "Complete missing update responsibilities and channels." : "Confirm an update process; none is assumed established."));
    text(s, "Coordinator arranges internal updates. External communication approver: __________________. Authorized customer / partner spokesperson: __________________. Confirm these roles; do not assume the reporting contact has approval authority.");
    text(s, "If email is unavailable, use an approved phone or in-person update route. Method / location: __________________. Next update time: __________________. Log the audience, sender, time and exact information shared.");
    text(s, "Sample message: “We are currently investigating a technology issue affecting some of our services. Our team is working to understand the situation. We will provide another update when more information is available.”");
    text(s, (a.sensitiveData === "Yes" ? "Sensitive information is reported. " : a.sensitiveData === "No" ? "Sensitive information was not reported, but check the actual affected data. " : "Confirm whether sensitive information is involved. ") + "Do not assume a data breach occurred. If information may have been exposed, notification duties depend on jurisdiction, data and circumstances. Obtain qualified legal advice before external notifications, while meeting applicable legal reporting deadlines.");

    s = section(pages[4].body, 9, "Incident Log");
    text(s, "Incident reference / date: __________________  Log keeper: __________________");
    text(s, "Record facts as accurately as possible. Do not guess or change earlier entries without noting the correction. Keep sensitive details secure.");
    table(s, ["Time", "What Happened", "Action Taken", "Person Responsible"], Array.from({length: 8}, () => ["", "", "", ""]), "plan-log");
    s = section(pages[4].body, 10, "Keeping the Plan Updated");
    text(s, "Review at least annually (next review: " + fmt(review) + "), after an incident or tabletop exercise, and when key staff, contact details, critical systems or IT providers change.");
    text(s, "Response exercises reported: " + reported(a.responseExercises) + ". " + (a.responseExercises === "Yes" ? "Repeat a discussion exercise and follow up on lessons learned." : a.responseExercises === "No" ? "Schedule a short discussion exercise; use Antzecure's 20-Minute Exercise to practice without changing live systems." : "Confirm whether exercises have occurred; record the result and schedule practice if needed."));
    list(s, ["Contact information is current.", "Roles and responsibilities are confirmed.", "Critical systems are identified.", "Backup and recovery information is accurate.", "Staff know how to report a problem.", "The plan has been reviewed and practiced."], true);
    text(s, "Reviewed by / date: __________________  Next practice date: __________________");
    text(s, "Notes / follow-up owner: __________________________________________________");
    text(s, "________________________________________________________________________");
    text(s, "Basis: NIST CSF 2.0 (Respond / Recover), NIST SP 800-61 Rev. 3, and CISA incident response guidance. This self-reported starter requires local approval and qualified advice; it does not establish compliance. Reference: nist.gov/cyberframework · cisa.gov/stopransomware/ive-been-hit-ransomware");
    text(s, "Assessment answers are self-reported; suggested actions are recommendations. Blank or unconfirmed fields must be completed by your organization. Store a verified copy securely where staff can reach it during an outage.");
}

// The existing resource entry point now renders the short demo draft only.
function renderIncidentPlan(context) {
    const { element: el, report, snapshot } = context;
    const { a, contact, system, backup, technical } = getIncidentPlanDetails(snapshot);
    const date = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
    const pages = [1, 2].map(number => {
        const page = el("article", undefined, "draft-sheet");
        const header = el("header", undefined, "draft-header");
        header.append(el("p", "ANTZECURE", "report-brand"));
        header.append(el(number === 1 ? "h1" : "p", "Your Incident Response Plan — Draft", "draft-title"));
        header.append(el("p", snapshot.organizationName, "draft-organization"));
        if (number === 1) {
            header.append(el("p", "Date generated: " + date, "draft-date"));
            header.append(el("p", "Starter draft — review and complete contact details before use.", "draft-note"));
        }
        const body = el("div", undefined, "draft-body");
        page.append(header, body, el("footer", "Antzecure · Draft · Page " + number + " of 2", "plan-footer"));
        return { page, body };
    });
    report.replaceChildren(...pages.map(p => p.page));
    function step(page, number, title, explanation, actions, facts) {
        const section = el("section", undefined, "draft-step");
        section.dataset.planStep = number;
        const heading = el("h2");
        heading.append(el("span", String(number).padStart(2, "0"), "draft-step-number"), el("span", title));
        section.append(heading, el("p", explanation, "draft-explanation"));
        const checklist = el("ul", undefined, "plan-checklist");
        actions.forEach(action => checklist.append(el("li", action)));
        const info = el("div", undefined, "draft-facts");
        info.append(el("p", "Your assessment and details to confirm", "draft-facts-label"));
        facts.forEach(([label, value]) => {
            const line = el("p");
            line.append(el("strong", label + ": "), report.ownerDocument.createTextNode(value));
            info.append(line);
        });
        section.append(checklist, info); page.append(section);
        return section;
    }
    const method = a.reportingMethod;
    const knownMethod = ["Phone", "Email", "In Person"].includes(method);
    const firstStep = step(pages[0].body, 1, "Report and Prevent the Problem from Spreading",
        "If you notice something unusual, tell the right person as soon as possible.", [
            "Stop using the suspicious device. Do not open suspicious emails, links, or files.",
            "If ransomware (files locked for payment) or active spreading is suspected, promptly isolate the affected device from the network using approved instructions, when safe and possible.",
            "If unsure how to isolate it, immediately contact the designated IT responder for instructions. If none is assigned, ask the coordinator or manager to arrange qualified help immediately.",
            "Do not shut down, restart, wipe, or investigate the device without authorized guidance, unless immediate safety requires action.",
            "Notify the incident coordinator or manager and IT support immediately. Use the contacts below.",
            "Explain what happened and when you noticed it.",
            "Identify which computer, account, or system may be affected."
        ], [
            ["Primary emergency contact", contact || "Not confirmed — name: __________________"],
            ["Preferred reporting method", knownMethod ? method + " — " + (method === "Email" ? "address" : method === "Phone" ? "phone" : "location") + ": __________________" : "Not confirmed — method / details: __________________"],
            ["Alternate contact", a.alternateContact === "Yes" ? "Reported available — name / phone: __________________" : a.alternateContact === "No" ? "None reported — arrange a backup contact; name / phone: __________________" : "Availability not confirmed — name / phone: __________________"],
            ["Backup reporting", (method === "Email" ? "If email is unavailable, use a confirmed phone or in-person method. " : "If the normal route is unavailable, use a confirmed phone or in-person method. ") + "Phone / location: __________________"]
        ]);
    const contacts = el("div", undefined, "draft-facts draft-contacts");
    contacts.append(el("h3", "Who to Contact"));
    const contactRows = [
        ["Incident coordinator or manager", "Name / phone: __________________. Primary reporting contact from assessment: " + (contact || "Not confirmed — name: __________________") + ". Confirm who will lead the response; the primary contact may have a different role."],
        ["IT support", technical + " Name / phone: __________________"],
        ["Cyber insurance provider (if applicable)", "Coverage not confirmed. Provider / claims phone: __________________"]
    ];
    contactRows.forEach(([label, value]) => {
        const line = el("p");
        line.append(el("strong", label + ": "), report.ownerDocument.createTextNode(value));
        contacts.append(line);
    });
    [["CISA", "https://www.cisa.gov/report"], ["FBI Internet Crime Complaint Center", "https://www.ic3.gov/"]].forEach(([label, url]) => {
        const line = el("p");
        const link = el("a", url);
        link.href = url;
        line.append(el("strong", label + ": "), link);
        contacts.append(line);
    });
    firstStep.append(contacts);
    step(pages[1].body, 2, "Protect Your Organization",
        "Take safe steps to prevent the problem from getting worse while waiting for help.", [
            a.itSupport === "No IT Support" ? "Ask the responsible person to arrange qualified assistance; no dedicated IT support is reported." : "Notify the organization's IT support or designated responder; confirm who can help.",
            "Do not delete suspicious messages or other evidence.",
            "For suspected ransomware or active spreading, follow Step 1 isolation guidance. Otherwise, do not disconnect equipment without authorized instructions. Do not shut down, restart, wipe, or investigate it without authorized guidance, unless immediate safety requires action.",
            "Have the responsible person assess whether important systems or sensitive information are affected.",
            "Record what happened and any actions taken."
        ], [
            ["IT support", technical],
            ["Critical system", system],
            ["Sensitive information", a.sensitiveData === "Yes" ? "Your organization reports handling it. Check whether any may be affected; exposure is not confirmed." : a.sensitiveData === "No" ? "None reported. Check the actual affected information rather than assuming no risk." : "Not confirmed — ask what information may be affected."],
            ["Device isolation", a.deviceIsolation === "Yes" ? "Procedures reported. For suspected ransomware or spreading, promptly follow approved isolation instructions when safe and possible (Step 1). If unsure, ask the IT responder immediately." : a.deviceIsolation === "Partially" ? "Procedures are incomplete. Confirm safe instructions with qualified help; do not improvise disconnections." : "Procedures not confirmed or not in place. Obtain qualified guidance; do not improvise disconnections."]
        ]);
    step(pages[1].body, 3, "Recover and Follow Up",
        "Work with the responsible people to restore normal operations safely.", [
            "Identify which important systems need to be restored.",
            a.backups === "No" ? "No backups are reported. Arrange qualified help to assess other recovery options; do not assume backup restoration is possible." : a.backups === "Yes" ? "Have qualified personnel confirm that backups are safe and usable before any restoration." : "Confirm whether backups exist and are safe; do not assume they are available.",
            "Have qualified personnel verify that affected systems are safe before returning them to use.",
            "Inform employees about the status of the problem through an approved method.",
            "Record what happened and identify improvements for the future."
        ], [
            ["Priority system to recover", system],
            ["Backups", backup],
            ["Backup testing", a.backups !== "Yes" ? "Not established for recovery — confirm backup availability first." : a.backupTesting === "Yes" ? "Testing reported. Confirm the latest result; qualified personnel must still check current copies." : a.backupTesting === "No" ? "Backups have not been tested. Have qualified personnel verify usability; do not assume restoration will work." : "Testing status is unconfirmed — ask the backup owner or provider to verify."],
            ["Recovery procedures", a.recoveryProcedures === "Yes" ? "Procedures reported. Locate the approved instructions and confirm who performs recovery." : a.recoveryProcedures === "Partially" ? "Procedures are incomplete. Confirm missing steps with qualified help." : a.recoveryProcedures === "No" ? "No procedures reported. Arrange qualified help to agree safe recovery steps." : "Status unconfirmed. Check whether approved recovery instructions exist."],
            ["Staff updates", a.recoveryCommunication === "Yes" ? "A process is reported. Confirm the person and approved method; use an approved phone or in-person route if email is unavailable." : a.recoveryCommunication === "Partially" ? "The process is incomplete. Agree who updates staff and how, including a backup if email is unavailable." : "An update process is not confirmed or not in place. Agree who updates staff and which approved method works if email is unavailable."],
            ["Details to complete", "Recovery lead: __________________  Staff update contact / method: __________________"]
        ]);
}
