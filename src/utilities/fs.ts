import * as path from 'path';
import * as fs from 'fs/promises';

// FindModuleRoot finds the relative path to the root of the project.
export async function findModuleRoot(): Promise<string> {
    let currentDir = process.cwd();

    while (true) {
        try {
            await fs.access(path.join(currentDir, 'package.json'));
            // package.json found
            return currentDir;
        } catch (error) {
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) {
                // Reached the root directory
                throw new Error('package.json file not found');
            }
            currentDir = parentDir;
        }
    }
}