import fs from "fs-extra";
import path from "path";
import _7z from "7zip-min";

const appsDir = path.resolve("src", "Apps");
if (fs.pathExistsSync(appsDir) && fs.readdirSync(appsDir).length > 0) {
  const source = path.resolve("dist", "Windows Terminal");
  fs.copySync(path.resolve("src"), source, { dereference: true });

  const dest = path.resolve("dist", "windows-terminal-portable.zip");

  console.log(`Build: Packing to ${dest}...`);

  await _7z.pack(source, dest);

  console.log("Build: Done.");
} else {
  console.log("Build: Step skipped.");
}
