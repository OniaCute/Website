import fs from 'fs';
import path from 'path';
import type { AppConfig } from '@/types';

let _config: AppConfig | null = null;
const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export function loadAppConfig(): AppConfig {
  if (_config) return _config;

  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error('config.json not found. Please run setup first.');
  }

  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  _config = JSON.parse(raw) as AppConfig;
  return _config;
}

export function isSetupComplete(): boolean {
  const lockPath = path.join(process.cwd(), '.setup.lock');
  return fs.existsSync(lockPath);
}

export function markSetupComplete(): void {
  const lockPath = path.join(process.cwd(), '.setup.lock');
  fs.writeFileSync(lockPath, new Date().toISOString(), 'utf-8');
  _config = null;
}

export function markSetupIncomplete(removeConfig = true): void {
  const lockPath = path.join(process.cwd(), '.setup.lock');
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
  if (removeConfig && fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
  _config = null;
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}
