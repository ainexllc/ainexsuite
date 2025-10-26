#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const prompts = require('prompts');
const { execaCommand } = require('execa');
const fs = require('fs').promises;
const path = require('path');

// Monorepo Manager Agent for AINexSuite
// Manages deployments, updates, and consistency across 9 apps

program
  .name('monorepo-manager')
  .description('Manage and deploy AINexSuite monorepo')
  .version('1.0.0');

// Deploy all apps
program
  .command('deploy:all')
  .description('Deploy all 9 apps to Vercel')
  .option('--production', 'Deploy to production (default is preview)', false)
  .action(async (options) => {
    console.log(chalk.blue.bold('\n🚀 Monorepo Manager - Deploy All Apps\n'));

    const apps = [
      'main', 'notes', 'journal', 'todo',
      'track', 'moments', 'grow', 'pulse', 'fit'
    ];

    const spinner = ora('Preparing deployments...').start();

    try {
      for (const app of apps) {
        spinner.text = `Deploying ${app}...`;

        const appDir = path.join(process.cwd(), 'apps', app);
        const exists = await checkAppExists(appDir);

        if (!exists) {
          spinner.warn();
          console.log(chalk.yellow(`⚠️  App "${app}" not found, skipping...`));
          continue;
        }

        const deployCommand = options.production
          ? 'vercel --prod'
          : 'vercel';

        await execaCommand(deployCommand, {
          cwd: appDir,
          stdio: 'pipe'
        });

        spinner.succeed(chalk.green(`✅ ${app} deployed`));
        spinner.start();
      }

      spinner.stop();
      console.log(chalk.green.bold('\n✨ All apps deployed successfully!\n'));

    } catch (error) {
      spinner.fail();
      console.log(chalk.red(`❌ Deployment failed: ${error.message}`));
      process.exit(1);
    }
  });

// Deploy specific app
program
  .command('deploy <app>')
  .description('Deploy a specific app to Vercel')
  .option('--production', 'Deploy to production', false)
  .action(async (app, options) => {
    console.log(chalk.blue.bold(`\n🚀 Deploying ${app}...\n`));

    const spinner = ora('Deploying...').start();

    try {
      const appDir = path.join(process.cwd(), 'apps', app);
      const exists = await checkAppExists(appDir);

      if (!exists) {
        spinner.fail();
        console.log(chalk.red(`❌ App "${app}" not found`));
        process.exit(1);
      }

      const deployCommand = options.production
        ? 'vercel --prod'
        : 'vercel';

      await execaCommand(deployCommand, {
        cwd: appDir,
        stdio: 'inherit'
      });

      spinner.succeed(chalk.green(`✅ ${app} deployed successfully!`));

    } catch (error) {
      spinner.fail();
      console.log(chalk.red(`❌ Deployment failed: ${error.message}`));
      process.exit(1);
    }
  });

// Update shared packages
program
  .command('update:shared')
  .description('Update all apps to use latest shared packages')
  .action(async () => {
    console.log(chalk.blue.bold('\n📦 Updating shared packages...\n'));

    const spinner = ora('Building shared packages...').start();

    try {
      // Build shared packages first
      const packages = ['ui', 'firebase', 'auth', 'ai', 'types', 'config'];

      for (const pkg of packages) {
        spinner.text = `Building @ainexsuite/${pkg}...`;

        const pkgDir = path.join(process.cwd(), 'packages', pkg);
        const exists = await checkAppExists(pkgDir);

        if (!exists) {
          continue;
        }

        await execaCommand('npm run build', {
          cwd: pkgDir,
          stdio: 'pipe'
        });
      }

      // Update apps
      spinner.text = 'Updating apps...';
      await execaCommand('pnpm install', {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      spinner.succeed(chalk.green('✅ Shared packages updated!'));

    } catch (error) {
      spinner.fail();
      console.log(chalk.red(`❌ Update failed: ${error.message}`));
      process.exit(1);
    }
  });

// Run tests for affected apps
program
  .command('test:affected')
  .description('Run tests for apps affected by recent changes')
  .action(async () => {
    console.log(chalk.blue.bold('\n🧪 Running tests for affected apps...\n'));

    const spinner = ora('Analyzing changes...').start();

    try {
      // Get changed files
      const { stdout: changedFiles } = await execaCommand('git diff --name-only HEAD~1');
      const affectedApps = new Set();

      changedFiles.split('\n').forEach(file => {
        if (file.startsWith('apps/')) {
          const appName = file.split('/')[1];
          affectedApps.add(appName);
        } else if (file.startsWith('packages/')) {
          // If shared package changed, test all apps
          affectedApps.add('all');
        }
      });

      if (affectedApps.has('all') || affectedApps.size === 0) {
        spinner.text = 'Running tests for all apps...';
        await execaCommand('pnpm test', { stdio: 'inherit' });
      } else {
        for (const app of affectedApps) {
          spinner.text = `Testing ${app}...`;
          const appDir = path.join(process.cwd(), 'apps', app);
          await execaCommand('npm test', { cwd: appDir, stdio: 'inherit' });
        }
      }

      spinner.succeed(chalk.green('✅ All tests passed!'));

    } catch (error) {
      spinner.fail();
      console.log(chalk.red('❌ Tests failed'));
      process.exit(1);
    }
  });

// Check design system consistency
program
  .command('audit:design-system')
  .description('Check for design system compliance across all apps')
  .action(async () => {
    console.log(chalk.blue.bold('\n🎨 Auditing design system consistency...\n'));

    const spinner = ora('Scanning apps...').start();

    const issues = [];

    try {
      const apps = [
        'main', 'notes', 'journal', 'todo',
        'track', 'moments', 'grow', 'pulse', 'fit'
      ];

      for (const app of apps) {
        spinner.text = `Checking ${app}...`;

        const appDir = path.join(process.cwd(), 'apps', app);
        const exists = await checkAppExists(appDir);

        if (!exists) continue;

        // Check if using shared UI package
        const packageJsonPath = path.join(appDir, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

        if (!packageJson.dependencies['@ainexsuite/ui']) {
          issues.push(`${app}: Missing @ainexsuite/ui package`);
        }

        // Check for custom styles that should use design tokens
        const globalsPath = path.join(appDir, 'src/app/globals.css');
        try {
          const globals = await fs.readFile(globalsPath, 'utf8');
          if (globals.includes('color:') && !globals.includes('--')) {
            issues.push(`${app}: Using hard-coded colors instead of design tokens`);
          }
        } catch (err) {
          // globals.css might not exist
        }
      }

      spinner.stop();

      if (issues.length === 0) {
        console.log(chalk.green('✅ All apps comply with design system!\n'));
      } else {
        console.log(chalk.yellow('⚠️  Found design system issues:\n'));
        issues.forEach(issue => console.log(chalk.yellow(`  - ${issue}`)));
        console.log();
      }

    } catch (error) {
      spinner.fail();
      console.log(chalk.red(`❌ Audit failed: ${error.message}`));
      process.exit(1);
    }
  });

// List all apps
program
  .command('list')
  .description('List all apps in the monorepo')
  .action(async () => {
    console.log(chalk.blue.bold('\n📋 AINexSuite Apps:\n'));

    try {
      const appsDir = path.join(process.cwd(), 'apps');
      const apps = await fs.readdir(appsDir);

      for (const app of apps) {
        const appDir = path.join(appsDir, app);
        const stat = await fs.stat(appDir);

        if (stat.isDirectory()) {
          const packageJsonPath = path.join(appDir, 'package.json');
          try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            console.log(chalk.white(`  • ${app}`));
            console.log(chalk.gray(`    ${packageJson.description || 'No description'}`));
            console.log(chalk.gray(`    Domain: ${app}.ainexsuite.com\n`));
          } catch (err) {
            console.log(chalk.white(`  • ${app}`));
            console.log(chalk.gray(`    (No package.json found)\n`));
          }
        }
      }

    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();

/**
 * Check if app/package directory exists
 */
async function checkAppExists(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
}
