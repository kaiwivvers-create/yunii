'use client';

import { useRef, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import { Database, Download, Upload, FileJson, CheckCircle2, XCircle } from 'lucide-react';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

type ExportFormat = 'json' | 'csv' | 'sql';

const csvEscape = (v: any) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function buildCsv(data: any): string {
  const lines: string[] = [];
  const addTable = (title: string, rows: any[], cols: string[]) => {
    if (rows.length === 0) return;
    lines.push(`=== ${title} ===`);
    lines.push(cols.map(csvEscape).join(','));
    rows.forEach((r) => {
      lines.push(cols.map((c) => csvEscape(r[c])).join(','));
    });
    lines.push('');
  };
  addTable('universities', data.universities, ['id', 'name', 'location', 'province', 'region', 'description']);
  addTable('regions', data.regions.map((r: string) => ({ region: r })), ['region']);
  addTable('users', data.users, ['id', 'name', 'email', 'role', 'createdAt']);
  addTable('bookmarks', data.bookmarks, ['universityName', 'region', 'action', 'userEmail', 'timestamp']);
  return lines.join('\n');
}

const sqlEscape = (v: any) => {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
};

function buildSql(data: any): string {
  const out: string[] = [];
  out.push(`-- UniVerse database export — ${new Date().toISOString()}`);
  out.push('');
  out.push('CREATE TABLE IF NOT EXISTS universities (id INTEGER PRIMARY KEY, name TEXT, location TEXT, province TEXT, region TEXT, description TEXT, image TEXT);');
  data.universities.forEach((u: any) => {
    out.push(
      `INSERT INTO universities (id, name, location, province, region, description, image) VALUES (${u.id}, ${sqlEscape(u.name)}, ${sqlEscape(u.location)}, ${sqlEscape(u.province)}, ${sqlEscape(u.region)}, ${sqlEscape(u.description)}, ${sqlEscape(u.image || '')});`
    );
  });
  out.push('');
  out.push('CREATE TABLE IF NOT EXISTS regions (name TEXT PRIMARY KEY);');
  data.regions.forEach((r: string) => {
    out.push(`INSERT INTO regions (name) VALUES (${sqlEscape(r)});`);
  });
  out.push('');
  out.push('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, role TEXT, created_at TEXT);');
  data.users.forEach((u: any) => {
    out.push(`INSERT INTO users (id, name, email, role, created_at) VALUES (${u.id}, ${sqlEscape(u.name)}, ${sqlEscape(u.email)}, ${sqlEscape(u.role)}, ${sqlEscape(u.createdAt)});`);
  });
  out.push('');
  out.push('CREATE TABLE IF NOT EXISTS bookmarks (id INTEGER PRIMARY KEY, university_name TEXT, region TEXT, action TEXT, user_email TEXT, timestamp TEXT);');
  data.bookmarks.forEach((b: any) => {
    out.push(`INSERT INTO bookmarks (id, university_name, region, action, user_email, timestamp) VALUES (${b.id}, ${sqlEscape(b.universityName)}, ${sqlEscape(b.region)}, ${sqlEscape(b.action)}, ${sqlEscape(b.userEmail || '')}, ${sqlEscape(b.timestamp)});`);
  });
  return out.join('\n');
}

export default function DatabaseSection({ onDataChange }: { onDataChange?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [importing, setImporting] = useState(false);
  const [confirmImport, setConfirmImport] = useState<null | { json: any; fileName: string }>(null);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const full = data.data;
      const date = new Date().toISOString().slice(0, 10);
      let content = '';
      let ext = 'json';
      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        ext = 'json';
      } else if (format === 'csv') {
        content = buildCsv(full);
        ext = 'csv';
      } else {
        content = buildSql(full);
        ext = 'sql';
      }
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `universedata-${date}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      setResult({
        ok: true,
        message: `Exported as ${format.toUpperCase()} — ${(blob.size / 1024).toFixed(1)} KB`,
      });
    } catch (err) {
      console.error(err);
      setResult({ ok: false, message: 'Export failed. Is the backend running?' });
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (!json || typeof json !== 'object') throw new Error('Not a JSON object');
        setConfirmImport({ json, fileName: file.name });
      } catch {
        setResult({ ok: false, message: 'That file is not valid JSON.' });
      }
    };
    reader.readAsText(file);
  };

  const doImport = async () => {
    if (!confirmImport) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmImport.json),
      });
      if (res.ok) {
        const d = await res.json();
        setResult({
          ok: true,
          message: `Imported ${d.totals?.universities ?? '?'} universities, ${d.totals?.regions ?? '?'} regions, ${d.totals?.users ?? '?'} users.`,
        });
        onDataChange?.();
      } else {
        const text = await res.text();
        setResult({ ok: false, message: `Import failed: ${text.slice(0, 120)}` });
      }
    } catch (err) {
      console.error(err);
      setResult({ ok: false, message: 'Import failed.' });
    } finally {
      setImporting(false);
      setConfirmImport(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">Database</h2>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
            Backup your data or restore from a backup
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export */}
        <div className={`${cardCls} p-6`}>
          <div className="w-12 h-12 rounded-xl bg-[#9370DB]/10 text-[#9370DB] flex items-center justify-center mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">Export</h3>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1.5 mb-5">
            Download your data in the format that suits you.
          </p>

          {/* Format picker */}
          <div className="inline-flex items-center gap-1 bg-[#F4F2FA] dark:bg-dark-bg-tertiary p-1 rounded-xl mb-5">
            {(['json', 'csv', 'sql'] as ExportFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium uppercase transition-all ${
                  format === f
                    ? 'bg-[#9370DB] text-white shadow-sm'
                    : 'text-slate-600 dark:text-dark-text-secondary hover:text-[#9370DB]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500 dark:text-dark-text-secondary mb-5">
            {format === 'json' && 'Full backup — universities, regions, users, roles, settings, versions, activity & bookmarks. Use this for import.'}
            {format === 'csv' && 'Universities, regions, users, and bookmarks as spreadsheets (one section per table).'}
            {format === 'sql' && 'Portable SQL with CREATE TABLE + INSERT statements for MySQL/Postgres/SQLite-style databases.'}
          </p>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors shadow-sm shadow-[#9370DB]/30"
          >
            <Download className="w-4 h-4" />
            Export {format.toUpperCase()}
          </button>
        </div>

        {/* Import */}
        <div className={`${cardCls} p-6`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">Import</h3>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1.5 mb-5">
            Restore from a previously exported JSON file. This <span className="font-semibold text-slate-700 dark:text-dark-text">replaces</span> the current database.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/30"
          >
            <FileJson className="w-4 h-4" />
            Choose Backup File
          </button>
        </div>
      </div>

      {/* Storage note */}
      <div className={`${cardCls} p-5 text-sm text-slate-600 dark:text-dark-text-secondary`}>
        <p className="font-medium text-slate-800 dark:text-dark-text mb-1">Where is the data stored?</p>
        <p>
          Currently in <code className="px-1.5 py-0.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary rounded text-[#9370DB]">backend/data/db.json</code> on your machine — it survives restarts and is git-ignored. This is the file your exports back up and imports replace.
        </p>
      </div>

      {result && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
            result.ok ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'
          }`}
        >
          {result.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          {result.message}
          <button onClick={() => setResult(null)} className="ml-auto text-xs hover:underline">dismiss</button>
        </div>
      )}

      <ConfirmModal
        open={!!confirmImport}
        title="Import database?"
        message={`Replace all current data with "${confirmImport?.fileName}"? This cannot be undone — export your current data first if you want a backup.`}
        confirmLabel="Import & Replace"
        danger
        onConfirm={doImport}
        onCancel={() => setConfirmImport(null)}
      />
      {importing && (
        <div className="text-center py-8 text-slate-500 dark:text-dark-text-secondary">Importing…</div>
      )}
    </div>
  );
}
