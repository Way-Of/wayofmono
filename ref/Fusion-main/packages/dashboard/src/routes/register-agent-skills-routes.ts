import { ApiError } from "../api-error.js";
import type { ApiRoutesContext } from "./types.js";

export function registerAgentSkillsRoutes(ctx: ApiRoutesContext): void {
  const { router, options, getScopedStore, rethrowAsApiError } = ctx;

  /**
   * GET /api/skills/discovered
   * List all discovered skills with their enabled state.
   * Query: projectId (optional) for multi-project context
   * Response: { skills: DiscoveredSkill[] }
   */
  router.get("/skills/discovered", async (req, res) => {
    try {
      const scopedStore = await getScopedStore(req);
      const skillsAdapter = options?.skillsAdapter;

      if (!skillsAdapter) {
        res.status(404).json({ error: "Skills adapter not configured", code: "adapter_not_configured" });
        return;
      }

      const rootDir = scopedStore.getRootDir();
      const skills = await skillsAdapter.discoverSkills(rootDir);

      res.json({ skills });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      rethrowAsApiError(err, "Failed to discover skills");
    }
  });

  /**
   * GET /api/skills/:id/content
   * Read the contents of a skill's SKILL.md file and list supplementary files.
   * Params: id (URL-encoded skill ID)
   * Query: projectId (optional) for multi-project context
   * Response: { content: SkillContent }
   * Error: 404 { error: string; code: "skill_not_found" | "adapter_not_configured" }
   */
  router.get("/skills/:id/content", async (req, res) => {
    try {
      const scopedStore = await getScopedStore(req);
      const skillsAdapter = options?.skillsAdapter;

      if (!skillsAdapter) {
        res.status(404).json({ error: "Skills adapter not configured", code: "adapter_not_configured" });
        return;
      }

      const encodedSkillId = req.params.id as string;
      let skillId = encodedSkillId;
      try {
        skillId = decodeURIComponent(encodedSkillId);
      } catch {
        res.status(400).json({ error: "Invalid skill ID", code: "invalid_skill_id" });
        return;
      }

      const rootDir = scopedStore.getRootDir();
      const content = await skillsAdapter.readSkillContent(rootDir, skillId);

      res.json({ content });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      if (err instanceof Error && err.message.includes("Skill not found")) {
        res.status(404).json({ error: "Skill not found", code: "skill_not_found" });
        return;
      }
      if (err instanceof Error && err.message.includes("Invalid skill ID")) {
        res.status(400).json({ error: err.message, code: "invalid_skill_id" });
        return;
      }
      rethrowAsApiError(err, "Failed to read skill content");
    }
  });

  /**
   * PATCH /api/skills/execution
   * Toggle a skill's enabled/disabled state.
   * Body: { skillId: string; enabled: boolean }
   * Query: projectId (optional) for multi-project context
   * Response: { success: true; skillId: string; enabled: boolean; persistence: { scope: "project"; targetFile: string; settingsPath: string; pattern: string } }
   */
  router.patch("/skills/execution", async (req, res) => {
    try {
      const scopedStore = await getScopedStore(req);
      const skillsAdapter = options?.skillsAdapter;

      if (!skillsAdapter) {
        res.status(404).json({ error: "Skills adapter not configured", code: "adapter_not_configured" });
        return;
      }

      const { skillId, enabled } = req.body as { skillId?: string; enabled?: boolean };

      if (!skillId || typeof skillId !== "string") {
        res.status(400).json({ error: "skillId is required", code: "invalid_body" });
        return;
      }

      if (typeof enabled !== "boolean") {
        res.status(400).json({ error: "enabled must be a boolean", code: "invalid_body" });
        return;
      }

      const rootDir = scopedStore.getRootDir();
      const persistence = await skillsAdapter.toggleExecutionSkill(rootDir, { skillId, enabled });

      res.json({
        success: true,
        skillId,
        enabled,
        persistence: {
          scope: "project",
          targetFile: persistence.targetFile,
          settingsPath: persistence.settingsPath,
          pattern: persistence.pattern,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      if (err instanceof Error && err.message.includes("Invalid skill ID")) {
        res.status(400).json({ error: err.message, code: "invalid_skill_id" });
        return;
      }
      if (err instanceof Error && err.message.includes("Skill not found")) {
        res.status(404).json({ error: err.message, code: "skill_not_found" });
        return;
      }
      rethrowAsApiError(err, "Failed to toggle skill execution");
    }
  });

  /**
   * GET /api/skills/catalog
   * Fetch the skills.sh catalog with optional authentication.
   * Query:
   *   - limit: number (default 20, max 100)
   *   - q: optional search query
   *   - projectId (optional) for multi-project context
   * Response: { entries: CatalogEntry[]; auth: { mode: string; tokenPresent: boolean; fallbackUsed: boolean } }
   * Error: 502 { error: string; code: "upstream_timeout"|"upstream_http_error"|"upstream_invalid_payload" }
   */
  router.get("/skills/catalog", async (req, res) => {
    try {
      const skillsAdapter = options?.skillsAdapter;

      if (!skillsAdapter) {
        res.status(404).json({ error: "Skills adapter not configured", code: "adapter_not_configured" });
        return;
      }

      const limitStr = typeof req.query.limit === "string" ? req.query.limit : "20";
      const limit = Math.min(Math.max(1, parseInt(limitStr, 10) || 20), 100);
      const query = typeof req.query.q === "string" ? req.query.q : undefined;

      const result = await skillsAdapter.fetchCatalog({ limit, query });

      // Check if result is an upstream error
      if ("code" in result) {
        res.status(502).json(result);
        return;
      }

      res.json(result);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      rethrowAsApiError(err, "Failed to fetch skills catalog");
    }
  });

}
