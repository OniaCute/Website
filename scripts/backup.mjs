#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const backupDir = path.join(root, 'backups');

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const archiveName = `onia-backup-${timestamp}.tar.gz`;
const archivePath = path.join(backupDir, archiveName);

const targets = ['data', 'config.json', '.setup.lock'].filter(t => fs.existsSync(path.join(root, t)));

if (targets.length === 0) {
  console.log('Nothing to backup.');
  process.exit(0);
}

execSync(`tar -czf "${archivePath}" ${targets.join(' ')}`, { cwd: root, stdio: 'inherit' });
console.log(`✅ Backup created: ${archiveName}`);

// Keep only last 5 backups
const all = fs.readdirSync(backupDir).filter(f => f.startsWith('onia-backup-')).sort().reverse();
all.slice(5).forEach(f => {
  fs.unlinkSync(path.join(backupDir, f));
  console.log(`🗑️  Removed old backup: ${f}`);
});
