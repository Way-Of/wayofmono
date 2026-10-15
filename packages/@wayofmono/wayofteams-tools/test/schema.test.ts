import { describe, it, expect } from "vitest"
import { convertSchema } from "../src/schema.js"

describe("convertSchema (JSON Schema → TypeBox)", () => {
	it("converts a plain object with required/optional props", () => {
		const tb = convertSchema({
			type: "object",
			properties: {
				title: { type: "string" },
				priority: { type: "integer" },
				flag: { type: "boolean" },
				count: { type: "number" },
			},
			required: ["title"],
		}) as any
		expect(tb.type).toBe("object")
		expect(tb.properties.title.type).toBe("string")
		expect(tb.required).toContain("title")
		// optional fields must not be in required
		expect(tb.required.length).toBe(1)
	})

	it("handles string enums", () => {
		const tb = convertSchema({
			type: "string",
			enum: ["auto", "legacy", "v2", "rest"],
			description: "endpoint mode",
		}) as any
		expect(tb.type).toBe("string")
		expect(tb.enum).toEqual(["auto", "legacy", "v2", "rest"])
		expect(tb.description).toBe("endpoint mode")
	})

	it("handles arrays", () => {
		const tb = convertSchema({
			type: "array",
			items: { type: "string" },
		}) as any
		expect(tb.type).toBe("array")
		expect(tb.items.type).toBe("string")
	})

	it("collapses nullable unions to the non-null type", () => {
		const tb = convertSchema({ type: ["string", "null"] }) as any
		expect(tb.type).toBe("string")
	})

	it("handles anyOf with a single member", () => {
		const tb = convertSchema({
			anyOf: [{ type: "string" }],
		}) as any
		expect(tb.type).toBe("string")
	})

	it("defaults empty schemas to permissive object", () => {
		const tb = convertSchema({}) as any
		expect(tb.type).toBe("object")
	})

	it("does not crash on undefined", () => {
		expect(() => convertSchema(undefined)).not.toThrow()
	})
})