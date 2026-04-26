'use client';

import { useRightClickGuard, useDevToolsGuard, useTextSelectionGuard, useCopyShortcutGuard } from '@/hooks/useRightClickGuard';
import { useThemeApply } from '@/hooks/useThemeApply';
import { useLiveConfig } from '@/hooks/useLiveConfig';
import { useConfigStore } from '@/store/configStore';

export function SiteGuard() {
  const config = useConfigStore((s) => s.config);

  useLiveConfig();
  useThemeApply();
  useRightClickGuard(config?.features ?? null);
  useDevToolsGuard(config?.features ?? null);
  useTextSelectionGuard(config?.features ?? null);
  useCopyShortcutGuard(config?.features ?? null);

  return null;
}
