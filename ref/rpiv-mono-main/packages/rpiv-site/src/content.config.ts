import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const skillSpecs = defineCollection({
	loader: glob({ pattern: "*/SKILL.md", base: "../rpiv-pi/skills" }),
	schema: z.object({
		name: z.string(),
		description: z.string(),
		"argument-hint": z.union([z.string(), z.array(z.string())]).optional(),
		"allowed-tools": z.union([z.string(), z.array(z.string())]).optional(),
		"disable-model-invocation": z.boolean().optional(),
	}),
});

const skills = defineCollection({
	loader: glob({ pattern: "*.md", base: "./src/content/skills" }),
	schema: z.object({
		slug: z.string(),
		tagline: z.string(),
	}),
});

const agentSpecs = defineCollection({
	loader: glob({ pattern: "*.md", base: "../rpiv-pi/agents" }),
	schema: z.object({
		name: z.string(),
		description: z.string(),
		tools: z.string().optional(),
		isolated: z.boolean().optional(),
	}),
});

const agents = defineCollection({
	loader: glob({ pattern: "*.md", base: "./src/content/agents" }),
	schema: z.object({
		slug: z.string(),
		tagline: z.string(),
	}),
});

const extensions = defineCollection({
	loader: glob({ pattern: "*.md", base: "./src/content/extensions" }),
	schema: z.object({
		slug: z.string(),
		tagline: z.string(),
		package: z.string(),
		status: z.enum(["stable", "beta", "experimental"]).default("stable"),
		order: z.number().default(0),
	}),
});

export const collections = { skills, skillSpecs, agents, agentSpecs, extensions };
