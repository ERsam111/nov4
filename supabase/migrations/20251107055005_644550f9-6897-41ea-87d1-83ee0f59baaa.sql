-- Create table for GFA chat messages
CREATE TABLE public.gfa_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gfa_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own chat messages"
ON public.gfa_chat_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat messages"
ON public.gfa_chat_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
ON public.gfa_chat_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for faster queries
CREATE INDEX idx_gfa_chat_messages_user_id ON public.gfa_chat_messages(user_id);
CREATE INDEX idx_gfa_chat_messages_scenario_id ON public.gfa_chat_messages(scenario_id);
CREATE INDEX idx_gfa_chat_messages_created_at ON public.gfa_chat_messages(created_at);