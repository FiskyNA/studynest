import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dmkqmvvztxlvrzcruhmt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRta3FtdnZ6dHhsdnJ6Y3J1aG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzI0NDksImV4cCI6MjEwMzI0ODQ0OX0.Vk6OTLoXfT3QDXmWv0IeDMcZphPD6yww12tIcgLeDtY';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
