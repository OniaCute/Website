import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAssetCategories, createCategory, deleteCategory } from '@/lib/assetCategories';

/** GET /api/admin/asset-categories — 获取所有自定义分类 */
export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }
  const data = getAssetCategories();
  return NextResponse.json({ code: 200, message: 'ok', data: data.categories });
}

/** POST /api/admin/asset-categories — 创建分类 */
export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }
  const { name, slug } = await request.json() as { name?: string; slug?: string };
  if (!name || !slug) {
    return NextResponse.json({ code: 400, message: '缺少 name 或 slug', data: null }, { status: 400 });
  }
  const result = createCategory(name.trim(), slug.trim().toLowerCase());
  if (!result.success) {
    return NextResponse.json({ code: 400, message: result.error ?? '创建失败', data: null }, { status: 400 });
  }
  return NextResponse.json({ code: 200, message: 'created', data: result.category });
}

/** DELETE /api/admin/asset-categories?slug=xxx — 删除分类 */
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ code: 400, message: '缺少 slug', data: null }, { status: 400 });
  }
  const result = deleteCategory(slug);
  if (!result.success) {
    return NextResponse.json({ code: 400, message: result.error ?? '删除失败', data: null }, { status: 400 });
  }
  return NextResponse.json({ code: 200, message: 'deleted', data: null });
}
