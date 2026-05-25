#!/usr/bin/env node
import { execSync } from "node:child_process";
import { env } from "node:process";

env.NODE_OPTIONS = "--max-old-space-size=8192";

const cmd = process.argv.slice(2).join(" ");
execSync(cmd, { stdio: "inherit", env });