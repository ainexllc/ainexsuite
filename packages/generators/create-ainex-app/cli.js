#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const prompts = require('prompts');
const fs = require('fs-extra');
const path = require('path');

// App Generator Agent for AINexSuite
// Scaffolds new Next.js 15 apps with complete SSO, AI, and design system integration

program
  .name('create-ainex-app')
  .description('Generate a new AINexSuite app with complete configuration')
  .argument('<app-name>', 'Name of the app (e.g., notes, journal, todo)')
  .option('--type <type>', 'App type: base, with-ai, or dashboard', 'base')
  .option('--skip-install', 'Skip npm install', false)
  .action(async (appName, options) => {
    console.log(chalk.blue.bold('\n🚀 AINexSuite App Generator\n'));

    // Validate app name
    if (!/^[a-z]+$/.test(appName)) {
      console.log(chalk.red('❌ App name must be lowercase letters only (e.g., notes, journal)'));
      process.exit(1);
    }

    // Confirm with user
    const response = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Create new app "${appName}" of type "${options.type}"?`,
      initial: true
    });

    if (!response.proceed) {
      console.log(chalk.yellow('Cancelled.'));
      process.exit(0);
    }

    const spinner = ora('Generating app...').start();

    try {
      // Determine paths
      const rootDir = path.join(process.cwd());
      const appsDir = path.join(rootDir, 'apps');
      const appDir = path.join(appsDir, appName);
      const templateDir = path.join(__dirname, 'templates', options.type);

      // Check if app already exists
      if (await fs.pathExists(appDir)) {
        spinner.fail();
        console.log(chalk.red(`❌ App "${appName}" already exists at ${appDir}`));
        process.exit(1);
      }

      // Ensure apps directory exists
      await fs.ensureDir(appsDir);

      // Copy template
      spinner.text = 'Copying template files...';
      await fs.copy(templateDir, appDir);

      // Replace placeholders in files
      spinner.text = 'Customizing app configuration...';
      await replacePlaceholders(appDir, appName, options.type);

      // Install dependencies if not skipped
      if (!options.skipInstall) {
        spinner.text = 'Installing dependencies...';
        const { execSync } = require('child_process');
        execSync('npm install', { cwd: appDir, stdio: 'inherit' });
      }

      spinner.succeed(chalk.green(`✅ App "${appName}" created successfully!`));

      // Print next steps
      console.log(chalk.blue('\n📋 Next Steps:\n'));
      console.log(chalk.white(`  cd apps/${appName}`));
      console.log(chalk.white(`  npm run dev\n`));
      console.log(chalk.gray(`App will be available at: http://localhost:3000`));
      console.log(chalk.gray(`Production domain: ${appName}.ainexsuite.com\n`));

    } catch (error) {
      spinner.fail();
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();

/**
 * Replace placeholders in template files
 */
async function replacePlaceholders(appDir, appName, appType) {
  const files = await getAllFiles(appDir);

  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');

    // Replace placeholders
    content = content
      .replace(/\{\{APP_NAME\}\}/g, appName)
      .replace(/\{\{APP_NAME_CAPITALIZED\}\}/g, capitalize(appName))
      .replace(/\{\{APP_TYPE\}\}/g, appType)
      .replace(/\{\{DOMAIN\}\}/g, `${appName}.ainexsuite.com`);

    await fs.writeFile(file, content, 'utf8');
  }
}

/**
 * Get all files recursively in a directory
 */
async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.join(dir, entry.name);
      return entry.isDirectory() ? getAllFiles(res) : res;
    })
  );
  return files.flat();
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
