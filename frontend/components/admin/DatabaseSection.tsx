'use client';

import { useEffect, useRef, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import { Database, Download, Upload, FileJson, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { isSuperAdmin } from '@/utils/roles';

const cardCls =
  'bg-white dark:bg-dark-bg-secondary border border-[#E2E0F0] dark:border-dark-border rounded-xl shadow-sm';

type ExportFormat = 'json' | 'csv' | 'sql';

const csvEscape = (v: any) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Every table in the database, with its columns. Used by both the CSV and SQL
// exporters so a backup covers the full schema (JSON export already does).
const TABLE_COLUMNS: Record<string, string[]> = {
  universities: ['id', 'name', 'location', 'province', 'region', 'description', 'image', 'details', 'rankings', 'pros', 'cons', 'scholarships', 'applicationDeadlines', 'costOfLiving', 'visa', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'],
  regions: ['name'],
  users: ['id', 'name', 'email', 'role', 'permissions', 'emailVerified', 'profilePicture', 'createdAt', 'updatedAt'],
  roles: ['id', 'name', 'permissions', 'isSystem'],
  settings: ['id', 'appName', 'appIcon', 'address', 'managerName', 'contactEmail', 'contactPhone'],
  activityLog: ['id', 'action', 'entity', 'entityId', 'entityName', 'actor', 'meta', 'timestamp'],
  versions: ['id', 'universityId', 'version', 'snapshot', 'actor', 'summary', 'timestamp'],
  trash: ['id', 'type', 'item', 'deletedBy', 'deletedAt'],
  bookmarks: ['id', 'universityId', 'universityName', 'region', 'action', 'userEmail', 'timestamp'],
  reviews: ['id', 'universityId', 'universityName', 'userEmail', 'userName', 'rating', 'comment', 'createdAt'],
  applications: ['id', 'userEmail', 'universityId', 'universityName', 'status', 'notes', 'createdAt', 'updatedAt'],
  userPreferences: ['id', 'userEmail', 'intendedMajor', 'degreeLevel', 'preferredRegions', 'preferredCountries', 'budget', 'gpa', 'languageRequirements', 'extracurriculars', 'studyMode', 'startDate', 'surveyCompleted', 'updatedAt'],
  academicScores: ['id', 'userEmail', 'name', 'score', 'scale', 'status', 'updatedAt'],
  recommendations: ['id', 'userEmail', 'source', 'query', 'response', 'results', 'createdAt'],
  programs: ['id', 'universityId', 'name', 'degreeLevel', 'description', 'updatedAt'],
  requirements: ['id', 'universityId', 'category', 'name', 'updatedAt'],
  scholarships: ['id', 'universityId', 'name', 'amount', 'eligibility', 'deadline', 'updatedAt'],
};

/** Rows for a table from the export payload (regions/versions/settings have odd shapes). */
const tableRows = (data: any, table: string): any[] => {
  if (table === 'regions') return (data.regions || []).map((r: string) => ({ name: r }));
  if (table === 'versions') return Object.values(data.versions || {}).flat();
  if (table === 'settings') return data.settings ? [data.settings] : [];
  return data[table] || [];
};

const cell = (r: any, c: string): any => {
  const v = r?.[c];
  if (v !== null && v !== undefined && typeof v === 'object') return JSON.stringify(v);
  return v;
};

function buildCsv(data: any): string {
  const lines: string[] = [];
  const addTable = (title: string, rows: any[], cols: string[]) => {
    // Always print the header so every table is represented, even when empty
    lines.push(`=== ${title} ===`);
    lines.push(cols.map(csvEscape).join(','));
    rows.forEach((r) => {
      lines.push(cols.map((c) => csvEscape(cell(r, c))).join(','));
    });
    lines.push('');
  };
  Object.entries(TABLE_COLUMNS).forEach(([table, cols]) => {
    addTable(table, tableRows(data, table), cols);
  });
  return lines.join('\n');
}

const sqlEscape = (v: any) => {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
};

const sqlType = (col: string) => {
  if (col === 'id') return 'INTEGER PRIMARY KEY';
  if (col === 'universityId' || col === 'version' || col === 'rating') return 'INTEGER';
  if (col === 'emailVerified' || col === 'isSystem' || col === 'surveyCompleted') return 'BOOLEAN';
  return 'TEXT';
};

function buildSql(data: any, appName: string): string {
  const out: string[] = [];
  out.push(`-- ${appName} database export — ${new Date().toISOString()}`);
  out.push('-- Full backup: every table, CREATE TABLE + INSERT (MySQL/Postgres/SQLite-style)');
  out.push('');

  Object.entries(TABLE_COLUMNS).forEach(([table, cols]) => {
    const create =
      table === 'regions'
        ? 'CREATE TABLE IF NOT EXISTS regions (name TEXT PRIMARY KEY);'
        : `CREATE TABLE IF NOT EXISTS ${table} (${cols
            .map((c) => `${c} ${sqlType(c)}`)
            .join(', ')});`;
    out.push(create);
    tableRows(data, table).forEach((r: any) => {
      const values = cols.map((c) => {
        const v = cell(r, c);
        // Store booleans as 1/0 so the dump works in SQLite, MySQL and Postgres
        return sqlEscape(typeof v === 'boolean' ? (v ? '1' : '0') : v);
      });
      out.push(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${values.join(', ')});`);
    });
    out.push('');
  });
  return out.join('\n');
}

export default function DatabaseSection({ onDataChange }: { onDataChange?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [importing, setImporting] = useState(false);
  const [confirmImport, setConfirmImport] = useState<null | { json: any; fileName: string }>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: user?.name || 'admin', actorRole: user?.role || '' }),
      });
      if (res.ok) {
        const d = await res.json();
        setResult({
          ok: true,
          message: `Database reset to seed data (${d.totals?.universities ?? '?'} universities, ${d.totals?.users ?? '?'} users).`,
        });
        onDataChange?.();
      } else {
        setResult({ ok: false, message: 'Reset failed — only Super Admins can reset the database.' });
      }
    } catch (err) {
      console.error(err);
      setResult({ ok: false, message: 'Reset failed.' });
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const full = data.data;
      const appName = data.app || 'UniVerse';
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
        content = buildSql(full, appName);
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
        body: JSON.stringify({
          ...confirmImport.json,
          actor: user?.name || 'admin',
          actorRole: user?.role || '',
        }),
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
            {format === 'json' && 'Full backup of every table — users, universities, programs, requirements, scholarships, preferences, recommendations, activity, versions & more. Use this for import.'}
            {format === 'csv' && `Every table as spreadsheets — one section per table (${Object.keys(TABLE_COLUMNS).length} total).`}
            {format === 'sql' && `Portable SQL with CREATE TABLE + INSERT statements for every table (${Object.keys(TABLE_COLUMNS).length} total).`}
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
      </div>        {/* Reset to seed data (Super Admin only) */}
        {isSuperAdmin(user?.role) && (
          <div className={`${cardCls} p-6 border border-red-200 dark:border-red-500/30`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-red-500" />
                  Reset database
                </h3>
                <p className="text-sm text-slate-500 dark:text-dark-text-secondary mt-1.5 max-w-xl">
                  Wipe all data and restore the original seed content (universities, regions, roles
                  and the demo admin). Only Super Admins can do this — export a backup first if you
                  need one.
                </p>
              </div>
              <button
                onClick={() => setConfirmReset(true)}
                disabled={resetting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30 disabled:opacity-60"
              >
                <RotateCcw className="w-4 h-4" />
                {resetting ? 'Resetting…' : 'Reset to seed data'}
              </button>
            </div>
          </div>
        )}

        {/* Storage note */}
        <div className={`${cardCls} p-5 text-sm text-slate-600 dark:text-dark-text-secondary`}>
        <p className="font-medium text-slate-800 dark:text-dark-text mb-1">Where is the data stored?</p>
        <p>
          In a real database — MySQL, PostgreSQL, or SQLite (fallback) — configured via{" "}
          <code className="px-1.5 py-0.5 bg-[#F4F2FA] dark:bg-dark-bg-tertiary rounded text-[#9370DB]">backend/.env</code>.
          This is the data your exports back up and imports replace.
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

      <ConfirmModal
        open={confirmReset}
        title="Reset database?"
        message="All current data will be wiped and replaced with the original seed data. This cannot be undone — export a backup first if you need one."
        confirmLabel="Reset database"
        danger
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
      {importing && (
        <div className="text-center py-8 text-slate-500 dark:text-dark-text-secondary">Importing…</div>
      )}
    </div>
  );
}
