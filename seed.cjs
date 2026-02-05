const SUPABASE_URL = 'https://vznjqbneooufjhfkeicd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bmpxYm5lb291ZmpoZmtlaWNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI0MjkxNywiZXhwIjoyMDg1ODE4OTE3fQ.4cbbcGJ7sZgAo7uHiT1Qt0cuN6s2wllgT0VFgdqjPF0';

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function post(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${table}: ${res.status} ${err}`);
  }
  return res.json();
}

function contact(name, email, phone, company, role, type, notes, lastContact) {
  return { name, email: email || null, phone: phone || null, company: company || null, role: role || null, relationship_type: type, notes: notes || null, last_contact_date: lastContact || null };
}

function task(title, desc, status, priority, due, assigned) {
  return { title, description: desc, status, priority, due_date: due || null, assigned_to: assigned, created_by: null };
}

async function seed() {
  console.log('Seeding contacts...');
  await post('contacts', [
    contact('Stephen', 'stephenx_99@yahoo.com', '+14695141427', 'Assured Home Health Agency', 'Associate / Operations', 'Partner', 'Key business associate. Handles day-to-day ops coordination.', '2026-02-04'),
    contact('Richard Ashford', null, '+14193096961', 'Assured Home Health Agency', 'Owner', 'Staff', 'Agency owner. Primary decision maker.', '2026-02-04'),
    contact('Brittco Support', null, null, 'Brittco Software', 'Support Team', 'Vendor', 'Care management platform. Login: Nashford. Need admin upgrade for full staff visibility.', null),
    contact('QuickBooks Support', null, null, 'Intuit QuickBooks', 'Payroll Support', 'Vendor', 'Payroll processing. Pending: need user credentials with Payroll access.', null),
    contact('Aetna Insurance', null, '1-800-872-3862', 'Aetna', 'Provider Relations', 'Insurance', 'Major insurance partner for HPC services.', null),
    contact('Molina Healthcare', null, '1-800-642-4168', 'Molina Healthcare', 'Provider Relations', 'Insurance', 'Insurance partner.', null),
    contact('Ohio Department of Medicaid', null, null, 'Ohio DOH', 'Compliance', 'Partner', 'State Medicaid oversight and compliance.', null),
    contact('Maria Johnson', 'maria.j@email.com', '(419) 555-0142', 'Assured Home Health Agency', 'Lead Caregiver', 'Caregiver', 'Experienced caregiver. Reliable for complex cases.', '2026-01-28'),
    contact('Denise Williams', 'denise.w@email.com', '(419) 555-0198', 'Assured Home Health Agency', 'Caregiver Coordinator', 'Staff', 'Handles caregiver scheduling and assignments.', '2026-01-30'),
    contact('James Carter', null, '(419) 555-0267', 'Assured Home Health Agency', 'Field Supervisor', 'Staff', 'Oversees field staff and quality checks.', '2026-02-01'),
    contact('Dr. Sarah Patel', 'dr.patel@clinic.com', '(419) 555-0311', 'Northwest Ohio Medical', 'Referring Physician', 'Referral Source', 'Regular referral source for new HPC clients.', '2026-01-15'),
    contact('Linda Torres', 'linda.t@email.com', '(419) 555-0089', null, 'Client', 'Client', 'Active HPC client since 2024. Weekly visits.', '2026-02-03'),
    contact('Robert Chen', null, '(419) 555-0455', null, 'Client', 'Client', 'Active HPC client. Requires OSOC coverage.', '2026-02-02'),
    contact('Patricia Hayes', 'p.hayes@email.com', '(419) 555-0523', null, 'Client', 'Client', 'Active client. Bi-weekly visits.', '2026-01-25'),
  ]);
  console.log('✅ Contacts seeded (14)');

  console.log('Seeding tasks...');
  await post('tasks', [
    task('Get Brittco admin credentials', 'Current account is staff-level (Nashford). Need admin upgrade to see all staff clock-ins and run reports programmatically.', 'todo', 'high', '2026-02-10', 'Richard'),
    task('Set up QuickBooks access', 'Richard needs to create a user account with Payroll access (view + run payroll, but NOT edit pay rates). Browser automation approach preferred.', 'todo', 'high', '2026-02-14', 'Richard'),
    task('Run biweekly payroll', 'Process payroll for current 2-week period (Sun-Sat). Three categories: Regular, Overtime, OSOC. Use Brittco Report 193 (TimeclockForADP) as source.', 'todo', 'urgent', '2026-02-08', 'Niva'),
    task('Build dashboard - Phase 2 features', 'Add automation triggers, Brittco integration, payroll summary views, and notification system to the management dashboard.', 'in-progress', 'medium', '2026-02-28', 'Niva'),
    task('Set up Zoom integration', 'Connect Zoom for scheduling and managing virtual meetings with staff and clients.', 'todo', 'low', '2026-02-21', 'Niva'),
    task('Fix OpenAI Whisper quota', 'Whisper API quota exceeded on both keys. Need to add billing at platform.openai.com/account/billing. 2 pending voice messages need transcription.', 'todo', 'medium', '2026-02-07', 'Richard'),
    task('Review staff clock-in compliance', 'Check for missed clock-ins and late entries across all caregivers for current pay period. Flag any staff with >8hrs OSOC.', 'todo', 'high', '2026-02-07', 'Stephen'),
    task('Update caregiver contact info', 'Audit and update phone numbers and emails for all active caregivers. Some records may be outdated.', 'todo', 'medium', '2026-02-15', 'Denise Williams'),
    task('Quarterly compliance report', 'Prepare Q1 2026 compliance documentation for Ohio Medicaid. Include staff certifications, training records, and service logs.', 'todo', 'medium', '2026-03-15', 'James Carter'),
    task('Gmail push notifications configured', 'Set up Gmail OAuth, Pub/Sub push notifications via Tailscale Funnel. GCP Project: vibrant-beanbag-486411-m9.', 'done', 'medium', null, 'Niva'),
    task('WhatsApp channel connected', 'Connected to Richard\'s number (+14193096961). Allowlist mode active: Richard + Stephen only.', 'done', 'high', null, 'Niva'),
    task('Dashboard v1 deployed', 'React + Supabase + Netlify stack. Auth, tasks, contacts, reports, collaborations pages. Live at ahha-dashboard.netlify.app.', 'done', 'high', null, 'Niva'),
  ]);
  console.log('✅ Tasks seeded (12)');

  console.log('Seeding reports...');
  await post('reports', [
    { type: 'Payroll', title: 'Biweekly Payroll - Jan 19-Feb 1, 2026', data: 'Pending: need Brittco Report 193 export or admin access to pull full pay period data. 3 hour types: Regular, Overtime, OSOC.', status: 'pending' },
    { type: 'Staff Hours', title: 'Staff Hours Summary - Week of Jan 27', data: 'Partial data extracted from Brittco: 43 staff, ~460 hours across Feb 3-4 only. Full period extraction blocked by date filter issues.', status: 'pending' },
    { type: 'Compliance', title: 'Q1 2026 Compliance Prep', data: 'Ohio Medicaid quarterly compliance documentation. Due March 2026. Staff certifications and training records needed.', status: 'pending' },
    { type: 'Weekly Summary', title: 'Weekly Operations Summary - Feb 3', data: 'Agency snapshot: ~50 active clients, ~95 staff. Key items: dashboard launch, payroll setup in progress, Brittco admin access pending.', status: 'success' },
    { type: 'Financial', title: 'January 2026 Revenue Summary', data: 'Pending QuickBooks access to generate. Need user credentials with reporting permissions.', status: 'pending' },
    { type: 'Payroll', title: 'Brittco Report 193 - TimeclockForADP', data: 'Best report for payroll data. Generates HPC Staff Hours With Overtime as PDF. Richard can run manually and send for processing.', status: 'success' },
  ]);
  console.log('✅ Reports seeded (6)');

  console.log('Seeding collaborations...');
  await post('collaborations', [
    { name: 'Management Dashboard', description: 'AHHA management dashboard app. React + Supabase + Netlify. Task management, contacts, reports, automations. Phase 1 complete, Phase 2 in progress.', status: 'active', created_by: null },
    { name: 'Payroll Automation', description: 'Automate biweekly payroll processing. Extract hours from Brittco, calculate Regular/Overtime/OSOC, push to QuickBooks. Blocked on admin access + QB credentials.', status: 'planning', created_by: null },
    { name: 'Brittco Integration', description: 'Full integration with Brittco care management system. Goal: automated clock-in monitoring, report generation, staff alerts. Needs admin credentials.', status: 'planning', created_by: null },
    { name: 'Staff Communication System', description: 'Centralized staff notifications and updates via WhatsApp/email. Currently: WhatsApp connected for Richard + Stephen.', status: 'active', created_by: null },
  ]);
  console.log('✅ Collaborations seeded (4)');

  console.log('Seeding activity log...');
  await post('activity_log', [
    { action: 'Created', entity_type: 'system', entity_id: null, details: 'Dashboard app deployed to ahha-dashboard.netlify.app' },
    { action: 'Connected', entity_type: 'system', entity_id: null, details: 'Gmail OAuth + push notifications configured' },
    { action: 'Connected', entity_type: 'system', entity_id: null, details: 'WhatsApp channel linked to +14193096961' },
    { action: 'Connected', entity_type: 'system', entity_id: null, details: 'Google Calendar + Meet integration active' },
    { action: 'Deployed', entity_type: 'system', entity_id: null, details: 'Dashboard v1 with auth, tasks, contacts, reports, collaborations' },
    { action: 'Extracted', entity_type: 'system', entity_id: null, details: 'Partial Brittco payroll data: 43 staff, ~460 hours (2 days only)' },
    { action: 'Identified', entity_type: 'system', entity_id: null, details: 'Brittco Report 193 (TimeclockForADP) as best payroll source' },
    { action: 'Configured', entity_type: 'system', entity_id: null, details: 'Supabase database schema and RLS policies' },
  ]);
  console.log('✅ Activity log seeded (8)');

  console.log('\n🎉 All seed data inserted successfully!');
}

seed().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
