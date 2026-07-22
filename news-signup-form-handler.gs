/**
 * Meatika Trading — "News & Articles" access-gate → Google Sheet handler.
 *
 * What this does: every time a visitor fills in the registration form that
 * gates the News & Articles page (news.html), this script appends a row
 * with their details to a Google Sheet. That's it — no email, just a
 * simple running list you can open any time.
 *
 * This is a SEPARATE, simpler form from the "Exclusive Content" registration
 * form used elsewhere on the site (google-sheets-form-handler.gs) — keep
 * both scripts and their deployments separate.
 *
 * Setup (see news-signup-setup.md for the full walkthrough):
 *   1. Create a new Google Sheet (or open the one you want submissions in).
 *   2. Extensions → Apps Script.
 *   3. Delete the placeholder code, paste this whole file in, and save.
 *   4. Deploy → New deployment → type "Web app" →
 *        Execute as: Me
 *        Who has access: Anyone
 *      then Deploy, and authorize it when Google asks.
 *   5. Copy the "Web app URL" it gives you (ends in /exec).
 *   6. In news.html, find the line:
 *        const NEWS_GATE_ENDPOINT = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
 *      and paste your URL in between the quotes.
 *
 * If you ever edit this script after deploying, you need to create a new
 * deployment (or "Manage deployments" → edit → new version) for the
 * changes to take effect on the live /exec URL.
 */

function doPost(e) {
  var p = (e && e.parameter) || {};
  var name = p.name || '';
  var phone = p.phone || '';
  var email = p.email || '';
  var experience = p.experience || '';

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Full Name', 'Phone Number', 'Email', 'Trading Experience']);
  }
  sheet.appendRow([new Date(), name, phone, email, experience]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Visiting the /exec URL directly (e.g. to sanity-check the deployment)
// hits this instead of doPost — just a friendly message, no form data.
function doGet(e) {
  return ContentService.createTextOutput('This endpoint only accepts form submissions.');
}
