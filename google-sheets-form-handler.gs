/**
 * Meatika Trading — registration-form → Google Sheet handler.
 *
 * What this does: every time someone submits the registration form on the
 * site, their details are appended as a new row in whichever Google Sheet
 * this script is attached to.
 *
 * Setup (see google-sheets-setup.md for the full walkthrough with
 * screenshots-in-words):
 *   1. Create a Google Sheet.
 *   2. Extensions → Apps Script, delete the placeholder code, paste this
 *      whole file in, and save.
 *   3. Deploy → New deployment → type "Web app" →
 *        Execute as: Me
 *        Who has access: Anyone
 *      then Deploy, and authorize it when Google asks.
 *   4. Copy the "Web app URL" it gives you (ends in /exec).
 *   5. In admin.html, open the registration-form block and paste that URL
 *      into "Form submission endpoint". Save changes.
 *
 * If you ever edit this script after deploying, you need to create a new
 * deployment (or "Manage deployments" → edit → new version) for the
 * changes to take effect on the live /exec URL.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // First submission ever: add a header row.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Full Name', 'Email', 'Phone Number', 'Telegram Username', 'Message']);
  }

  var p = (e && e.parameter) || {};
  sheet.appendRow([
    new Date(),
    p.name || '',
    p.email || '',
    p.phone || '',
    p.telegram || '',
    p.message || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Visiting the /exec URL directly (e.g. to sanity-check the deployment)
// hits this instead of doPost — just a friendly message, no form data.
function doGet(e) {
  return ContentService.createTextOutput('This endpoint only accepts form submissions.');
}
