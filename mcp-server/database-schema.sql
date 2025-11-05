/**
 * SQLite Database Schema for MCP Learning System
 *
 * Design: Ready for implementation (Option C)
 * Status: Not yet implemented - using JSON for now
 *
 * Migration plan:
 * 1. Validate learning system works with JSON
 * 2. Implement this schema
 * 3. Migrate existing corrections
 * 4. Switch MCP to use database
 */

-- ===== CORRECTIONS TABLE =====
-- Records every user correction for learning

CREATE TABLE IF NOT EXISTS corrections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correction_id TEXT UNIQUE NOT NULL,  -- correction-001, correction-002, etc.
  timestamp TEXT NOT NULL,
  issue_type TEXT NOT NULL,  -- crop, overlap, transition_type, timing, etc.
  issue_description TEXT NOT NULL,
  confidence TEXT NOT NULL,  -- high, medium, low

  -- Original parameters (stored as JSON)
  original_params TEXT NOT NULL,  -- JSON blob

  -- Corrected parameters (stored as JSON)
  corrected_params TEXT NOT NULL,  -- JSON blob

  -- Learned rule identifier
  learned_rule TEXT NOT NULL,

  -- Element context (optional)
  element_type TEXT,
  element_width INTEGER,
  element_height INTEGER,

  -- Metadata
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_corrections_issue_type ON corrections(issue_type);
CREATE INDEX IF NOT EXISTS idx_corrections_learned_rule ON corrections(learned_rule);
CREATE INDEX IF NOT EXISTS idx_corrections_timestamp ON corrections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_corrections_confidence ON corrections(confidence);
CREATE INDEX IF NOT EXISTS idx_corrections_element ON corrections(element_type, element_width, element_height);

-- ===== VALIDATED RULES TABLE =====
-- Extracted, consolidated rules ready for application

CREATE TABLE IF NOT EXISTS validated_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT UNIQUE NOT NULL,  -- code_editor_max_scale_1500x850
  rule_type TEXT NOT NULL,  -- max_scale, transition, timing, layout
  rule_value TEXT NOT NULL,  -- JSON blob with rule data

  -- Usage tracking
  times_applied INTEGER DEFAULT 0,
  last_applied TEXT,
  success_rate REAL DEFAULT 1.0,  -- How often this rule prevents issues

  -- Confidence scoring
  confidence_score REAL DEFAULT 1.0,  -- Calculated from correction confidence
  source_corrections TEXT,  -- Comma-separated correction IDs

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rules_type ON validated_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_rules_confidence ON validated_rules(confidence_score DESC);

-- ===== ELEMENT SCALES TABLE =====
-- Quick lookup for max safe scales by element type/size

CREATE TABLE IF NOT EXISTS element_scales (
  element_type TEXT NOT NULL,
  element_width INTEGER NOT NULL,
  element_height INTEGER NOT NULL,
  max_safe_scale REAL NOT NULL,

  -- Metadata
  learned_from TEXT,  -- correction-001
  times_used INTEGER DEFAULT 0,
  last_validated TEXT,

  PRIMARY KEY (element_type, element_width, element_height)
);

CREATE INDEX IF NOT EXISTS idx_element_scales_type ON element_scales(element_type);

-- ===== TRANSITION PREFERENCES TABLE =====
-- Learned transition types between scene types

CREATE TABLE IF NOT EXISTS transition_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_scene_type TEXT NOT NULL,  -- logo, stats, achievements, etc.
  to_scene_type TEXT NOT NULL,
  preferred_transition TEXT NOT NULL,  -- wipe-left, hard-cut, etc.

  -- Context
  energy_level TEXT,  -- high, moderate, low
  content_similarity REAL,  -- 0.0-1.0

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 1.0,
  learned_from TEXT,  -- correction-003

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transitions ON transition_preferences(from_scene_type, to_scene_type);

-- ===== TIMING PREFERENCES TABLE =====
-- Learned timing values (stagger delays, durations, etc.)

CREATE TABLE IF NOT EXISTS timing_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timing_type TEXT NOT NULL,  -- stagger_delay, scene_duration, transition_duration
  context TEXT,  -- code_typing, badge_reveal, etc.

  value_frames INTEGER NOT NULL,
  value_seconds REAL NOT NULL,

  learned_from TEXT,
  times_applied INTEGER DEFAULT 0,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(timing_type, context)
);

-- ===== LAYOUT PATTERNS TABLE =====
-- Learned layout configurations

CREATE TABLE IF NOT EXISTS layout_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern_name TEXT UNIQUE NOT NULL,  -- multi_project_grid_2col
  layout_type TEXT NOT NULL,  -- grid, flex-row, flex-column

  -- Configuration
  element_count INTEGER NOT NULL,
  gap_px INTEGER NOT NULL,
  max_element_width INTEGER,
  max_element_height INTEGER,

  -- When to use
  use_when_item_count_over INTEGER,
  recommended_for TEXT,  -- projects, achievements, features

  learned_from TEXT,
  times_used INTEGER DEFAULT 0,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ===== GENERATION HISTORY TABLE =====
-- Track all generations to calculate success rate

CREATE TABLE IF NOT EXISTS generation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  generation_id TEXT UNIQUE NOT NULL,
  timestamp TEXT NOT NULL,

  -- Request details
  content_type TEXT,  -- github_profile, product_showcase, etc.
  scene_count INTEGER,
  duration_frames INTEGER,

  -- Applied rules
  rules_applied TEXT,  -- JSON array of rule names

  -- Outcome
  had_issues BOOLEAN DEFAULT FALSE,
  issues_found TEXT,  -- JSON array of issues
  user_modified BOOLEAN DEFAULT FALSE,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generation_timestamp ON generation_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_generation_content_type ON generation_history(content_type);

-- ===== MOTION BLUR RULES TABLE =====
-- When to apply motion blur (velocity-based)

CREATE TABLE IF NOT EXISTS motion_blur_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  animation_type TEXT NOT NULL,  -- slide-up, wipe-left, etc.
  min_velocity_threshold REAL NOT NULL,  -- pixels per frame
  blur_amount_px INTEGER NOT NULL,

  apply_during TEXT NOT NULL,  -- entry, exit, both
  never_during TEXT,  -- hold

  learned_from TEXT,
  times_applied INTEGER DEFAULT 0,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(animation_type, apply_during)
);

-- ===== LEARNING METADATA TABLE =====
-- System statistics and health metrics

CREATE TABLE IF NOT EXISTS learning_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,  -- Can be number, string, or JSON
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Initialize metadata
INSERT OR REPLACE INTO learning_metadata (key, value) VALUES
  ('total_corrections', '0'),
  ('total_generations', '0'),
  ('success_rate', '0.0'),
  ('most_common_issue', 'none'),
  ('most_reliable_rule', 'none'),
  ('database_version', '1.0.0');

-- ===== HELPER VIEWS =====

-- View: Most reliable rules
CREATE VIEW IF NOT EXISTS most_reliable_rules AS
SELECT
  rule_name,
  rule_type,
  times_applied,
  success_rate,
  confidence_score
FROM validated_rules
WHERE times_applied > 2
ORDER BY success_rate DESC, confidence_score DESC
LIMIT 20;

-- View: Recent corrections summary
CREATE VIEW IF NOT EXISTS recent_corrections AS
SELECT
  correction_id,
  timestamp,
  issue_type,
  learned_rule,
  confidence
FROM corrections
ORDER BY timestamp DESC
LIMIT 50;

-- View: Element scale lookup (optimized)
CREATE VIEW IF NOT EXISTS element_scale_lookup AS
SELECT
  element_type,
  element_width || 'x' || element_height as size,
  max_safe_scale,
  times_used
FROM element_scales
ORDER BY element_type, element_width, element_height;

/**
 * MIGRATION SCRIPT (when implementing):
 *
 * import Database from 'better-sqlite3';
 * import fs from 'fs';
 *
 * const db = new Database('mcp-learning.db');
 * const schema = fs.readFileSync('database-schema.sql', 'utf-8');
 * db.exec(schema);
 *
 * // Migrate existing JSON
 * const prefs = JSON.parse(fs.readFileSync('preferences/user-preferences.json'));
 *
 * const insertCorrection = db.prepare(`
 *   INSERT INTO corrections (correction_id, timestamp, issue_type, ...)
 *   VALUES (?, ?, ?, ...)
 * `);
 *
 * prefs.corrections.forEach(c => {
 *   insertCorrection.run(c.id, c.timestamp, c.issue_type, ...);
 * });
 */

/**
 * QUERY EXAMPLES (after implementation):
 *
 * // Find max scale for element
 * const scale = db.prepare(`
 *   SELECT max_safe_scale FROM element_scales
 *   WHERE element_type = ? AND element_width = ? AND element_height = ?
 * `).get('code_editor', 1500, 850);
 *
 * // Get transition preference
 * const transition = db.prepare(`
 *   SELECT preferred_transition FROM transition_preferences
 *   WHERE from_scene_type = ? AND to_scene_type = ?
 *   ORDER BY success_rate DESC LIMIT 1
 * `).get('achievements', 'tech_stack');
 *
 * // Find similar past corrections
 * const similar = db.prepare(`
 *   SELECT * FROM corrections
 *   WHERE issue_type = ? AND element_type = ?
 *   ORDER BY timestamp DESC LIMIT 5
 * `).all('crop', 'code_editor');
 */
