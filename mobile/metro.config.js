const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the workspace root (the folder containing both 'mobile' and 'src')
config.watchFolders = [workspaceRoot];

// 2. Let Metro know how to resolve the @web alias
config.resolver.extraNodeModules = {
  '@web': path.resolve(workspaceRoot, 'src'),
};

// 3. (Optional) Force Metro to use the node_modules from the project root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
