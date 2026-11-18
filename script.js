
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

// One ordered library owns the stories, practice choices and teaching points.
// recommendedWhen rules choose training material, never change assessment findings.
const tabletopScenarios = [
    {
        id: "ransomware", title: "Ransomware",
        recommendedWhen: a => a.backups === "No" || a.backups === "Not Sure",
        opening: "An employee tries to open an important file, but it will not open. A message appears saying the organization's files are locked and money must be paid to unlock them.",
        development: "Another employee sees the same locked-file message on their computer. The person in charge asks how the team would limit the spread during a real incident.",
        optionalDevelopment: "The person who checks backups is away today. The group must identify who else could confirm whether safe copies exist.",
        recognition: "Locked files and a money demand point to ransomware. Do not pay, reply or click anything in the message.",
        collect: "Write down which computer showed the locked-file message and when it appeared.",
        nextQuestions: ["During a real incident, who could guide staff in disconnecting only affected individual devices safely?", "How would your team check safe recovery options without paying a demand?", "What work would need another safe way to continue?"],
        nextAnswers: ["Ask trusted IT help for safe steps for an affected computer. Leave shared equipment to the people responsible for it.", "Give the money demand to leadership for review. Do not pay or reply; payment does not promise that files will come back."],
        lesson: "Know whom to call and check backup readiness before a real locked-file emergency.",
        decision: { step: 3, situation: "In this fictional story, a locked-file message demands payment. What would your team discuss doing next?", recommended: 1,
            options: [
                { text: "Pay the demand at once to try to get files back.", consequence: "Payment may lose money without bringing files back." },
                { text: "Ask the person in charge and trusted IT help to plan safe next steps and check recovery options.", consequence: "This brings the right people into the decision and avoids rushed payment or risky changes." },
                { text: "Try several fixes or switch off shared equipment without asking.", consequence: "Unplanned changes may spread harm, lose useful clues or interrupt other people's work." }
            ], lesson: "During a real incident, get trusted help before changing shared equipment or deciding about money." }
    },
    {
        id: "email-takeover", title: "Email Account Takeover",
        recommendedWhen: a => a.reportingMethod === "Email",
        opening: "A staff member discovers that emails were sent from their work account without their permission. Some of those emails ask vendors to change payment information.",
        development: "A vendor phones to ask whether one of those emails is genuine. The staff member still does not know who can read or send messages from the account.",
        optionalDevelopment: "The team finds more suspicious messages in the account's sent folder. Discuss who would approve contacting the people who received them.",
        recognition: "Treat unexpected sent messages as a sign that someone else may be using the account. Do not use that account to coordinate the response.",
        collect: "List the unexpected sent messages, their recipients and when they were sent.",
        nextQuestions: ["How would your team reach people without using the affected email account?", "Who would approve warning people who received the messages?", "Who would ask trusted IT help to check the account during a real incident?"],
        nextAnswers: ["Use a phone number already on file to contact people who received unexpected messages. Do not coordinate through the affected email account.", "Ask {it} to check account access. Agree which manager will approve warnings to affected recipients."],
        lesson: "Use trusted phone contacts when an email account may be under someone else's control.",
        decision: { step: 2, situation: "A vendor asks about a payment-change email sent from the affected account. Which response would your team choose in this discussion?", recommended: 1,
            options: [
                { text: "Reply from the same email account to say everything is fine.", consequence: "Someone else may still read or send messages from that account." },
                { text: "Discuss calling the vendor on a number already trusted and involving the person in charge.", consequence: "A known number helps the team check the message without relying on the affected email account." },
                { text: "Forward the suspicious email to everyone without checking first.", consequence: "This may spread harmful content or private information and confuse recipients." }
            ], lesson: "A familiar email address alone does not prove who sent a message." }
    },
    {
        id: "payment-fraud", title: "Payment Fraud",
        recommendedWhen: a => a.criticalSystems === "Financial Systems",
        opening: "Your organization receives a message from someone claiming to be a regular vendor. The message asks you to send future payments to a different bank account.",
        development: "The message says the change is urgent and asks the bookkeeper not to phone the vendor. No payment has been made in this practice story.",
        optionalDevelopment: "For a second discussion, imagine a payment was already sent before anyone checked. Who would contact the bank's fraud team promptly, using a trusted number?",
        recognition: "Pause an unusual payment request. Check the change before sending money, even if the vendor name looks familiar.",
        collect: "Record the requested bank change, who sent it and whether any payment was already made.",
        nextQuestions: ["How would your team check a bank-account change using a number it already trusts?", "Who has authority to approve a payment or pause it for review?", "If money had already been sent, who would contact the bank promptly?"],
        nextAnswers: ["Call the vendor using a number already on file. Get approval before sending money or changing bank details.", "If a suspicious payment was made, contact the bank promptly using a trusted number. Record the amount, time, payment reference and who was contacted."],
        lesson: "Check unusual payment requests using contact information your team already trusts.",
        decision: { step: 2, situation: "The vendor name looks familiar, but the message asks for a new bank account. What would your team choose?", recommended: 1,
            options: [
                { text: "Send the payment because the vendor name looks familiar.", consequence: "A familiar name can be copied. The payment could go to a scammer." },
                { text: "Discuss calling the vendor using a phone number your organization already trusts.", consequence: "A trusted number helps confirm whether the request is real before money moves." },
                { text: "Reply to the message to ask whether the new bank details are correct.", consequence: "If a scammer controls the message, they can reply and continue the trick." }
            ], lesson: "Verify unusual payment requests using a known phone number, not the new message." }
    },
    {
        id: "data-exposure", title: "Sensitive Information Exposure",
        recommendedWhen: a => a.sensitiveData === "Yes",
        opening: "An employee reports that a work laptop containing sensitive information has gone missing. The team is unsure whether anyone else can access the information.",
        development: "The employee remembers that the laptop may hold customer and employee records. Nobody has confirmed whether anyone opened them.",
        optionalDevelopment: "A customer asks whether their information was exposed. Discuss who could check the facts and approve a careful reply without guessing.",
        recognition: "Report the missing laptop promptly. Identify what information it held before deciding whether anyone needs to be told.",
        collect: "Record when the laptop was last seen and what customer, employee or financial information it may hold.",
        nextQuestions: ["How would your team find out what information might be on the missing laptop?", "Who would get IT and legal advice before deciding whom to tell?", "What could your team say while the facts are still unknown?"],
        nextAnswers: ["List the kinds of information that may be on the missing laptop. Ask the responsible manager and {it} to check who could access it.", "Ask leadership to get legal or privacy advice about notices and deadlines. Check the facts before telling anyone their information was exposed."],
        lesson: "Report a lost device promptly, check the facts and get advice before making claims about exposed information.",
        decision: { step: 3, situation: "Someone asks whether all customer records were stolen from the missing laptop. The team does not know yet. Which answer would it discuss?", recommended: 1,
            options: [
                { text: "Announce that all records were stolen.", consequence: "That claim is not supported by the facts and may cause avoidable fear." },
                { text: "Explain that the facts need checking and ask leadership to get IT and legal advice.", consequence: "This avoids guessing while allowing the right people to assess notices and deadlines." },
                { text: "Assume nothing happened and avoid telling the person in charge.", consequence: "Delay may prevent the team from checking the risk and meeting any reporting duties." }
            ], lesson: "A missing laptop needs prompt review; it does not automatically prove a data breach." }
    },
    {
        id: "phishing", title: "Phishing",
        recommendedWhen: () => true,
        opening: "An employee clicks a link in an email and enters their work password on a website. Later, they realize the website may have been fake.",
        development: "The employee receives an unexpected sign-in alert for the same account. The team must discuss how it would report this and ask for help.",
        optionalDevelopment: "The fake email appears in another colleague's inbox. Discuss who could warn staff without forwarding the harmful link.",
        recognition: "Stop using the suspicious page. Tell your emergency contact immediately if a work password was entered.",
        collect: "Record when the link was opened, which account was involved and whether a password was entered.",
        nextQuestions: ["During a real incident, who would arrange safe help to protect the account?", "How would trusted IT help check for unusual account use?", "Who would approve a staff warning without forwarding the suspicious link?"],
        nextAnswers: ["Tell {it} if a password was entered. Ask how they would protect the account and check unusual sign-ins during a real incident.", "Agree who would warn staff and what they would say. Describe the suspicious message without forwarding its harmful link."],
        lesson: "Report a suspected fake sign-in quickly and ask for safe help without blaming the person who clicked.",
        decision: { step: 3, situation: "The employee entered a password on a page that may be fake. Which next step would your team discuss?", recommended: 1,
            options: [
                { text: "Open the page again to investigate it alone.", consequence: "More contact with the page may create further risk and is not needed for reporting." },
                { text: "Discuss reporting promptly and asking trusted help to protect and check the account.", consequence: "Prompt reporting gives the right people a chance to check account use and guide safe steps." },
                { text: "Wait quietly to see if anything else happens.", consequence: "Delay may give someone more time to misuse the account." }
            ], lesson: "A quick, blame-free report is safer than investigating a suspicious page yourself." }
    }
];

function recommendTabletopScenario(answers) {
    return tabletopScenarios.find(scenario => scenario.recommendedWhen(answers));
}

function buildTabletopScenario(answers, scenarioId) {
    return (tabletopScenarios.find(scenario => scenario.id === scenarioId) || recommendTabletopScenario(answers)).opening;
}

function buildExerciseComplication(answers, scenarioId, optional = false) {
    const scenario = tabletopScenarios.find(scenario => scenario.id === scenarioId) || recommendTabletopScenario(answers);
    return optional ? scenario.optionalDevelopment : scenario.development;
}

// Shared assessment wording never invents a responder, contact, procedure or backup.
function buildTabletopContext(answers) {
    const a = answers;
    const contact = knownResourceValue((a.emergencyContact || "").trim());
    const system = knownResourceValue(a.criticalSystems);
    const it = { "Internal IT Team": "your internal IT team", "External IT Provider": "your external IT provider", "Office Manager": "your Office Manager", "No IT Support": "your manager" }[a.itSupport] || "the person arranging IT help";
    const call = contact ? "Call " + contact + " using a trusted phone number: __________. Do not rely on an email account that may be affected."
        : "Choose a main emergency contact and confirm a trusted phone number: __________. Use that number if email may be affected.";
    const support = a.itSupport === "Internal IT Team" || a.itSupport === "External IT Provider" ? "Call " + it + " using a trusted phone number: __________. Confirm who will help."
        : a.itSupport === "Office Manager" ? "Call your Office Manager: __________. Ask them to arrange help from a trusted IT professional if needed."
        : a.itSupport === "No IT Support" ? "Choose a manager to arrange help from a trusted outside IT professional. Confirm whom they would call and a phone number: __________."
        : "Confirm who provides IT support. Choose someone to arrange trusted help and write down a phone number: __________.";
    const backup = a.backups === "No" ? "Add setting up backups to your improvement list. Your assessment says you have none, so ask " + it + " about other recovery options."
        : a.backups !== "Yes" ? "Confirm whether backups exist and who checks them before making a recovery plan."
        : a.backupTesting === "Yes" ? "Ask " + it + " to check that current backups are safe and usable before recovery. Your assessment says they have been tested before."
        : a.backupTesting === "No" ? "Ask " + it + " how important files could be restored safely. Your assessment says your backups have not been tested."
        : "Ask " + it + " to confirm whether backups have been tested before relying on them.";
    const plan = a.existingPlan === "No" ? "Write down the response steps your team agrees on. Your assessment says you do not have written instructions yet."
        : a.existingPlan === "Yes" ? "Open your written response plan and mark any contact details or instructions that need updating."
        : a.existingPlan === "Partially" ? "Add the missing steps your team noticed to your partly finished response plan."
        : "Confirm whether a written response plan exists. Choose someone to find it or write down the agreed steps.";
    const reporting = a.reportingMethod === "Email" ? "Choose a trusted phone number for urgent help. Do not use email to coordinate if it is down or someone else may have access."
        : a.reportingMethod === "Phone" ? "Find the trusted phone number your team would call and a second number if nobody answers."
        : a.reportingMethod === "In Person" ? "Agree where to find your contact and whom to call if they are away."
        : a.reportingMethod === "Other" ? "Write down your usual reporting method and a phone number to use if it fails."
        : "Choose how employees should tell someone about a problem. Record a main contact and a trusted phone number.";
    const alternate = a.alternateContact === "Yes" ? "Confirm your backup contact's name and phone number so staff know whom to call next."
        : a.alternateContact === "No" ? "Choose a backup contact for when the main contact is unavailable. Record their name and phone number."
        : "Check whether a backup contact exists. If not, agree on a person and a trusted phone number.";
    const update = a.recoveryCommunication === "Yes" ? "Use your staff-update process to agree who will share confirmed facts and when the next update will be."
        : a.recoveryCommunication === "Partially" ? "Finish your staff-update plan: choose who gives updates, what they say and how to reach staff if email is down."
        : "Choose who will update staff, which facts they can share and another way to reach people, such as a phone call.";
    const recovery = a.recoveryProcedures === "Yes" ? "Find the written recovery steps that fit this problem. Agree who will check that normal work can restart safely."
        : a.recoveryProcedures === "Partially" ? "Ask " + it + " to help finish the missing recovery steps before your team relies on them."
        : "Ask " + it + " to help write safe recovery steps and name the person who approves a return to normal work.";
    const severity = a.incidentSeverity === "Yes" ? "Use your process for judging seriousness to decide who needs help first."
        : "Agree who will decide how serious the problem is and tell the person in charge.";
    const practice = a.responseExercises === "Yes" ? "Compare today's actions with your last exercise. Set a date to check whether earlier gaps were fixed."
        : a.responseExercises === "No" ? "Choose one improvement from this first exercise and a date to practice again."
        : "Find out when your team last practiced. Set a date for the next exercise and name who will organize it.";
    const device = a.deviceIsolation === "Yes" ? "Find your approved device-disconnect instructions. Agree who would use them for an affected computer during a real incident; leave shared equipment to " + it + "."
        : "Ask " + it + " who could give safe instructions for an affected computer during a real incident. Do not change shared equipment without their guidance.";
    const sensitive = system ? "Ask whether " + system + (a.sensitiveData === "Yes" ? " or sensitive customer, employee or financial records could be affected." : a.sensitiveData === "No" ? " or other work tools could be affected." : " or any personal or financial information could be affected; confirm what information you handle.")
        : "Name the important tools that could be affected" + (a.sensitiveData === "Yes" ? " and ask whether sensitive customer, employee or financial records are at risk." : "; check what information those tools hold.");
    return { contact, system, it, call, support, backup, plan, reporting, alternate, update, recovery, severity, practice, device, sensitive };
}

function buildTabletopSteps(answers, scenario) {
    const c = buildTabletopContext(answers);
    return [
        { title: "Understand the Problem", minutes: 3,
            questions: ["What happened in this practice story?", c.system ? "Your assessment lists " + c.system + " as your critical system. Which work using it might this story affect, if any?" : "Your critical system is not named. Which tool does your team need most, and might this story affect it?", "What facts would your team check before deciding how serious the problem is?"],
            guidance: [scenario.recognition, c.call, scenario.collect, c.sensitive + " " + c.severity] },
        { title: "Who Do We Contact?", minutes: 5,
            questions: [c.contact ? "Your assessment lists " + c.contact + " as your emergency contact. How would your team reach this person?" : "No emergency contact is named. Who could employees contact during a security problem?", answers.reportingMethod === "Email" ? "Your usual reporting method is email. How would your team reach trusted help if that account could not be used?" : "How would your team use its reporting method and reach a backup contact?", answers.itSupport === "No IT Support" ? "With no IT support listed, who would arrange trusted outside help during a real incident?" : "Who would contact the person who helps fix your computers, and how?"],
            guidance: [c.call, c.reporting, c.support, c.alternate] },
        { title: "What Happens Next?", minutes: 7, questions: scenario.nextQuestions,
            guidance: scenario.id === "ransomware" ? [c.device, c.backup, c.recovery, c.update] : [...scenario.nextAnswers.map(point => point.replaceAll("{it}", c.it)), c.recovery, c.update] },
        { title: "What Did We Learn?", minutes: 5,
            questions: ["What went well?", "What was confusing?", "What needs improvement?", "Who will own each improvement, and when will they check progress?"],
            guidance: [c.plan, c.practice, "Record one clear action, an owner and a target date. Finding a gap is a useful result of practice, not a failure.", scenario.lesson] }
    ];
}

function renderTabletop(context) {
    const { element: el, report, snapshot } = context;
    const a = snapshot.answers;
    const c = buildTabletopContext(a);
    const recommended = recommendTabletopScenario(a);
    const controls = el("div", undefined, "tabletop-controls tabletop-screen");
    const label = el("label", "Choose a Practice Scenario");
    const select = el("select"); select.id = "tabletopScenario"; label.htmlFor = select.id;
    select.setAttribute("aria-describedby", "tabletopScenarioHelp");
    tabletopScenarios.forEach(scenario => {
        const option = el("option", scenario.title); option.value = scenario.id; select.append(option);
    });
    select.value = recommended.id;
    const help = el("p", "Recommended practice scenario based on your assessment. Choose another story if you like.");
    help.id = "tabletopScenarioHelp";
    controls.append(label, select, help);
    const content = el("div", undefined, "tabletop-content"); content.id = "tabletopContent";
    select.setAttribute("aria-controls", content.id);
    const status = el("p", "", "tabletop-screen tabletop-announcement");
    status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite"); status.setAttribute("aria-atomic", "true");
    report.append(controls, status, content);

    const paragraph = (parent, text, className) => { const p = el("p", text, className); parent.append(p); return p; };
    const bullets = (parent, points, className) => { const list = el("ul", undefined, className); points.forEach(point => list.append(el("li", point))); parent.append(list); return list; };
    function decisionKey(parent, decision) {
        const key = el("div", undefined, "tabletop-decision-key"); parent.append(key);
        paragraph(key, "✓ Recommended answer: " + String.fromCharCode(65 + decision.recommended), "tabletop-recommended");
        bullets(key, decision.options.map((option, i) => String.fromCharCode(65 + i) + ": " + option.consequence));
        paragraph(key, "Lesson: " + decision.lesson);
    }
    function decisionPoint(parent, scenario) {
        const decision = scenario.decision;
        const card = el("div", undefined, "tabletop-decision");
        card.dataset.decision = scenario.id;
        const title = el("h4", "Practice decision"); title.id = "decision-" + scenario.id + "-title";
        const situation = el("p", decision.situation, "tabletop-decision-situation"); situation.id = "decision-" + scenario.id + "-situation";
        card.setAttribute("role", "group"); card.setAttribute("aria-labelledby", title.id); card.setAttribute("aria-describedby", situation.id);
        card.append(title, situation);
        paragraph(card, "Choose an answer for discussion. You can change it; no answer blocks the exercise.", "tabletop-screen");
        const choices = el("div", undefined, "tabletop-screen tabletop-choices");
        choices.setAttribute("role", "group"); choices.setAttribute("aria-label", "Practice choices");
        const feedback = el("div", undefined, "tabletop-screen tabletop-feedback");
        feedback.id = "decision-" + scenario.id + "-feedback"; feedback.hidden = true;
        feedback.setAttribute("aria-live", "polite"); feedback.setAttribute("aria-atomic", "true");
        const buttons = decision.options.map((option, i) => {
            const button = el("button", String.fromCharCode(65 + i) + ". " + option.text);
            button.type = "button"; button.setAttribute("aria-pressed", "false"); button.setAttribute("aria-controls", feedback.id);
            button.addEventListener("click", () => {
                buttons.forEach((other, j) => other.setAttribute("aria-pressed", String(i === j)));
                feedback.replaceChildren(); paragraph(feedback, "You chose " + String.fromCharCode(65 + i) + ". Discuss all three outcomes below.");
                decisionKey(feedback, decision); feedback.hidden = false;
            });
            choices.append(button); return button;
        });
        const paperChoices = bullets(card, decision.options.map((option, i) => String.fromCharCode(65 + i) + ". " + option.text), "tabletop-print tabletop-paper-choices");
        paperChoices.setAttribute("aria-label", "Practice choices for printing");
        card.append(choices, feedback); parent.append(card);
    }
    function draw(scenario) {
        const steps = buildTabletopSteps(a, scenario);
        content.replaceChildren(); content.dataset.scenario = scenario.id;
        const opening = el("section", undefined, "tabletop-scenario");
        opening.append(el("h2", "Your practice scenario — " + scenario.title));
        paragraph(opening, buildTabletopScenario(a, scenario.id), "tabletop-opening");
        const safety = el("div", undefined, "exercise-safety"); safety.setAttribute("role", "note");
        safety.append(el("strong", "PRACTICE ONLY — DO NOT CHANGE REAL SYSTEMS"));
        paragraph(safety, "This is a discussion exercise. Talk through what your team would do during a real cybersecurity problem. Do not disconnect computers, change passwords, open suspicious links, send messages, or modify real systems during this practice.");
        opening.append(safety);
        const details = el("dl", undefined, "exercise-context");
        const summary = [
            ["Critical system", c.system || "Not named — identify the tool your team needs most."],
            ["IT support", a.itSupport === "Internal IT Team" ? "Your assessment says you have an internal IT team. Confirm a name and phone number." : a.itSupport === "External IT Provider" ? "Your assessment says you use an external IT provider. Confirm the company and phone number." : a.itSupport === "Office Manager" ? "Your Office Manager handles IT matters; discuss when outside help is needed." : a.itSupport === "No IT Support" ? "No IT support is listed. Identify who could arrange trusted help." : "IT support is not confirmed. Identify who could arrange trusted help."],
            ["Emergency contact", c.contact || "Not named — choose who employees would contact."],
            ["Reporting method", a.reportingMethod === "Email" ? "Email is usual. Discuss a trusted phone number if email is unsafe or down." : a.reportingMethod === "Phone" ? "Phone is usual. Identify a trusted number." : a.reportingMethod === "In Person" ? "In person is usual. Discuss a backup if the contact is away." : "Method not confirmed or not described — identify it together."],
            ["Alternate contact", a.alternateContact === "Yes" ? "Available according to the assessment; name and phone still need confirmation." : a.alternateContact === "No" ? "You told us there is no backup contact. Choose one." : "Unknown — check whether a backup person exists."],
            ["Backups and testing", a.backups === "No" ? "Your assessment says your organization has no backups." : a.backups !== "Yes" ? "Backup availability is unknown — identify who would check." : a.backupTesting === "Yes" ? "You told us your backups have been tested. Check that current copies still work." : a.backupTesting === "No" ? "Your assessment says you have backups, but they have not been tested." : "Your assessment says you have backups; confirm whether they have been tested."],
            ["Written response plan", a.existingPlan === "Yes" ? "Your assessment says you have a written response plan. Identify where it is kept." : a.existingPlan === "No" ? "Your assessment says you have no written response plan. Write down the agreed steps." : a.existingPlan === "Partially" ? "Partly complete — identify the missing instructions." : "Written response instructions are not confirmed — identify who would check."],
            ["Sensitive information", a.sensitiveData === "Yes" ? "Your assessment says your organization handles sensitive information." : a.sensitiveData === "No" ? "You answered No for handling sensitive information. Identify what this situation could affect." : "Your answer did not confirm this. Identify who can check what information you handle."]
        ];
        summary.forEach(([term, value]) => { const row = el("div"); row.append(el("dt", term), el("dd", value)); details.append(row); });
        opening.append(details);
        const words = el("aside", undefined, "tabletop-words"); words.append(el("h3", "Words to Know"));
        bullets(words, ["Incident: a security problem that may harm your accounts, information or work.", "Phishing: a fake message that tries to trick you into sharing information or doing something unsafe.", "Ransomware: harmful software that locks files and asks for money to unlock them.", "Backup: a separate copy of information that may help you get it back.", "Critical system: a tool your organization needs for its most important work."]);
        opening.append(words); content.append(opening);

        const discussion = el("section", undefined, "facilitator-guide tabletop-discussion");
        discussion.append(el("h2", "Simple facilitator guide — 20 minutes"));
        paragraph(discussion, "Choose one person to lead and another to take notes. Read the story aloud, use a timer and invite everyone's ideas. Record unknown details instead of guessing. A missing contact or procedure is a useful finding, not a failure.");
        steps.forEach((step, i) => {
            const article = el("article", undefined, "exercise-part"); article.dataset.step = i + 1; article.dataset.minutes = step.minutes;
            article.append(el("h3", "Step " + (i + 1) + " — " + step.title + " (" + step.minutes + " minutes)"));
            if (i === 2) paragraph(article, "New development: " + buildExerciseComplication(a, scenario.id), "exercise-complication");
            bullets(article, step.questions, "tabletop-questions");
            if (scenario.decision.step === i + 1) decisionPoint(article, scenario);
            const inline = el("div", undefined, "tabletop-screen tabletop-suggestions");
            const button = el("button", "Show Suggested Answers"); button.type = "button";
            const hints = el("div", undefined, "tabletop-hints"); hints.id = "strong-" + scenario.id + "-" + i; hints.hidden = true;
            hints.append(el("h4", "What a Strong Answer Includes")); bullets(hints, step.guidance);
            button.setAttribute("aria-expanded", "false"); button.setAttribute("aria-controls", hints.id);
            button.addEventListener("click", () => {
                hints.hidden = !hints.hidden; button.setAttribute("aria-expanded", String(!hints.hidden));
                button.textContent = hints.hidden ? "Show Suggested Answers" : "Hide Suggested Answers";
            });
            inline.append(button, hints); article.append(inline);
            discussion.append(article);
        });
        const worksheet = el("section", undefined, "lessons-worksheet");
        worksheet.append(el("h2", "What We Learned"));
        paragraph(worksheet, "Organization: " + snapshot.organizationName + " · Practice scenario: " + scenario.title);
        paragraph(worksheet, "Record your discussion and agree on follow-up work. Finding a gap is progress.");
        paragraph(worksheet, c.recovery, "exercise-privacy");
        ["What went well?", "What was confusing?", "What needs improvement?", "What action will we take next?", "Who will be responsible?", "Target completion date"].forEach(label => {
            const block = el("div", undefined, "worksheet-answer");
            block.append(el("h3", label), el("div", undefined, "writing-lines")); worksheet.append(block);
        });
        const guide = el("section", undefined, "tabletop-print tabletop-answer-guide");
        guide.append(el("h2", "Facilitator Answer Guide"));
        paragraph(guide, snapshot.organizationName + " · " + scenario.title + ". Keep these pages separate from the participant discussion pages.");
        steps.forEach((step, i) => {
            const block = el("article", undefined, "tabletop-answer-block");
            block.append(el("h3", "Step " + (i + 1) + " — " + step.title), el("h4", "What a Strong Answer Includes"));
            bullets(block, step.guidance);
            if (scenario.decision.step === i + 1) {
                const answer = el("div", undefined, "tabletop-answer-decision");
                paragraph(answer, "Practice decision: " + scenario.decision.situation); decisionKey(answer, scenario.decision); block.append(answer);
            }
            guide.append(block);
        });
        guide.append(el("h3", "Optional second development — within Step 3's 7 minutes"));
        paragraph(guide, buildExerciseComplication(a, scenario.id, true));
        paragraph(guide, "Use this only if there is time. Skip another Step 3 question if needed; keep the same seven-minute limit.");
        paragraph(guide, "Lesson learned: " + scenario.lesson);
        // Screen facilitators can reveal this extra story without exposing the print answer key.
        const optional = el("details", undefined, "tabletop-screen tabletop-optional");
        optional.append(el("summary", "Facilitator: optional second development (within Step 3's 7 minutes)"));
        paragraph(optional, buildExerciseComplication(a, scenario.id, true));
        paragraph(optional, "Use only if time permits; replace another Step 3 question rather than extending the exercise.");
        discussion.querySelector('[data-step="3"]').append(optional);
        content.append(discussion, worksheet, guide);
    }
    draw(recommended);
    select.addEventListener("change", () => {
        const scenario = tabletopScenarios.find(s => s.id === select.value);
        if (!scenario) return;
        draw(scenario); status.textContent = scenario.title + " practice scenario selected.";
    });
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

// The existing resource entry point consumes only the latest submitted answers.
// Plan fields reuse the contact card helpers; their edits remain in this tab only.
function renderIncidentPlan(context) {
    const { element: el, report, snapshot } = context;
    const a = snapshot.answers;
    const missing = new Set();
    const contact = isKnownContact(a.emergencyContact) ? knownResourceValue(a.emergencyContact) : "";
    const itPhrases = {
        "Internal IT Team": "your internal IT team",
        "External IT Provider": "your external IT provider",
        "Office Manager": "your Office Manager",
        "No IT Support": "your manager"
    };
    const it = itPhrases[a.itSupport] || "your manager";
    const blank = (parent, label, value = "") => parent.append(editableLine(context, label, value, "draft-field"));
    const paragraph = (parent, text, className) => {
        const node = el("p", text, className); parent.append(node); return node;
    };
    const checks = parent => { const list = el("ul", undefined, "plan-checklist"); parent.append(list); return list; };
    const item = (list, text, fields = []) => {
        const li = el("li"); li.append(el("span", text));
        if (fields.length) {
            const row = el("div", undefined, "draft-field-row");
            fields.forEach(([label, value]) => blank(row, label, value)); li.append(row);
        }
        list.append(li); return li;
    };
    function section(number, title, intro) {
        const node = el("section", undefined, "draft-step"); node.dataset.planStep = number;
        const heading = el("h2");
        heading.append(el("span", String(number).padStart(2, "0"), "draft-step-number"), el("span", " — " + title));
        node.append(heading); paragraph(node, intro, "draft-explanation"); report.append(node); return node;
    }
    report.replaceChildren(); report.classList.add("incident-draft");
    const header = el("header", undefined, "draft-header");
    paragraph(header, "Prepared with Antzecure", "report-brand");
    header.append(el("h1", "Your Incident Response Plan — Draft", "draft-title"));
    paragraph(header, snapshot.organizationName, "draft-organization");
    const dates = el("div", undefined, "draft-field-row draft-dates");
    paragraph(dates, "Date created: " + new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date()));
    blank(dates, "Last reviewed"); header.append(dates);
    paragraph(header, "Keep a printed copy. If your computers stop working, you will still have this plan.", "draft-note");
    report.append(header);

    const stop = section(1, "Stop the Spread", "If you think your computer has been attacked, take these steps to help stop the problem from spreading.");
    // Scope the physical disconnect advice to an employee's own device, never shared equipment.
    paragraph(stop, "These steps are for your own computer or device. Do not touch servers, routers, or other shared equipment; ask " + it + " first.", "draft-device-note");
    const stopList = checks(stop);
    item(stopList, "Stop using the affected computer or device.");
    item(stopList, "Disconnect it from the internet: unplug its network cable or turn off Wi-Fi.");
    item(stopList, "Keep it turned on. If you can't disconnect it, call " + it + " right away and ask whether to turn it off.");
    item(stopList, "Do not delete suspicious emails, messages, or files.");
    item(stopList, "Write down what you saw and when. If a warning message is on the screen, take a photo of it with your phone. Do not reopen suspicious emails, links, or files.");
    item(stopList, "Do not reply to or pay anyone who demands money. Your leadership will decide what to do next.");
    if (a.deviceIsolation === "Yes") {
        const note = paragraph(stop, "Your organization has approved steps for disconnecting a device. Follow them.");
        blank(note, "Where to find them");
    } else if (a.deviceIsolation === "No") {
        paragraph(stop, "Disconnecting your own computer from the internet is generally safe if it doesn't affect anyone else's work. For shared equipment, such as servers or network equipment, wait for instructions from " + it + ".");
    } else {
        paragraph(stop, "To disconnect your own computer, unplug the network cable from the computer or turn off its Wi-Fi. Do not touch servers, routers, or other shared equipment. Call " + it + " first.");
        if (a.deviceIsolation === "Partially") paragraph(stop, "Your approved disconnect steps are not finished.");
        else { blank(stop, "Approved disconnect steps — confirm where to find them"); missing.add("Confirm approved disconnect steps."); }
    }
    paragraph(stop, "If there is an immediate danger to people, follow emergency safety procedures first.", "draft-safety");

    const reportStep = section(2, "Report It", "Call the right people immediately so they can help your organization respond.");
    const urgent = el("p", undefined, "draft-urgent");
    urgent.append(el("strong", "For urgent problems, call by phone. "), report.ownerDocument.createTextNode("Email may not work, or the attacker may be able to read it. Use email only for non-urgent reports.")); reportStep.append(urgent);
    if (a.reportingMethod === "Email") paragraph(reportStep, "Your organization usually reports problems by email. In an emergency, call instead.");
    else if (a.reportingMethod === "In Person") paragraph(reportStep, "If your contact is nearby, you can also tell them in person.");
    else if (a.reportingMethod === "Other") blank(reportStep, "Your organization's usual reporting method");
    else if (a.reportingMethod === "Not Established") {
        paragraph(reportStep, "Your organization has not chosen a reporting method yet. Until it does, call your main contact.");
        missing.add("Choose a usual reporting method.");
    } else if (a.reportingMethod !== "Phone") {
        blank(reportStep, "Usual reporting method — confirm"); missing.add("Confirm the usual reporting method.");
    }
    reportStep.append(el("h3", "A. Call right away"));
    const calls = checks(reportStep);
    if (contact) item(calls, "Call " + contact + ".", [["Phone"]]);
    else { item(calls, "No main contact is assigned yet.", [["Main contact name"], ["Phone"]]); missing.add("Assign a main contact."); }
    if (a.alternateContact === "Yes") item(calls, "If your main contact doesn't answer, call your backup contact.", [["Backup contact name"], ["Phone"]]);
    else if (a.alternateContact === "No") {
        item(calls, "No backup contact is assigned. Choose one before an emergency.", [["Backup contact name"], ["Phone"]]); missing.add("Choose a backup contact.");
    } else { item(calls, "Check whether your organization has a backup contact.", [["Backup contact name"], ["Phone"]]); missing.add("Confirm a backup contact."); }
    if (a.itSupport === "Internal IT Team") item(calls, "Call " + it + ".", [["Phone"]]);
    else if (a.itSupport === "External IT Provider") item(calls, "Call " + it + ".", [["Company"], ["Phone"]]);
    else if (a.itSupport === "Office Manager") item(calls, "Call " + it + ". Your Office Manager should arrange help from a trusted IT professional if needed.", [["Phone"]]);
    else {
        item(calls, (a.itSupport === "No IT Support" ? "No IT support is listed. " : "IT support is not confirmed. ") + "Call " + it + ". Your manager should arrange help from a trusted IT professional.", [["IT professional"], ["Phone"]]);
        missing.add(a.itSupport === "No IT Support" ? "Arrange trusted IT help." : "Confirm IT support.");
    }
    item(calls, "Call your incident coordinator or manager. This may be a different person from your main contact.", [["Coordinator or manager name"], ["Phone"]]);
    reportStep.append(el("h3", "B. What to tell them"));
    const tell = el("ul", undefined, "draft-tell");
    ["What happened?", "When did you notice it?", "Which computer, account, or system is affected?", "Are you seeing any warning messages?"].forEach(text => tell.append(el("li", text))); reportStep.append(tell);
    paragraph(reportStep, "Your incident coordinator or " + it + " will check how serious the problem is.");

    const leadership = el("div", undefined, "draft-leadership"); reportStep.append(leadership);
    leadership.append(el("h3", "C. Leadership decides"));
    paragraph(leadership, "Not every problem needs every report below. Your leadership decides which ones apply.");
    const leadershipList = checks(leadership);
    item(leadershipList, "Cyber insurance provider, if you have one.", [["Company"], ["Policy number"], ["Phone"]]);
    const cisa = item(leadershipList, "Report to CISA (U.S. Cybersecurity and Infrastructure Security Agency): ");
    const cisaLink = el("a", "cisa.gov/report"); cisaLink.href = "https://www.cisa.gov/report";
    cisa.append(cisaLink, report.ownerDocument.createTextNode(" or (888) 282-0870"));
    const fbi = item(leadershipList, "Report internet crime to the FBI: ");
    const fbiLink = el("a", "ic3.gov"); fbiLink.href = "https://www.ic3.gov/"; fbi.append(fbiLink);
    if (a.sensitiveData === "Yes") paragraph(leadership, "Personal or financial information may be involved. Leadership should get legal advice about who must be told.");
    else if (a.sensitiveData !== "No") {
        paragraph(leadership, "Find out whether personal or financial information may be involved.");
        blank(leadership, "Personal or financial information — confirm"); missing.add("Confirm whether personal or financial information is involved.");
    }

    const recover = section(3, "Recover and Follow Up", "Work with the people responsible for your systems to restore normal operations safely.");
    const recoveryList = checks(recover);
    if (["Email", "Financial Systems", "Customer Records", "Shared Files", "Website"].includes(a.criticalSystems)) item(recoveryList, "Check whether your " + a.criticalSystems + " is affected.");
    else if (a.criticalSystems === "Other") item(recoveryList, "Check whether your most important system is affected.", [["System"]]);
    else { item(recoveryList, "Check which important systems are affected.", [["List important systems"]]); missing.add("Identify important systems."); }
    item(recoveryList, "Work with " + it + " to make sure the problem has stopped before restoring anything.");
    if (a.backups === "No") item(recoveryList, "Your organization has no backups. Ask " + it + " about other ways to recover.");
    else if (a.backups !== "Yes") {
        item(recoveryList, "Find out whether your organization has backups before planning recovery.", [["Backups available — confirm"]]); missing.add("Confirm whether backups exist.");
    } else if (a.backupTesting === "Yes") item(recoveryList, "Check that your backups are safe before using them. They have been tested before.");
    else if (a.backupTesting === "No") {
        const warning = item(recoveryList, ""); warning.append(el("strong", "Your backups have never been tested. They may not work. "), report.ownerDocument.createTextNode("Do not count on them until " + it + " checks them."));
    } else {
        item(recoveryList, "It is not known whether your backups have been tested. Ask " + it + " to check them before using them.", [["Backup testing — confirm"]]); missing.add("Confirm whether backups have been tested.");
    }
    item(recoveryList, "Restore important systems only after " + it + " says it is safe.");
    if (a.itSupport === "No IT Support" || !itPhrases[a.itSupport]) paragraph(recover, "Your manager should arrange help from a trusted IT professional before restoring anything.");
    if (a.recoveryCommunication === "Yes") item(recoveryList, "Tell employees what is working and what they should do next. Use your usual process to update employees.");
    else {
        item(recoveryList, "Tell employees what is working and what they should do next. Choose who will update employees and how. If email is down, use phone or text.", [["Person"], ["Method"]]);
        if (!["No", "Partially"].includes(a.recoveryCommunication)) missing.add("Confirm how employees will receive updates.");
    }
    item(recoveryList, "Write down what happened and what your organization can do better next time.");
    if (a.recoveryProcedures === "Yes") {
        const line = paragraph(recover, "Follow your written recovery steps."); blank(line, "Where to find them");
    } else if (a.recoveryProcedures === "Partially") paragraph(recover, "Your written recovery steps are not finished. Ask " + it + " to help with the missing parts.");
    else {
        paragraph(recover, "There are no known written recovery steps. " + it[0].toUpperCase() + it.slice(1) + " should guide the recovery.");
        if (a.recoveryProcedures !== "No") { blank(recover, "Written recovery steps — confirm"); missing.add("Confirm written recovery steps."); }
    }
    const complete = el("aside", undefined, "draft-complete"); complete.append(el("h3", "Still to Complete"));
    if (missing.size) {
        const list = el("ul"); missing.forEach(text => list.append(el("li", text))); complete.append(list);
    }
    else paragraph(complete, "Fill in all phone numbers above before printing.");
    report.append(complete);
}
