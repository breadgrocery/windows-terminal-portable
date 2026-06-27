import fs from "fs-extra";
import path from "path";
import os from "os";
import _7z from "7zip-min";
import { getLatestRelease, downloadReleaseAsset } from "./utils/github.mjs";
import { updateHash } from "./utils/pkg.mjs";

const unpackArchive = async (archivePath, dest, options = {}) => {
  const { stripRoot = false } = options;
  const tempExtractDir = path.join(
    os.tmpdir(),
    `wt-portable-unpack-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );

  await fs.remove(dest);
  await fs.ensureDir(dest);
  await fs.ensureDir(tempExtractDir);

  try {
    await _7z.unpack(archivePath, tempExtractDir);

    if (stripRoot) {
      const entries = await fs.readdir(tempExtractDir);
      if (entries.length === 1) {
        const rootCandidate = path.join(tempExtractDir, entries[0]);
        const stat = await fs.stat(rootCandidate);
        if (stat.isDirectory()) {
          await fs.copy(rootCandidate, dest, {
            overwrite: true,
            dereference: true
          });
          return;
        }
      }
    }

    await fs.copy(tempExtractDir, dest, { overwrite: true, dereference: true });
  } finally {
    await fs.remove(tempExtractDir);
  }
};

const appsDir = path.resolve("src", "Apps");
const apps = {
  terminal: {
    name: "Windows Terminal",
    owner: "microsoft",
    repo: "terminal",
    predicate: (asset) => asset.name.endsWith("_x64.zip"),
    dest: () => path.resolve(appsDir, apps.terminal.name),
    unzip: (archivePath) =>
      unpackArchive(archivePath, apps.terminal.dest(), { stripRoot: true })
  },
  powershell: {
    name: "PowerShell",
    owner: "PowerShell",
    repo: "PowerShell",
    predicate: (asset) => asset.name.endsWith("-win-x64.zip"),
    dest: () => path.resolve(appsDir, apps.powershell.name),
    unzip: (archivePath) => unpackArchive(archivePath, apps.powershell.dest())
  },
  clink: {
    name: "clink",
    owner: "chrisant996",
    repo: "clink",
    predicate: (asset) => /\.\w{6}.zip$/.test(asset.name),
    dest: () => path.resolve(appsDir, apps.clink.name),
    unzip: (archivePath) => unpackArchive(archivePath, apps.clink.dest())
  },
  starship: {
    name: "starship",
    owner: "starship",
    repo: "starship",
    predicate: (asset) => asset.name.endsWith("x86_64-pc-windows-msvc.zip"),
    dest: () => path.resolve(appsDir, apps.starship.name),
    unzip: (archivePath) => unpackArchive(archivePath, apps.starship.dest())
  }
};

const shouldSkipPrepare = () => {
  const dirExists = fs.pathExistsSync(appsDir);
  if (!dirExists) return false;

  const files = fs.readdirSync(appsDir);
  return files.length > 0 && !process.argv.includes("--force");
};

const prepare = async () => {
  if (shouldSkipPrepare()) {
    console.log("Prepare Apps: Step skipped.");
    return;
  }

  console.log("Preparing apps...");
  const assets = await Promise.all(
    Object.values(apps).map(async (app) => {
      const release = await getLatestRelease(app.owner, app.repo);
      const asset = release.assets.find(app.predicate);
      if (!asset) throw new Error(`No matching asset found for ${app.name}`);
      return asset;
    })
  );

  if (await updateHash(assets)) {
    const tasks = assets.map(async (asset, i) => {
      const app = Object.values(apps)[i];
      const dest = path.resolve("node_modules", "temp", asset.name);
      await downloadReleaseAsset(app.owner, app.repo, asset.id, dest);
      await app.unzip(dest);
    });
    await Promise.all(tasks);
    console.log("Prepare Apps: Done.");
  }
};

(async () => {
  try {
    await prepare();
  } catch (error) {
    console.error("Error during app preparation:", error);
    process.exit(1);
  }
})();
