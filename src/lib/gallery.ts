import { v4 as uuidv4 } from 'uuid';
import { atomicWriteJson, readJson } from './fsAtomic';
import type { GalleryData, GalleryPhoto, GalleryRegion, GalleryTag } from '@/types';
import path from 'path';

const GALLERY_FILE = path.join(process.cwd(), 'data', 'gallery.json');

const DEFAULT_DATA: GalleryData = {
  photos: [],
  regions: [],
  tags: [],
};

function readGalleryFile(): GalleryData {
  const stored = readJson<GalleryData>(GALLERY_FILE);
  if (!stored) return DEFAULT_DATA;
  return {
    photos: stored.photos ?? [],
    regions: stored.regions ?? [],
    tags: stored.tags ?? [],
  };
}

function writeGalleryFile(data: GalleryData): void {
  atomicWriteJson(GALLERY_FILE, data);
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export function getAllPhotos(opts: {
  tag?: string;
  region?: string;
  sort?: 'newest' | 'oldest' | 'taken';
  search?: string;
} = {}): GalleryPhoto[] {
  let { photos } = readGalleryFile();

  if (opts.tag) {
    photos = photos.filter(p => p.tags.includes(opts.tag!));
  }
  if (opts.region) {
    photos = photos.filter(p => p.region === opts.region);
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    photos = photos.filter(p =>
      p.name['zh-CN'].toLowerCase().includes(q) ||
      p.name['en-US'].toLowerCase().includes(q) ||
      (p.description?.['zh-CN'] ?? '').toLowerCase().includes(q) ||
      (p.description?.['en-US'] ?? '').toLowerCase().includes(q)
    );
  }

  const sort = opts.sort ?? 'newest';
  photos.sort((a, b) => {
    if (sort === 'taken') {
      const ta = a.takenAt ?? a.createdAt;
      const tb = b.takenAt ?? b.createdAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    }
    if (sort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return photos;
}

export function getPhoto(id: string): GalleryPhoto | null {
  const { photos } = readGalleryFile();
  return photos.find(p => p.id === id) ?? null;
}

export function createPhoto(data: Omit<GalleryPhoto, 'id' | 'createdAt' | 'updatedAt' | 'order'>): GalleryPhoto {
  const gallery = readGalleryFile();
  const now = new Date().toISOString();
  const photo: GalleryPhoto = {
    ...data,
    id: uuidv4(),
    order: gallery.photos.length,
    createdAt: now,
    updatedAt: now,
  };
  gallery.photos.push(photo);
  writeGalleryFile(gallery);
  return photo;
}

export function updatePhoto(id: string, data: Partial<Omit<GalleryPhoto, 'id' | 'createdAt'>>): GalleryPhoto | null {
  const gallery = readGalleryFile();
  const idx = gallery.photos.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const updated: GalleryPhoto = { ...gallery.photos[idx], ...data, updatedAt: new Date().toISOString() };
  gallery.photos[idx] = updated;
  writeGalleryFile(gallery);
  return updated;
}

export function deletePhoto(id: string): boolean {
  const gallery = readGalleryFile();
  const filtered = gallery.photos.filter(p => p.id !== id);
  if (filtered.length === gallery.photos.length) return false;
  gallery.photos = filtered;
  writeGalleryFile(gallery);
  return true;
}

export function getPhotoCount(): number {
  return readGalleryFile().photos.length;
}

// ─── Regions ──────────────────────────────────────────────────────────────────

export function getRegions(): GalleryRegion[] {
  return readGalleryFile().regions;
}

export function saveRegions(regions: GalleryRegion[]): void {
  const gallery = readGalleryFile();
  gallery.regions = regions;
  writeGalleryFile(gallery);
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export function getGalleryTags(): GalleryTag[] {
  return readGalleryFile().tags;
}

export function saveGalleryTags(tags: GalleryTag[]): void {
  const gallery = readGalleryFile();
  gallery.tags = tags;
  writeGalleryFile(gallery);
}

export function getGalleryMeta(): Pick<GalleryData, 'regions' | 'tags'> {
  const { regions, tags } = readGalleryFile();
  return { regions, tags };
}

export function saveGalleryMeta(meta: Pick<GalleryData, 'regions' | 'tags'>): void {
  const gallery = readGalleryFile();
  gallery.regions = meta.regions;
  gallery.tags = meta.tags;
  writeGalleryFile(gallery);
}
