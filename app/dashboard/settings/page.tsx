'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from "@/components/Skeleton";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/lib/toast';
import { 
  Check,
  Save,
  Globe,
  Plus,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  ShieldOff
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Settings {
  email_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly';
  marketing_emails: boolean;
  product_updates: boolean;
}

interface Domain {
  id: string;
  domain: string;
  isVerified: boolean;
  spfStatus: string;
  dkimStatus: string;
  dmarcStatus: string;
  lastCheckedAt: string | null;
}

interface BlacklistEntry {
  id: string;
  email: string;
  reason: string;
  createdAt: string;
}

export default function SettingsPage() {
  const addToast = useToast((state) => state.addToast);
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<Settings>({
    email_notifications: true,
    notification_frequency: 'daily',
    marketing_emails: false,
    product_updates: true,
  });

  const [domains, setDomains] = useState<Domain[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newBlacklistEmail, setNewBlacklistEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'compliance'>('profile');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [isAddingBlacklist, setIsAddingBlacklist] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const [settingsRes, domainsRes, blacklistRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/settings/domains/verify'),
          fetch('/api/settings/blacklist')
        ]);

        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (domainsRes.ok) setDomains(await domainsRes.json());
        if (blacklistRes.ok) setBlacklist(await blacklistRes.json());
      } catch (error) {
        console.error('Error fetching settings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  const handleDomainVerify = async (domainToVerify: string) => {
    if (!domainToVerify || !user) return;
    setIsVerifyingDomain(true);
    try {
      const response = await fetch('/api/settings/domains/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domainToVerify }),
      });

      if (!response.ok) throw new Error('Failed to verify domain');
      
      const updatedDomain = await response.json();
      setDomains(prev => {
        const index = prev.findIndex(d => d.domain === updatedDomain.domain);
        if (index > -1) {
          const newDomains = [...prev];
          newDomains[index] = updatedDomain;
          return newDomains;
        }
        return [updatedDomain, ...prev];
      });
      setNewDomain('');
      addToast({
        message: updatedDomain.isVerified ? 'Domain verified successfully' : 'Domain DNS records are still pending',
        type: updatedDomain.isVerified ? 'success' : 'warning',
      });
    } catch (error) {
      addToast({ message: 'Error verifying domain', type: 'error' });
    } finally {
      setIsVerifyingDomain(false);
    }
  };

  const handleDeleteDomain = async (domain: string) => {
    if (!user) return;
    try {
      await fetch('/api/settings/domains/verify', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });
      setDomains(prev => prev.filter(d => d.domain !== domain));
    } catch (error) {
      addToast({ message: 'Failed to delete domain', type: 'error' });
    }
  };

  const handleAddBlacklist = async () => {
    if (!newBlacklistEmail || !user) return;
    setIsAddingBlacklist(true);
    try {
      const response = await fetch('/api/settings/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newBlacklistEmail }),
      });
      if (!response.ok) throw new Error('Failed to add to blacklist');
      const newEntry = await response.json();
      setBlacklist(prev => [newEntry, ...prev]);
      setNewBlacklistEmail('');
      addToast({ message: 'Email added to global blacklist', type: 'success' });
    } catch (error) {
      addToast({ message: 'Error adding email', type: 'error' });
    } finally {
      setIsAddingBlacklist(false);
    }
  };

  const handleRemoveBlacklist = async (email: string) => {
    if (!user) return;
    try {
      await fetch('/api/settings/blacklist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      setBlacklist(prev => prev.filter(e => e.email !== email));
    } catch (error) {
      addToast({ message: 'Failed to remove from blacklist', type: 'error' });
    }
  };

  const handleToggle = (key: keyof Settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
  };

  const handleSelectChange = (
    key: keyof Settings,
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!user) throw new Error('No session');

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      addToast({
        message: 'Settings saved successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast({
        message: 'Failed to save settings',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${
        enabled ? 'bg-[#1F2937]' : 'bg-[#E5E7EB]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">Settings</h1>
            <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 border border-[#E5E7EB] rounded-2xl w-fit">
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                General
              </button>
              <button 
                onClick={() => setActiveTab('notifications')} 
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                  activeTab === 'notifications' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Notifications
              </button>
              <button 
                onClick={() => setActiveTab('compliance')} 
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                  activeTab === 'compliance' ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                Compliance & Teams
              </button>
            </div>
          </div>
          {activeTab !== 'compliance' && (
            <Button 
              onClick={handleSave} 
              isLoading={isSaving}
              size="lg"
              className="h-12 px-8"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          )}
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <div className="xl:col-span-12 space-y-10">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {[1, 2].map(i => (
                       <div key={i} className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-10 animate-pulse">
                          <div className="flex items-center gap-6 mb-10">
                             <Skeleton className="w-16 h-16 rounded-2xl" />
                             <div className="space-y-3">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-8 w-48" />
                             </div>
                          </div>
                          <div className="space-y-6">
                             <Skeleton className="h-14 w-full rounded-2xl" />
                             <div className="space-y-4">
                                {[1, 2, 3].map(j => (
                                   <div key={j} className="flex justify-between items-center p-6 bg-[#FAFAF8] rounded-2xl">
                                      <Skeleton className="h-4 w-32" />
                                      <Skeleton className="h-6 w-20 rounded-full" />
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {activeTab === 'compliance' ? (
              <div className="xl:col-span-12 space-y-10">
                {/* DNS Domain Health SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <Card className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-10 shadow-[8px_8px_0px_0px_#FAFAF8] relative overflow-hidden">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-16 h-16 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl flex items-center justify-center rotate-[-2deg]">
                        <Globe className="w-8 h-8 text-[#1F2937]" />
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.2em] mb-1">Deliverability</h2>
                        <h3 className="text-2xl font-bold text-[#1F2937]">Domain DNS Health</h3>
                        <p className="text-[#6B7280] text-sm">Verify SPF, DKIM, and DMARC records to hit the inbox.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <Input 
                          placeholder="yourdomain.com"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          className="flex-1 h-14 bg-[#FAFAF8] border-[#E5E7EB] rounded-2xl px-6 focus:ring-0 focus:border-[#1F2937] transition-all"
                        />
                        <Button
                          onClick={() => handleDomainVerify(newDomain)}
                          disabled={isVerifyingDomain || !newDomain}
                          className="h-14 px-8 bg-[#1F2937] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
                        >
                          {isVerifyingDomain ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                          Add & Verify
                        </Button>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                        {domains.length === 0 ? (
                          <div className="text-center py-12 bg-[#FAFAF8] border-2 border-dashed border-[#E5E7EB] rounded-3xl">
                            <ShieldCheck className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
                            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">No domains verified yet</p>
                          </div>
                        ) : domains.map(domain => (
                          <div key={domain.id} className="p-8 bg-[#FAFAF8] border border-[#E5E7EB] rounded-3xl space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${domain.isVerified ? 'bg-[#10B981]' : 'bg-[#EF4444]'} animate-pulse`} />
                                <span className="text-lg font-bold text-[#1F2937]">{domain.domain}</span>
                              </div>
                              <button onClick={() => handleDeleteDomain(domain.domain)} className="p-3 text-[#EF4444] hover:bg-[#FEE2E2] rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              {['spf', 'dkim', 'dmarc'].map(type => {
                                const status = (domain as any)[`${type}Status`];
                                return (
                                  <div key={type} className="p-4 bg-white border border-[#E5E7EB] rounded-2xl">
                                    <p className="text-[8px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-2">{type}</p>
                                    <div className="flex items-center gap-2">
                                      {status === 'active' ? <Check className="w-3 h-3 text-[#10B981]" /> : <AlertTriangle className="w-3 h-3 text-[#EF4444]" />}
                                      <span className={`text-[10px] font-bold uppercase tracking-widest ${status === 'active' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{status}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <Button 
                              onClick={() => handleDomainVerify(domain.domain)}
                              className="w-full h-10 bg-white border border-[#E5E7EB] text-[#1F2937] rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-gray-50"
                            >
                              Refresh Health Check
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Global Blacklist / DNC SECTION */}
                  <Card className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-10 shadow-[8px_8px_0px_0px_#FAFAF8] relative overflow-hidden">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-16 h-16 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl flex items-center justify-center rotate-[2deg]">
                        <ShieldOff className="w-8 h-8 text-[#1F2937]" />
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.2em] mb-1">Company Protection</h2>
                        <h3 className="text-2xl font-bold text-[#1F2937]">Global DNC List</h3>
                        <p className="text-[#6B7280] text-sm">Block these emails company-wide across all campaigns.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <Input 
                          placeholder="email@example.com"
                          value={newBlacklistEmail}
                          onChange={(e) => setNewBlacklistEmail(e.target.value)}
                          className="flex-1 h-14 bg-[#FAFAF8] border-[#E5E7EB] rounded-2xl px-6 focus:ring-0 focus:border-[#1F2937] transition-all"
                        />
                        <Button
                          onClick={handleAddBlacklist}
                          disabled={isAddingBlacklist || !newBlacklistEmail}
                          className="h-14 px-8 bg-[#1F2937] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
                        >
                          {isAddingBlacklist ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                          Blacklist
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                        {blacklist.length === 0 ? (
                           <div className="text-center py-12 bg-[#FAFAF8] border-2 border-dashed border-[#E5E7EB] rounded-3xl">
                             <ShieldCheck className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
                             <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">DNC list is currently empty</p>
                           </div>
                        ) : blacklist.map(entry => (
                          <div key={entry.id} className="flex items-center justify-between p-6 bg-[#FAFAF8] border border-[#E5E7EB] rounded-2xl group hover:border-[#1F2937] transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center font-bold text-[#1F2937]">
                                  {entry.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-[#1F2937]">{entry.email}</p>
                                   <p className="text-[8px] text-[#9CA3AF] font-black uppercase tracking-widest">Added {new Date(entry.createdAt).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <button onClick={() => handleRemoveBlacklist(entry.email)} className="p-3 text-[#9CA3AF] hover:text-[#EF4444] transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="xl:col-span-8 space-y-8">
                {/* Communications Segment */}
                <Card className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-10 shadow-[8px_8px_0px_0px_#FAFAF8] overflow-hidden relative">
                  {/* ... Existing content ... */}


                <div className="space-y-6">
                   <div className="flex items-center justify-between p-8 bg-[#FAFAF8] border border-[#E5E7EB] rounded-3xl">
                      <div>
                         <p className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.2em] mb-1">Status: {settings.email_notifications ? 'Enabled' : 'Disabled'}</p>
                         <p className="text-lg font-bold text-[#1F2937]">Email Notifications</p>
                         <p className="text-xs text-[#6B7280] mt-1">Receive notifications about your account and activities.</p>
                      </div>
                      <ToggleSwitch
                        enabled={settings.email_notifications}
                        onChange={() => handleToggle('email_notifications')}
                      />
                   </div>

                   {settings.email_notifications && (
                     <div className="space-y-4 p-8 border border-[#E5E7EB] bg-white rounded-3xl">
                        <label className="block text-[10px] font-black text-[#1F2937] uppercase tracking-[0.2em] mb-4">Notification Frequency</label>
                        <div className="grid grid-cols-3 gap-4">
                           {(['immediate', 'daily', 'weekly'] as const).map((freq) => (
                             <button
                               key={freq}
                               onClick={() => handleSelectChange('notification_frequency', freq)}
                               className={`h-12 flex items-center justify-center rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                                 settings.notification_frequency === freq
                                   ? 'bg-[#1F2937] border-[#1F2937] text-white shadow-lg'
                                   : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#1F2937]/20'
                               }`}
                             >
                               {freq === 'immediate' ? 'Instant' : freq === 'daily' ? 'Daily' : 'Weekly'}
                             </button>
                           ))}
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="p-8 bg-white border border-[#E5E7EB] rounded-3xl hover:border-[#1F2937]/20 transition-all">
                        <div className="flex items-center justify-between mb-4">
                           <p className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.2em]">Product Updates</p>
                           <ToggleSwitch
                             enabled={settings.product_updates}
                             onChange={() => handleToggle('product_updates')}
                           />
                        </div>
                        <p className="text-sm font-bold text-[#1F2937] mb-1">New Features & Updates</p>
                        <p className="text-xs text-[#6B7280]">Learn about new features and improvements to our platform.</p>
                      </div>

                      <div className="p-8 bg-white border border-[#E5E7EB] rounded-3xl hover:border-[#1F2937]/20 transition-all">
                        <div className="flex items-center justify-between mb-4">
                           <p className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.2em]">Marketing Emails</p>
                           <ToggleSwitch
                             enabled={settings.marketing_emails}
                             onChange={() => handleToggle('marketing_emails')}
                           />
                        </div>
                        <p className="text-sm font-bold text-[#1F2937] mb-1">Tips & Best Practices</p>
                        <p className="text-xs text-[#6B7280]">Get tips, best practices, and special offers.</p>
                      </div>
                   </div>
                </div>
              </Card>
            </div>
            )}

            <div className="xl:col-span-4 space-y-8">
               <div className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-[2.5rem] p-10 shadow-[8px_8px_0px_0px_#1F2937]">
                  <h3 className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.2em] mb-6">Account Security</h3>
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-[#1F2937]">Data Protection</span>
                           <span className="text-xs font-mono font-bold text-emerald-600">Active</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99%' }} />
                        </div>
                     </div>
                     <p className="text-xs text-[#6B7280] leading-relaxed">
                        Your account data is automatically encrypted and backed up across secure servers to ensure maximum protection.
                     </p>
                     <div className="pt-6 border-t border-[#E5E7EB]">
                        <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] mb-1">Email Address</p>
                        <p className="text-sm font-mono font-bold text-[#1F2937] truncate">{user?.email}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
