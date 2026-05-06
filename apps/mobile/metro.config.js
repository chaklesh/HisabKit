const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the necessary directories
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, "packages/features"),
  path.resolve(workspaceRoot, "packages/lib"),
  path.resolve(workspaceRoot, "packages/types"),
  path.resolve(workspaceRoot, "packages/ui"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 2. Resolve modules from project and workspace
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Exclude non-relevant directories from scanning
config.resolver.blockList = [
  /.*[/\\]apps[/\\](api|docs|web)[/\\].*/,
  /.*[/\\]agents[/\\].*/,
  /.*[/\\]scratch[/\\].*/,
  /.*[/\\]\.git[/\\].*/,
  /.*[/\\]\.turbo[/\\].*/,
  /.*\.db.*/,
  /.*\.sqlite.*/,
  /.*\.log.*/,
];

// 4. Force singletons using a more robust method
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  "react-native-web": path.resolve(projectRoot, "node_modules/react-native-web"),
};

// 4. Handle internal packages
const packages = ["features", "lib", "types", "ui"];
packages.forEach((pkg) => {
  config.resolver.extraNodeModules[`@hisabkit/${pkg}`] = path.resolve(
    workspaceRoot,
    `packages/${pkg}`
  );
});

module.exports = config;
