Incident response plan draft checks
==================================

Serve the project from its root:

    python3 -m http.server 8000

With Playwright, Chromium and Poppler (`pdfinfo`, `pdftotext`) installed:

    node tests/incident-plan.cjs

Optional variables: `TEST_URL` (default http://127.0.0.1:8000), `CHROMIUM_PATH`
(default /usr/bin/chromium). Artifacts go into a temporary directory printed by the test.
These are automated browser/content/PDF-export checks, not manual print-dialog tests.

Cases and expected plan content
-------------------------------

The plan suite checks external IT, internal IT, no IT support, unknown details, Office
Manager, absent reporting methods, partial recovery steps, literal HTML-looking text,
and matching main/IT roles. It covers absent/untested/tested/unknown backups and no
alternate contact. The matching-role cases verify reuse of the main number without
another IT phone field; an IT Manager is not assumed to be the same as a whole IT team.

Expected layout: four short checkboxes in Stop the Spread; Who to Call with numbered
main, backup and IT rows; exactly four What to Tell Them questions; four short recovery
items. The leadership section, insurance fields and CISA/IC3 entries must be absent.
One short management-advice note remains. All contact inputs are filled in the browser
checks and verified in Letter/A4 PDF text. User text stays literal, and existing resources
and the Contact Card's original field helpers remain covered.

Manual Chrome and Safari print checklist
----------------------------------------

1. Submit an assessment; open Download Incident Response Plan Draft.
2. Complete the last review date and necessary contact names/phone numbers. The call
   order should be main contact, backup if unavailable, then IT help. Confirm whether
   anyone else coordinates the incident; do not add another copy of the same contact.
3. Choose Print / Save as PDF. Check US Letter and A4 at 100% with browser headers and
   footers disabled. Confirm 1–2 readable pages, no overlaps, clipped fields or blank sheets.
4. Confirm every filled contact value appears in the saved PDF. Verify the four-question
   reporting list, shared-equipment caution, short management note and technical recovery
   responsibility. No C. Leadership decides, policy fields, CISA or FBI entries should appear.
5. Test external IT, no IT support, no alternate contact, absent backups and untested backups.
   No-IT plans should ask management to arrange a trusted technology professional; absent
   or untested backups must not appear ready to use. Financial Systems should read naturally.
6. Resubmit changed answers and open a fresh plan. Check the new organization and answers.
7. Recheck Recommendations PDF, Contact Card, Exercise and Your First Steps.

Limits and future expansion
---------------------------

Field edits remain in the open tab and are not saved to the assessment or a server.
Verify contacts and phone numbers before use. Shared equipment must not be disconnected
or shut down without help. Management remains responsible for deciding whether insurer,
legal or authority advice is needed. Removing the long employee-facing reporting section
does not remove those responsibilities. Long entries may wrap, so review the preview
again after editing. Native Safari printing requires manual checking on a Mac/iOS device.

The resource key and openPreparednessResource print flow are unchanged. renderIncidentPlan
uses the submitted answers and existing contact/field helpers. The dormant full plan
renderer remains available for future expansion but is not exposed by this download.

Personalized 20-minute tabletop exercise
---------------------------------------

With the same server and dependencies, run:

    node tests/tabletop.cjs

The exercise uses the latest submitted assessment. Its scenario library is the ordered
`tabletopScenarios` array in script.js. First match wins: no/unknown backups → Ransomware;
otherwise Email reporting → Email Account Takeover; otherwise Financial Systems →
Payment Fraud; otherwise sensitive information Yes → Sensitive Information Exposure;
otherwise Phishing. These rules choose practice material, not recommendation priorities.

The browser suite checks all five stories with each of three organization profiles
(no IT/no backups, external IT/email, internal IT/tested backups/written plan). It checks
selection precedence, manual switching without assessment changes, four sections totaling
20 minutes, 2–4 hidden guidance points per section, mouse and keyboard reveal controls,
changeable A/B/C answers, all consequences, safe handling of free text and missing details,
mobile width, PDF answer-key separation and the other resources. Generated PDFs are in
the temporary directory printed by the test. Native Safari printing is a manual check;
Linux Chromium exports do not establish Safari print-dialog behavior.

Manual scenario and printing checks:

1. Submit an assessment, open Practice Your Response — 20-Minute Exercise, and confirm
   the recommended default matches the rules above. There is no need to resubmit to
   select another story.
2. Use Choose a Practice Scenario to try all five stories. Check that the opening,
   Step 3 development, optional second development, decision and suggested answers
   change together. The organization summary should stay the same.
3. Confirm the four sections are 3, 5, 7 and 5 minutes. The optional development replaces
   another Step 3 question if used; it does not extend the time.
4. Reveal and hide Suggested Answers using mouse, Tab, Enter and Space. Select A/B/C,
   change the selection, and check that all three consequences and a text/check-mark
   recommended answer appear. No answer should prevent continuing.
5. In Chrome and Safari, use Print / Save as PDF. Open some suggested answers first and
   choose a decision answer, then check the print preview: controls, selections and inline
   answers must disappear. Participant A/B/C choices should have empty boxes.
6. Confirm the worksheet follows participant discussion pages and the Facilitator Answer
   Guide starts on a new page after it, with all four sets of answers, consequences,
   the lesson and optional development. A facilitator can keep these final pages separate.
7. Check the safety reminder, readable text, page breaks and all pages for clipping or
   blank sheets. Save/reopen the PDF and confirm the selected story and organization.
8. Recheck the Recommendations PDF, Contact Card, Incident Response Plan, questionnaire
   navigation/progress and Your First Steps. Nothing in the exercise should change answers.

All activities are discussion-only: no network calls, payments, account changes or live
security actions are attached to exercise controls. Choices and scenario selections stay
in the resource tab and are not saved. The worksheet remains a printable writing sheet.
Optional mock props were left out to keep the focus on stories, decisions and guidance.

Tabletop usability regression checks
-----------------------------------

The tabletop suite also verifies one safety banner with the exact discussion-only text;
no confusing capability wording such as “is reported”; action guidance using the real
emergency contact, critical system, IT arrangement and sensitive-information answer;
and scenario-specific facts to collect. The scenario announcement is screen-reader-only.

Decision cards now use a normal heading inside a labelled group instead of a fieldset
legend across the border. Automated desktop/mobile geometry checks keep the heading and
all three buttons inside the card. During manual Chrome/Safari review, also check the
card before and after choosing an answer at narrow widths, and check its border, wrapped
text, selected state, keyboard focus, consequences and printable choices. Screen-reader
users should hear a short “practice scenario selected” message after a scenario change;
there should be no visible status message or toast.
