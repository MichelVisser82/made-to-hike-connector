-- Fix security vulnerability: Remove public access to profiles table
-- Replace the overly permissive policy with a user-specific one

-- Drop the existing public policy
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Create a new policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);