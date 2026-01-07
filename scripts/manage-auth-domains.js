#!/usr/bin/env node
/**
 * Firebase Authorized Domains Manager
 *
 * Usage:
 *   node scripts/manage-auth-domains.js list              # List current domains
 *   node scripts/manage-auth-domains.js add <domain>      # Add a domain
 *   node scripts/manage-auth-domains.js remove <domain>   # Remove a domain
 *
 * Requires: Firebase CLI authenticated (firebase login)
 */

const PROJECT_ID = "alnexsuite";

// Show methods to manage domains
function listDomainsViaFirebase() {
  console.log("\n📋 To manage authorized domains, use one of these methods:\n");

  console.log("METHOD 1: Firebase Console (Easiest)");
  console.log("─".repeat(50));
  console.log(
    `1. Open: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`,
  );
  console.log('2. Scroll to "Authorized domains"');
  console.log('3. Click "Add domain" to add, or the X to remove\n');

  console.log("METHOD 2: Google Cloud Console");
  console.log("─".repeat(50));
  console.log(
    `1. Open: https://console.cloud.google.com/identity/providers?project=${PROJECT_ID}`,
  );
  console.log('2. Click on "Settings" tab');
  console.log('3. Manage "Authorized domains"\n');

  console.log("METHOD 3: Install gcloud CLI");
  console.log("─".repeat(50));
  console.log("brew install google-cloud-sdk");
  console.log("gcloud auth login");
  console.log(
    `gcloud identity-platform config describe --project=${PROJECT_ID}`,
  );
  console.log("");

  console.log("METHOD 4: Use REST API with curl");
  console.log("─".repeat(50));
  console.log("# First, get an access token:");
  console.log("gcloud auth print-access-token");
  console.log("");
  console.log("# Then list authorized domains:");
  console.log(
    `curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \\`,
  );
  console.log(
    `  "https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config"`,
  );
  console.log("");

  // Show current domains from known config
  console.log("CURRENT KNOWN DOMAINS:");
  console.log("─".repeat(50));
  console.log("By default, Firebase authorizes:");
  console.log("  • localhost");
  console.log(`  • ${PROJECT_ID}.firebaseapp.com`);
  console.log(`  • ${PROJECT_ID}.web.app`);
  console.log("");
  console.log("You likely also have:");
  console.log("  • ainexspace.com");
  console.log("  • *.ainexspace.com (subdomains)");
  console.log("  • Any Vercel preview URLs");
  console.log("");
}

// Main
const args = process.argv.slice(2);
const command = args[0] || "list";
const domain = args[1];

console.log("🔐 Firebase Authorized Domains Manager");
console.log(`   Project: ${PROJECT_ID}\n`);

switch (command) {
  case "list":
    listDomainsViaFirebase();
    break;
  case "add":
    if (!domain) {
      console.error("❌ Please specify a domain to add");
      console.log("   Usage: node manage-auth-domains.js add example.com");
      process.exit(1);
    }
    console.log(`\n⚠️  To add "${domain}" as an authorized domain:`);
    console.log(
      `   1. Go to: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`,
    );
    console.log(`   2. Click "Add domain"`);
    console.log(`   3. Enter: ${domain}`);
    console.log(`   4. Click "Add"\n`);
    break;
  case "remove":
    if (!domain) {
      console.error("❌ Please specify a domain to remove");
      console.log("   Usage: node manage-auth-domains.js remove example.com");
      process.exit(1);
    }
    console.log(`\n⚠️  To remove "${domain}" from authorized domains:`);
    console.log(
      `   1. Go to: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`,
    );
    console.log(`   2. Find "${domain}" in the list`);
    console.log(`   3. Click the X next to it`);
    console.log(`   4. Confirm removal\n`);
    break;
  default:
    console.log("Usage:");
    console.log("  node manage-auth-domains.js list");
    console.log("  node manage-auth-domains.js add <domain>");
    console.log("  node manage-auth-domains.js remove <domain>");
}
