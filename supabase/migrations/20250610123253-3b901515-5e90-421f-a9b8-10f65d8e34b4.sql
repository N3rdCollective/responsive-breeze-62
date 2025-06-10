
-- Fix Function Search Path Security Issues (Corrected Version)
-- This resolves all 17 "Function Search Path Mutable" warnings by setting secure search paths

-- Set secure search path for all affected functions
-- Using empty search_path ('') forces functions to use fully qualified names

ALTER FUNCTION public.update_content_reports_updated_at() SET search_path = '';
ALTER FUNCTION public.update_homepage_content_updated_at() SET search_path = '';
ALTER FUNCTION public.update_user_messages_updated_at() SET search_path = '';
ALTER FUNCTION public.update_profile_forum_post_count() SET search_path = '';
ALTER FUNCTION public.get_post_page_and_index(uuid, uuid, integer) SET search_path = '';
ALTER FUNCTION public.audit_sensitive_operation() SET search_path = '';
ALTER FUNCTION public.handle_new_staff_member() SET search_path = '';
ALTER FUNCTION public.get_conversations_with_unread_status(uuid) SET search_path = '';
ALTER FUNCTION public.check_staff_admin_role(uuid) SET search_path = '';
ALTER FUNCTION public.update_modified_column() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.staff_has_role(uuid, text[]) SET search_path = '';
ALTER FUNCTION public.create_activity_log(uuid, text, text, text, uuid, jsonb, text) SET search_path = '';
ALTER FUNCTION public.update_topic_last_post() SET search_path = '';
ALTER FUNCTION public.increment_topic_view_count(uuid) SET search_path = '';
ALTER FUNCTION public.update_poll_option_vote_count() SET search_path = '';
ALTER FUNCTION public.get_content_reports_with_details() SET search_path = '';

-- Also secure the critical permission functions for completeness
ALTER FUNCTION public.staff_has_permission(uuid, text) SET search_path = '';
ALTER FUNCTION public.validate_staff_action(uuid, text, text, uuid) SET search_path = '';

-- Additional security functions
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.get_analytics_summary(timestamp with time zone, timestamp with time zone) SET search_path = '';
