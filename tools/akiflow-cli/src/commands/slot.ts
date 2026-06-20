import { defineCommand } from "citty";
import { createClient } from "../lib/api/client";
import type { TimeSlot, UpdateTimeSlotPayload } from "../lib/api/types";
import { readResource } from "../lib/cache";
import { createSlotCommand } from "./create";

function fail(message: string): never {
	console.error(`Error: ${message}`);
	process.exit(1);
}

export function resolveCachedSlot(
	slots: TimeSlot[],
	identifier: string,
): TimeSlot {
	const exact = slots.find((slot) => slot.id === identifier);
	if (exact) return exact;

	const matches = slots.filter((slot) => slot.id.startsWith(identifier));
	const [match] = matches;
	if (matches.length === 1 && match) return match;
	if (matches.length > 1) {
		fail(
			`Slot id prefix "${identifier}" is ambiguous (${matches
				.map((slot) => slot.id)
				.join(", ")}). Use a longer id.`,
		);
	}

	fail(
		`Slot "${identifier}" was not found in the Akiflow time slot cache. Run af refresh and try again.`,
	);
}

export function buildSlotDeletePayload({
	slot,
	now = new Date().toISOString(),
}: {
	slot: TimeSlot;
	now?: string;
}): UpdateTimeSlotPayload {
	if (slot.deleted_at) fail(`Slot "${slot.id}" is deleted`);

	return {
		id: slot.id,
		deleted_at: now,
		global_updated_at: now,
	};
}

export const deleteSlotCommand = defineCommand({
	meta: {
		name: "delete",
		description: "Soft-delete an Akiflow task slot",
	},
	args: {
		id: {
			type: "positional",
			description: "Slot id or unique id prefix",
			required: true,
		},
		json: {
			type: "boolean",
			description: "Output deleted slot as JSON",
		},
	},
	run: async (context) => {
		const client = createClient();
		const args = context.args as Record<string, unknown>;
		const slots = await readResource(client, "time_slots");
		const slot = resolveCachedSlot(slots, args.id as string);
		const payload = buildSlotDeletePayload({ slot });
		const response = await client.upsertTimeSlots([payload]);
		const deletedSlot = response.data[0];
		if (!deletedSlot) fail("Failed to delete slot - no data returned");

		if (args.json === true) {
			console.log(JSON.stringify(deletedSlot, null, 2));
			return;
		}

		console.log("✓ Akiflow task slot deleted successfully");
		console.log(`  ID: ${deletedSlot.id}`);
		console.log(`  Title: ${deletedSlot.title ?? slot.title}`);
	},
});

export const slotCommand = defineCommand({
	meta: {
		name: "slot",
		description: "Manage Akiflow task slots",
	},
	subCommands: {
		create: createSlotCommand,
		delete: deleteSlotCommand,
	},
});
