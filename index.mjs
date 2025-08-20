#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const program = new Command();
const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.xndrc');

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function loadConfig() {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath));
  }
  return {};
}

program
  .version('1.0.0')
  .description('A simple package manager');

program
  .command('init')
  .description('Initialize a new project')
  .action(() => {
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Package name:',
        default: path.basename(process.cwd()),
      },
      {
        type: 'input',
        name: 'version',
        message: 'Version:',
        default: '1.0.0',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
      },
      {
        type: 'input',
        name: 'main',
        message: 'Entry point:',
        default: 'index.js',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author:',
      },
      {
        type: 'input',
        name: 'license',
        default: 'ISC',
      },
    ];

    inquirer.prompt(questions).then((answers) => {
      const packageJson = JSON.stringify(answers, null, 2);
      fs.writeFileSync('package.json', packageJson);
      console.log('package.json created successfully!');
    });
  });

program
  .command('install [packages...]')
  .alias('i') // Alias for install
  .description('Install one or more packages')
  .option('-S, --save', 'Save dependency to package.json')
  .action(async (packages, options) => {
    if (packages.length) {
      for (const pkg of packages) {
        try {
          const res = await axios.get(`https://registry.npmjs.org/${pkg}`);
          const latestVersion = res.data['dist-tags'].latest;
          const tarball = res.data.versions[latestVersion].dist.tarball;

          console.log(`Installing ${pkg}@${latestVersion}...`);

          if (!fs.existsSync('node_modules')) {
            fs.mkdirSync('node_modules');
          }

          const pkgDir = path.join('node_modules', pkg);
          if (!fs.existsSync(pkgDir)) {
            fs.mkdirSync(pkgDir);
          }

          fs.writeFileSync(
            path.join(pkgDir, 'package.json'),
            JSON.stringify(res.data.versions[latestVersion], null, 2)
          );

          if (options.save) {
            if (fs.existsSync('package.json')) {
              const packageJson = JSON.parse(fs.readFileSync('package.json'));
              if (!packageJson.dependencies) {
                packageJson.dependencies = {};
              }
              packageJson.dependencies[pkg] = `^${latestVersion}`;
              fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
              console.log(`Saved ${pkg} to dependencies`);
            } else {
              console.log('No package.json found. Cannot save dependency.');
            }
          }

          console.log(`Successfully installed ${pkg}@${latestVersion}`);
        } catch (error) {
          console.error(`Error installing ${pkg}:`, error.message);
        }
      }
    } else {
      // Install from package.json
      if (fs.existsSync('package.json')) {
        console.log('Installing dependencies from package.json...');
        const packageJson = JSON.parse(fs.readFileSync('package.json'));
        const dependencies = packageJson.dependencies || {};
        const packagesToInstall = Object.keys(dependencies);
        if (packagesToInstall.length > 0) {
          for (const pkg of packagesToInstall) {
            try {
              const res = await axios.get(`https://registry.npmjs.org/${pkg}`);
              const latestVersion = res.data['dist-tags'].latest;
              const tarball = res.data.versions[latestVersion].dist.tarball;

              console.log(`Installing ${pkg}@${latestVersion}...`);

              if (!fs.existsSync('node_modules')) {
                fs.mkdirSync('node_modules');
              }

              const pkgDir = path.join('node_modules', pkg);
              if (!fs.existsSync(pkgDir)) {
                fs.mkdirSync(pkgDir);
              }

              fs.writeFileSync(
                path.join(pkgDir, 'package.json'),
                JSON.stringify(res.data.versions[latestVersion], null, 2)
              );

              console.log(`Successfully installed ${pkg}@${latestVersion}`);
            } catch (error) {
              console.error(`Error installing ${pkg}:`, error.message);
            }
          }
        } else {
          console.log('No dependencies found in package.json');
        }
      } else {
        console.log('No package.json found.');
      }
    }
  });

program
  .command('login')
  .description('Log in to XND')
  .action(() => {
    const questions = [
      {
        type: 'input',
        name: 'username',
        message: 'Username:',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
      },
    ];

    inquirer.prompt(questions).then((answers) => {
      // In a real implementation, you would authenticate against a server.
      // For now, we'll just save the username and a default tier.
      const config = loadConfig();
      config.user = {
        username: answers.username,
        tier: 'user', // Default tier
      };
      saveConfig(config);
      console.log(`Logged in as ${answers.username}`);
    });
  });

program
  .command('logout')
  .description('Log out of XND')
  .action(() => {
    const config = loadConfig();
    delete config.user;
    saveConfig(config);
    console.log('Logged out successfully');
  });

program
  .command('whoami')
  .description('Show the current logged in user')
  .action(() => {
    const config = loadConfig();
    if (config.user) {
      console.log(config.user.username);
    } else {
      console.log('Not logged in');
    }
  });

program
  .command('publish')
  .description('Publish a package to the registry')
  .action(() => {
    const config = loadConfig();
    if (!config.user) {
      console.log('You must be logged in to publish packages.');
      return;
    }

    const allowedTiers = ['package-maker', 'moderator', 'creator'];
    if (!allowedTiers.includes(config.user.tier)) {
      console.log('You do not have permission to publish packages.');
      return;
    }

    if (!fs.existsSync('package.json')) {
      console.log('No package.json found in the current directory.');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json'));
    console.log(`Publishing ${packageJson.name}@${packageJson.version}...`);
    // In a real implementation, you would upload the package to the registry.
    console.log('Package published successfully!');
  });

program
  .command('set-tier <username> <tier>')
  .description('Set the tier for a user')
  .action((username, tier) => {
    const config = loadConfig();
    if (!config.user || config.user.tier !== 'creator') {
      console.log('You do not have permission to set user tiers.');
      return;
    }

    const tiers = ['user', 'package-maker', 'moderator', 'creator'];
    if (!tiers.includes(tier)) {
      console.log(`Invalid tier: ${tier}. Valid tiers are: ${tiers.join(', ')}`);
      return;
    }

    // In a real implementation, you would update the user's tier in a database.
    console.log(`Setting tier for ${username} to ${tier}...`);
    console.log('User tier updated successfully!');
  });

program
  .command('create <package-name>')
  .alias('c') // Alias for create
  .description('Create a new XND package')
  .action((packageName) => {
    console.log(`Creating new package: ${packageName}...`);
    const packageDir = path.join(process.cwd(), packageName);
    if (fs.existsSync(packageDir)) {
      console.error(`Error: Directory '${packageName}' already exists.`);
      return;
    }
    fs.mkdirSync(packageDir);
    process.chdir(packageDir);

    // Simulate xnd init
    const defaultPackageJson = {
      name: packageName,
      version: '1.0.0',
      description: `A new XND package: ${packageName}`,
      main: 'index.js',
      scripts: {
        test: 'echo "Error: no test specified" && exit 1'
      },
      keywords: ['xnd-package', packageName],
      author: '',
      license: 'ISC',
      repository: {
        type: 'git',
        url: ''
      },
      bugs: {
        url: ''
      },
      homepage: ''
    };
    fs.writeFileSync('package.json', JSON.stringify(defaultPackageJson, null, 2));
    console.log('package.json created.');

    fs.writeFileSync('index.js', '// A simple example function\nexport function add(a, b) {\n  return a + b;\n}\n');
    console.log('index.js created with example function.');

    fs.writeFileSync('README.md', `# ${packageName}\n\n`);
    console.log('README.md created.');

    console.log(`Package '${packageName}' created successfully!`);
  });

program
  .command('edit <package-name>')
  .alias('e')
  .description('Open an installed package for editing')
  .action((packageName) => {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    if (!fs.existsSync(packagePath)) {
      console.error(`Error: Package '${packageName}' not found in node_modules.`);
      return;
    }

    console.log(`Package '${packageName}' found at: ${packagePath}`);
    console.log('You can now modify the files in this directory using your preferred text editor.');
    console.log('Example (VS Code): code ', packagePath);
    console.log('Example (Sublime Text): subl ', packagePath);
    console.log('Example (Windows Notepad): notepad ', packagePath);
  });

program
  .command('uninstall <package-name>')
  .alias('un')
  .description('Uninstall a package')
  .action((packageName) => {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    if (!fs.existsSync(packagePath)) {
      console.error(`Error: Package '${packageName}' not found in node_modules.`);
      return;
    }

    fs.rmSync(packagePath, { recursive: true, force: true });
    console.log(`Successfully uninstalled ${packageName}.`);

    // Remove from package.json if present
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json'));
      if (packageJson.dependencies && packageJson.dependencies[packageName]) {
        delete packageJson.dependencies[packageName];
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log(`Removed ${packageName} from package.json dependencies.`);
      }
    }
  });

program
  .command('list')
  .alias('ls')
  .description('List installed packages and dependencies')
  .action(() => {
    console.log('Installed Packages (in node_modules):');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      const installedPackages = fs.readdirSync(nodeModulesPath);
      if (installedPackages.length > 0) {
        installedPackages.forEach(pkg => console.log(`  - ${pkg}`));
      } else {
        console.log('  No packages installed in node_modules.');
      }
    }
    else {
      console.log('  node_modules directory not found.');
    }

    console.log('\nDependencies (from package.json):');
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json'));
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {}; // Assuming devDependencies might be added later

      const allDependencies = { ...dependencies, ...devDependencies };
      if (Object.keys(allDependencies).length > 0) {
        for (const pkg in allDependencies) {
          console.log(`  - ${pkg}@${allDependencies[pkg]}`);
        }
      } else {
        console.log('  No dependencies listed in package.json.');
      }
    } else {
      console.log('  package.json not found.');
    }
  });

program.parse(process.argv);