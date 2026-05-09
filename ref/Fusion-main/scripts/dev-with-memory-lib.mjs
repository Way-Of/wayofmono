export function buildDevNodeArgs({
  inspectFlags = [],
  preload,
  loader,
  entry,
  args = [],
}) {
  return [
    ...inspectFlags,
    "--conditions=source",
    "--require",
    preload,
    "--import",
    `file://${loader}`,
    entry,
    ...args,
  ];
}
