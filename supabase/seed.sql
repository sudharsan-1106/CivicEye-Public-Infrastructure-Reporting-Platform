-- ====================================================================
-- CivicEye – Default Seed Data for Departments & Categories
-- ====================================================================

-- 1. SEED DEPARTMENTS
INSERT INTO public.departments (id, name, code, description, contact_email, contact_phone, is_active)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Roads & Highways Department', 'ROADS', 'Maintenance of city roads, pavements, potholes, bridges, and flyovers.', 'roads@civiceye.gov', '+1-800-555-0101', true),
  ('a1000000-0000-0000-0000-000000000002', 'Electrical & Public Lighting', 'ELEC', 'Streetlights, traffic lights, and municipal electrical infrastructure.', 'power@civiceye.gov', '+1-800-555-0102', true),
  ('a1000000-0000-0000-0000-000000000003', 'Sanitation & Waste Management', 'SANIT', 'Garbage collection, solid waste disposal, and street sweeping.', 'sanitation@civiceye.gov', '+1-800-555-0103', true),
  ('a1000000-0000-0000-0000-000000000004', 'Water Supply & Sewerage Board', 'WATER', 'Clean water distribution, pipeline leakages, drainage, and stormwater management.', 'water@civiceye.gov', '+1-800-555-0104', true),
  ('a1000000-0000-0000-0000-000000000005', 'Public Works & Property', 'WORKS', 'Public buildings, parks, sidewalks, signs, and civic structures.', 'publicworks@civiceye.gov', '+1-800-555-0105', true),
  ('a1000000-0000-0000-0000-000000000006', 'Traffic Infrastructure & Signals', 'TRAFFIC', 'Bollards, lane markings, pedestrian crossings, speed humps, and traffic signage.', 'traffic@civiceye.gov', '+1-800-555-0106', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone;

-- 2. SEED ISSUE CATEGORIES
INSERT INTO public.issue_categories (id, name, description, icon, department_id, default_priority, sla_hours, is_active)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Roads & Potholes',
    'Potholes, broken asphalt, damaged pavements, curb damage, or sinking road segments.',
    'Construction',
    'a1000000-0000-0000-0000-000000000001',
    'HIGH',
    48,
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Streetlight Failures',
    'Dark streetlights, flickering lamps, exposed electric wires, or fallen lamp poles.',
    'Zap',
    'a1000000-0000-0000-0000-000000000002',
    'MEDIUM',
    24,
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Garbage & Sanitation',
    'Overflowing trash bins, illegal dumping, unsanitary public areas, or missed garbage collection.',
    'Trash2',
    'a1000000-0000-0000-0000-000000000003',
    'MEDIUM',
    24,
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'Water Supply & Leakage',
    'Burst water mains, dirty tap water supply, low water pressure, or broken public valves.',
    'Droplets',
    'a1000000-0000-0000-0000-000000000004',
    'HIGH',
    36,
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'Drainage & Waterlogging',
    'Clogged storm drains, flooded roads during rain, open manholes, or sewer overflow.',
    'Waves',
    'a1000000-0000-0000-0000-000000000004',
    'CRITICAL',
    12,
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000006',
    'Public Property Damage',
    'Damaged bus stops, broken park benches, vandalized statues, or collapsed perimeter walls.',
    'Building2',
    'a1000000-0000-0000-0000-000000000005',
    'LOW',
    96,
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000007',
    'Traffic Infrastructure & Signage',
    'Defective traffic signals, missing stop signs, knocked-down guardrails, or faded crosswalks.',
    'TrafficCone',
    'a1000000-0000-0000-0000-000000000006',
    'HIGH',
    24,
    true
  ),
  (
    'b1000000-0000-0000-0000-000000000008',
    'Other Civic Issues',
    'General public infrastructure hazards and municipal concerns not listed above.',
    'HelpCircle',
    NULL,
    'MEDIUM',
    72,
    true
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  department_id = EXCLUDED.department_id,
  default_priority = EXCLUDED.default_priority,
  sla_hours = EXCLUDED.sla_hours;
