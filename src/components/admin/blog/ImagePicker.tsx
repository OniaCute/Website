'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import Image from 'next/image';

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

interface ImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
  onClose: () => void;
}

export function ImagePicker({ value, onChange, onClose }: ImagePickerProps) {
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/upload')
      .then(r => r.json())
      .then(res => {
        if (res.code === 200) {
          setImages(res.data.filter((f: UploadedFile) =>
            f.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
          ));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = images.filter(img =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative glass rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>从资源中心选择图片</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="搜索图片..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              加载中...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              暂无图片，请先在资源管理中上传
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map(img => (
                <button
                  key={img.url}
                  onClick={() => { onChange(img.url); onClose(); }}
                  className="relative aspect-square rounded-xl overflow-hidden group transition-all"
                  style={{
                    border: value === img.url ? '2px solid var(--color-primary)' : '2px solid transparent',
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 640px) 33vw, 25vw"
                  />
                  {value === img.url && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}>
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
