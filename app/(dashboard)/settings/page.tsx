'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Shield, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', university: '', major: '', year_of_study: '' });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile({ full_name: data.full_name || '', university: data.university || '', major: data.major || '', year_of_study: data.year_of_study?.toString() || '' });
    setLoading(false);
  }

  async function saveProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ full_name: profile.full_name, university: profile.university, major: profile.major, year_of_study: profile.year_of_study ? parseInt(profile.year_of_study) : null }).eq('id', user.id);
    if (error) toast.error('Failed'); else toast.success('Saved!');
  }

  async function handleLogout() { await supabase.auth.signOut(); window.location.href = '/login'; }

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-gray-200 bg-white px-6 py-4"><h1 className="text-2xl font-bold">Settings</h1></div>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4"><User className="w-5 h-5 text-gray-400" /><h2 className="font-semibold">Profile</h2></div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">University</label><input type="text" value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Major</label><input type="text" value={profile.major} onChange={(e) => setProfile({ ...profile, major: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><select value={profile.year_of_study} onChange={(e) => setProfile({ ...profile, year_of_study: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"><option value="">Select</option><option value="1">Freshman</option><option value="2">Sophomore</option><option value="3">Junior</option><option value="4">Senior</option></select></div>
            </div>
            <button onClick={saveProfile} className="bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700">Save Profile</button>
          </div>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-red-400" /><h2 className="font-semibold text-red-600">Danger Zone</h2></div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50"><LogOut className="w-4 h-4" />Log Out</button>
        </div>
      </div>
    </div>
  );
}
