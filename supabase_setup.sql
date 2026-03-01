-- Run this in your Supabase SQL Editor to enable secure invite acceptance

-- Function to accept an invite securely (Bypasses RLS for the workspace update)
create or replace function accept_workspace_invite(invite_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  invite_record record;
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  -- 1. Get the invite
  select * into invite_record
  from public.workspace_invites
  where id = invite_id;

  if not found then
    raise exception 'Invite not found';
  end if;

  if invite_record.status <> 'pending' then
    raise exception 'Invite is no longer pending';
  end if;

  -- 2. Update the workspace
  if invite_record.invited_role = 'client' then
    update public.workspaces
    set client_id = current_user_id,
        updated_at = now()
    where id = invite_record.workspace_id;
  else
    update public.workspaces
    set editor_id = current_user_id,
        updated_at = now()
    where id = invite_record.workspace_id;
  end if;

  -- 3. Update the invite status
  update public.workspace_invites
  set status = 'accepted'
  where id = invite_id;
end;
$$;
