Incident response plan draft browser checks
==========================================

Serve the project from its root:

    python3 -m http.server 8000

With Playwright, Chromium and Poppler (`pdfinfo`, `pdftotext`) installed, run in another terminal:

    node tests/incident-plan.cjs

Optional environment variables: `TEST_URL` (default http://127.0.0.1:8000) and
`CHROMIUM_PATH` (default /usr/bin/chromium). The test prints the temporary directory
containing generated sample PDFs.

Checks cover a small business with no IT support or backups; a nonprofit with external
support and untested backups; and an organization with internal support and tested
backups. They verify three response steps, contact and reporting details, personalized
systems and recovery guidance, missing/unknown/partial answers, safe text rendering,
latest submitted answers, two US Letter pages with matching footers, mobile page width,
and the existing recommendations, contact card and tabletop downloads.

Manual Chrome / Safari demo check
---------------------------------

Complete and submit an assessment. In Your Preparedness Resources select Download
Incident Response Plan Draft. In the new tab choose Print / Save as PDF, select US Letter
at 100%, and disable browser headers and footers. Confirm there are two pages: Report
and Protect on page 1; Recover on page 2. Check that the organization, reporting method,
IT support, critical system and backup guidance match the submitted answers. Change
answers, submit again and open a fresh draft to verify the updated guidance.

Complete blank contact details and review instructions before use. Blanks can be filled
by hand after printing; the draft does not store contact edits or establish approved policy.
Actual Safari print-dialog behavior must be checked on a Mac or iOS device.

Future expansion
----------------

The existing resource key, snapshot and print flow are unchanged. `renderIncidentPlan`
now produces the short prototype. The previous ten-section layout remains in
`renderFullIncidentPlan` for later expansion; both use `getIncidentPlanDetails` for
shared assessment facts. It is not exposed as another download. Restoring that layout
would require updating the dispatcher and its page-count tests together.
