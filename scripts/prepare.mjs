import fs from "fs-extra";
import path from "path";
import { zip } from "compressing";
import { getLatestRelease, downloadReleaseAsset } from "./utils/github.mjs";
import { updateHash } from "./utils/pkg.mjs";

const appsDir = path.resolve("src", "Apps");
const apps = {
  terminal: {
    name: "Windows Terminal",
    owner: "microsoft",
    repo: "terminal",
    predicate: (asset) => asset.name.endsWith("_x64.zip"),
    dest: () => path.resolve(appsDir, apps.terminal.name),
    unzip: (dest) => zip.uncompress(dest, apps.terminal.dest(), { strip: 1 }),
  },
  clink: {
    name: "clink",
    owner: "chrisant996",
    repo: "clink",
    predicate: (asset) => /\.\w{6}.zip$/.test(asset.name),
    dest: () => path.resolve(appsDir, apps.clink.name),
    unzip: (dest) => zip.uncompress(dest, apps.clink.dest()),
  },
  starship: {
    name: "starship",
    owner: "starship",
    repo: "starship",
    predicate: (asset) => asset.name.endsWith("x86_64-pc-windows-msvc.zip"),
    dest: () => path.resolve(appsDir, apps.starship.name),
    unzip: (dest) => zip.uncompress(dest, apps.starship.dest()),
  },
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
    await Promise.all(
      assets.map(async (asset, i) => {
        const app = Object.values(apps)[i];
        const dest = path.resolve("node_modules", "temp", asset.name);
        await downloadReleaseAsset(app.owner, app.repo, asset.id, dest);
        await app.unzip(dest);
      })
    );

    console.log("Prepare Apps: Done.");
  }
};

await prepare();
