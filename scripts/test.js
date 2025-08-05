#!/usr/bin/env node

import { execSync } from 'node:child_process';

function compareSemver(version, minVersion) {
  const [major, minor, patch] = version.split('.').map(Number);
  const [minMajor, minMinor, minPatch] = minVersion;

  if (major > minMajor) return true;
  if (major < minMajor) return false;

  if (minor > minMinor) return true;
  if (minor < minMinor) return false;

  return patch >= minPatch;
}

function runTests() {
  try {
    // Try to get bun version
    const version = execSync('bun --version', { encoding: 'utf8' }).trim();
    console.log(`Found bun version: ${version}`);

    // Check if version is >= 1.2.19
    const isValidVersion = compareSemver(version, [1, 2, 19]);

    if (isValidVersion) {
      console.log('✓ Bun version is 1.2.19 or later, using bun test');
      execSync('bun test', { stdio: 'inherit' });
    } else {
      console.log('⚠ Bun version is older than 1.2.19, falling back to node --test');
      execSync('node --test', { stdio: 'inherit' });
    }
  } catch (error) {
    console.log('⚠ Bun not found or error occurred, falling back to node --test');
    execSync('node --test', { stdio: 'inherit' });
  }
}

runTests();
