import { type CollectionEntry, getCollection } from "astro:content";

type SpecEntry = CollectionEntry<"agentSpecs">;

export type AgentEntry = {
	slug: string;
	tagline: string;
	body: string | undefined;
	data: SpecEntry["data"];
};

export type CapabilityTier = "locator" | "analyzer" | "external" | "specialist";

const TIER_BY_NAME: Record<string, CapabilityTier> = {
	"codebase-locator": "locator",
	"thoughts-locator": "locator",
	"test-case-locator": "locator",
	"integration-scanner": "locator",
	"codebase-analyzer": "analyzer",
	"codebase-pattern-finder": "analyzer",
	"thoughts-analyzer": "analyzer",
	"precedent-locator": "analyzer",
	"scope-tracer": "analyzer",
	"web-search-researcher": "external",
	"claim-verifier": "specialist",
	"diff-auditor": "specialist",
	"peer-comparator": "specialist",
};

/** Counts from research §7 dispatcher table. Single-source-of-truth. */
export const DISPATCHER_COUNT: Record<string, number> = {
	"claim-verifier": 1,
	"codebase-analyzer": 9,
	"codebase-locator": 7,
	"codebase-pattern-finder": 5,
	"diff-auditor": 1,
	"integration-scanner": 4,
	"peer-comparator": 1,
	"precedent-locator": 3,
	"scope-tracer": 1,
	"test-case-locator": 2,
	"thoughts-analyzer": 2,
	"thoughts-locator": 3,
	"web-search-researcher": 5,
};

/** Specialists + already-single-sentence locators get the full description. Others trim to first sentence. */
const FULL_DESCRIPTION_AGENTS = new Set([
	"claim-verifier",
	"diff-auditor",
	"peer-comparator",
	"precedent-locator",
	"codebase-locator",
	"integration-scanner",
	"test-case-locator",
]);

/** Fallback derivation when no visitor tagline is authored yet. Trim jokey multi-sentence to first sentence and silently fix two known typos. */
function fallbackTagline(spec: SpecEntry): string {
	const { name } = spec.data;
	let desc = spec.data.description;
	if (name === "thoughts-locator") {
		desc = desc.replace(/reseaching/g, "researching").replace(/equivilent/g, "equivalent");
	}
	if (FULL_DESCRIPTION_AGENTS.has(name)) return desc;
	return desc.split(/(?<=[.!?])\s+/, 2)[0]!;
}

/** Visitor-facing copy. Returns the authored tagline if present, otherwise a derived fallback from the spec. */
export function siteDescription(agent: AgentEntry): string {
	return agent.tagline;
}

export function tier(agent: AgentEntry): CapabilityTier {
	return TIER_BY_NAME[agent.slug] ?? "analyzer";
}

const TIER_ORDER: CapabilityTier[] = ["locator", "analyzer", "specialist", "external"];

export async function getAgentsByTier(): Promise<Array<{ tier: CapabilityTier; agents: AgentEntry[] }>> {
	const [specs, copies] = await Promise.all([getCollection("agentSpecs"), getCollection("agents")]);
	const all: AgentEntry[] = specs.map((spec) => {
		const copy = copies.find((c) => c.data.slug === spec.data.name);
		return {
			slug: spec.data.name,
			tagline: copy?.data.tagline ?? fallbackTagline(spec),
			body: copy?.body,
			data: spec.data,
		};
	});
	const groups = new Map<CapabilityTier, AgentEntry[]>(TIER_ORDER.map((t) => [t, []]));
	for (const a of all) groups.get(tier(a))!.push(a);
	for (const list of groups.values()) {
		list.sort((x, y) => x.slug.localeCompare(y.slug));
	}
	return TIER_ORDER.map((t) => ({ tier: t, agents: groups.get(t)! }));
}
