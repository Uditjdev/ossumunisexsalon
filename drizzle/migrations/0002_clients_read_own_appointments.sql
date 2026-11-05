GRANT SELECT ON public.appointments TO authenticated;
CREATE POLICY "Clients read own appointments by verified email" ON public.appointments
FOR SELECT TO authenticated
USING (lower(customer_email) = lower(coalesce(auth.jwt()->>'email','')) AND coalesce((auth.jwt()->>'email_verified')::boolean, auth.jwt()->'user_metadata'->>'email_verified' = 'true', true));