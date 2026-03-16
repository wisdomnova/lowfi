'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import InviteModal from './InviteModal';
import { useToast } from '@/lib/toast';
import EmptyState from '@/components/EmptyState';
import { Skeleton, TableSkeleton } from '@/components/Skeleton';
import { Users, UserPlus, Mail, CheckCircle, Clock, X, ArrowUpRight} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  avatar_url?: string;
}

function StatCard({ title, value, icon: Icon, trend, isUp, description }: any) {
  return (
    <Card className="border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-8 hover:border-[#1F2937] transition-all duration-300 group">
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E7EB] text-[#1F2937] transition-colors group-hover:bg-[#1F2937] group-hover:text-white group-hover:border-[#1F2937]">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          {trend}
        </div>
      </div>
      <div className="mt-8">
        <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] leading-none mb-3">{title}</p>
        <h3 className="text-4xl font-bold text-[#1F2937] leading-none mb-3 tracking-tight">{value}</h3>
        <p className="text-xs text-[#6B7280] font-medium">{description}</p>
      </div>
    </Card>
  );
}

export default function TeamPage() {
  const addToast = useToast((state) => state.addToast);
  const { user } = useAuth();
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Fetch team members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch('/api/team');

        if (!response.ok) throw new Error('Failed to fetch team members');

        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching team members:', error);
        addToast({
          message: 'Failed to load team members',
          type: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user, addToast]);

  const handleInvite = async (email: string, role: string) => {
    setIsInviting(true);
    try {
      if (!user) throw new Error('No session');

      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite member');
      }

      const newMember = await response.json();
      setMembers((prev) => [...prev, newMember]);
      setShowInviteModal(false);
      
      addToast({
        message: `Invite sent to ${email}`,
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error inviting member:', error);
      addToast({
        message: error instanceof Error ? error.message : 'Failed to send invite',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      if (!user) throw new Error('No session');

      const response = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove member');

      setMembers((prev) => prev.filter((m) => m.id !== id));
      addToast({
        message: 'Member removed from team',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error removing member:', error);
      addToast({
        message: 'Failed to remove member',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      if (!user) throw new Error('No session');

      const response = await fetch(`/api/team/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      const updatedMember = await response.json();
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? updatedMember : m))
      );
      addToast({
        message: 'Member role updated',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      addToast({
        message: 'Failed to update role',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'manager':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const activeMemberCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-10"> 
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#1F2937]/5 pb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1F2937] tracking-tight">
              Team Members 
            </h1>
            <p className="text-[#1F2937]/50 font-medium mt-1">
              Manage your team members and their access levels.
            </p>
          </div>
          <Button 
            onClick={() => setShowInviteModal(true)}
            size="lg"
            className="h-12 px-8"
          >
            Invite Team Member
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Capacity" 
            value={members.length} 
            icon={Users} 
            trend="Active" 
            isUp={true} 
            description="seats used"
          />
          <StatCard 
            title="Active Members" 
            value={activeMemberCount} 
            icon={CheckCircle} 
            trend="Live" 
            isUp={true} 
            description="operational"
          />
          <StatCard 
            title="Pending Invites" 
            value={pendingCount} 
            icon={Mail} 
            trend="Awaiting" 
            isUp={false} 
            description="invitations"
          />
        </div>

        {/* Team List Table */}
        <div className="bg-white rounded-[2rem] border border-[#1F2937]/5 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1F2937]/5">
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/30">Member</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/30">Role</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/30">Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/30">Joined</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/30 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48 opacity-50" />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-8 py-6">
                        <Skeleton className="h-4 w-24 rounded-full" />
                      </td>
                      <td className="px-8 py-6">
                        <Skeleton className="h-3 w-24" />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Skeleton className="h-8 w-16 ml-auto rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <div className="bg-[#FAFAF8] rounded-b-[2rem]">
                        <EmptyState 
                          size="sm"
                          title="No Team Members"
                          description="Invite your first team member to start collaborating."
                          icon={Users}
                          action={{
                            label: "Invite Member",
                            onClick: () => setShowInviteModal(true)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="group hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#1F2937] text-white flex items-center justify-center font-bold text-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1F2937]">{member.name}</p>
                            <p className="text-xs text-[#1F2937]/40 font-medium">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                            className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-[#1F2937] appearance-none cursor-pointer focus:outline-none"
                          >
                            <option value="member">Member</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Director</option>
                          </select>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${
                             member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                           }`} />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/60">
                             {member.status}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs text-[#1F2937]/50 font-medium font-mono">
                        {formatDate(member.joined_at)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#1F2937]/30 hover:text-red-500 transition-colors"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles & Permissions Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              role: 'Director',
              description: 'Full administrative access.',
              permissions: ['Full System Access', 'Configuration', 'Team Management', 'Data Access'],
              dark: true
            },
            {
              role: 'Manager',
              description: 'Management access.',
              permissions: ['View Team Data', 'Invite Members', 'Generate Reports'],
              dark: false
            },
            {
              role: 'Member',
              description: 'Limited access.',
              permissions: ['My Dashboard', 'Complete Tasks', 'Basic Features'],
              dark: false
            }
          ].map((item) => (
            <div key={item.role} className={`p-8 rounded-[2rem] border ${item.dark ? 'bg-[#1F2937] text-white border-[#1F2937]' : 'bg-white border-[#1F2937]/5'}`}>
               <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${item.dark ? 'text-white/40' : 'text-[#1F2937]/40'}`}>{item.role} Role</h3>
               <p className={`text-sm font-bold mb-8 ${item.dark ? 'text-white' : 'text-[#1F2937]'}`}>{item.description}</p>
               <div className="space-y-3">
                  {item.permissions.map(p => (
                    <div key={p} className="flex items-center gap-3">
                       <div className={`w-1 h-1 rounded-full ${item.dark ? 'bg-white/20' : 'bg-[#1F2937]/20'}`} />
                       <span className={`text-[11px] font-medium ${item.dark ? 'text-white/60' : 'text-[#1F2937]/60'}`}>{p}</span>
                    </div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        isLoading={isInviting}
      />
    </DashboardLayout>
  );
}
