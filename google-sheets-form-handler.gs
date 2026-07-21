/**
 * Meatika Trading — registration-form → email (+ optional Google Sheet) handler.
 *
 * What this does: every time someone submits the registration form on the
 * site, this script immediately emails the submitted details straight to
 * NOTIFY_EMAIL below — fully silently, with no email app popping up for the
 * visitor and no click required from them beyond "Submit". It also logs a
 * row to a Google Sheet if this script happens to be attached to one
 * (optional — see NOTES at the bottom).
 *
 * Setup (see google-sheets-setup.md for the full walkthrough):
 *   1. Go to script.google.com → New project (a blank Google Sheet is NOT
 *      required — this can be a standalone script).
 *   2. Delete the placeholder code, paste this whole file in, and save.
 *   3. Update NOTIFY_EMAIL below if it's ever not makaranen@gmail.com.
 *   4. Deploy → New deployment → type "Web app" →
 *        Execute as: Me
 *        Who has access: Anyone
 *      then Deploy, and authorize it when Google asks.
 *   5. Copy the "Web app URL" it gives you (ends in /exec).
 *   6. In admin.html, open the registration-form block and paste that URL
 *      into "Form submission endpoint". Save changes.
 *
 * If you ever edit this script after deploying, you need to create a new
 * deployment (or "Manage deployments" → edit → new version) for the
 * changes to take effect on the live /exec URL.
 */

var NOTIFY_EMAIL = 'makaranen@gmail.com';

function doPost(e) {
  var p = (e && e.parameter) || {};
  var name = p.name || '';
  var email = p.email || '';
  var phone = p.phone || '';
  var telegram = p.telegram || '';
  var broker = p.broker || '';
  var message = p.message || '';
  var subject = p.subject || 'New registration — Meatika Trading';

  // 1. Email the submission straight to NOTIFY_EMAIL — this is the main
  //    point: the visitor never sees an email app, it's sent server-side.
  var body =
    'New form submission from the Meatika Trading website:\n\n' +
    'Full Name: ' + name + '\n' +
    'Email: ' + email + '\n' +
    'Phone Number: ' + phone + '\n' +
    'Current Broker: ' + broker + '\n' +
    'Telegram: ' + (telegram || '-') + '\n' +
    'Message: ' + (message || '-') + '\n' +
    '\nSubmitted: ' + new Date();

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email || undefined,
    subject: subject,
    body: body
  });

  // 2. Optional: also log a row, only if this script happens to be bound
  //    to a Google Sheet (Container-bound script). Standalone scripts
  //    (recommended, see setup doc) skip this harmlessly.
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      var sheet = ss.getActiveSheet();
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Timestamp', 'Full Name', 'Email', 'Phone Number', 'Current Broker', 'Telegram Username', 'Message']);
      }
      sheet.appendRow([new Date(), name, email, phone, broker, telegram, message]);
    }
  } catch (err) {
    // No bound sheet — that's fine, email above already went out.
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Visiting the /exec URL directly (e.g. to sanity-check the deployment)
// hits this instead of doPost — just a friendly message, no form data.
function doGet(e) {
  return ContentService.createTextOutput('This endpoint only accepts form submissions.');
}
