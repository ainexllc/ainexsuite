#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const prompts = require('prompts');
const fs = require('fs-extra');
const path = require('path');

// Grok AI Integration Agent for AINexSuite
// Adds AI assistant capabilities to existing apps

program
  .name('add-grok-ai')
  .description('Add Grok AI assistant to an existing AINexSuite app')
  .argument('<app-name>', 'Name of the app to add AI to (e.g., notes, journal)')
  .option('--system-prompt <prompt>', 'Custom system prompt for the AI')
  .option('--skip-install', 'Skip npm install', false)
  .action(async (appName, options) => {
    console.log(chalk.blue.bold('\n🤖 Grok AI Integration Agent\n'));

    const spinner = ora('Analyzing app...').start();

    try {
      // Determine paths
      const rootDir = process.cwd();
      const appDir = path.join(rootDir, 'apps', appName);

      // Check if app exists
      if (!(await fs.pathExists(appDir))) {
        spinner.fail();
        console.log(chalk.red(`❌ App "${appName}" not found at ${appDir}`));
        console.log(chalk.yellow('\nAvailable apps:'));
        const apps = await fs.readdir(path.join(rootDir, 'apps'));
        apps.forEach(app => console.log(chalk.gray(`  - ${app}`)));
        process.exit(1);
      }

      // Check if AI is already integrated
      const aiComponentPath = path.join(appDir, 'src/components/ai/ai-assistant-panel.tsx');
      if (await fs.pathExists(aiComponentPath)) {
        spinner.warn();
        console.log(chalk.yellow(`⚠️  AI assistant already exists in "${appName}"`));

        const response = await prompts({
          type: 'confirm',
          name: 'overwrite',
          message: 'Overwrite existing AI integration?',
          initial: false
        });

        if (!response.overwrite) {
          console.log(chalk.gray('Cancelled.'));
          process.exit(0);
        }
      }

      spinner.text = 'Adding AI package dependency...';

      // Update package.json to include @ainexsuite/ai
      const packageJsonPath = path.join(appDir, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);

      if (!packageJson.dependencies['@ainexsuite/ai']) {
        packageJson.dependencies['@ainexsuite/ai'] = 'workspace:*';
      }
      if (!packageJson.dependencies['lucide-react']) {
        packageJson.dependencies['lucide-react'] = '^0.460.0';
      }

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      // Create AI components directory
      spinner.text = 'Creating AI components...';
      const aiDir = path.join(appDir, 'src/components/ai');
      await fs.ensureDir(aiDir);

      // Copy AI assistant panel template
      const templateDir = path.join(__dirname, 'templates');
      const aiPanelTemplate = await fs.readFile(
        path.join(templateDir, 'ai-assistant-panel.tsx'),
        'utf8'
      );

      // Replace app name placeholder
      const customizedPanel = aiPanelTemplate
        .replace(/\{\{APP_NAME\}\}/g, appName)
        .replace(/\{\{APP_NAME_CAPITALIZED\}\}/g, capitalize(appName));

      await fs.writeFile(aiComponentPath, customizedPanel, 'utf8');

      // Generate system prompt if provided
      if (options.systemPrompt) {
        spinner.text = 'Creating custom system prompt...';
        const promptPath = path.join(aiDir, 'system-prompt.ts');
        const promptContent = `export const SYSTEM_PROMPT = \`${options.systemPrompt}\`;\n`;
        await fs.writeFile(promptPath, promptContent, 'utf8');
      }

      // Update page.tsx to include AI panel
      spinner.text = 'Updating app page...';
      await updatePageWithAI(appDir, appName);

      // Install dependencies if not skipped
      if (!options.skipInstall) {
        spinner.text = 'Installing dependencies...';
        const { execSync } = require('child_process');
        execSync('npm install', { cwd: appDir, stdio: 'ignore' });
      }

      spinner.succeed(chalk.green(`✅ Grok AI added to "${appName}"!`));

      // Print next steps
      console.log(chalk.blue('\n📋 Next Steps:\n'));
      console.log(chalk.white(`  1. Review AI assistant panel at:`));
      console.log(chalk.gray(`     src/components/ai/ai-assistant-panel.tsx\n`));
      console.log(chalk.white(`  2. Customize the AI behavior:`));
      console.log(chalk.gray(`     - Edit system prompt`));
      console.log(chalk.gray(`     - Add app-specific context`));
      console.log(chalk.gray(`     - Customize UI/UX\n`));
      console.log(chalk.white(`  3. Test the AI assistant:`));
      console.log(chalk.gray(`     npm run dev\n`));

    } catch (error) {
      spinner.fail();
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();

/**
 * Update page.tsx to include AI assistant panel
 */
async function updatePageWithAI(appDir, appName) {
  const pagePath = path.join(appDir, 'src/app/page.tsx');

  if (!(await fs.pathExists(pagePath))) {
    throw new Error('page.tsx not found');
  }

  let content = await fs.readFile(pagePath, 'utf8');

  // Check if already imported
  if (content.includes('AIAssistantPanel')) {
    return; // Already integrated
  }

  // Add import
  const importStatement = `import { AIAssistantPanel } from "@/components/ai/ai-assistant-panel";\n`;

  // Find the first import and add after it
  const firstImportIndex = content.indexOf('import');
  if (firstImportIndex !== -1) {
    const endOfImports = content.indexOf('\n\n', firstImportIndex);
    content = content.slice(0, endOfImports) + '\n' + importStatement + content.slice(endOfImports);
  }

  // Find the return statement and wrap with fragment if needed
  if (!content.includes('<>') && !content.includes('Fragment')) {
    // Wrap main return in fragment
    content = content.replace(
      /return \(/,
      'return (\n    <>'
    );

    // Find last closing tag before semicolon and add fragment close + AI panel
    const lastClosingTag = content.lastIndexOf('</');
    const nextClosingBracket = content.indexOf('>', lastClosingTag);
    content = content.slice(0, nextClosingBracket + 1) +
      '\n\n      {/* AI Assistant - floating panel */}\n      <AIAssistantPanel />\n    </>' +
      content.slice(nextClosingBracket + 1);
  }

  await fs.writeFile(pagePath, content, 'utf8');
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
