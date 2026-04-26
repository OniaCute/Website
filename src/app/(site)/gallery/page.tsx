'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, X, ChevronLeft, ChevronRight,
  MapPin, Calendar, Tag, Filter,
} from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import type { GalleryPhoto, GalleryRegion, GalleryTag } from '@/types';

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

interface LightboxProps {
  photo: GalleryPhoto;
  photos: GalleryPhoto[];
  meta: { regions: GalleryRegion[]; tags: GalleryTag[] };
  locale: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function Lightbox({ photo, meta, locale, onClose, onPrev, onNext, hasPrev, hasNext }: LightboxProps) {
  const region = meta.regions.find(r => r.id === photo.region);
  const photoTags = photo.tags
    .map(tagId => meta.tags.find(t => t.id === tagId))
    .filter(Boolean);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl w-full max-w-5xl max-h-[90vh]"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Left: Image */}
        <div className="relative flex-1 min-h-[280px] md:min-h-0 flex items-center justify-center"
          style={{ background: '#000' }}>
          <img
            src={photo.url}
            alt={photo.name[locale as 'zh-CN' | 'en-US']}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 'min(60vh, 600px)' }}
          />

          {/* Nav arrows */}
          {hasPrev && (
            <button onClick={onPrev}
              className="absolute left-3 p-2.5 rounded-full bg-black/40 hover:bg-black/70 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          {hasNext && (
            <button onClick={onNext}
              className="absolute right-3 p-2.5 rounded-full bg-black/40 hover:bg-black/70 transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Right: Info */}
        <div className="w-full md:w-72 flex-shrink-0 overflow-y-auto p-6 space-y-5"
          style={{ borderLeft: '1px solid var(--color-border)' }}>
          <div>
            <h2 className="font-bold text-lg leading-snug mb-1" style={{ color: 'var(--color-text)' }}>
              {photo.name[locale as 'zh-CN' | 'en-US'] || photo.name['zh-CN']}
            </h2>
            {photo.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {photo.description[locale as 'zh-CN' | 'en-US'] || photo.description['zh-CN']}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {photo.takenAt && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>{formatDate(photo.takenAt, locale)}</span>
              </div>
            )}
            {photo.location && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>{photo.location[locale as 'zh-CN' | 'en-US'] || photo.location['zh-CN']}</span>
              </div>
            )}
            {region && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span>{region.name[locale as 'zh-CN' | 'en-US']}</span>
              </div>
            )}
          </div>

          {photoTags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <Tag className="w-3.5 h-3.5" />
                {locale === 'zh-CN' ? '标签' : 'Tags'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {photoTags.map(tag => tag && (
                  <span key={tag.id} className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                    {tag.name[locale as 'zh-CN' | 'en-US']}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const { locale } = useLocaleStore();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryMeta, setGalleryMeta] = useState<{ regions: GalleryRegion[]; tags: GalleryTag[] }>({ regions: [], tags: [] });
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'taken'>('newest');

  // Lightbox state
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (activeRegion) params.set('region', activeRegion);
    if (activeTag) params.set('tag', activeTag);

    const [photosRes, metaRes] = await Promise.all([
      fetch(`/api/gallery?${params}`),
      fetch('/api/gallery/meta'),
    ]);
    const [photosJson, metaJson] = await Promise.all([photosRes.json(), metaRes.json()]);

    if (photosJson.code === 200) setPhotos(photosJson.data);
    if (metaJson.code === 200) setGalleryMeta(metaJson.data);
    setLoading(false);
  }, [activeRegion, activeTag, sort]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIdx(null);
    document.body.style.overflow = '';
  };

  const lightboxPrev = () => {
    if (lightboxIdx !== null && lightboxIdx > 0) setLightboxIdx(lightboxIdx - 1);
  };

  const lightboxNext = () => {
    if (lightboxIdx !== null && lightboxIdx < photos.length - 1) setLightboxIdx(lightboxIdx + 1);
  };

  const hasActiveFilter = Boolean(activeRegion || activeTag || sort !== 'newest');
  const filterCount = [activeRegion, activeTag, sort !== 'newest'].filter(Boolean).length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
            <Camera className="w-4 h-4" />
            {locale === 'zh-CN' ? '相册' : 'Gallery'}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-gradient mb-2">
                {locale === 'zh-CN' ? '相册' : 'Gallery'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {locale === 'zh-CN' ? `共 ${photos.length} 张照片` : `${photos.length} photos`}
              </p>
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all glass"
              style={{
                border: `1px solid ${filterOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: filterOpen ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              <Filter className="w-4 h-4" />
              {locale === 'zh-CN' ? '筛选' : 'Filter'}
              {filterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: 'var(--color-primary)' }}>
                  {filterCount}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-2xl p-5 space-y-5"
                style={{ border: '1px solid var(--color-border)' }}>
                {/* Sort */}
                <div>
                  <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    {locale === 'zh-CN' ? '排序方式' : 'Sort by'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: 'newest', zh: '最新添加', en: 'Newest' },
                      { value: 'oldest', zh: '最早添加', en: 'Oldest' },
                      { value: 'taken', zh: '拍摄时间', en: 'Taken date' },
                    ] as const).map(({ value, zh, en }) => (
                      <button key={value} onClick={() => setSort(value)}
                        className="px-3 py-1.5 rounded-full text-xs transition-all"
                        style={{
                          background: sort === value ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                          color: sort === value ? 'white' : 'var(--color-text-muted)',
                          border: `1px solid ${sort === value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        }}>
                        {locale === 'zh-CN' ? zh : en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region filter */}
                {galleryMeta.regions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      <MapPin className="w-3.5 h-3.5" />
                      {locale === 'zh-CN' ? '地区' : 'Region'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setActiveRegion('')}
                        className="px-3 py-1.5 rounded-full text-xs transition-all"
                        style={{
                          background: !activeRegion ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                          color: !activeRegion ? 'white' : 'var(--color-text-muted)',
                          border: `1px solid ${!activeRegion ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        }}>
                        {locale === 'zh-CN' ? '全部' : 'All'}
                      </button>
                      {galleryMeta.regions.map(region => (
                        <button key={region.id} onClick={() => setActiveRegion(prev => prev === region.id ? '' : region.id)}
                          className="px-3 py-1.5 rounded-full text-xs transition-all"
                          style={{
                            background: activeRegion === region.id ? 'var(--color-accent)' : 'var(--color-surface-alt)',
                            color: activeRegion === region.id ? 'white' : 'var(--color-text-muted)',
                            border: `1px solid ${activeRegion === region.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          }}>
                          {region.name[locale as 'zh-CN' | 'en-US']}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tag filter */}
                {galleryMeta.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      <Tag className="w-3.5 h-3.5" />
                      {locale === 'zh-CN' ? '标签' : 'Tags'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setActiveTag('')}
                        className="px-3 py-1.5 rounded-full text-xs transition-all"
                        style={{
                          background: !activeTag ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                          color: !activeTag ? 'white' : 'var(--color-text-muted)',
                          border: `1px solid ${!activeTag ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        }}>
                        {locale === 'zh-CN' ? '全部' : 'All'}
                      </button>
                      {galleryMeta.tags.map(tag => (
                        <button key={tag.id} onClick={() => setActiveTag(prev => prev === tag.id ? '' : tag.id)}
                          className="px-3 py-1.5 rounded-full text-xs transition-all"
                          style={{
                            background: activeTag === tag.id ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                            color: activeTag === tag.id ? 'white' : 'var(--color-text-muted)',
                            border: `1px solid ${activeTag === tag.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          }}>
                          {tag.name[locale as 'zh-CN' | 'en-US']}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear */}
                {hasActiveFilter && (
                  <button
                    onClick={() => { setActiveRegion(''); setActiveTag(''); setSort('newest'); }}
                    className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                    {locale === 'zh-CN' ? '清除所有筛选' : 'Clear filters'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Masonry Grid */}
        {loading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden animate-pulse"
                style={{ height: `${Math.random() * 100 + 200}px`, background: 'var(--color-surface-alt)' }} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-14 h-14 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              {locale === 'zh-CN' ? '暂无照片' : 'No photos yet'}
            </p>
          </div>
        ) : (
          <motion.div
            className="columns-2 sm:columns-3 lg:columns-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {photos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                className="break-inside-avoid mb-4 group cursor-pointer"
                onClick={() => openLightbox(idx)}
              >
                <div className="relative overflow-hidden rounded-2xl"
                  style={{ border: '1px solid var(--color-border)' }}>
                  <img
                    src={photo.url}
                    alt={photo.name[locale as 'zh-CN' | 'en-US']}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }}>
                    <p className="text-white text-sm font-medium line-clamp-1">
                      {photo.name[locale as 'zh-CN' | 'en-US']}
                    </p>
                    {(photo.location || photo.takenAt) && (
                      <div className="flex items-center gap-2 mt-1">
                        {photo.location && (
                          <span className="text-white/70 text-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {photo.location[locale as 'zh-CN' | 'en-US'] || photo.location['zh-CN']}
                          </span>
                        )}
                        {photo.takenAt && (
                          <span className="text-white/60 text-xs">
                            {new Date(photo.takenAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && photos[lightboxIdx] && (
          <Lightbox
            photo={photos[lightboxIdx]}
            photos={photos}
            meta={galleryMeta}
            locale={locale}
            onClose={closeLightbox}
            onPrev={lightboxPrev}
            onNext={lightboxNext}
            hasPrev={lightboxIdx > 0}
            hasNext={lightboxIdx < photos.length - 1}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
