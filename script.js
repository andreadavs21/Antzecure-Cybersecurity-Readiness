
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

    const { recommendations, observations } = evaluateReadiness(organizationData);

    // ==========================================
    // DISPLAY RECOMMENDATION SUMMARY AND RETAIN THIS SUBMITTED ASSESSMENT
    // ==========================================

    latestAssessmentReport = {
        organizationName: organizationData.organizationName,
        generatedAt: new Date(),
        answers: { ...organizationData },
        observations: observations.map(note => ({ ...note })),
        overview: fields.map(([label, value]) => [label, value]),
        recommendations: recommendations.map(rec => ({ ...rec }))
    };
    renderCrossQuestionObservations(observations);
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

const resourceTitles = {
    recommendations: "Cybersecurity Readiness Report",
    contacts: "Emergency Cybersecurity Contact Card",
    roadmap: "30/60/90-Day Cybersecurity Action Roadmap",
    tabletop: "20-Minute Cybersecurity Tabletop Exercise"
};

document.getElementById("downloadReport").addEventListener("click", () => openPreparednessResource("recommendations"));

document.querySelectorAll("[data-resource]").forEach(button => {
    button.addEventListener("click", () => openPreparednessResource(button.dataset.resource));
});

function renderCrossQuestionObservations(observations) {
    const output = document.getElementById("observationOutput");
    output.replaceChildren();
    if (!observations.length) {
        const note = document.createElement("p");
        note.textContent = "No cross-question observations were identified from these answers. Review your individual recommendations for next steps.";
        output.append(note);
    }
    observations.forEach(observation => {
        const card = document.createElement("article");
        card.className = "observation-card";
        const title = document.createElement("h4");
        title.textContent = observation.category;
        const message = document.createElement("p");
        message.textContent = observation.message;
        card.append(title, message);
        output.append(card);
    });
}

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

function appendObservationSections({ element, report, snapshot }) {
    if (!snapshot.observations.length) return;
    const section = element("section", undefined, "report-observations");
    section.append(element("h2", "Cross-question observations"));
    snapshot.observations.forEach(note => {
        const article = element("article", undefined, "report-recommendation");
        article.append(element("h3", note.category), element("p", note.message), element("p", "NIST CSF 2.0: " + note.nist, "report-nist"));
        section.append(article);
    });
    report.append(section);
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
            card.append(element("p", rec.priority + " priority", "report-priority"), element("h3", rec.category), element("p", rec.message), element("p", "NIST CSF 2.0: " + rec.nist, "report-nist"));
            group.append(card);
        });
        report.append(group);
    });
    appendObservationSections(context);
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
        "Email": "An employee receives a suspicious email and their email account may be compromised. Consider how loss of email access could interrupt communication.",
        "Financial Systems": "Suspicious financial transactions are detected. Discuss how to report them and protect financial operations while qualified responders investigate.",
        "Customer Records": "Unauthorized access to customer records is suspected. Discuss how to protect the records and coordinate investigation without assuming exposure has been confirmed.",
        "Shared Files": "Employees discover important shared files are inaccessible. Discuss the impact on daily work and how to assess possible causes with technical assistance.",
        "Website": "The organization's website appears to have been compromised. Discuss how to verify the report and communicate while technical responders assess the situation."
    };
    return scenarios[answers.criticalSystems] || "Generic scenario — no specific critical system was identified in the assessment. An employee notices suspicious activity affecting an important work application. Select an example together for this discussion; this is not a claim about your actual systems.";
}

function renderTabletop(context) {
    const { element, report, snapshot } = context;
    const a = snapshot.answers;
    const scenario = element("section", undefined, "tabletop-scenario");
    scenario.append(element("h2", "Scenario sheet"), element("p", buildTabletopScenario(a)));
    scenario.append(element("p", "Discussion only. Do not shut down systems, change passwords, run malware, or modify production systems as part of this exercise.", "exercise-safety"));
    const details = element("dl", undefined, "exercise-context");
    const backupText = a.backups === "No" ? "No backups reported. Discuss immediate continuity options and the need to establish backups; do not assume restoration is available." : a.backups === "Not Sure" ? "Backup availability is unverified. Identify who will check availability and ownership; do not assume backups can be restored." : "Backups reported. Restoration testing: " + a.backupTesting + ". Discuss who can authorize and verify a safe restoration.";
    [["Selected critical system", a.criticalSystems], ["IT support arrangement", a.itSupport], ["Primary incident contact", knownResourceValue(a.emergencyContact) || "To be completed"], ["Reporting method", a.reportingMethod], ["Backup status", backupText]].forEach(([label,value]) => { details.append(element("dt",label),element("dd",value)); });
    scenario.append(details);
    const facilitator = element("section", undefined, "facilitator-guide");
    facilitator.append(element("h2", "Facilitator guide — 20 minutes"), element("p", "Choose a facilitator, a note-taker and participants who understand daily operations. Read the fictional scenario aloud. Ask participants to describe decisions, not perform technical actions. Record unknowns as follow-up tasks. Use only approved real-world response procedures if an actual incident occurs."));
    const parts = [
        ["Part 1 — Scenario Introduction (3 minutes)", ["Read the scenario. What daily activities could be affected? Which facts are known and which need verification?"]],
        ["Part 2 — Initial Response (5 minutes)", ["Who should employees contact first?", "How would the organization confirm that something suspicious happened?", "What should employees avoid doing?", "When should the IT provider or designated technical responder be contacted?"]],
        ["Part 3 — Containment and Communication (5 minutes)", ["Who has authority to make decisions?", "How would affected systems be protected under approved instructions?", "Who needs to be informed?", "How would normal operations continue?"]],
        ["Part 4 — Recovery (4 minutes)", ["How would the organization restore affected systems?", "Are backups available, who owns them, and have they been tested?", "Who would confirm that systems are safe to use again?"]],
        ["Part 5 — Lessons Learned (3 minutes)", ["What worked, what was unclear, and what needs improvement? Agree on follow-up owners and target dates."]]
    ];
    parts.forEach(([title, questions]) => {
        const part = element("article", undefined, "exercise-part");
        const list = element("ul"); questions.forEach(question => list.append(element("li",question)));
        part.append(element("h3",title),list); facilitator.append(part);
    });
    const worksheet = element("section", undefined, "lessons-worksheet");
    worksheet.append(element("h2", "What We Learned"), element("p", "Organization: " + snapshot.organizationName));
    ["What went well?", "What problems or gaps were identified?", "Which decisions were unclear?", "What actions should be taken next?", "Who is responsible?", "Target completion date?"].forEach(label => {
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


    const observations = [];
    if (organizationData.securityMonitoring === "Yes" || organizationData.securityMonitoring === "Partially") {
        if (organizationData.existingPlan === "No" || organizationData.existingPlan === "Not Sure" || organizationData.existingPlan === "Partially") {
            observations.push({ category: "Monitoring and response readiness", message: "Your organization reports " + (organizationData.securityMonitoring === "Yes" ? "security monitoring" : "partial security monitoring") + ", but " + (organizationData.existingPlan === "No" ? "no documented incident response plan" : organizationData.existingPlan === "Partially" ? "an incomplete incident response plan" : "uncertainty about a documented incident response plan") + ". Monitoring can identify suspicious activity; employees also need clear instructions for reporting, escalating, and responding to alerts. The Incident Response Plan recommendation addresses this gap.", nist: "DE.CM / RS.MA" });
        }
        if (organizationData.reportingMethod === "Not Established" || !isKnownContact(organizationData.emergencyContact)) {
            const gaps = [];
            if (organizationData.reportingMethod === "Not Established") gaps.push("an incident reporting method is not established");
            if (!isKnownContact(organizationData.emergencyContact)) gaps.push("the primary incident contact is not assigned or known");
            observations.push({ category: "Alert reporting and ownership", message: "Monitoring is reported, but " + gaps.join(" and ") + ". Confirm who receives alerts and how employees escalate them. The existing contact and reporting recommendations address these needs.", nist: "DE.CM / RS.CO" });
        }
    }
    return { recommendations, observations };
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
