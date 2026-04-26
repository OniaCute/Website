'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, X, MapPin, Calendar, Tag, Image as ImageIcon, Search } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { ImagePicker } from '@/components/admin/blog/ImagePicker';
import { v4 as uuidv4 } from 'uuid';
import type { GalleryPhoto, GalleryRegion, GalleryTag, LocalizedString } from '@/types';

type TabId = 'photos' | 'regions' | 'tags';
type L = 'zh-CN' | 'en-US';

const i18n = {
  pageTitle:   { 'zh-CN': '相册管理',                   'en-US': 'Gallery Management' },
  pageDesc:    { 'zh-CN': '管理相册照片、地区分类和标签', 'en-US': 'Manage gallery photos, regions and tags' },
  tabs: {
    photos:  { 'zh-CN': '照片管理', 'en-US': 'Photos' },
    regions: { 'zh-CN': '地区管理', 'en-US': 'Regions' },
    tags:    { 'zh-CN': '标签管理', 'en-US': 'Tags' },
  },
  // Photos tab
  searchPhotos:       { 'zh-CN': '搜索照片名称或描述...', 'en-US': 'Search by name or description...' },
  addPhoto:           { 'zh-CN': '添加照片',   'en-US': 'Add Photo' },
  noPhotos:           { 'zh-CN': '暂无照片，点击「添加照片」开始管理相册', 'en-US': 'No photos yet. Click "Add Photo" to get started.' },
  // Modal
  editPhoto:          { 'zh-CN': '编辑照片',   'en-US': 'Edit Photo' },
  photoLabel:         { 'zh-CN': '照片',        'en-US': 'Photo' },
  changePhoto:        { 'zh-CN': '更换照片',    'en-US': 'Change Photo' },
  selectFromAssets:   { 'zh-CN': '从资源中心选择', 'en-US': 'Select from Assets' },
  nameZh:             { 'zh-CN': '名称（中文）*', 'en-US': 'Name (Chinese) *' },
  nameEn:             { 'zh-CN': '名称（英文）',  'en-US': 'Name (English)' },
  nameZhPlaceholder:  { 'zh-CN': '照片名称',      'en-US': 'Photo name (ZH)' },
  descZh:             { 'zh-CN': '描述（中文）',  'en-US': 'Description (Chinese)' },
  descEn:             { 'zh-CN': '描述（英文）',  'en-US': 'Description (English)' },
  descZhPlaceholder:  { 'zh-CN': '简短描述...',   'en-US': 'Short description (ZH)...' },
  takenAt:            { 'zh-CN': '拍摄时间',      'en-US': 'Date Taken' },
  locationZh:         { 'zh-CN': '拍摄地点（中文）', 'en-US': 'Location (Chinese)' },
  locationEn:         { 'zh-CN': '拍摄地点（英文）', 'en-US': 'Location (English)' },
  locationZhPlaceholder: { 'zh-CN': '如：故宫博物院', 'en-US': 'Location (ZH)' },
  regionLabel:        { 'zh-CN': '地区分类',      'en-US': 'Region' },
  noRegion:           { 'zh-CN': '— 不指定地区 —', 'en-US': '— No Region —' },
  tagLabel:           { 'zh-CN': '标签',          'en-US': 'Tags' },
  noTagsHint:         { 'zh-CN': '先在标签管理中创建标签', 'en-US': 'Create tags in the Tags tab first.' },
  saveChanges:        { 'zh-CN': '保存修改',      'en-US': 'Save Changes' },
  addPhotoBtn:        { 'zh-CN': '添加照片',      'en-US': 'Add Photo' },
  cancel:             { 'zh-CN': '取消',          'en-US': 'Cancel' },
  saving:             { 'zh-CN': '保存中...',     'en-US': 'Saving...' },
  confirmDelete:      { 'zh-CN': '确认删除这张照片？', 'en-US': 'Delete this photo?' },
  // Regions tab
  addRegion:          { 'zh-CN': '添加地区',      'en-US': 'Add Region' },
  regionNameZh:       { 'zh-CN': '名称（中文）*', 'en-US': 'Name (Chinese) *' },
  regionNameEn:       { 'zh-CN': '名称（英文）',  'en-US': 'Name (English)' },
  regionZhPlaceholder:{ 'zh-CN': '如：北京',      'en-US': 'Region name (ZH)' },
  noRegions:          { 'zh-CN': '暂无地区',      'en-US': 'No regions yet' },
  saveRegions:        { 'zh-CN': '保存地区',      'en-US': 'Save Regions' },
  // Tags tab
  addTag:             { 'zh-CN': '添加标签',      'en-US': 'Add Tag' },
  tagNameZh:          { 'zh-CN': '名称（中文）*', 'en-US': 'Name (Chinese) *' },
  tagNameEn:          { 'zh-CN': '名称（英文）',  'en-US': 'Name (English)' },
  tagZhPlaceholder:   { 'zh-CN': '如：风景',      'en-US': 'Tag name (ZH)' },
  noTags:             { 'zh-CN': '暂无标签',      'en-US': 'No tags yet' },
  saveTags:           { 'zh-CN': '保存标签',      'en-US': 'Save Tags' },
} as const;

interface PhotoFormData {
  url: string;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  takenAt: string;
  locationZh: string;
  locationEn: string;
  region: string;
  tags: string[];
}

const emptyForm = (): PhotoFormData => ({
  url: '', nameZh: '', nameEn: '', descZh: '', descEn: '',
  takenAt: '', locationZh: '', locationEn: '', region: '', tags: [],
});

function photoToForm(photo: GalleryPhoto): PhotoFormData {
  return {
    url: photo.url,
    nameZh: photo.name['zh-CN'],
    nameEn: photo.name['en-US'],
    descZh: photo.description?.['zh-CN'] ?? '',
    descEn: photo.description?.['en-US'] ?? '',
    takenAt: photo.takenAt ? photo.takenAt.slice(0, 16) : '',
    locationZh: photo.location?.['zh-CN'] ?? '',
    locationEn: photo.location?.['en-US'] ?? '',
    region: photo.region ?? '',
    tags: photo.tags,
  };
}

function formatDate(iso: string, locale: L) {
  return new Date(iso).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US');
}

export default function AdminGalleryPage() {
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = <T extends string>(o: Record<L, T>) => o[l];

  const [tab, setTab] = useState<TabId>('photos');

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [search, setSearch] = useState('');
  const [regions, setRegions] = useState<GalleryRegion[]>([]);
  const [galleryTags, setGalleryTags] = useState<GalleryTag[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PhotoFormData>(emptyForm());
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newRegionZh, setNewRegionZh] = useState('');
  const [newRegionEn, setNewRegionEn] = useState('');
  const [newTagZh, setNewTagZh] = useState('');
  const [newTagEn, setNewTagEn] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  const fetchAll = useCallback(async () => {
    const [photosRes, metaRes] = await Promise.all([
      fetch(`/api/gallery${search ? `?search=${encodeURIComponent(search)}` : ''}`),
      fetch('/api/gallery/meta'),
    ]);
    const [photosJson, metaJson] = await Promise.all([photosRes.json(), metaRes.json()]);
    if (photosJson.code === 200) setPhotos(photosJson.data);
    if (metaJson.code === 200) { setRegions(metaJson.data.regions); setGalleryTags(metaJson.data.tags); }
  }, [search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (photo: GalleryPhoto) => { setEditingId(photo.id); setForm(photoToForm(photo)); setShowForm(true); };

  const handleSavePhoto = async () => {
    if (!form.url || !form.nameZh) return;
    setSaving(true);
    try {
      const body = {
        url: form.url,
        name: { 'zh-CN': form.nameZh, 'en-US': form.nameEn || form.nameZh } as LocalizedString,
        description: (form.descZh || form.descEn)
          ? { 'zh-CN': form.descZh, 'en-US': form.descEn } as LocalizedString
          : undefined,
        takenAt: form.takenAt ? new Date(form.takenAt).toISOString() : undefined,
        location: (form.locationZh || form.locationEn)
          ? { 'zh-CN': form.locationZh, 'en-US': form.locationEn } as LocalizedString
          : undefined,
        region: form.region || undefined,
        tags: form.tags,
      };
      if (editingId) {
        await fetch(`/api/gallery/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      setShowForm(false);
      setEditingId(null);
      await fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(tx(i18n.confirmDelete))) return;
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    await fetchAll();
  };

  const toggleFormTag = (tagId: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter(t => t !== tagId) : [...prev.tags, tagId],
    }));
  };

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    try {
      await fetch('/api/gallery/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regions, tags: galleryTags }),
      });
    } finally {
      setSavingMeta(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors";
  const inputStyle = {
    background: 'var(--color-surface-alt)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  };

  const tabItems: { id: TabId }[] = [{ id: 'photos' }, { id: 'regions' }, { id: 'tags' }];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{tx(i18n.pageTitle)}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.pageDesc)}</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
            {tabItems.map(({ id }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="px-5 py-3.5 text-sm font-medium transition-all relative"
                style={{ color: tab === id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              >
                {tx(i18n.tabs[id])}
                {tab === id && (
                  <motion.div
                    layoutId="gallery-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'var(--color-primary)' }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── Photos Tab ── */}
            {tab === 'photos' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      placeholder={tx(i18n.searchPhotos)}
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className={inputCls + ' pl-9'}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    <Plus className="w-4 h-4" />
                    {tx(i18n.addPhoto)}
                  </button>
                </div>

                {photos.length === 0 ? (
                  <div className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {tx(i18n.noPhotos)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {photos.map(photo => (
                      <div key={photo.id} className="group relative rounded-xl overflow-hidden aspect-square"
                        style={{ border: '1px solid var(--color-border)' }}>
                        <img src={photo.url} alt={photo.name[l]} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}>
                          <p className="text-white text-xs font-medium truncate">{photo.name[l]}</p>
                          {photo.takenAt && (
                            <p className="text-white/70 text-xs">{formatDate(photo.takenAt, l)}</p>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(photo)} className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 transition-colors">
                            <Pencil className="w-3 h-3 text-white" />
                          </button>
                          <button onClick={() => handleDelete(photo.id)} className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 transition-colors">
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Regions Tab ── */}
            {tab === 'regions' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                  <h3 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tx(i18n.addRegion)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.regionNameZh)}</label>
                      <input type="text" value={newRegionZh} onChange={e => setNewRegionZh(e.target.value)} className={inputCls} style={inputStyle} placeholder={tx(i18n.regionZhPlaceholder)} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.regionNameEn)}</label>
                      <input type="text" value={newRegionEn} onChange={e => setNewRegionEn(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Beijing" />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!newRegionZh.trim()) return;
                      setRegions(prev => [...prev, { id: uuidv4(), name: { 'zh-CN': newRegionZh, 'en-US': newRegionEn || newRegionZh } }]);
                      setNewRegionZh(''); setNewRegionEn('');
                    }}
                    disabled={!newRegionZh.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    <Plus className="w-4 h-4" />
                    {tx(i18n.addRegion)}
                  </button>
                </div>

                <div className="space-y-2">
                  {regions.map(region => (
                    <div key={region.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ border: '1px solid var(--color-border)' }}>
                      <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <div className="flex-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          {region.name['zh-CN']}
                          {region.name['en-US'] !== region.name['zh-CN'] && (
                            <span className="ml-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>/ {region.name['en-US']}</span>
                          )}
                        </span>
                      </div>
                      <button onClick={() => setRegions(prev => prev.filter(r => r.id !== region.id))} className="p-1.5 rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                  {regions.length === 0 && (
                    <div className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.noRegions)}</div>
                  )}
                </div>

                <button onClick={handleSaveMeta} disabled={savingMeta}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                  <Save className="w-4 h-4" />
                  {savingMeta ? tx(i18n.saving) : tx(i18n.saveRegions)}
                </button>
              </div>
            )}

            {/* ── Tags Tab ── */}
            {tab === 'tags' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                  <h3 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{tx(i18n.addTag)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.tagNameZh)}</label>
                      <input type="text" value={newTagZh} onChange={e => setNewTagZh(e.target.value)} className={inputCls} style={inputStyle} placeholder={tx(i18n.tagZhPlaceholder)} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.tagNameEn)}</label>
                      <input type="text" value={newTagEn} onChange={e => setNewTagEn(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Scenery" />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!newTagZh.trim()) return;
                      setGalleryTags(prev => [...prev, { id: uuidv4(), name: { 'zh-CN': newTagZh, 'en-US': newTagEn || newTagZh } }]);
                      setNewTagZh(''); setNewTagEn('');
                    }}
                    disabled={!newTagZh.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                    <Plus className="w-4 h-4" />
                    {tx(i18n.addTag)}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {galleryTags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                      <span className="text-sm" style={{ color: 'var(--color-text)' }}>{tag.name['zh-CN']}</span>
                      {tag.name['en-US'] !== tag.name['zh-CN'] && (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/ {tag.name['en-US']}</span>
                      )}
                      <button onClick={() => setGalleryTags(prev => prev.filter(t => t.id !== tag.id))} className="p-0.5 rounded hover:bg-red-500/20 ml-1">
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                  {galleryTags.length === 0 && (
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.noTags)}</div>
                  )}
                </div>

                <button onClick={handleSaveMeta} disabled={savingMeta}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                  <Save className="w-4 h-4" />
                  {savingMeta ? tx(i18n.saving) : tx(i18n.saveTags)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div
            className="relative glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="sticky top-0 flex items-center justify-between p-5 border-b z-10"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                {editingId ? tx(i18n.editPhoto) : tx(i18n.addPhoto)}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)]">
                <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Photo picker */}
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {tx(i18n.photoLabel)} <span className="text-red-400">*</span>
                </label>
                {form.url ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video mb-2">
                    <img src={form.url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setForm(p => ({ ...p, url: '' }))}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : null}
                <button
                  onClick={() => setShowImagePicker(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-colors hover:bg-[var(--color-surface-alt)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <ImageIcon className="w-4 h-4" />
                  {form.url ? tx(i18n.changePhoto) : tx(i18n.selectFromAssets)}
                </button>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.nameZh)}</label>
                  <input type="text" value={form.nameZh} onChange={e => setForm(p => ({ ...p, nameZh: e.target.value }))}
                    className={inputCls} style={inputStyle} placeholder={tx(i18n.nameZhPlaceholder)} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.nameEn)}</label>
                  <input type="text" value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))}
                    className={inputCls} style={inputStyle} placeholder="Photo name" />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.descZh)}</label>
                  <textarea value={form.descZh} onChange={e => setForm(p => ({ ...p, descZh: e.target.value }))}
                    rows={2} className={inputCls + ' resize-none'} style={inputStyle} placeholder={tx(i18n.descZhPlaceholder)} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.descEn)}</label>
                  <textarea value={form.descEn} onChange={e => setForm(p => ({ ...p, descEn: e.target.value }))}
                    rows={2} className={inputCls + ' resize-none'} style={inputStyle} placeholder="Short description..." />
                </div>
              </div>

              {/* Taken At */}
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  <Calendar className="inline w-3.5 h-3.5 mr-1" />
                  {tx(i18n.takenAt)}
                </label>
                <input type="datetime-local" value={form.takenAt} onChange={e => setForm(p => ({ ...p, takenAt: e.target.value }))}
                  className={inputCls} style={inputStyle} />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin className="inline w-3 h-3 mr-1" />
                    {tx(i18n.locationZh)}
                  </label>
                  <input type="text" value={form.locationZh} onChange={e => setForm(p => ({ ...p, locationZh: e.target.value }))}
                    className={inputCls} style={inputStyle} placeholder={tx(i18n.locationZhPlaceholder)} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.locationEn)}</label>
                  <input type="text" value={form.locationEn} onChange={e => setForm(p => ({ ...p, locationEn: e.target.value }))}
                    className={inputCls} style={inputStyle} placeholder="e.g. The Forbidden City" />
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.regionLabel)}</label>
                <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                  className={inputCls} style={inputStyle}>
                  <option value="">{tx(i18n.noRegion)}</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name[l]}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  <Tag className="inline w-3 h-3 mr-1" />
                  {tx(i18n.tagLabel)}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {galleryTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleFormTag(tag.id)}
                      className="px-2 py-0.5 rounded-full text-xs transition-all"
                      style={{
                        background: form.tags.includes(tag.id) ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                        color: form.tags.includes(tag.id) ? 'white' : 'var(--color-text-muted)',
                        border: `1px solid ${form.tags.includes(tag.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      {tag.name[l]}
                    </button>
                  ))}
                  {galleryTags.length === 0 && (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.noTagsHint)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSavePhoto} disabled={saving || !form.url || !form.nameZh}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                  {saving ? tx(i18n.saving) : editingId ? tx(i18n.saveChanges) : tx(i18n.addPhotoBtn)}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--color-surface-alt)]"
                  style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                  {tx(i18n.cancel)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImagePicker && (
        <ImagePicker
          value={form.url}
          onChange={url => setForm(p => ({ ...p, url }))}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </>
  );
}
