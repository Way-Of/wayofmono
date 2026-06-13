import ignore from "ignore";
import { parse } from "yaml";
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const IGNORE_FILE_NAMES = [".gitignore", ".ignore", ".fdignore"];
/** Format a skill invocation prompt, optionally appending additional user instructions. */
export function formatSkillInvocation(skill, additionalInstructions) {
    const skillBlock = `<skill name="${skill.name}" location="${skill.filePath}">\nReferences are relative to ${dirnameEnvPath(skill.filePath)}.\n\n${skill.content}\n</skill>`;
    return additionalInstructions ? `${skillBlock}\n\n${additionalInstructions}` : skillBlock;
}
/**
 * Load skills from one or more directories.
 *
 * Traverses directories recursively, loads `SKILL.md` files, loads direct root `.md` files as skills, honors ignore files,
 * and returns diagnostics for invalid skill files. Missing input directories are skipped.
 */
export async function loadSkills(env, dirs) {
    const skills = [];
    const diagnostics = [];
    for (const dir of Array.isArray(dirs) ? dirs : [dirs]) {
        const rootInfo = await safeFileInfo(env, dir);
        if (!rootInfo || (await resolveKind(env, rootInfo)) !== "directory")
            continue;
        const result = await loadSkillsFromDirInternal(env, rootInfo.path, true, ignore(), rootInfo.path);
        skills.push(...result.skills);
        diagnostics.push(...result.diagnostics);
    }
    return { skills, diagnostics };
}
/**
 * Load skills from source-tagged directories.
 *
 * Source values are preserved exactly and attached to every loaded skill and diagnostic. The agent package does not
 * interpret source values; applications define their own provenance shape.
 */
export async function loadSourcedSkills(env, inputs, mapSkill) {
    const skills = [];
    const diagnostics = [];
    for (const input of inputs) {
        const result = await loadSkills(env, input.path);
        for (const skill of result.skills) {
            skills.push({ skill: mapSkill ? mapSkill(skill, input.source) : skill, source: input.source });
        }
        for (const diagnostic of result.diagnostics)
            diagnostics.push({ ...diagnostic, source: input.source });
    }
    return { skills, diagnostics };
}
async function loadSkillsFromDirInternal(env, dir, includeRootFiles, ignoreMatcher, rootDir) {
    const skills = [];
    const diagnostics = [];
    if (!(await env.exists(dir)))
        return { skills, diagnostics };
    const dirInfo = await safeFileInfo(env, dir);
    if (!dirInfo || (await resolveKind(env, dirInfo)) !== "directory")
        return { skills, diagnostics };
    await addIgnoreRules(env, ignoreMatcher, dir, rootDir);
    let entries;
    try {
        entries = await env.listDir(dir);
    }
    catch {
        return { skills, diagnostics };
    }
    for (const entry of entries) {
        if (entry.name !== "SKILL.md")
            continue;
        const fullPath = entry.path;
        const kind = await resolveKind(env, entry);
        if (kind !== "file")
            continue;
        const relPath = relativeEnvPath(rootDir, fullPath);
        if (ignoreMatcher.ignores(relPath))
            continue;
        const result = await loadSkillFromFile(env, fullPath);
        if (result.skill)
            skills.push(result.skill);
        diagnostics.push(...result.diagnostics);
        return { skills, diagnostics };
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        if (entry.name.startsWith(".") || entry.name === "node_modules")
            continue;
        const fullPath = entry.path;
        const kind = await resolveKind(env, entry);
        if (!kind)
            continue;
        const relPath = relativeEnvPath(rootDir, fullPath);
        const ignorePath = kind === "directory" ? `${relPath}/` : relPath;
        if (ignoreMatcher.ignores(ignorePath))
            continue;
        if (kind === "directory") {
            const result = await loadSkillsFromDirInternal(env, fullPath, false, ignoreMatcher, rootDir);
            skills.push(...result.skills);
            diagnostics.push(...result.diagnostics);
            continue;
        }
        if (kind !== "file" || !includeRootFiles || !entry.name.endsWith(".md"))
            continue;
        const result = await loadSkillFromFile(env, fullPath);
        if (result.skill)
            skills.push(result.skill);
        diagnostics.push(...result.diagnostics);
    }
    return { skills, diagnostics };
}
async function addIgnoreRules(env, ig, dir, rootDir) {
    const relativeDir = relativeEnvPath(rootDir, dir);
    const prefix = relativeDir ? `${relativeDir}/` : "";
    for (const filename of IGNORE_FILE_NAMES) {
        const ignorePath = joinEnvPath(dir, filename);
        const info = await safeFileInfo(env, ignorePath);
        if (info?.kind !== "file")
            continue;
        try {
            const content = await env.readTextFile(ignorePath);
            const patterns = content
                .split(/\r?\n/)
                .map((line) => prefixIgnorePattern(line, prefix))
                .filter((line) => Boolean(line));
            if (patterns.length > 0)
                ig.add(patterns);
        }
        catch { }
    }
}
function prefixIgnorePattern(line, prefix) {
    const trimmed = line.trim();
    if (!trimmed)
        return null;
    if (trimmed.startsWith("#") && !trimmed.startsWith("\\#"))
        return null;
    let pattern = line;
    let negated = false;
    if (pattern.startsWith("!")) {
        negated = true;
        pattern = pattern.slice(1);
    }
    else if (pattern.startsWith("\\!")) {
        pattern = pattern.slice(1);
    }
    if (pattern.startsWith("/"))
        pattern = pattern.slice(1);
    const prefixed = prefix ? `${prefix}${pattern}` : pattern;
    return negated ? `!${prefixed}` : prefixed;
}
async function loadSkillFromFile(env, filePath) {
    const diagnostics = [];
    try {
        const rawContent = await env.readTextFile(filePath);
        const { frontmatter, body } = parseFrontmatter(rawContent);
        const skillDir = dirnameEnvPath(filePath);
        const parentDirName = basenameEnvPath(skillDir);
        for (const error of validateDescription(frontmatter.description)) {
            diagnostics.push({ type: "warning", message: error, path: filePath });
        }
        const name = frontmatter.name || parentDirName;
        for (const error of validateName(name, parentDirName)) {
            diagnostics.push({ type: "warning", message: error, path: filePath });
        }
        if (!frontmatter.description || frontmatter.description.trim() === "") {
            return { skill: null, diagnostics };
        }
        return {
            skill: {
                name,
                description: frontmatter.description,
                content: body,
                filePath,
                disableModelInvocation: frontmatter["disable-model-invocation"] === true,
            },
            diagnostics,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "failed to parse skill file";
        diagnostics.push({ type: "warning", message, path: filePath });
        return { skill: null, diagnostics };
    }
}
function validateName(name, parentDirName) {
    const errors = [];
    if (name !== parentDirName)
        errors.push(`name "${name}" does not match parent directory "${parentDirName}"`);
    if (name.length > MAX_NAME_LENGTH)
        errors.push(`name exceeds ${MAX_NAME_LENGTH} characters (${name.length})`);
    if (!/^[a-z0-9-]+$/.test(name)) {
        errors.push("name contains invalid characters (must be lowercase a-z, 0-9, hyphens only)");
    }
    if (name.startsWith("-") || name.endsWith("-"))
        errors.push("name must not start or end with a hyphen");
    if (name.includes("--"))
        errors.push("name must not contain consecutive hyphens");
    return errors;
}
function validateDescription(description) {
    const errors = [];
    if (!description || description.trim() === "") {
        errors.push("description is required");
    }
    else if (description.length > MAX_DESCRIPTION_LENGTH) {
        errors.push(`description exceeds ${MAX_DESCRIPTION_LENGTH} characters (${description.length})`);
    }
    return errors;
}
function parseFrontmatter(content) {
    const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (!normalized.startsWith("---"))
        return { frontmatter: {}, body: normalized };
    const endIndex = normalized.indexOf("\n---", 3);
    if (endIndex === -1)
        return { frontmatter: {}, body: normalized };
    const yamlString = normalized.slice(4, endIndex);
    const body = normalized.slice(endIndex + 4).trim();
    return { frontmatter: (parse(yamlString) ?? {}), body };
}
async function safeFileInfo(env, path) {
    try {
        return await env.fileInfo(path);
    }
    catch {
        return undefined;
    }
}
async function resolveKind(env, info) {
    if (info.kind === "file" || info.kind === "directory")
        return info.kind;
    try {
        const realPath = await env.realPath(info.path);
        const target = await env.fileInfo(realPath);
        return target.kind === "file" || target.kind === "directory" ? target.kind : undefined;
    }
    catch {
        return undefined;
    }
}
function joinEnvPath(base, child) {
    return `${base.replace(/\/+$/, "")}/${child.replace(/^\/+/, "")}`;
}
function dirnameEnvPath(path) {
    const normalized = path.replace(/\/+$/, "");
    const slashIndex = normalized.lastIndexOf("/");
    return slashIndex <= 0 ? "/" : normalized.slice(0, slashIndex);
}
function basenameEnvPath(path) {
    const normalized = path.replace(/\/+$/, "");
    const slashIndex = normalized.lastIndexOf("/");
    return slashIndex === -1 ? normalized : normalized.slice(slashIndex + 1);
}
function relativeEnvPath(root, path) {
    const normalizedRoot = root.replace(/\/+$/, "");
    const normalizedPath = path.replace(/\/+$/, "");
    if (normalizedPath === normalizedRoot)
        return "";
    return normalizedPath.startsWith(`${normalizedRoot}/`)
        ? normalizedPath.slice(normalizedRoot.length + 1)
        : normalizedPath.replace(/^\/+/, "");
}
//# sourceMappingURL=skills.js.map