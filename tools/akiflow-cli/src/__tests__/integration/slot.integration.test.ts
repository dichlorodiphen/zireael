import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { FakeAkiflowServer } from "./helpers/fake-server";
import { loadAllFixtures } from "./helpers/load-fixtures";
import { spawnCli } from "./helpers/spawn-cli";
import { makeTestEnv } from "./helpers/test-env";

let server: FakeAkiflowServer;
let env: ReturnType<typeof makeTestEnv>;

beforeEach(async () => {
	server = new FakeAkiflowServer();
	await server.start();
	loadAllFixtures(server);
	server.respondTo("PATCH", "/v5/time_slots", (req: { body: string }) => {
		const payload = JSON.parse(req.body);
		return {
			success: true,
			message: null,
			data: payload,
		};
	});
	env = makeTestEnv(server.url);
});

afterEach(async () => {
	await server.stop();
	env.cleanup();
});

describe("af slot (BDD)", () => {
	test("deletes a cached slot through the captured v5 time slots endpoint", async () => {
		const refresh = await spawnCli(["refresh", "--rebuild", "--json"], {
			env: env.env,
		});
		expect(refresh.exitCode).toBe(0);

		const result = await spawnCli(
			["slot", "delete", "slot-focus-1", "--json"],
			{ env: env.env },
		);

		expect(result.exitCode).toBe(0);
		const deletedSlot = JSON.parse(result.stdout);
		expect(deletedSlot).toEqual({
			id: "slot-focus-1",
			deleted_at: expect.any(String),
			global_updated_at: expect.any(String),
		});

		const request = server.requests.find(
			(r) => r.method === "PATCH" && r.url.pathname === "/v5/time_slots",
		);
		expect(request).toBeDefined();
		const payload = JSON.parse(request!.body);
		expect(payload).toEqual([
			{
				id: "slot-focus-1",
				deleted_at: expect.any(String),
				global_updated_at: expect.any(String),
			},
		]);
	});
});
