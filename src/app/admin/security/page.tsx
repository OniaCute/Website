'use client';

import React, { useState } from 'react';
import { Shield, Key, Save, AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { useLocaleStore } from '@/store/localeStore';
import { useRouter } from 'next/navigation';
import { routeProgress } from '@/components/ui/RouteProgressBar';

const i18n = {
  title:         { 'zh-CN': '安全设置',   'en-US': 'Security' },
  subtitle:      { 'zh-CN': '修改管理员密码', 'en-US': 'Change admin password' },
  notice:        { 'zh-CN': '密码存储在 ', 'en-US': 'Password is stored in ' },
  noticeMid:     { 'zh-CN': ' 中，使用 bcrypt 哈希加密。修改密码后将自动退出登录。', 'en-US': ', encrypted with bcrypt. You will be logged out after changing the password.' },
  changeTitle:   { 'zh-CN': '修改密码',   'en-US': 'Change Password' },
  oldPass:       { 'zh-CN': '当前密码',   'en-US': 'Current Password' },
  newPass:       { 'zh-CN': '新密码',     'en-US': 'New Password' },
  newPassHint:   { 'zh-CN': '至少 8 个字符', 'en-US': 'At least 8 characters' },
  confirmPass:   { 'zh-CN': '确认新密码', 'en-US': 'Confirm New Password' },
  submit:        { 'zh-CN': '修改密码',   'en-US': 'Change Password' },
  errShort:      { 'zh-CN': '新密码至少 8 个字符',  'en-US': 'New password must be at least 8 characters' },
  errMismatch:   { 'zh-CN': '两次密码不一致',        'en-US': 'Passwords do not match' },
  errWrong:      { 'zh-CN': '当前密码不正确',         'en-US': 'Incorrect current password' },
  successMsg:    { 'zh-CN': '密码修改成功！将自动退出登录...', 'en-US': 'Password changed. Logging out...' },
  resetTitle:    { 'zh-CN': '初始化网站',   'en-US': 'Reset Site' },
  resetDesc:     { 'zh-CN': '将网站重置为未初始化状态，此操作不可撤销。', 'en-US': 'Reset the site to an uninitialized state. This action cannot be undone.' },
  resetBtn:      { 'zh-CN': '初始化网站',   'en-US': 'Reset Site' },
  // 第一步确认弹窗
  modal1Title:   { 'zh-CN': '确认初始化网站',   'en-US': 'Confirm Site Reset' },
  modal1Desc:    { 'zh-CN': '此操作将清除以下所有数据，且无法恢复：', 'en-US': 'This action will permanently delete all of the following data:' },
  modal1Items:   {
    'zh-CN': ['所有博客文章与随笔', '所有相册照片', '所有上传的资源文件', '项目与页面内容', '网站配置（主题、排版、个人资料等）', '全部备份文件', '浏览量与表情回应数据'],
    'en-US': ['All blog articles and notes', 'All gallery photos', 'All uploaded assets', 'Projects and page content', 'Site config (theme, layout, profile, etc.)', 'All backup files', 'View counts and reaction data'],
  },
  modal1Cancel:  { 'zh-CN': '取消',   'en-US': 'Cancel' },
  modal1Next:    { 'zh-CN': '继续',   'en-US': 'Continue' },
  // 第二步确认弹窗
  modal2Title:   { 'zh-CN': '最终确认',   'en-US': 'Final Confirmation' },
  modal2Desc:    { 'zh-CN': '你即将执行不可撤销的操作。重置后网站将回到初始化向导，你需要重新完成所有配置。', 'en-US': 'You are about to perform an irreversible action. After reset, the site will return to the setup wizard and you will need to reconfigure everything.' },
  modal2Warn:    { 'zh-CN': '确定要继续吗？所有数据将被永久删除。', 'en-US': 'Are you sure? All data will be permanently deleted.' },
  modal2Cancel:  { 'zh-CN': '取消',         'en-US': 'Cancel' },
  modal2Confirm: { 'zh-CN': '确认初始化',   'en-US': 'Confirm Reset' },
  resetSuccess:  { 'zh-CN': '网站已重置为未初始化状态，正在跳转 Setup...', 'en-US': 'Site reset. Redirecting to Setup...' },
} as const;

type L = 'zh-CN' | 'en-US';

export default function SecurityPage() {
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = (o: Record<L, string>) => o[l];
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword.length < 8) { setMessage({ type: 'error', text: tx(i18n.errShort) }); return; }
    if (newPassword !== confirmPassword) { setMessage({ type: 'error', text: tx(i18n.errMismatch) }); return; }
    setLoading(true);
    const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword, newPassword }) });
    const data = await res.json() as { code: number; message: string };
    setLoading(false);
    if (data.code === 200) {
      setMessage({ type: 'success', text: tx(i18n.successMsg) });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(async () => { await fetch('/api/auth/logout', { method: 'POST' }); routeProgress.start(); router.push('/login'); }, 2000);
    } else {
      setMessage({ type: 'error', text: data.message === 'Invalid current password' ? tx(i18n.errWrong) : data.message });
    }
  };

  const doReset = async () => {
    setShowConfirm2(false);
    setMessage(null);
    setResetLoading(true);
    const res = await fetch('/api/admin/reset-site', { method: 'POST' });
    const data = await res.json() as { code: number; message: string };
    setResetLoading(false);
    if (data.code === 200) {
      setMessage({ type: 'success', text: tx(i18n.resetSuccess) });
      setTimeout(() => { routeProgress.start(); router.replace('/setup'); }, 500);
    } else {
      setMessage({ type: 'error', text: data.message });
    }
  };

  const resetItems = i18n.modal1Items[l];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{tx(i18n.title)}</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.subtitle)}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-error" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {tx(i18n.notice)}<code className="text-primary">config.json</code>{tx(i18n.noticeMid)}
        </p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{tx(i18n.changeTitle)}</h3>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <Input type="password" label={tx(i18n.oldPass)}     value={oldPassword}     onChange={e => setOldPassword(e.target.value)}     required placeholder="••••••••" />
          <Input type="password" label={tx(i18n.newPass)}     value={newPassword}     onChange={e => setNewPassword(e.target.value)}     required placeholder="••••••••" hint={tx(i18n.newPassHint)} />
          <Input type="password" label={tx(i18n.confirmPass)} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
          {message && (
            <div className="p-3 rounded-xl text-sm" style={{ background: message.type === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)', border: `1px solid ${message.type === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
              {message.text}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full"><Save className="w-4 h-4" /> {tx(i18n.submit)}</Button>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <RotateCcw className="w-5 h-5 text-error" />
          <h3 className="font-semibold">{tx(i18n.resetTitle)}</h3>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.resetDesc)}</p>
        <Button variant="danger" loading={resetLoading} onClick={() => setShowConfirm1(true)}>
          <RotateCcw className="w-4 h-4" /> {tx(i18n.resetBtn)}
        </Button>
      </GlassCard>

      {/* 第一步确认：列出将被删除的内容 */}
      <Modal
        open={showConfirm1}
        onClose={() => setShowConfirm1(false)}
        title={tx(i18n.modal1Title)}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirm1(false)}>{tx(i18n.modal1Cancel)}</Button>
            <Button variant="danger" onClick={() => { setShowConfirm1(false); setShowConfirm2(true); }}>{tx(i18n.modal1Next)}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.modal1Desc)}</p>
          <ul className="space-y-1.5">
            {resetItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Trash2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {/* 第二步确认：最终警告 */}
      <Modal
        open={showConfirm2}
        onClose={() => setShowConfirm2(false)}
        title={tx(i18n.modal2Title)}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirm2(false)}>{tx(i18n.modal2Cancel)}</Button>
            <Button variant="danger" onClick={doReset}>{tx(i18n.modal2Confirm)}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>{tx(i18n.modal2Warn)}</p>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.modal2Desc)}</p>
        </div>
      </Modal>
    </div>
  );
}
