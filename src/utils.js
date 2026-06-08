import * as XLSX from 'xlsx';

export function exportToExcel(tasks) {
  const rows = tasks.map(t => ({
    'No': t.no, 'Task Name': t.name, 'Description': t.description,
    'Category': t.category, 'Priority': t.priority, 'Status': t.status,
    'Assignee': t.assignee, 'Start Date': t.startDate, 'Due Date': t.dueDate,
    'Completed Date': t.completedDate, 'Remark': t.remark,
    'Attachments': (t.attachments || []).map(a => a.name).join(', '),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [8,36,50,18,10,12,16,12,12,14,40,30].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
  XLSX.writeFile(wb, `task-list-${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function isOverdue(task) {
  if (!task.dueDate || task.status === 'Done' || task.status === 'Cancelled') return false;
  return new Date(task.dueDate) < new Date();
}

export function nextNo(tasks) {
  const nums = tasks.map(t => parseInt((t.no || '').replace('TK-', '')) || 0);
  const max  = nums.length ? Math.max(...nums) : 0;
  return `TK-${String(max + 1).padStart(3, '0')}`;
}

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function getYears(tasks) {
  const set = new Set();
  tasks.forEach(t => {
    ['startDate','dueDate','completedDate'].forEach(k => {
      if (t[k]) set.add(new Date(t[k]).getFullYear());
    });
  });
  const cur = new Date().getFullYear();
  set.add(cur);
  return [...set].sort((a,b) => b - a);
}

export function filterByPeriod(tasks, year, month) {
  if (!year && !month) return tasks;
  return tasks.filter(t => {
    const dates = [t.startDate, t.dueDate, t.completedDate].filter(Boolean);
    return dates.some(d => {
      const dt = new Date(d);
      if (year && dt.getFullYear() !== parseInt(year)) return false;
      if (month !== null && month !== undefined && dt.getMonth() !== month) return false;
      return true;
    });
  });
}
