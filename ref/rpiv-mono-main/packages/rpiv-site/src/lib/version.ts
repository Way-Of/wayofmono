import pkg from "../../../rpiv-pi/package.json" with { type: "json" };

const raw = (pkg as { version?: string }).version;
if (!raw) throw new Error("rpiv-pi/package.json is missing a `version` field");

export const VERSION: string = raw;
