import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import {
	buildSlotDeletePayload,
	deleteSlotCommand,
	resolveCachedSlot,
} from "../../commands/slot";
import type { TimeSlot } from "../../lib/api/types";
import * as storage from "../../lib/auth/storage";
import * as cache from "../../lib/cache";

const mockCredentials = {
	token: "test-jwt-token",
	clientId: "test-client-id-12345",
	expiryTimestamp: Date.now() + 86400000,
};

function slot(overrides: Partial<TimeSlot> = {}): TimeSlot {
	return {
		id: "slot-123456",
		user_id: 1,
		recurring_id: null,
		calendar_id: "cal-123",
		label_id: null,
		section_id: null,
		status: "confirmed",
		title: "Planning block",
		description: "Focus time",
		original_start_time: null,
		start_time: "2026-06-20T16:00:00.000Z",
		end_time: "2026-06-20T17:00:00.000Z",
		start_datetime_tz: "America/Los_Angeles",
		recurrence: null,
		color: null,
		content: {},
		global_label_id_updated_at: null,
		global_created_at: "2026-06-19T00:00:00.000Z",
		global_updated_at: "2026-06-19T00:00:00.000Z",
		data: {},
		deleted_at: null,
		...overrides,
	};
}

describe("slot command", () => {
	let fetchSpy: ReturnType<typeof spyOn>;
	let loadCredentialsSpy: ReturnType<typeof spyOn>;
	let readResourceSpy: ReturnType<typeof spyOn>;

	beforeEach(() => {
		fetchSpy = spyOn(globalThis, "fetch");
		loadCredentialsSpy = spyOn(storage, "loadCredentials").mockResolvedValue(
			mockCredentials,
		);
		readResourceSpy = spyOn(cache, "readResource").mockImplementation(
			() => Promise.resolve([slot()]) as never,
		);
	});

	afterEach(() => {
		fetchSpy.mockRestore();
		loadCredentialsSpy.mockRestore();
		readResourceSpy.mockRestore();
	});

	it("builds a minimal slot delete payload", () => {
		expect(
			buildSlotDeletePayload({
				slot: slot(),
				now: "2026-06-20T00:00:00.000Z",
			}),
		).toEqual({
			id: "slot-123456",
			deleted_at: "2026-06-20T00:00:00.000Z",
			global_updated_at: "2026-06-20T00:00:00.000Z",
		});
	});

	it("deletes a cached slot through /v5/time_slots", async () => {
		const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
		fetchSpy.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					success: true,
					message: null,
					data: [
						{
							...slot(),
							deleted_at: "2026-06-20T00:00:00.000Z",
						},
					],
				}),
				{ status: 200 },
			),
		);

		await deleteSlotCommand.run!({
			args: {
				id: "slot-123",
				_: [],
			},
			rawArgs: [],
		} as never);

		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(fetchSpy.mock.calls[0]?.[0]).toBe(
			"https://api.akiflow.com/v5/time_slots",
		);
		const payload = JSON.parse(fetchSpy.mock.calls[0]?.[1]?.body as string);
		expect(payload).toEqual([
			{
				id: "slot-123456",
				deleted_at: expect.any(String),
				global_updated_at: expect.any(String),
			},
		]);
		expect(consoleLogSpy).toHaveBeenCalledWith(
			"✓ Akiflow task slot deleted successfully",
		);

		consoleLogSpy.mockRestore();
	});

	it("prints deleted slot JSON output", async () => {
		const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
		const deletedSlot = {
			id: "slot-123456",
			title: "Planning block",
			deleted_at: "2026-06-20T00:00:00.000Z",
		};
		fetchSpy.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					success: true,
					message: null,
					data: [deletedSlot],
				}),
				{ status: 200 },
			),
		);

		await deleteSlotCommand.run!({
			args: {
				id: "slot-123456",
				json: true,
				_: [],
			},
			rawArgs: [],
		} as never);

		expect(consoleLogSpy).toHaveBeenCalledWith(
			JSON.stringify(deletedSlot, null, 2),
		);

		consoleLogSpy.mockRestore();
	});

	it("rejects ambiguous slot id prefixes", () => {
		const consoleErrorSpy = spyOn(console, "error").mockImplementation(
			() => {},
		);
		const processExitSpy = spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process.exit");
		});

		try {
			resolveCachedSlot(
				[slot({ id: "slot-abc-1" }), slot({ id: "slot-abc-2" })],
				"slot-abc",
			);
		} catch {}

		expect(consoleErrorSpy.mock.calls.join("\n")).toContain("ambiguous");
		expect(processExitSpy).toHaveBeenCalledWith(1);

		consoleErrorSpy.mockRestore();
		processExitSpy.mockRestore();
	});

	it("rejects already-deleted slots before mutation", () => {
		const consoleErrorSpy = spyOn(console, "error").mockImplementation(
			() => {},
		);
		const processExitSpy = spyOn(process, "exit").mockImplementation(() => {
			throw new Error("process.exit");
		});

		try {
			buildSlotDeletePayload({
				slot: slot({ deleted_at: "2026-06-20T00:00:00.000Z" }),
			});
		} catch {}

		expect(consoleErrorSpy.mock.calls.join("\n")).toContain("is deleted");
		expect(processExitSpy).toHaveBeenCalledWith(1);

		consoleErrorSpy.mockRestore();
		processExitSpy.mockRestore();
	});
});
