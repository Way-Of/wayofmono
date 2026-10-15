/**
 * [WOTEAMS-547] JSON Schema (MCP tool inputSchema) → TypeBox conversion.
 *
 * Pure module, unit-tested. The original single-file extension's inline converter
 * mishandled enums/oneOf/nullable — this is a hardened version.
 */
import { Type } from "typebox"

export type Schema = ReturnType<typeof Type.Object> | ReturnType<typeof Type.Unsafe> |
	ReturnType<typeof Type.String> | ReturnType<typeof Type.Array> | ReturnType<typeof Type.Null> |
	ReturnType<typeof Type.Integer> | ReturnType<typeof Type.Number> | ReturnType<typeof Type.Boolean>

function withDescription(t: any, desc?: string): any {
	return desc ? { ...t, description: desc } : t
}

/** Recursively convert a JSON Schema fragment to a TypeBox schema. */
export function convertSchema(schema: Record<string, unknown> | undefined): Schema {
	if (!schema || typeof schema !== "object") return Type.Object({})

	const desc = typeof schema.description === "string" ? schema.description : undefined
	const type = schema.type as string | string[] | undefined
	const types: string[] = Array.isArray(type) ? (type as string[]) : type ? [type] : []

	// enum handling — MCP tools frequently use string enums
	if (Array.isArray(schema.enum) && schema.enum.length > 0) {
		const values = schema.enum as unknown[]
		if (values.every(v => typeof v === "string")) {
			return Type.Unsafe({ type: "string", enum: values, ...(desc ? { description: desc } : {}) })
		}
		return Type.Unsafe({
			anyOf: values.map(v => ({ type: typeof v, const: v })),
			...(desc ? { description: desc } : {}),
		})
	}

	// anyOf / oneOf / allOf compositions
	const anyOf = schema.anyOf ?? schema.oneOf
	if (Array.isArray(anyOf)) {
		const subs = anyOf.filter(Boolean).map(s => convertSchema(s as Record<string, unknown>))
		if (subs.length === 1) return withDescription(subs[0], desc)
		return Type.Unsafe({ anyOf: subs, ...(desc ? { description: desc } : {}) })
	}

	if (schema.type === "null") return Type.Null()
	if (types.includes("null")) {
		// nullable combined: handled by anyOf; if type: ["string","null"] degrade to string
		const real = types.filter(t => t !== "null")
		return convertSchema({ ...schema, type: real.length === 1 ? real[0] : real })
	}

	if (types.includes("object") || (!types.length && schema.properties)) {
		const props = (schema.properties as Record<string, Record<string, unknown>> | undefined) ?? {}
		const required = (schema.required as string[] | undefined) ?? []
		const properties: Record<string, any> = {}
		for (const [key, sub] of Object.entries(props)) {
			const converted = convertSchema(sub)
			properties[key] = required.includes(key) ? converted : Type.Optional(converted)
		}
		// container schema (additionalProperties ~ any) — keep property fields, allow extras
		return Type.Object(properties, {
			...(desc ? { description: desc } : {}),
			additionalProperties:
				typeof schema.additionalProperties === "boolean" && schema.additionalProperties === false
					? false
					: true,
		})
	}

	if (types.includes("array")) {
		const items = schema.items as Record<string, unknown> | undefined
		return Type.Array(items ? convertSchema(items) : Type.Any(), withDescription(undefined, desc))
	}
	if (types.includes("string")) return Type.String(desc ? { description: desc } : {})
	if (types.includes("integer")) return withDescription(Type.Integer(), desc)
	if (types.includes("number")) return withDescription(Type.Number(), desc)
	if (types.includes("boolean")) return withDescription(Type.Boolean(), desc)

	// default to a permissive object (arrays of enums, empty schemas, etc.)
	return Type.Object({})
}

/** TypeBox → JSON Schema, for reference/debugging. */
export function typeBoxToJsonSchema(schema: Record<string, unknown>): Record<string, unknown> {
	return {
		type: (schema as any).type ?? "object",
		...(schema as any).properties ? { properties: (schema as any).properties } : {},
		...(schema as any).description ? { description: (schema as any).description } : {},
	}
}