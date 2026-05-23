import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readLastChangelogVersion, writeLastChangelogVersion } from "@oh-my-pi/pi-coding-agent/utils/changelog-state";
import { getChangelogStatePath, Snowflake } from "@oh-my-pi/pi-utils";

describe("changelog state", () => {
	let testDir: string;
	let agentDir: string;

	beforeEach(() => {
		testDir = path.join(os.tmpdir(), "test-changelog-state", Snowflake.next());
		agentDir = path.join(testDir, "agent");
	});

	afterEach(() => {
		if (fs.existsSync(testDir)) {
			fs.rmSync(testDir, { recursive: true });
		}
	});

	it("stores the acknowledged version outside config.yml", async () => {
		await writeLastChangelogVersion("15.2.4", { agentDir });

		expect(await Bun.file(path.join(agentDir, "config.yml")).exists()).toBe(false);
		expect(await Bun.file(getChangelogStatePath(agentDir)).text()).toBe("15.2.4\n");
		expect(await readLastChangelogVersion({ agentDir })).toBe("15.2.4");
	});

	it("uses legacy config version only until state exists", async () => {
		expect(await readLastChangelogVersion({ agentDir, legacyVersion: "15.1.7" })).toBe("15.1.7");

		await writeLastChangelogVersion("15.2.4", { agentDir });

		expect(await readLastChangelogVersion({ agentDir, legacyVersion: "15.1.7" })).toBe("15.2.4");
	});
});
