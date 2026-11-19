import { execFileSync } from "node:child_process";
import { declareValuePlugin, PluginKind } from "@stryker-mutator/api/plugin";
import { strykerPlugins as vitestPlugins } from "@stryker-mutator/vitest-runner";

export { strykerValidationSchema } from "@stryker-mutator/vitest-runner";

// Keep Stryker's CLI on Node. Its workers fork Vitest and must use the same runtime as bun run test.
if (!process.versions.bun) {
  for (const key of ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR"]) {
    delete process.env[key];
  }
  process.execPath = execFileSync("bun", ["--print", "process.execPath"], {
    encoding: "utf8",
  }).trim();
}

const browserMethods = new Set(["evaluate", "evaluateHandle", "evaluateOnNewDocument"]);

/** @param {import("@babel/traverse").NodePath} path */
function puppeteerArgument(path) {
  if (!path.parentPath?.isCallExpression() || path.key !== 0) return false;
  const { callee } = path.parentPath.node;
  return (
    callee.type === "MemberExpression" &&
    callee.property.type === "Identifier" &&
    browserMethods.has(callee.property.name)
  );
}

/** @param {import("@babel/traverse").NodePath} path */
function puppeteerCallback(path) {
  if (path.isFunctionDeclaration() && path.node.id) {
    return (
      path.scope.getBinding(path.node.id.name)?.referencePaths.some(puppeteerArgument) ?? false
    );
  }
  return path.isFunction() && puppeteerArgument(path);
}

export const strykerPlugins = [
  ...vitestPlugins,
  declareValuePlugin(PluginKind.Ignore, "puppeteer-callbacks", {
    shouldIgnore(path) {
      if (puppeteerCallback(path) || path.findParent(puppeteerCallback)) {
        return "Puppeteer serializes this callback into Chrome without its module scope";
      }
    },
  }),
];
