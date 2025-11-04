-- Add UPDATE policies for scenario_inputs and scenario_outputs
-- This allows users to update their existing scenario data

-- Policy for scenario_inputs UPDATE
CREATE POLICY "Users can update inputs for their scenarios"
ON public.scenario_inputs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM scenarios s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = scenario_inputs.scenario_id
    AND p.user_id = auth.uid()
  )
);

-- Policy for scenario_outputs UPDATE
CREATE POLICY "Users can update outputs for their scenarios"
ON public.scenario_outputs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM scenarios s
    JOIN projects p ON s.project_id = p.id
    WHERE s.id = scenario_outputs.scenario_id
    AND p.user_id = auth.uid()
  )
);