'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

type AuditLogItem = {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  admin_login: '管理员登录',
  admin_logout: '管理员退出',
  view_user_detail: '查看用户详情',
  view_user_characters: '查看用户角色卡',
  reset_user_password: '重置用户密码',
  change_user_role: '修改用户等级',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [actionFilter, setActionFilter] = useState('');
  const [targetUserIdFilter, setTargetUserIdFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (actionFilter) params.set('action', actionFilter);
      if (targetUserIdFilter) params.set('targetUserId', targetUserIdFilter);
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, targetUserIdFilter]);

  const totalPages = Math.ceil(total / pageSize) || 1;
  const formatDate = (s: string) => new Date(s).toLocaleString('zh-CN');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="w-7 h-7" /> 审计日志
      </h1>
      <div className="bg-white rounded-lg shadow mb-4 p-4 flex flex-wrap gap-4 items-end">
        <div className="min-w-[180px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">操作类型</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          >
            <option value="">全部</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">目标用户 ID</label>
          <input
            type="text"
            value={targetUserIdFilter}
            onChange={(e) => setTargetUserIdFilter(e.target.value)}
            placeholder="筛选被操作的用户"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <button
          type="button"
          onClick={() => fetchLogs()}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          查询
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无审计记录</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 bg-gray-50">
                    <th className="py-3 px-4">时间</th>
                    <th className="py-3 px-4">管理员</th>
                    <th className="py-3 px-4">操作</th>
                    <th className="py-3 px-4">目标用户</th>
                    <th className="py-3 px-4">详情</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-4 text-gray-600 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-2 px-4 text-gray-800">{log.adminEmail}</td>
                      <td className="py-2 px-4 text-gray-800">
                        {actionLabel(log.action)}
                      </td>
                      <td className="py-2 px-4 text-gray-600 font-mono text-xs">
                        {log.targetUserId ?? '—'}
                      </td>
                      <td className="py-2 px-4 text-gray-500 max-w-xs truncate">
                        {log.payload && Object.keys(log.payload).length > 0
                          ? JSON.stringify(log.payload)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  共 {total} 条 · 第 {page} / {totalPages} 页
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
