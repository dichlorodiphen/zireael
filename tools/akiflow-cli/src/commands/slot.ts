import { defineCommand } from "citty";
import { createSlotCommand } from "./create";

export const slotCommand = defineCommand({
	meta: {
		name: "slot",
		description: "Manage Akiflow task slots",
	},
	subCommands: {
		create: createSlotCommand,
	},
});
