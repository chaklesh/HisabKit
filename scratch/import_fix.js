/**
 * import_fix.js
 * Automated script to fix barrel and local UI imports in the web app.
 */
const fs = require("node:fs");
const path = require("node:path");

const webSrc =
  "d:\\Dev\\Polyglot\\Ledger Based\\HisabKitFull\\worktrees\\hisabkit5\\apps\\web\\src";

const UI_MAPPINGS = {
  input: "Input",
  card: "Card",
  alert: "Alert",
  tabs: "Tabs",
  separator: "Separator",
  "form-field": "FormField",
  sheet: "Sheet",
  dialog: "Dialog",
  "page-loader": "PageLoader",
  sonner: "Sonner",
  skeleton: "Skeleton",
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(webSrc, (filePath) => {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) return;

  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // 1. Fix local UI imports: '@/shared/components/ui/xxx' -> '@hisabkit/ui/components/Xxx'
  for (const [local, remote] of Object.entries(UI_MAPPINGS)) {
    const regex = new RegExp(`['"]@/shared/components/ui/${local}['"]`, "g");
    content = content.replace(regex, `'@hisabkit/ui/components/${remote}'`);
  }

  // 2. Fix barrel imports: import { Button } from '@hisabkit/ui' -> import { Button } from '@hisabkit/ui/components/Button'
  // Only for single-export cases for now to stay safe
  content = content.replace(
    /import\s*{\s*(\w+)\s*}\s*from\s*['"]@hisabkit\/ui['"]\s*;?/g,
    (_match, component) => {
      if (component === "buttonVariants")
        return `import { buttonVariants } from '@hisabkit/ui/components/Button';`;
      return `import { ${component} } from '@hisabkit/ui/components/${component}';`;
    },
  );

  if (content !== original) {
    console.log(`Fixing imports in: ${filePath}`);
    fs.writeFileSync(filePath, content);
  }
});
