import * as fs from "node:fs/promises";
import * as path from "node:path";
import { getChangelogStatePath, isEnoent } from "@oh-my-pi/pi-utils";

export interface ChangelogStateOptions {
	agentDir?: string;
	legacyVersion?: string;
}

/**
 * Read the version whose changelog has already been acknowledged.
 *
 * This is runtime state, not user configuration. The legacy config value remains
 * a read-only fallback so existing installs do not replay every changelog entry
 * once the state file is introduced.
 */
export async function readLastChangelogVersion(options: ChangelogStateOptions = {}): Promise<string | undefined> {
	try {
		const value = (await Bun.file(getChangelogStatePath(options.agentDir)).text()).trim();
		if (value) return value;
	} catch (error) {
		if (!isEnoent(error)) throw error;
	}
	return options.legacyVersion;
}

export async function writeLastChangelogVersion(version: string, options: ChangelogStateOptions = {}): Promise<void> {
	const statePath = getChangelogStatePath(options.agentDir);
	await fs.mkdir(path.dirname(statePath), { recursive: true });
	await Bun.write(statePath, `${version}\n`);
}
