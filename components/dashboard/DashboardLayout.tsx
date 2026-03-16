"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight,
  Layout,
  FileText,
  Mail,
  Ticket,
  Send,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Search,
  CreditCard,
  Bell
} from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationsDropdown from "./NotificationsDropdown";
import LogoutButton from "@/components/auth/LogoutButton";
import { LogoutModal } from "@/components/modals/LogoutModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push("/auth/signin");
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: Layout },
    { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
    { label: "Follow-ups", href: "/dashboard/followups", icon: Mail },
    { label: "Campaigns", href: "/dashboard/campaigns", icon: Send },
    { label: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { label: "Team", href: "/dashboard/team", icon: Users },
    { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  ];

  const bottomItems = [
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-[#FAFAF8] overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative flex flex-col bg-[#1F2937] transition-all duration-300 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          {sidebarOpen && (
            <Link href="/" className="inline-flex items-center gap-2 cursor-pointer transition-transform hover:rotate-3 group">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-lowfi-slate-dark rounded-[2px]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">LowFi</span>
            </Link>
          )}
          {!sidebarOpen && (
            <Link href="/" className="inline-flex items-center gap-2 cursor-pointer transition-transform hover:rotate-3 group">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-lowfi-slate-dark rounded-[2px]" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
          <nav className="space-y-1">
            {sidebarOpen && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-4">Operations</p>}
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium leading-none ${
                  isActive(item.href)
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? "text-white" : "text-gray-400"}`} />
                {sidebarOpen && <span className="text-white">{item.label}</span>}
              </Link>
            ))}
          </nav>

          <nav className="space-y-1">
            {sidebarOpen && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-4">Account</p>}
            {bottomItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium leading-none ${
                  isActive(item.href)
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? "text-white" : "text-gray-400"}`} />
                {sidebarOpen && <span className="text-white">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/5">
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
              isActive("/dashboard/profile") ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white ring-1 ring-white/20">
              <span className="text-sm font-bold">U</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">User Account</p>
                <p className="text-xs text-gray-500 truncate">Pro Member</p>
              </div>
            )}
          </Link>
          <LogoutButton 
            sidebarOpen={sidebarOpen} 
            onLogoutClick={() => setIsLogoutModalOpen(true)} 
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAF8]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-[#1F2937]" />
            </button>
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white border border-[#E5E7EB] rounded-2xl w-[520px] h-12 transition-all focus-within:border-[#1F2937] group relative">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 group-focus-within:bg-[#1F2937] group-focus-within:text-white transition-all">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Quick search ..."
                className="flex-1 bg-transparent border-none p-0 text-[11px] font-black focus:ring-0 focus:outline-none placeholder:text-slate-300"
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-[#FAFAF8] border border-[#E5E7EB] rounded-lg group-focus-within:opacity-0 transition-opacity">
                 <span className="text-[9px] font-black text-slate-400">⌘</span>
                 <span className="text-[9px] font-black text-slate-400 tracking-tighter">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationsDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogout}
      />
    </div>
  );
}
