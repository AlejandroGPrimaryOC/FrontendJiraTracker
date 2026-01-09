/*
  # Create Deployments Table for Jira Wallboard

  1. New Tables
    - `deployments`
      - `id` (uuid, primary key) - Unique identifier
      - `ticket_id` (text, not null) - Jira ticket ID (e.g., PROJ-123)
      - `version` (text, not null) - Semantic version (e.g., 1.2.3-alpha.1)
      - `stage` (text, not null) - Deployment stage: develop, testing, or uat
      - `release_date` (timestamptz, not null) - When the deployment was released
      - `description` (text, not null) - Jira ticket title/description
      - `owner` (text, not null) - Person responsible for the deployment
      - `status` (text, default 'active') - Deployment status: active, failed, rolled-back
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Indexes
    - Index on ticket_id for fast lookups
    - Index on stage for filtering by deployment stage
    - Index on release_date for sorting

  3. Security
    - Enable RLS on `deployments` table
    - Add policy for public read access (wallboard is typically viewable by team)
    - Add policy for authenticated users to insert/update deployments
*/

CREATE TABLE IF NOT EXISTS deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text NOT NULL,
  version text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('develop', 'testing', 'uat')),
  release_date timestamptz NOT NULL,
  description text NOT NULL,
  owner text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'in-progress', 'failed', 'rolled-back')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deployments_ticket_id ON deployments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_deployments_stage ON deployments(stage);
CREATE INDEX IF NOT EXISTS idx_deployments_release_date ON deployments(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view deployments"
  ON deployments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert deployments"
  ON deployments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update deployments"
  ON deployments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete deployments"
  ON deployments FOR DELETE
  TO authenticated
  USING (true);