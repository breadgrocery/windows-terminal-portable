import fs from "fs-extra";
import path from "path";
import { zip } from "compressing";

const appsDir = path.resolve("src", "Apps");
if (fs.pathExistsSync(appsDir) && fs.readdirSync(appsDir).length > 0) {
  const source = path.resolve("dist", "Windows Terminal");
  fs.copySync(path.resolve("src"), source, { dereference: true });

  const dest = path.resolve("dist", "windows-terminal-portable.zip");

  console.log(`Build: Compressing to ${dest}...`);

  await zip.compressDir(source, dest, { compress: true, compressionLevel: 9 });

  console.log("Build: Done.");
} else {
  console.log("Build: Step skipped.");
}
