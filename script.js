
const form = document.getElementById("organizationForm");

const backupsSelect = document.getElementById("backups");
const backupTestingSelect = document.getElementById("backupTesting");

// ==========================================
// BACKUP TESTING DEPENDENCY
// ==========================================

function updateBackupTesting() {
    const backupStatus = backupsSelect.value;

    if (backupStatus === "No") {
        backupTestingSelect.value = "Not Applicable";
        backupTestingSelect.disabled = true;

    } else if (backupStatus === "Not Sure") {
        backupTestingSelect.value = "Not Sure";
        backupTestingSelect.disabled = true;

    } else if (backupStatus === "Yes") {
        backupTestingSelect.disabled = false;
        backupTestingSelect.value = "";

    } else {
        backupTestingSelect.value = "";
        backupTestingSelect.disabled = true;
    }
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
    const answered = questionnaireFields.filter(field => field.value.trim() !== "").length;
    document.getElementById("assessmentProgress").value = answered;
    document.getElementById("progressPercent").textContent = Math.round(answered / 20 * 100) + "%";
    document.getElementById("progressText").textContent = answered + " of 20 questions answered";
    questionnaireSections.forEach((section, index) => {
        const fields = [...section.querySelectorAll("input, select")];
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
window.addEventListener("pageshow", updateAssessmentProgress);

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

    // Collect all 21 questionnaire answers
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

    console.log("Organization Data:", organizationData);


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
        ["Backup Testing", organizationData.backupTesting],
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

    const invalidContacts = [
        "i don't know",
        "idk",
        "unknown",
        "none",
        "n/a",
        "not sure",
        "not assigned"
    ];

    if (
        !contact ||
        invalidContacts.includes(contact.toLowerCase())
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
            "Verify whether critical organizational data is " +
            "being backed up.",
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
            "Determine whether the organization stores or " +
            "processes sensitive personal, employee, or " +
            "financial information.",
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


    // ==========================================
    // DISPLAY RECOMMENDATION SUMMARY AND RETAIN THIS SUBMITTED ASSESSMENT
    // ==========================================

    latestAssessmentReport = {
        organizationName: organizationData.organizationName,
        generatedAt: new Date(),
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

document.getElementById("downloadReport").addEventListener("click", () => {
    if (!latestAssessmentReport) return;
    const reportWindow = window.open("", "_blank");
    const status = document.getElementById("reportStatus");
    if (!reportWindow) {
        status.textContent = "The report window was blocked. Allow pop-ups for this site, then try again.";
        return;
    }
    reportWindow.opener = null;
    const snapshot = latestAssessmentReport;
    const reportDocument = reportWindow.document;
    reportDocument.title = "Antzecure — Cybersecurity Readiness Report";
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
    reportDocument.body.className = "report-page";

    // All assessment text is inserted as textContent, including organization names.
    function element(tag, text, className) {
        const node = reportDocument.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }
    const toolbar = element("div", undefined, "report-toolbar");
    const printHelp = element("p", "In the print dialog, choose Save as PDF. Disable browser headers and footers for a cleaner report.");
    const printButton = element("button", "Print / Save as PDF");
    printButton.type = "button";
    printButton.disabled = true;
    printButton.addEventListener("click", () => reportWindow.print());
    toolbar.append(printHelp, printButton);
    const report = element("main", undefined, "readiness-report");
    const header = element("header", undefined, "report-header");
    const logo = element("img");
    logo.src = new URL("public/assets/antzecure-logo.png", document.baseURI).href;
    logo.alt = "Antzecure";
    logo.width = 65;
    logo.height = 52;
    const title = element("div");
    title.append(element("p", "ANTZECURE", "report-brand"), element("h1", "Cybersecurity Readiness Report"));
    header.append(logo, title);
    const metadata = element("div", undefined, "report-metadata");
    const date = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric" }).format(snapshot.generatedAt);
    metadata.append(element("h2", snapshot.organizationName), element("p", "Generated: " + date));
    const overview = element("section", undefined, "report-overview");
    overview.append(element("h2", "Organization overview"));
    const overviewList = element("dl");
    snapshot.overview.forEach(([label, value]) => {
        const item = element("div");
        item.append(element("dt", label), element("dd", value));
        overviewList.append(item);
    });
    overview.append(overviewList);
    const summary = element("section", undefined, "report-priority-summary");
    summary.append(element("h2", "Recommendations by priority"));
    const counts = element("div", undefined, "report-counts");
    ["High", "Medium", "Low"].forEach(priority => {
        const count = snapshot.recommendations.filter(rec => rec.priority === priority).length;
        counts.append(element("p", priority + " priority: " + count));
    });
    summary.append(counts);
    report.append(header, metadata, overview, summary);
    ["High", "Medium", "Low"].forEach(priority => {
        const group = element("section", undefined, "report-priority-group");
        group.append(element("h2", priority + "-priority recommendations"));
        const recommendations = snapshot.recommendations.filter(rec => rec.priority === priority);
        if (!recommendations.length) group.append(element("p", "No " + priority.toLowerCase() + "-priority recommendations were generated for these answers."));
        recommendations.forEach(rec => {
            const card = element("article", undefined, "report-recommendation " + priority.toLowerCase());
            card.append(element("p", rec.priority + " priority", "report-priority"), element("h3", rec.category), element("p", rec.message), element("p", "NIST CSF 2.0: " + rec.nist, "report-nist"));
            group.append(card);
        });
        report.append(group);
    });
    report.append(element("p", "These recommendations are based on information provided by your organization. They are intended as general cybersecurity guidance and do not replace a professional security assessment.", "disclaimer"));
    reportDocument.body.append(toolbar, report);
    Promise.all([styleReady, logo.decode().then(() => true).catch(() => false)]).then(([stylesLoaded, logoLoaded]) => {
        if (!stylesLoaded || !logoLoaded) {
            printHelp.textContent = "Some report assets could not load. Reload the assessment page and reopen the report before printing.";
            return;
        }
        printButton.disabled = false;
    });
    status.textContent = "Report opened in a new tab. Use Print / Save as PDF to download it.";
});
