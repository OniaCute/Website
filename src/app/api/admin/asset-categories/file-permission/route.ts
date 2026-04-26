import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { setFilePermission, getAssetCategories } from '@/lib/assetCategories';

/**
 * GET /api/admin/asset-categories/file-permission?slug=xxx
 * 获取某分类下所有文件的权限快照
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ code: 400, message: '缺少 slug', data: null }, { status: 400 });
  }
  const data = getAssetCategories();
  // 返回该 slug 下所有权限记录
  const permissions: Record<string, { publicDownload: boolean }> = {};
  for (const [key, perm] of Object.entries(data.filePermissions)) {
    if (key.startsWith(`${slug}/`)) {
      permissions[key] = perm;
    }
  }
  return NextResponse.json({ code: 200, message: 'ok', data: permissions });
}

/**
 * PATCH /api/admin/asset-categories/file-permission
 * Body: { slug: string; filename: string; publicDownload: boolean }
 * 设置单文件的公开下载权限
 */
export async function PATCH(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { slug, filename, publicDownload } = await request.json() as {
    slug?: string;
    filename?: string;
    publicDownload?: boolean;
  };

  if (!slug || !filename || publicDownload === undefined) {
    return NextResponse.json({ code: 400, message: '缺少必要参数', data: null }, { status: 400 });
  }

  // 验证 slug 属于合法分类
  const data = getAssetCategories();
  if (!data.categories.find(c => c.slug === slug)) {
    return NextResponse.json({ code: 404, message: '分类不存在', data: null }, { status: 404 });
  }

  setFilePermission(slug, filename, publicDownload);
  return NextResponse.json({ code: 200, message: 'ok', data: { slug, filename, publicDownload } });
}
