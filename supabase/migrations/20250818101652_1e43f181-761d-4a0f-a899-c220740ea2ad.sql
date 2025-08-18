-- Force RLS enforcement to ensure complete message security

-- 1. Enable FORCE ROW LEVEL SECURITY (stricter than regular RLS)
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages FORCE ROW LEVEL SECURITY;