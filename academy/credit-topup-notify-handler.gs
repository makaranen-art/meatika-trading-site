/**
 * Meatika Academy — "Top up credits" email notification.
 *
 * What this does: every time a student submits the top-up form in
 * /academy/ (the "Submit for approval" button in the credit modal), the
 * page also pings this script, which sends YOU an email so you know
 * there's a new request waiting in admin.html → Academy — Credit Top-ups.
 *
 * This does NOT replace Firestore — the request itself is still written to
 * the `creditRequests` collection exactly as before, and you still approve
 * or reject it from admin.html. This script only adds the "hey, someone
 * just submitted one" email on top of that. If this script is ever
 * mis-configured or Google is briefly unavailable, the top-up request
 * still goes through — the student experience never depends on this email.
 *
 * Setup (10 minutes, no coding required):
 *   1. Go to https://script.google.com/home and click "New project"
 *      (you don't need a spreadsheet for this one — just a script).
 *   2. Delete the placeholder code, paste this whole file in, and save.
 *   3. Change the NOTIFY_EMAIL constant below if you ever want notifications
 *      to go somewhere other than makaranen@gmail.com.
 *   4. Deploy → New deployment → type "Web app" →
 *        Execute as: Me
 *        Who has access: Anyone
 *      then Deploy, and authorize it when Google asks (click through the
 *      "Google hasn't verified this app" warning — expected for your own
 *      scripts).
 *   5. Copy the "Web app URL" it gives you (ends in /exec).
 *   6. Open admin.html, sign in (Academy — Approved Students panel), scroll to
 *      Academy — Pricing → "Notify top-up webhook URL", paste your URL there,
 *      and click "Save pricing." No code edits needed.
 *
 * If you ever edit this script after deploying, you need to create a new
 * deployment version (Deploy → Manage deployments → pencil icon → New
 * version) for the changes to take effect on the live /exec URL.
 */

// Where the "new top-up request" email is sent. Change this any time.
var NOTIFY_EMAIL = 'makaranen@gmail.com';

function doPost(e) {
  var p = (e && e.parameter) || {};

  var studentEmail = p.email || '(no email)';
  var studentName = p.displayName || '(no name)';
  var packageName = p.packageName || p.packageId || '(unknown package)';
  var usd = p.usd || '0';
  var credits = p.credits || '0';
  var bonusCredits = p.bonusCredits || '0';
  var reference = p.reference || '(none given)';
  var note = p.note || '(none)';

  var subject = 'New credit top-up request — ' + studentName + ' ($' + usd + ')';
  var body =
    'A student just submitted a top-up request on Meatika Academy.\n\n' +
    'Student: ' + studentName + ' <' + studentEmail + '>\n' +
    'Package: ' + packageName + '\n' +
    'Amount: $' + usd + '\n' +
    'Credits requested: ' + credits + (Number(bonusCredits) ? ' + ' + bonusCredits + ' bonus' : '') + '\n' +
    'Transaction reference / phone: ' + reference + '\n' +
    'Note from student: ' + note + '\n\n' +
    'Go to admin.html \u2192 Academy \u2014 Credit Top-ups to approve or reject it.';

  try {
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (err) {
    // Swallow errors so a mail hiccup never surfaces to the student — the
    // top-up request itself was already written to Firestore separately,
    // regardless of whether this email succeeds.
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Visiting the /exec URL directly (e.g. to sanity-check the deployment)
// hits this instead of doPost — just a friendly message, no email sent.
function doGet(e) {
  return ContentService.createTextOutput('This endpoint only accepts top-up notification submissions.');
}
