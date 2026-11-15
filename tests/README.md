Incident response plan browser checks
====================================

Serve the project from its root:

    python3 -m http.server 8000

With Playwright, Chromium and Poppler (`pdfinfo`, `pdftotext`) installed, run in another terminal:

    node tests/incident-plan.cjs

Optional environment variables: `TEST_URL` (default http://127.0.0.1:8000) and
`CHROMIUM_PATH` (default /usr/bin/chromium). Generated sample PDFs are temporary
files under the operating system's temporary directory.

Checks cover the Small Office, Nonprofit and Small Clinic examples; latest submitted
answers; safe rendering; backup availability and testing; ten sections; four first-hour
checkpoints; five US Letter pages with matching footers; mobile page width; and existing
recommendations, contact card and tabletop downloads. The test requires a running server.

Manual Safari check: complete and submit an assessment, open Your Incident Response
Plan, choose Print / Save as PDF, select US Letter at 100% and disable browser headers
and footers. Check all five pages, contact rows and first-hour checkpoints. Fill in the
blank contacts, authority, backup locations and approved workarounds before operational
use. These fields are handwritten on the printed plan; no edits are saved to the site.
