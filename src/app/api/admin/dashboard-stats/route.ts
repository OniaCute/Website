import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/siteConfig';
import { getAllProjects } from '@/lib/content';
import { getSseClientCount } from '@/lib/sse';
import { getArticleCount, getNoteCount } from '@/lib/blog';
import { getPhotoCount } from '@/lib/gallery';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getSiteConfig();
    const projects = getAllProjects('zh-CN');
    return NextResponse.json({
      code: 200,
      data: {
        projectCount: projects.length,
        skillCount:   config.content.skills.length,
        liveClients:  getSseClientCount(),
        articleCount: getArticleCount(),
        noteCount:    getNoteCount(),
        photoCount:   getPhotoCount(),
      },
    });
  } catch {
    return NextResponse.json({ code: 500, data: { projectCount: 0, skillCount: 0, liveClients: 0, articleCount: 0, noteCount: 0, photoCount: 0 } });
  }
}
