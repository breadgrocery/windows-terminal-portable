import fs from "fs-extra";
import { Octokit } from "@octokit/rest";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const getLatestRelease = async (owner, repo) => {
  const response = await octokit.rest.repos.getLatestRelease({ owner, repo });
  return response.data;
};

export const downloadReleaseAsset = async (owner, repo, asset_id, dest) => {
  const { data } = await octokit.rest.repos.getReleaseAsset({
    owner,
    repo,
    asset_id,
    headers: { accept: "application/octet-stream" },
  });

  fs.ensureFileSync(dest);
  await pipeline(
    Readable.from(Buffer.from(data)),
    fs.createWriteStream(dest, { encoding: "binary" })
  );
};
