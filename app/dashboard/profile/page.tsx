'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/Skeleton';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const addToast = useToast((state) => state.addToast);
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch('/api/profile');

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setProfile(data);
        setFormData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        addToast({
          message: 'Failed to load profile',
          type: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, addToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? ({
      ...prev,
      [name]: value,
    }) : null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!user || !formData) throw new Error('No session or form data');

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          phone: formData.phone,
          location: formData.location,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
      addToast({
        message: 'Profile updated successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      addToast({
        message: error instanceof Error ? error.message : 'Failed to update profile',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-10 space-y-12">
           <div className="flex justify-between items-end border-b border-[#1F2937]/5 pb-8 mb-10">
              <div className="space-y-4">
                 <Skeleton className="h-10 w-48" />
                 <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-12 w-32 rounded-2xl" />
           </div>

           <div className="bg-white border border-[#1F2937]/5 rounded-[3rem] p-12 space-y-10 animate-pulse">
              <div className="flex items-center gap-8">
                 <Skeleton className="w-32 h-32 rounded-[2.5rem]" />
                 <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-12 pt-10 border-t border-[#1F2937]/5">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Skeleton className="h-3 w-24" />
                       <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2">
                       <Skeleton className="h-3 w-24" />
                       <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Skeleton className="h-3 w-24" />
                       <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2">
                       <Skeleton className="h-3 w-24" />
                       <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1F2937]/5 pb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">
              Profile
            </h1>
            <p className="text-[#1F2937]/50 font-medium mt-1">
              Manage your account settings and preferences.
            </p>
          </div>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant="ghost"
            size="lg"
            className="h-12 px-6"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Side: Identity Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white border border-[#1F2937]/5 rounded-[2.5rem] p-10 shadow-sm text-center relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-1 bg-[#1F2937]/5" />
               <div className="w-24 h-24 bg-[#1F2937] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#1F2937]/10">
                  <span className="text-3xl font-bold text-white uppercase">{profile?.name.charAt(0)}</span>
               </div>
               <h2 className="text-xl font-bold text-[#1F2937] mb-1">{profile?.name}</h2>
               <p className="text-[10px] font-bold text-[#1F2937]/30 uppercase tracking-[0.2em] mb-6">{profile?.company || 'Not set'}</p>
               
               <div className="pt-6 border-t border-[#1F2937]/5 space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#1F2937]/40">
                     <span>Member Since</span>
                     <span className="text-[#1F2937]">{formatDate(profile?.created_at || '')}</span>
                  </div>
               </div>
            </div>

            <div className="bg-[#1F2937] rounded-[2rem] p-8 text-white">
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Security</h3>
               <p className="text-xs font-medium leading-relaxed text-white/60 mb-6">
                 All account changes are logged for security purposes.
               </p>
               <button disabled className="text-[10px] font-bold uppercase tracking-widest text-white/50 border-b border-white/20 pb-1 cursor-not-allowed opacity-50" title="Coming soon">Enable 2FA</button>
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#1F2937]/5 rounded-[2.5rem] p-12 shadow-sm">
              {isEditing && formData ? (
                <div className="space-y-10">
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 ml-1">Name</label>
                         <input 
                           name="name"
                           value={formData.name}
                           onChange={handleInputChange}
                           className="w-full h-12 px-5 bg-[#FAFAF8] border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937] focus:ring-1 focus:ring-[#1F2937]/20 outline-none cursor-pointer"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 ml-1">Email</label>
                         <input 
                           disabled
                           value={formData.email}
                           className="w-full h-12 px-5 bg-[#FAFAF8]/50 border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937]/30 outline-none cursor-not-allowed"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 ml-1">Company</label>
                         <input 
                           name="company"
                           value={formData.company || ''}
                           onChange={handleInputChange}
                           className="w-full h-12 px-5 bg-[#FAFAF8] border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937] focus:ring-1 focus:ring-[#1F2937]/20 outline-none cursor-pointer"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 ml-1">Phone</label>
                         <input 
                           name="phone"
                           value={formData.phone || ''}
                           onChange={handleInputChange}
                           className="w-full h-12 px-5 bg-[#FAFAF8] border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937] focus:ring-1 focus:ring-[#1F2937]/20 outline-none cursor-pointer"
                         />
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/40 ml-1">Location</label>
                      <input 
                           name="location"
                           value={formData.location || ''}
                           onChange={handleInputChange}
                           className="w-full h-12 px-5 bg-[#FAFAF8] border border-[#1F2937]/5 rounded-xl text-sm font-bold text-[#1F2937] focus:ring-1 focus:ring-[#1F2937]/20 outline-none cursor-pointer"
                      />
                   </div>

                   <div className="pt-8 border-t border-[#1F2937]/5">
                      <Button 
                        onClick={handleSave}
                        isLoading={isSaving}
                        size="lg"
                        className="h-12 w-full md:w-auto"
                      >
                        Save Profile
                      </Button>
                   </div>
                </div>
              ) : (
                <div className="space-y-12">
                   <div className="grid md:grid-cols-2 gap-y-12 gap-x-8">
                      <div>
                         <p className="text-[10px] uppercase font-bold tracking-widest text-[#1F2937]/30 mb-2">Name</p>
                         <p className="text-lg font-bold text-[#1F2937]">{profile?.name}</p>
                      </div>
                      <div>
                         <p className="text-[10px] uppercase font-bold tracking-widest text-[#1F2937]/30 mb-2">Email</p>
                         <p className="text-lg font-bold text-[#1F2937]">{profile?.email}</p>
                      </div>
                      <div>
                         <p className="text-[10px] uppercase font-bold tracking-widest text-[#1F2937]/30 mb-2">Company</p>
                         <p className="text-lg font-bold text-[#1F2937]">{profile?.company || 'Not set'}</p>
                      </div>
                      <div>
                         <p className="text-[10px] uppercase font-bold tracking-widest text-[#1F2937]/30 mb-2">Phone</p>
                         <p className="text-lg font-bold text-[#1F2937]">{profile?.phone || 'Not set'}</p>
                      </div>
                   </div>
                   
                   <div className="pt-12 border-t border-[#1F2937]/5">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#1F2937]/30 mb-2">Location</p>
                      <p className="text-lg font-bold text-[#1F2937]">{profile?.location || 'Not set'}</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
