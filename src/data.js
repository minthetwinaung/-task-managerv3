export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export const STATUSES = ['Backlog', 'In Progress', 'In Review', 'Done', 'Cancelled'];

export const CATEGORIES = [
  // ── Data Engineering ──────────────────────────────
  'ETL Pipeline',        // Extract / Transform / Load
  'dbt Model',           // dbt staging / intermediate / mart
  'Airflow DAG',         // Airflow pipeline orchestration
  'Kafka Stream',        // Kafka topic / consumer / producer
  'Clickhouse',          // Clickhouse table / query / cluster
  'Spark Job',           // PySpark / Spark SQL processing
  'Jupyter Notebook',    // EDA / analysis notebooks
  'SQL / DDL',           // CREATE TABLE, ALTER, migrations
  'Data Modeling',       // Star schema, ERD, dimension design
  'Data Quality',        // DQ checks, Great Expectations, tests
  'Data Catalogue',      // Metadata, lineage, DataHub / Alation
  'CDC / Replication',   // Change Data Capture, Debezium
  // ── DevOps / Infra ────────────────────────────────
  'DevOps',              // CI/CD, Docker, Kubernetes
  'Firewall / Network',  // Firewall, VPN, network requests
  // ── General ───────────────────────────────────────
  'Feature',
  'Bug Fix',
  'Refactor',
  'Testing',
  'Documentation',
  'Meeting',
  'Other',
];

export const CATEGORY_ICON = {
  'ETL Pipeline':      '⟳',
  'dbt Model':         '⬡',
  'Airflow DAG':       '◈',
  'Kafka Stream':      '⌁',
  'Clickhouse':        '◉',
  'Spark Job':         '⚡',
  'Jupyter Notebook':  '⊞',
  'SQL / DDL':         '⌗',
  'Data Modeling':     '◫',
  'Data Quality':      '✦',
  'Data Catalogue':    '⊙',
  'CDC / Replication': '⇄',
  'DevOps':            '⚙',
  'Firewall / Network':'⊗',
  'Feature':           '◆',
  'Bug Fix':           '✕',
  'Refactor':          '↻',
  'Testing':           '◎',
  'Documentation':     '≡',
  'Meeting':           '⊛',
  'Other':             '·',
};

export const CATEGORY_COLOR = {
  'ETL Pipeline':      { bg:'#1a2e45', color:'#60a5fa' },
  'dbt Model':         { bg:'#1a3028', color:'#34d399' },
  'Airflow DAG':       { bg:'#2a1f3d', color:'#a78bfa' },
  'Kafka Stream':      { bg:'#2a1a1a', color:'#f87171' },
  'Clickhouse':        { bg:'#2a2210', color:'#fbbf24' },
  'Spark Job':         { bg:'#2a1e10', color:'#fb923c' },
  'Jupyter Notebook':  { bg:'#1e2a10', color:'#84cc16' },
  'SQL / DDL':         { bg:'#1a2535', color:'#38bdf8' },
  'Data Modeling':     { bg:'#251a35', color:'#c084fc' },
  'Data Quality':      { bg:'#1a2e2a', color:'#2dd4bf' },
  'Data Catalogue':    { bg:'#2a1e1a', color:'#f97316' },
  'CDC / Replication': { bg:'#1a2530', color:'#67e8f9' },
  'DevOps':            { bg:'#1e2030', color:'#94a3b8' },
  'Firewall / Network':{ bg:'#2a1a20', color:'#fb7185' },
  'Feature':           { bg:'#1a2545', color:'#818cf8' },
  'Bug Fix':           { bg:'#2a1a1a', color:'#f87171' },
  'Refactor':          { bg:'#1e2530', color:'#64748b' },
  'Testing':           { bg:'#1a2e20', color:'#4ade80' },
  'Documentation':     { bg:'#252010', color:'#d4b96a' },
  'Meeting':           { bg:'#1e1e2a', color:'#a5b4fc' },
  'Other':             { bg:'#1e1e1e', color:'#6b7280' },
};

export const PRIORITY_COLOR = {
  Critical: '#ef4444',
  High:     '#f59e0b',
  Medium:   '#4f8fff',
  Low:      '#3ecf8e',
};

export const STATUS_COLOR = {
  Backlog:      '#555e78',
  'In Progress':'#4f8fff',
  'In Review':  '#a78bfa',
  Done:         '#3ecf8e',
  Cancelled:    '#374151',
};

export const SAMPLE_TASKS = [
  {
    id: 1, no: 'TK-001',
    name: 'Design & build ETL pipeline – CDP Customer',
    description: 'Extract from CONX sources (Oishi, SX, OnGround, Bevfood), transform with dbt, load into Clickhouse mart_cdp.',
    category: 'ETL Pipeline', priority: 'Critical', status: 'Done',
    assignee: 'Sinsit L.', startDate: '2026-01-14', dueDate: '2026-01-28', completedDate: '2026-01-28',
    remark: 'stg_conx_oishiclub, stg_conx_sx, stg_bevfood all deployed to production. CDP pipeline fully operational.',
    attachments: [],
  },
  {
    id: 2, no: 'TK-002',
    name: 'dbt models – staging & intermediate CDP',
    description: 'Build stg_conx_*.sql and int_cdp_*.sql models. Final mart: int_cdp_dim_customer.sql',
    category: 'dbt Model', priority: 'High', status: 'Done',
    assignee: 'Sinsit L.', startDate: '2026-01-20', dueDate: '2026-01-28', completedDate: '2026-01-28',
    remark: 'All 8 models deployed. Schema tests passing.',
    attachments: [],
  },
  {
    id: 3, no: 'TK-003',
    name: 'VSMS MTM – Kafka 32 tables migration',
    description: 'Migrate 32 tables from VSMS MTM via Kafka pipeline. Deploy stg_vsms_mtm to production cluster.',
    category: 'Kafka Stream', priority: 'High', status: 'Done',
    assignee: 'Sinsit L.', startDate: '2026-04-20', dueDate: '2026-05-08', completedDate: '2026-05-08',
    remark: 'Production verified on 8 May 2026. All 32 tables confirmed in stg_vsms_mtm.',
    attachments: [],
  },
  {
    id: 4, no: 'TK-004',
    name: 'Firewall access – OishiClub DB to Clickhouse PROD',
    description: 'Request firewall rule to allow OishiClub Database connectivity to mart_cdp Clickhouse cluster (janus).',
    category: 'Firewall / Network', priority: 'High', status: 'In Progress',
    assignee: 'Sinsit L.', startDate: '2026-05-27', dueDate: '2026-06-03', completedDate: '',
    remark: 'Ticket submitted to IT Service Center. Awaiting Infra team approval. CC: #Infra, Piyawan, Buncha.',
    attachments: [],
  },
  {
    id: 5, no: 'TK-005',
    name: 'Recreate auction_rewards – ReplicatedReplacingMergeTree',
    description: 'Recreate table on cluster janus with correct engine. Reload data from _bak, verify on all replicas.',
    category: 'SQL / DDL', priority: 'Medium', status: 'In Review',
    assignee: 'Sinsit L.', startDate: '2026-05-29', dueDate: '2026-06-05', completedDate: '',
    remark: 'dev_oishiclub tested OK. Awaiting PROD approval. ENGINE = ReplicatedReplacingMergeTree on cluster janus.',
    attachments: [],
  },
  {
    id: 6, no: 'TK-006',
    name: 'Airflow DAG – dag_cdp_oishiclub_el',
    description: 'Build and schedule Airflow DAG for OishiClub daily data extraction into Clickhouse.',
    category: 'Airflow DAG', priority: 'High', status: 'Done',
    assignee: 'Sinsit L.', startDate: '2026-01-23', dueDate: '2026-01-30', completedDate: '2026-01-30',
    remark: 'dag_cdp_oishiclub_el and dbt_dag_cdp_oishiclub both deployed and running daily.',
    attachments: [],
  },
  {
    id: 7, no: 'TK-007',
    name: 'ChangWorld – 28 new tables Clickhouse',
    description: 'Add 28 new tables for ChangWorld source. Build dag_cdp_changworld_el.py Airflow pipeline.',
    category: 'Clickhouse', priority: 'Medium', status: 'Done',
    assignee: 'Sinsit L.', startDate: '2026-04-20', dueDate: '2026-04-24', completedDate: '2026-04-24',
    remark: 'dag_cdp_changworld_el.py deployed. All 28 tables verified in production.',
    attachments: [],
  },
  {
    id: 8, no: 'TK-008',
    name: 'Data Quality – dbt schema tests for CDP models',
    description: 'Add unique, not_null, accepted_values schema tests for all staging and intermediate dbt models.',
    category: 'Data Quality', priority: 'Medium', status: 'Backlog',
    assignee: '', startDate: '', dueDate: '2026-06-15', completedDate: '',
    remark: 'Priority after TK-005 PROD deploy. Cover all int_cdp_* models first.',
    attachments: [],
  },
];
