import fs from "fs-extra";
import path from "path";

const pkgPath = path.resolve("package.json");

export const updateHash = async (assets) => {
  const pkg = await fs.readJSON(pkgPath);
  const hash = assets.map((asset) => asset.digest).join(",");

  if (hash === pkg.hash && !process.argv.includes("--force")) {
    console.log("Apps hash unchanged.");
    return false;
  }

  await fs.writeJSON(pkgPath, { ...pkg, hash }, { spaces: 2 });
  return true;
};
