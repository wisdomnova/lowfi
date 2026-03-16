'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Activity, Radio, Trash2, CheckSquare } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const addToast = useToast((state) => state.addToast);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch('/api/notifications');

        if (!response.ok) throw new Error('Failed to fetch notifications');

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      addToast({
        message: "Notification Deleted",
        description: "Notification has been removed.",
        type: "success"
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const formatTimeShort = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return '00M_AGO';
    if (diffMins < 60) return `${diffMins.toString().padStart(2, '0')}M_AGO`;
    if (diffHours < 24) return `${diffHours.toString().padStart(2, '0')}H_AGO`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase().replace(' ', '_');
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Notification Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-11 h-11 flex items-center justify-center rounded-2xl border-2 transition-all ${
          isOpen 
            ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
        } cursor-pointer`}
      >
        <Bell className={`w-5 h-5 ${isOpen ? 'animate-none' : unreadCount > 0 ? 'animate-[pulse_2s_infinite]' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white items-center justify-center">
              <span className="text-[8px] font-black text-white">{unreadCount}</span>
            </span>
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 bg-white border-2 border-[#E5E7EB] rounded-[2.5rem] shadow-[20px_20px_0px_0px_rgba(31,41,55,0.02)] z-50 overflow-hidden">
          {/* Panel Header */}
          <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1">
                  Notifications
                </h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Recent Updates
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[32rem] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-12 text-center space-y-4">
                <div className="relative inline-block">
                  <Activity className="w-8 h-8 text-slate-200 animate-pulse" />
                  <div className="absolute inset-0 bg-slate-200/20 blur-xl animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 border border-slate-100">
                  <Bell className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">No Notifications</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-slate-50">
                {notifications.map((notif, idx) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif.id);
                      if (notif.actionUrl) window.location.href = notif.actionUrl;
                    }}
                    className={`group relative p-6 transition-all cursor-pointer border-l-4 ${
                      !notif.read ? 'bg-slate-50/50 border-slate-900' : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Indicator */}
                      <div className="relative flex-shrink-0 mt-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(notif.type)} ${!notif.read ? 'animate-pulse' : 'opacity-40'}`} />
                        {!notif.read && (
                          <div className={`absolute inset-0 ${getStatusColor(notif.type)} blur-sm opacity-50 animate-pulse`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Notification {idx.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[9px] font-mono font-black text-slate-300">
                            {formatTimeShort(notif.createdAt)}
                          </span>
                        </div>
                        <h4 className={`text-sm font-black tracking-tight leading-tight uppercase transition-colors ${
                          !notif.read ? 'text-slate-900' : 'text-slate-500'
                        }`}>
                          {notif.title}
                        </h4>
                        {notif.description && (
                          <p className="text-[11px] font-medium text-slate-500 mt-2 leading-relaxed italic line-clamp-2">
                            {notif.description}
                          </p>
                        )}
                      </div>

                      {/* Tactical Actions */}
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel Footer */}
          {notifications.length > 0 && (
            <div className="p-4 bg-slate-50/50 border-t-2 border-slate-100 flex gap-3">
              <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all group">
                <CheckSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Mark All as Read</span>
              </button>
              <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">See All</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
