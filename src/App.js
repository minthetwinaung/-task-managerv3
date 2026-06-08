import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, Download, Search, Pencil, Trash2, Paperclip,
  ChevronUp, ChevronDown, LayoutGrid, List, AlertCircle,
  MessageSquare, ChevronRight, ChevronDown as CDown,
  LogOut, Trash, Calendar, X, CheckSquare,
} from 'lucide-react';
import TaskModal from './TaskModal';
import { PRIORITIES, STATUSES, CATEGORIES, PRIORITY_COLOR, STATUS_COLOR, CATEGORY_COLOR, CATEGORY_ICON } from './data';
import { exportToExcel, formatDate, isOverdue, nextNo, MONTHS, getYears, filterByPeriod } from './utils';
import { logout } from './auth';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/* ─────────────────────────────────────────────────────────────────────── */
function Badge({ label, color, bg, icon }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, fontFamily:'var(--mono)', padding:'3px 8px', borderRadius:5, background:bg||`${color}1a`, color:color||'var(--text2)', whiteSpace:'nowrap', border:`1px solid ${color||'#fff'}18` }}>
      {icon && <span style={{ fontSize:10 }}>{icon}</span>}{label}
    </span>
  );
}

/* ── expanded remark + attachments row ── */
function ExpandRow({ task }) {
  const hasRemark = task.remark?.trim();
  const hasFiles  = (task.attachments||[]).length > 0;
  if (!hasRemark && !hasFiles) return null;
  return (
    <tr>
      <td colSpan={11} style={{ padding:0, background:'rgba(20,24,32,0.8)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ padding:'10px 16px 14px 52px', display:'flex', flexDirection:'column', gap:10 }}>
          {hasRemark && (
            <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <MessageSquare size={13} color="var(--text3)" style={{ marginTop:2, flexShrink:0 }}/>
              <span style={{ fontSize:12, color:'var(--text2)', lineHeight:1.65, whiteSpace:'pre-wrap' }}>{task.remark}</span>
            </div>
          )}
          {hasFiles && (
            <div style={{ display:'flex', gap:8, alignItems:'flex-start', flexWrap:'wrap' }}>
              <Paperclip size={13} color="var(--text3)" style={{ marginTop:3, flexShrink:0 }}/>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {task.attachments.map((a,i) => (
                  <a key={i} href={a.url} download={a.name} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, padding:'4px 10px', borderRadius:6, background:'var(--surface3)', color:'var(--accent)', textDecoration:'none', border:'1px solid var(--border)', fontFamily:'var(--mono)' }}>
                    <Download size={11}/>{a.name}<span style={{ color:'var(--text3)', fontSize:10 }}>({(a.size/1024).toFixed(1)}KB)</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── card ── */
function TaskCard({ task, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const catColor = CATEGORY_COLOR[task.category] || { bg:'#1e1e1e', color:'#6b7280' };
  const overdue  = isOverdue(task);
  return (
    <div className="fade-in" style={{ background:'var(--surface)', border:`1px solid ${overdue?'rgba(239,68,68,0.3)':'var(--border)'}`, borderRadius:12, overflow:'hidden', transition:'border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.3)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
      <div style={{ padding:'13px 15px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)' }}>{task.no}</span>
          <div style={{ display:'flex', gap:3 }}>
            <button onClick={()=>onEdit(task)} style={{ background:'transparent', color:'var(--text3)', padding:4, borderRadius:5, display:'flex', border:'none', cursor:'pointer' }}><Pencil size={13}/></button>
            <button onClick={()=>onDelete(task.id)} style={{ background:'transparent', color:'var(--text3)', padding:4, borderRadius:5, display:'flex', border:'none', cursor:'pointer' }}><Trash2 size={13}/></button>
          </div>
        </div>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:6, lineHeight:1.4 }}>{task.name}</div>
        {task.description && <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5, marginBottom:8 }}>{task.description.slice(0,110)}{task.description.length>110?'…':''}</div>}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
          <Badge label={task.category} color={catColor.color} bg={catColor.bg} icon={CATEGORY_ICON[task.category]}/>
          <Badge label={task.priority} color={PRIORITY_COLOR[task.priority]}/>
          <Badge label={task.status}   color={STATUS_COLOR[task.status]}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', borderTop:'1px solid var(--border)', paddingTop:8 }}>
          <span>{task.assignee||'Unassigned'}</span>
          <span style={{ color:overdue?'var(--red)':'var(--text3)' }}>Due {formatDate(task.dueDate)}</span>
        </div>
      </div>
      {(task.remark||(task.attachments||[]).length>0) && (
        <>
          <button onClick={()=>setOpen(o=>!o)} style={{ width:'100%', padding:'7px 15px', background:'var(--surface2)', border:'none', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:6, color:'var(--text3)', fontSize:11, cursor:'pointer', fontFamily:'var(--mono)' }}>
            {open?<CDown size={12}/>:<ChevronRight size={12}/>}
            {task.remark?'remark':''}{task.remark&&(task.attachments||[]).length>0?' · ':''}
            {(task.attachments||[]).length>0?`${task.attachments.length} file${task.attachments.length>1?'s':''}` :''}
          </button>
          {open && (
            <div style={{ padding:'10px 14px 12px', background:'var(--surface2)', display:'flex', flexDirection:'column', gap:8 }}>
              {task.remark && <div style={{ display:'flex', gap:7 }}><MessageSquare size={12} color="var(--text3)" style={{ marginTop:2, flexShrink:0 }}/><span style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>{task.remark}</span></div>}
              {(task.attachments||[]).length>0 && (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {task.attachments.map((a,i)=>(
                    <a key={i} href={a.url} download={a.name} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, padding:'4px 10px', borderRadius:5, background:'var(--surface3)', color:'var(--accent)', textDecoration:'none', border:'1px solid var(--border)', fontFamily:'var(--mono)' }}>
                      <Download size={11}/>{a.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── CLEAR CONFIRM DIALOG ── */
function ClearDialog({ count, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:16 }}>
      <div className="fade-in" style={{ background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:14, padding:'28px 28px 24px', width:380, textAlign:'center' }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <Trash size={22} color="var(--red)"/>
        </div>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Clear Tasks</div>
        <div style={{ fontSize:13, color:'var(--text2)', marginBottom:24, lineHeight:1.6 }}>
          This will permanently delete <strong style={{ color:'var(--red)' }}>{count} task{count!==1?'s':''}</strong> matching current filters.<br/>This action cannot be undone.
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          <button onClick={onCancel} style={{ padding:'9px 22px', borderRadius:9, background:'var(--surface2)', color:'var(--text2)', fontSize:13, border:'1px solid var(--border)', cursor:'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding:'9px 22px', borderRadius:9, background:'var(--red)', color:'#fff', fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>Delete {count} task{count!==1?'s':''}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ MAIN APP ════════════════════════════════ */
export default function App({ user, onLogout }) {
  const [tasks, _setTasks]    = useState([]);
  const [modal, setModal]     = useState(null);
  const [search, setSearch]   = useState('');
  const [filterStatus, setFS] = useState('All');
  const [filterPri, setFP]    = useState('All');
  const [filterCat, setFC]    = useState('All');
  const [sortKey, setSK]      = useState('no');
  const [sortDir, setSD]      = useState('asc');
  const [view, setView]       = useState('table');
  const [deleteId, setDI]     = useState(null);
  const [expanded, setExp]    = useState({});
  const [showClear, setSC]    = useState(false);
  const [filterYear, setFY]   = useState('');
  const [filterMonth, setFM]  = useState('');

  const LOCAL_TASK_KEY = user?.id ? `tm_tasks_${user.id}` : null;

  const sanitizeTask = task => ({
    ...task,
    attachments: (task.attachments || []).map(({ name, size, type, url }) => ({ name, size, type, url })),
  });

  const loadLocalTasks = useCallback(() => {
    if (!LOCAL_TASK_KEY) return [];
    try {
      const saved = localStorage.getItem(LOCAL_TASK_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, [LOCAL_TASK_KEY]);

  const persistLocalTasks = list => {
    if (!LOCAL_TASK_KEY) return;
    localStorage.setItem(LOCAL_TASK_KEY, JSON.stringify(list));
  };

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;
    if (!isSupabaseConfigured || !supabase) {
      _setTasks(loadLocalTasks());
      return;
    }
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: true });

    if (error) {
      console.error('Failed to load tasks', error);
      return;
    }
    _setTasks(data || []);
  }, [user?.id, loadLocalTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const saveTask = async form => {
    const payload = sanitizeTask(form);
    if (!isSupabaseConfigured || !supabase) {
      const nextTasks = form.id
        ? tasks.map(x => x.id === form.id ? { ...form } : x)
        : [...tasks, { ...form, id: Date.now().toString() }];
      _setTasks(nextTasks);
      persistLocalTasks(nextTasks);
    } else {
      if (form.id) {
        const { error } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', form.id)
          .eq('user_id', user.id);
        if (error) {
          console.error('Update failed', error);
          return;
        }
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{ ...payload, user_id: user.id }]);
        if (error) {
          console.error('Insert failed', error);
          return;
        }
      }
      await fetchTasks();
    }
    setModal(null);
  };

  const deleteTask = async id => {
    if (!isSupabaseConfigured || !supabase) {
      const nextTasks = tasks.filter(x => x.id !== id);
      _setTasks(nextTasks);
      persistLocalTasks(nextTasks);
      setDI(null);
      return;
    }
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      console.error('Delete failed', error);
      return;
    }
    setDI(null);
    await fetchTasks();
  };

  const toggleSort = key => {
    if (sortKey===key) setSD(d=>d==='asc'?'desc':'asc');
    else { setSK(key); setSD('asc'); }
  };

  const years = useMemo(() => getYears(tasks), [tasks]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const monthIdx = filterMonth !== '' ? parseInt(filterMonth) : null;
    let list = tasks.filter(t => {
      if (filterStatus!=='All' && t.status!==filterStatus) return false;
      if (filterPri!=='All'    && t.priority!==filterPri)  return false;
      if (filterCat!=='All'    && t.category!==filterCat)  return false;
      if (q && !`${t.no} ${t.name} ${t.description} ${t.assignee} ${t.remark}`.toLowerCase().includes(q)) return false;
      return true;
    });
    list = filterByPeriod(list, filterYear||null, monthIdx);
    return list.sort((a,b) => {
      const cmp = String(a[sortKey]||'').localeCompare(String(b[sortKey]||''));
      return sortDir==='asc' ? cmp : -cmp;
    });
  }, [tasks, search, filterStatus, filterPri, filterCat, sortKey, sortDir, filterYear, filterMonth]);

  const stats = useMemo(() => ({
    total:   tasks.length,
    done:    tasks.filter(t=>t.status==='Done').length,
    inprog:  tasks.filter(t=>t.status==='In Progress').length,
    overdue: tasks.filter(isOverdue).length,
  }), [tasks]);

  const SortIcon = ({ k }) => sortKey===k ? (sortDir==='asc' ? <ChevronUp size={11}/> : <ChevronDown size={11}/>) : null;
  const TH = ({ k, label, w }) => (
    <th onClick={k?()=>toggleSort(k):undefined}
      style={{ padding:'10px 11px', textAlign:'left', fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'var(--mono)', cursor:k?'pointer':'default', userSelect:'none', whiteSpace:'nowrap', borderBottom:'1px solid var(--border)', width:w, background:'var(--surface2)' }}>
      <span style={{ display:'inline-flex', alignItems:'center', gap:3 }}>{label}<SortIcon k={k}/></span>
    </th>
  );
  const td = { padding:'9px 11px', verticalAlign:'middle', borderBottom:'1px solid var(--border)', fontSize:13, color:'var(--text)' };

  const handleLogout = async () => { await logout(); onLogout(); };

  const clearFiltered = async () => {
    const ids = filtered.map(t=>t.id);
    if (ids.length === 0) {
      setSC(false);
      return;
    }
    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id);
    if (error) {
      console.error('Clear filtered tasks failed', error);
      return;
    }
    setSC(false);
    await fetchTasks();
  };

  const donePercent = stats.total ? Math.round(stats.done/stats.total*100) : 0;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>

      {/* ── top bar ── */}
      <div style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'0 22px', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(12px)' }}>
        <div style={{ maxWidth:1500, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'rgba(79,143,255,0.15)', border:'1px solid rgba(79,143,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CheckSquare size={14} color="#4f8fff"/>
              </div>
              <span style={{ fontSize:14, fontWeight:700, letterSpacing:'-0.01em' }}>DevTask</span>
            </div>
            <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>{stats.total} tasks</span>
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={()=>exportToExcel(filtered)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'var(--surface2)', color:'var(--text2)', fontSize:13, border:'1px solid var(--border)', cursor:'pointer' }}>
              <Download size={14}/> Export
            </button>
            <button onClick={()=>setModal({})}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:8, background:'var(--accent)', color:'#fff', fontSize:13, fontWeight:600, border:'none', cursor:'pointer', boxShadow:'0 2px 12px rgba(79,143,255,0.35)' }}>
              <Plus size={15}/> New task
            </button>

            {/* user avatar */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:4, padding:'5px 10px', borderRadius:9, background:'var(--surface2)', border:'1px solid var(--border)' }}>
              <div style={{ width:26, height:26, borderRadius:7, background:'rgba(79,143,255,0.2)', border:'1px solid rgba(79,143,255,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#4f8fff', fontFamily:'var(--mono)' }}>
                {user.avatar}
              </div>
              <span style={{ fontSize:12, color:'var(--text2)', maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</span>
              <button onClick={handleLogout} style={{ background:'transparent', border:'none', color:'var(--text3)', display:'flex', cursor:'pointer', padding:2, borderRadius:5, marginLeft:2 }} title="Sign out">
                <LogOut size={13}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1500, margin:'0 auto', padding:'18px 22px' }}>

        {/* ── stat cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
          {[
            { label:'Total tasks',  val:stats.total,   col:'var(--text)',   icon:'📋' },
            { label:'Completed',    val:stats.done,    col:'var(--green)',  icon:'✅' },
            { label:'In progress',  val:stats.inprog,  col:'var(--accent)', icon:'⚡' },
            { label:'Overdue',      val:stats.overdue, col:'var(--red)',    icon:'⚠️' },
          ].map(s => (
            <div key={s.label} className="fade-in" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:12, right:14, fontSize:20, opacity:0.3 }}>{s.icon}</div>
              <div style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:700, color:s.col, fontFamily:'var(--mono)', lineHeight:1 }}>{s.val}</div>
              {s.label==='Completed' && stats.total>0 && (
                <div style={{ marginTop:8 }}>
                  <div style={{ height:3, background:'var(--surface3)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${donePercent}%`, background:'var(--green)', borderRadius:2, transition:'width 0.5s ease' }}/>
                  </div>
                  <div style={{ fontSize:10, color:'var(--text3)', marginTop:3, fontFamily:'var(--mono)' }}>{donePercent}% complete</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── filter bar ── */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
          {/* row 1: search + status/priority/category + view */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:180, background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:9, padding:'0 12px' }}>
              <Search size={13} color="var(--text3)"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks, remarks..." style={{ border:'none', background:'transparent', padding:'8px 0', flex:1 }}/>
              {search && <button onClick={()=>setSearch('')} style={{ background:'transparent', border:'none', color:'var(--text3)', display:'flex', cursor:'pointer', padding:2 }}><X size={13}/></button>}
            </div>
            {[
              { val:filterStatus, fn:setFS, opts:['All',...STATUSES],     label:'Status' },
              { val:filterPri,    fn:setFP, opts:['All',...PRIORITIES],   label:'Priority' },
              { val:filterCat,    fn:setFC, opts:['All',...CATEGORIES],   label:'Category' },
            ].map(f=>(
              <select key={f.label} value={f.val} onChange={e=>f.fn(e.target.value)} style={{ width:'auto', minWidth:140 }}>
                {f.opts.map(o=><option key={o}>{o}</option>)}
              </select>
            ))}
            <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
              {[['table',<List size={14}/>],['grid',<LayoutGrid size={14}/>]].map(([v,icon])=>(
                <button key={v} onClick={()=>setView(v)} style={{ padding:'6px 10px', borderRadius:7, background:view===v?'var(--surface3)':'transparent', color:view===v?'var(--text)':'var(--text3)', display:'flex', alignItems:'center', border:'none', cursor:'pointer' }}>{icon}</button>
              ))}
            </div>
          </div>

          {/* row 2: year / month filter + clear button */}
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <Calendar size={13} color="var(--text3)"/>
            <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Period</span>

            <select value={filterYear} onChange={e=>{setFY(e.target.value); setFM('');}} style={{ width:'auto', minWidth:100 }}>
              <option value="">All years</option>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>

            <select value={filterMonth} onChange={e=>setFM(e.target.value)} style={{ width:'auto', minWidth:120 }} disabled={!filterYear}>
              <option value="">All months</option>
              {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
            </select>

            {(filterYear||filterMonth!=='') && (
              <button onClick={()=>{setFY('');setFM('');}}
                style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, padding:'5px 10px', borderRadius:6, background:'rgba(79,143,255,0.1)', color:'var(--accent)', border:'1px solid rgba(79,143,255,0.2)', cursor:'pointer', fontFamily:'var(--mono)' }}>
                <X size={11}/> Clear period
              </button>
            )}

            <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>{filtered.length} of {tasks.length} tasks</span>
              {filtered.length > 0 && (
                <button onClick={()=>setSC(true)}
                  style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, padding:'6px 12px', borderRadius:7, background:'rgba(239,68,68,0.08)', color:'var(--red)', border:'1px solid rgba(239,68,68,0.2)', cursor:'pointer', fontFamily:'var(--mono)' }}>
                  <Trash size={11}/> Clear {filtered.length !== tasks.length ? 'filtered' : 'all'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── TABLE VIEW ── */}
        {view==='table' && (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, overflow:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:1100 }}>
              <thead>
                <tr>
                  <TH w={28}/>
                  <TH k="no"            label="No"       w={75}/>
                  <TH k="name"          label="Task"     w={240}/>
                  <TH k="category"      label="Category" w={145}/>
                  <TH k="priority"      label="Priority" w={90}/>
                  <TH k="status"        label="Status"   w={110}/>
                  <TH k="assignee"      label="Assignee" w={110}/>
                  <TH k="startDate"     label="Start"    w={95}/>
                  <TH k="dueDate"       label="Due"      w={95}/>
                  <TH k="completedDate" label="Done"     w={95}/>
                  <TH                   label="Actions"  w={70}/>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 && (
                  <tr><td colSpan={11} style={{ ...td, textAlign:'center', color:'var(--text3)', padding:44 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:32 }}>📭</span>
                      <span>No tasks found</span>
                    </div>
                  </td></tr>
                )}
                {filtered.map(t => {
                  const isExp   = !!expanded[t.id];
                  const overdue = isOverdue(t);
                  const catC    = CATEGORY_COLOR[t.category]||{bg:'#1e1e1e',color:'#6b7280'};
                  const hasExtra= (t.remark?.trim())||(t.attachments||[]).length>0;
                  return (
                    <React.Fragment key={t.id}>
                      <tr onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                          style={{ transition:'background 0.1s', borderLeft: overdue?'2px solid var(--red)':'2px solid transparent' }}>
                        <td style={{ ...td, padding:'9px 6px', textAlign:'center' }}>
                          {hasExtra && (
                            <button onClick={()=>setExp(ex=>({...ex,[t.id]:!ex[t.id]}))}
                              style={{ background:'transparent', border:'none', color:'var(--text3)', cursor:'pointer', display:'flex', alignItems:'center', padding:2, borderRadius:4 }}>
                              {isExp?<ChevronDown size={13}/>:<ChevronRight size={13}/>}
                            </button>
                          )}
                        </td>
                        <td style={td}><span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)' }}>{t.no}</span></td>
                        <td style={td}>
                          <div style={{ fontWeight:600, marginBottom:2 }}>{t.name}</div>
                          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                            {overdue && <span style={{ fontSize:10, color:'var(--red)', display:'inline-flex', alignItems:'center', gap:2 }}><AlertCircle size={10}/>Overdue</span>}
                            {(t.attachments||[]).length>0 && <span style={{ fontSize:10, color:'var(--text3)', display:'inline-flex', alignItems:'center', gap:2 }}><Paperclip size={10}/>{t.attachments.length}</span>}
                          </div>
                        </td>
                        <td style={td}><Badge label={t.category} color={catC.color} bg={catC.bg} icon={CATEGORY_ICON[t.category]}/></td>
                        <td style={td}><Badge label={t.priority} color={PRIORITY_COLOR[t.priority]}/></td>
                        <td style={td}><Badge label={t.status}   color={STATUS_COLOR[t.status]}/></td>
                        <td style={{ ...td, color:'var(--text2)' }}>{t.assignee||'—'}</td>
                        <td style={{ ...td, fontFamily:'var(--mono)', fontSize:11, color:'var(--text2)' }}>{formatDate(t.startDate)}</td>
                        <td style={{ ...td, fontFamily:'var(--mono)', fontSize:11, color:overdue?'var(--red)':'var(--text2)' }}>{formatDate(t.dueDate)}</td>
                        <td style={{ ...td, fontFamily:'var(--mono)', fontSize:11, color:'var(--green)' }}>{formatDate(t.completedDate)}</td>
                        <td style={td}>
                          <div style={{ display:'flex', gap:3 }}>
                            <button onClick={()=>setModal(t)} style={{ background:'transparent', color:'var(--text3)', padding:5, borderRadius:5, display:'flex', border:'none', cursor:'pointer' }}><Pencil size={13}/></button>
                            <button onClick={()=>setDI(t.id)} style={{ background:'transparent', color:'var(--text3)', padding:5, borderRadius:5, display:'flex', border:'none', cursor:'pointer' }}><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                      {isExp && <ExpandRow task={t}/>}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {view==='grid' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:12 }}>
            {filtered.length===0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'var(--text3)' }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
                <div>No tasks found</div>
              </div>
            )}
            {filtered.map(t=>(
              <TaskCard key={t.id} task={t} onEdit={setModal} onDelete={setDI}/>
            ))}
          </div>
        )}
      </div>

      {modal!==null && (
        <TaskModal task={modal.id?modal:null} nextNo={nextNo(tasks)} onSave={saveTask} onClose={()=>setModal(null)}/>
      )}

      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div className="fade-in" style={{ background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:14, padding:'26px 28px', width:340, textAlign:'center' }}>
            <Trash2 size={30} color="var(--red)" style={{ marginBottom:12 }}/>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Delete this task?</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginBottom:20 }}>This action cannot be undone.</div>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={()=>setDI(null)} style={{ padding:'8px 20px', borderRadius:8, background:'var(--surface2)', color:'var(--text2)', fontSize:13, border:'1px solid var(--border)', cursor:'pointer' }}>Cancel</button>
              <button onClick={()=>deleteTask(deleteId)} style={{ padding:'8px 20px', borderRadius:8, background:'var(--red)', color:'#fff', fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showClear && <ClearDialog count={filtered.length} onConfirm={clearFiltered} onCancel={()=>setSC(false)}/>}
    </div>
  );
}
