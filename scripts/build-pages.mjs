import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);

const env = {
  ...process.env,
  GITHUB_PAGES: "true",
  NEXT_PUBLIC_SITE_BASE_PATH:
    process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "/Automated-Paper-Reader-for-Robotics",
  NEXT_PUBLIC_SITE_ORIGIN:
    process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://kaijunwang111.github.io",
};

const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
