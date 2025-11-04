-- Add unique constraint for project names per user
ALTER TABLE public.projects
ADD CONSTRAINT unique_project_name_per_user UNIQUE (user_id, name);

-- Add unique constraint for scenario names per project
ALTER TABLE public.scenarios
ADD CONSTRAINT unique_scenario_name_per_project UNIQUE (project_id, name);