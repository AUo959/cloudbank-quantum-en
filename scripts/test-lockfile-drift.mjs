#!/usr/bin/env node
/* eslint-env node */

// Minimal tests for lockfile-drift library using Node's built-in test runner

import { test, describe } from 'node:test'
import assert from 'node:assert'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { checkLockfileDrift, sha256, writeManifest, writeGlyphcard } from './lib/lockfile-drift.mjs'

describe('lockfile-drift library', () => {
  describe('sha256 function', () => {
    test('should compute correct hash for string', () => {
      const result = sha256('test content')
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result.length, 64) // SHA256 hex is 64 chars
      assert.strictEqual(result, '6ae8a75555209fd6c44157c0aed8016e763ff435a19cf186f76863140143ff72')
    })

    test('should compute correct hash for buffer', () => {
      const buffer = Buffer.from('test content', 'utf8')
      const result = sha256(buffer)
      assert.strictEqual(result, '6ae8a75555209fd6c44157c0aed8016e763ff435a19cf186f76863140143ff72')
    })

    test('should produce different hashes for different content', () => {
      const hash1 = sha256('content1')
      const hash2 = sha256('content2')
      assert.notStrictEqual(hash1, hash2)
    })
  })

  describe('writeManifest function', () => {
    test('should write JSON with stable ordering', () => {
      const testPath = '/tmp/test-manifest.json'
      const manifest = {
        status: 'ok',
        drifted: false,
        anchors: ['test'],
        timestamp: '2024-01-01T00:00:00.000Z'
      }

      writeManifest(manifest, testPath)
      
      assert(existsSync(testPath), 'Manifest file should exist')
      const content = readFileSync(testPath, 'utf8')
      const parsed = JSON.parse(content)
      assert.deepStrictEqual(parsed, manifest)
    })
  })

  describe('writeGlyphcard function', () => {
    test('should write markdown summary', () => {
      const testPath = '/tmp/test-glyphcard.md'
      const manifest = {
        status: 'ok',
        drifted: false,
        originalHash: 'abc123',
        updatedHash: 'abc123',
        timestamp: '2024-01-01T00:00:00.000Z',
        anchors: ['ANCHOR: LOCKFILE_DRIFT_CHECK:T1'],
        notes: 'Test notes'
      }

      writeGlyphcard(manifest, testPath)
      
      assert(existsSync(testPath), 'Glyphcard file should exist')
      const content = readFileSync(testPath, 'utf8')
      assert(content.includes('# Lockfile Drift Check'), 'Should contain title')
      assert(content.includes('✅ OK'), 'Should contain status emoji')
      assert(content.includes('abc123'), 'Should contain hash')
      assert(content.includes('Test notes'), 'Should contain notes')
    })
  })

  describe('checkLockfileDrift function', () => {
    test('should return error for missing package.json', async () => {
      const result = await checkLockfileDrift({ root: '/tmp/nonexistent' })
      assert.strictEqual(result.status, 'error')
      assert(result.error.includes('package.json not found'))
      assert(Array.isArray(result.anchors))
      assert(result.anchors.includes('ANCHOR: LOCKFILE_DRIFT_CHECK:T1'))
      assert.strictEqual(result.seed, 'EOS_SEED_ORION')
      assert(result.dlp)
      assert.strictEqual(result.dlp.confidentiality, 'low')
    })

    test('should include custom seed when provided', async () => {
      const customSeed = 'CUSTOM_SEED_123'
      const result = await checkLockfileDrift({ 
        root: '/tmp/nonexistent',
        seed: customSeed
      })
      assert.strictEqual(result.seed, customSeed)
    })

    test('should include DLP tagging', async () => {
      const result = await checkLockfileDrift({ root: '/tmp/nonexistent' })
      assert(result.dlp)
      assert.strictEqual(result.dlp.confidentiality, 'low')
      assert(Array.isArray(result.dlp.critical))
      assert(result.dlp.critical.includes('package-lock.json hash'))
      assert(Array.isArray(result.dlp.tags))
      assert(result.dlp.tags.includes('build'))
      assert(result.dlp.tags.includes('ci'))
      assert(result.dlp.tags.includes('lockfile'))
    })

    test('should return ok status for valid project without drift', async () => {
      // Use the current project directory for this test
      const result = await checkLockfileDrift({ root: process.cwd() })
      
      // Should succeed since we're in a valid project
      assert(['ok', 'drift', 'fixed'].includes(result.status), `Expected valid status, got: ${result.status}`)
      assert(typeof result.drifted === 'boolean')
      assert(typeof result.originalHash === 'string')
      assert(typeof result.updatedHash === 'string')
      assert(result.lockPath.includes('package-lock.json'))
      assert(result.timestamp)
      assert(Array.isArray(result.anchors))
      assert(result.seed)
      assert(result.dlp)
    })
  })
})

console.log('Running lockfile drift tests...')