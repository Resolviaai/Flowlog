-- Run this in your Supabase SQL Editor to allow workspaces to be created by clients without an editor initially

ALTER TABLE public.workspaces ALTER COLUMN editor_id DROP NOT NULL;
