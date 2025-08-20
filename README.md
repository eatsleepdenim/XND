# XND - A Secure and Extensible Package Manager

## Introduction
XND is a command-line interface (CLI) tool designed to be a simple, secure, and extensible package manager. It aims to provide a robust platform for managing XND packages with a focus on security through a user tier system.

## Features
- **Project Initialization:** Quickly set up new projects with `xnd init`.
- **Package Installation:** Install packages from the XND registry with `xnd install`.
- **Dependency Management:** Automatically save installed packages to your `package.json`.
- **Package Creation:** Scaffold new XND packages with `xnd create`.
- **User Tier System:** A multi-level user system to control publishing and moderation, preventing malicious uploads.
  - **User:** Can install packages.
  - **Package-Maker:** Can publish their own packages.
  - **Moderator:** Can manage packages and users.
  - **Creator:** Full control over the system.
- **Secure Publishing:** Publishing is restricted based on user tiers.

## Installation

To install XND globally, run the following command:

```bash
npm install -g xnd
```

## Usage

### `xnd init`
Initializes a new project and creates a `package.json` file.

```bash
xnd init
```

### `xnd install [packages...]`
Installs one or more packages from the XND registry. If no packages are specified, it installs all dependencies from `package.json`.

```bash
xnd install react
xnd install lodash express
xnd install # Installs from package.json
```

Use the `--save` or `-S` flag to save the installed package as a dependency in your `package.json`:

```bash
xnd install moment --save
```

### `xnd create <package-name>`
Creates a new XND package with a basic structure, including a `package.json`, `index.js` with an example function, and a `README.md`.

```bash
xnd create my-awesome-package
```

### `xnd login`
Logs in a user to the XND system. You will be prompted for your username and password.

```bash
xnd login
```

### `xnd logout`
Logs out the current user.

```bash
xnd logout
```

### `xnd whoami`
Shows the username of the currently logged-in user.

```bash
xnd whoami
```

### `xnd publish`
Publishes the package in the current directory to the XND registry. Requires appropriate user tier permissions.

```bash
xnd publish
```

### `xnd set-tier <username> <tier>`
Sets the tier for a specified user. This command is restricted to the `creator` tier.

Valid tiers are: `user`, `package-maker`, `moderator`, `creator`.

```bash
xnd set-tier john_doe package-maker
```

## User Tier System

XND implements a user tier system to ensure the integrity and security of the package registry. Each tier has specific permissions:

- **User:** The default tier for all new users. Can install packages.
- **Package-Maker:** Can publish and manage their own packages.
- **Moderator:** Can manage packages and users (e.g., remove malicious packages, suspend users).
- **Creator:** Has full administrative control over the system, including setting user tiers and managing all aspects of the registry.

## Development

### Running the XND Server

To run the XND server (which handles user authentication and package publishing logic), navigate to the `xnd-server` directory and run:

```bash
node index.js
```

### Running the XND CLI Locally

To test changes to the XND CLI locally without global installation, navigate to the `xnd` directory and use `node index.mjs` followed by the command:

```bash
node index.mjs init
node index.mjs install react
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
