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

A. External IT, email, no approved disconnect steps, untested backups: phone is urgent;
   Call your external IT provider; the own-computer/shared-equipment note; bold untested warning.
B. No IT, no backups or backup contact: manager arranges trusted IT help; no IT team is
   assumed; other recovery options replace backup use; Still to Complete lists contact/help gaps.
C. Internal IT, phone, approved disconnect steps, tested backups: Call your internal IT
   team; editable approved-step location; check safe backups even though previously tested.
D. Unknown dropdown answers and idk contact: no Call idk or your Not Sure; labeled
   editable fields and completion reminders for unknown plan details. Q3 and Q14 do not
   offer Not Sure, so this defensive case supplies those values to the snapshot directly.
E. Office Manager, Other system/method: Office Manager arranges trusted help as needed;
   editable system and usual-reporting-method fields.
F. Not Established reporting: call the main contact until a method is chosen; completion reminder.
G. Partial recovery procedures/updates and unknown backup testing: finish written steps,
   verify testing and choose an employee update contact/method.
H. HTML-looking organization/contact values and in-person reporting: literal text only;
   no injected elements; nearby contact can also be told in person.

All cases check exactly three steps, consistent everyday wording, typed-field rendering
and beforeprint synchronization, visible CISA/IC3 addresses, no hard-coded page numbers,
mobile width, and automated 1–2-page Letter/A4 exports. Existing resources and the
Contact Card's original field helpers are checked as well.

Manual Chrome and Safari print checklist
----------------------------------------

1. Submit an assessment; open Download Incident Response Plan Draft.
2. Type the last review date, contact names/phone numbers, company/policy details,
   procedure locations and other applicable fields. Tab between controls.
3. Choose Print / Save as PDF. Check both US Letter and A4 at 100% with browser
   headers/footers disabled. The plan should be 1–2 pages with no cut-off text.
4. Check all three numbered headings, every checkbox and each filled field. No item
   should split across pages and no heading should stand alone at a page bottom.
5. Confirm CISA's address and phone and the FBI address are visible on paper. Leadership
   reporting must be separate from the employee's immediate calls.
6. Check the highlighted urgent-phone instruction, the appropriate IT phrase, approved
   disconnect note and backup warning against your submitted answers.
7. Save and reopen the PDF. Ensure typed values are present and editable controls are
   replaced by readable text. Long entries may wrap; review layout again after filling.
8. Change assessment answers, submit and open a fresh draft. Confirm new answers appear.
   Recheck Recommendations PDF, Contact Card, Exercise and Your First Steps.

Limits and future expansion
---------------------------

Edits remain in the open resource tab and are not saved to the assessment or a server.
Fill and verify phone numbers, coordinator/manager authority, backup contact, any
external provider, insurance details, procedure locations and unknown system/backup
information before relying on the draft. No coverage, role or approval is assumed.
Manual Safari and physical printing need a Mac/iOS device and printer; automated
Chromium exports do not establish Safari print-dialog behavior.

The resource key and openPreparednessResource print flow are unchanged. renderIncidentPlan
uses the submitted answers and existing contact/field helpers. The dormant full plan
renderer remains available for future expansion but is not exposed by this download.
