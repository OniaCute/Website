import React from 'react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* 页面标题骨架 */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl" style={{ background: 'var(--color-surface-alt)' }} />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-lg" style={{ background: 'var(--color-surface-alt)' }} />
          <div className="h-3.5 w-56 rounded" style={{ background: 'var(--color-surface-alt)' }} />
        </div>
      </div>

      {/* 卡片骨架 × 3 */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="h-4 w-1/3 rounded" style={{ background: 'var(--color-surface-alt)' }} />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 rounded-xl" style={{ background: 'var(--color-surface-alt)' }} />
            <div className="h-10 rounded-xl" style={{ background: 'var(--color-surface-alt)' }} />
          </div>
          <div className="h-10 rounded-xl" style={{ background: 'var(--color-surface-alt)' }} />
        </div>
      ))}
    </div>
  );
}
