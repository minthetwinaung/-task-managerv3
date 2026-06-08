import React, { useState, useRef } from 'react';
import { X, Paperclip, Trash2, Upload, Download } from 'lucide-react';
import { PRIORITIES, STATUSES, CATEGORIES, CATEGORY_COLOR, CATEGORY_ICON } from './data';

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)', fontWeight: 500 }}>
        {label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function TaskModal({ task, onSave, onClose, nextNo }) {
  const empty = { no: '', name: '', description: '', category: 'ETL Pipeline', priority: 'Medium', status: 'Backlog', assignee: '', startDate: '', dueDate: '', completedDate: '', remark: '', attachments: [] };
  const [form, setForm]     = useState(task ? { ...task } : { ...empty, no: nextNo });
  const [dragOver, setDO]   = useState(false);
  const fileRef             = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFiles = files => {
    const arr = Array.from(files).map(f => ({
      name: f.name, size: f.size, type: f.type,
      url: URL.createObjectURL(f), file: f,
    }));
    setForm(f => ({ ...f, attachments: [...(f.attachments || []), ...arr] }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  const g2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 };
  const fc  = { gridColumn: '1 / -1' };

  const catColor = CATEGORY_COLOR[form.category] || { bg: '#1e1e1e', color: '#6b7280' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 14, width: '100%', maxWidth: 760, maxHeight: '92vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', background: 'rgba(79,143,255,0.13)', padding: '3px 9px', borderRadius: 5 }}>{form.no || nextNo}</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{task ? 'Edit task' : 'New task'}</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', color: 'var(--text2)', padding: 5, display: 'flex', borderRadius: 7, border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, ...g2 }}>

          <div style={fc}>
            <Field label="Task name" required>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter task name..." style={{ fontSize: 14, fontWeight: 500 }} required />
            </Field>
          </div>

          <div style={fc}>
            <Field label="Description">
              <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="What needs to be done?" style={{ resize: 'vertical' }} />
            </Field>
          </div>

          {/* Category with colour preview */}
          <Field label="Category">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={{ flex: 1 }}>
                {CATEGORIES.map(o => <option key={o}>{o}</option>)}
              </select>
              <span style={{ fontSize: 13, padding: '6px 12px', borderRadius: 6, background: catColor.bg, color: catColor.color, fontWeight: 600, whiteSpace: 'nowrap', border: `1px solid ${catColor.color}30` }}>
                {CATEGORY_ICON[form.category]} {form.category}
              </span>
            </div>
          </Field>

          <Field label="Priority">
            <select value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Assignee">
            <input value={form.assignee || ''} onChange={e => set('assignee', e.target.value)} placeholder="Name..." />
          </Field>

          <Field label="Start date">
            <input type="date" value={form.startDate || ''} onChange={e => set('startDate', e.target.value)} />
          </Field>

          <Field label="Due date">
            <input type="date" value={form.dueDate || ''} onChange={e => set('dueDate', e.target.value)} />
          </Field>

          <Field label="Completed date">
            <input type="date" value={form.completedDate || ''} onChange={e => set('completedDate', e.target.value)} />
          </Field>

          <div />

          <div style={fc}>
            <Field label="Remark">
              <textarea value={form.remark || ''} onChange={e => set('remark', e.target.value)} rows={3} placeholder="Notes, references, links..." style={{ resize: 'vertical' }} />
            </Field>
          </div>

          {/* Attachments */}
          <div style={fc}>
            <Field label="Attachments">
              <div
                onDragOver={e => { e.preventDefault(); setDO(true); }}
                onDragLeave={() => setDO(false)}
                onDrop={e => { e.preventDefault(); setDO(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current.click()}
                style={{ border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 8, padding: '14px 16px', textAlign: 'center', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, background: dragOver ? 'rgba(79,143,255,0.06)' : 'transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Upload size={15} /> Drop files here or <span style={{ color: 'var(--accent)' }}>click to upload</span>
              </div>
              <input ref={fileRef} type="file" multiple onChange={e => handleFiles(e.target.files)} style={{ display: 'none' }} />

              {(form.attachments || []).length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {form.attachments.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', background: 'var(--surface2)', borderRadius: 7, border: '1px solid var(--border)' }}>
                      <Paperclip size={13} color="var(--text3)" style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{(a.size / 1024).toFixed(1)} KB</span>
                      <a href={a.url} download={a.name} onClick={e => e.stopPropagation()} style={{ display: 'flex', color: 'var(--accent)', padding: 3 }}>
                        <Download size={13} />
                      </a>
                      <button type="button" onClick={() => setForm(f => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }))} style={{ background: 'transparent', color: 'var(--text3)', display: 'flex', padding: 3, border: 'none', cursor: 'pointer', borderRadius: 4 }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'var(--surface)' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--surface2)', color: 'var(--text2)', fontSize: 13, border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding: '8px 24px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            {task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  );
}
