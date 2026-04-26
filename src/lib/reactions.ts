import path from 'path';
import { atomicWriteJson, readJson } from './fsAtomic';
import type { ReactionsData } from '@/types';

const REACTIONS_FILE = path.join(process.cwd(), 'data', 'reactions.json');

// 把 emoji grapheme cluster 转为稳定的 key（所有码点的十六进制，连字符分隔）
// 例：'😶‍🌫️'（ZWJ 序列）→ '1f636-200d-1f32b-fe0f'
// 例：'❤️' → '2764-fe0f'
function emojiToKey(emoji: string): string {
  return Array.from(emoji)
    .map(ch => ch.codePointAt(0)!.toString(16))
    .join('-');
}

// 从 key 还原 emoji 字符串
function keyToEmoji(key: string): string {
  return key.split('-')
    .map(cp => String.fromCodePoint(parseInt(cp, 16)))
    .join('');
}

// 判断 key 是否是码点格式（含连字符或全为十六进制数字）
// 兼容旧数据：旧格式直接用 emoji 字符串作为 key
function isCodePointKey(key: string): boolean {
  return /^[0-9a-f]+([-][0-9a-f]+)*$/.test(key);
}

function readReactions(): ReactionsData {
  return readJson<ReactionsData>(REACTIONS_FILE) ?? {};
}

function writeReactions(data: ReactionsData): void {
  atomicWriteJson(REACTIONS_FILE, data);
}

// 把 entry 里所有 key 还原成 emoji 字符串，统计计数
function entryToEmojiCounts(entry: Record<string, string[]>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, ips] of Object.entries(entry)) {
    const emoji = isCodePointKey(key) ? keyToEmoji(key) : key;
    result[emoji] = (result[emoji] ?? 0) + ips.length;
  }
  return result;
}

// 找出某个 IP 已经 react 过的 emoji 列表（还原为 emoji 字符串）
function getUserReacted(entry: Record<string, string[]>, ip: string): string[] {
  return Object.entries(entry)
    .filter(([, ips]) => ips.includes(ip))
    .map(([key]) => isCodePointKey(key) ? keyToEmoji(key) : key);
}

export function getReactionsWithIp(contentKey: string, ip: string): {
  counts: Record<string, number>;
  userReacted: string[];
} {
  const data = readReactions();
  const entry = data[contentKey] ?? {};
  return {
    counts: entryToEmojiCounts(entry),
    userReacted: getUserReacted(entry, ip),
  };
}

export function pruneReactions(validEmojis: string[], validArticleSlugs: string[], validNoteIds: string[]): {
  removedKeys: number;
  removedEmojis: number;
} {
  const data = readReactions();
  const validEmojiKeys = new Set(validEmojis.map(e => emojiToKey(e)));
  let removedKeys = 0;
  let removedEmojis = 0;

  for (const contentKey of Object.keys(data)) {
    const [type, id] = contentKey.split(':');
    const contentExists =
      (type === 'article' && validArticleSlugs.includes(id)) ||
      (type === 'note' && validNoteIds.includes(id));

    if (!contentExists) {
      delete data[contentKey];
      removedKeys++;
      continue;
    }

    const entry = data[contentKey];
    for (const emojiKey of Object.keys(entry)) {
      const isValid = isCodePointKey(emojiKey)
        ? validEmojiKeys.has(emojiKey)
        : validEmojis.includes(emojiKey);
      if (!isValid) {
        delete entry[emojiKey];
        removedEmojis++;
      }
    }
  }

  writeReactions(data);
  return { removedKeys, removedEmojis };
}

export function toggleReaction(contentKey: string, emoji: string, ip: string): {
  counts: Record<string, number>;
  userReacted: string[];
  action: 'added' | 'removed';
} {
  const data = readReactions();
  const key = emojiToKey(emoji);

  if (!data[contentKey]) data[contentKey] = {};
  if (!data[contentKey][key]) data[contentKey][key] = [];

  const ips = data[contentKey][key];
  const alreadyReacted = ips.includes(ip);

  if (alreadyReacted) {
    data[contentKey][key] = ips.filter(i => i !== ip);
  } else {
    data[contentKey][key].push(ip);
  }

  writeReactions(data);

  return {
    counts: entryToEmojiCounts(data[contentKey]),
    userReacted: getUserReacted(data[contentKey], ip),
    action: alreadyReacted ? 'removed' : 'added',
  };
}
