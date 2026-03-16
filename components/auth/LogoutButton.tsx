"use client";

import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  sidebarOpen?: boolean;
  onLogoutClick: () => void;
}

export default function LogoutButton({ sidebarOpen = true, onLogoutClick }: LogoutButtonProps) {
  return (
    <button
      onClick={onLogoutClick}
      className={`mt-4 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 text-sm font-medium transition-all ${
        !sidebarOpen ? "justify-center px-0" : ""
      }`}
      title={!sidebarOpen ? "Logout" : undefined}
    >
      <LogOut className="w-5 h-5 flex-shrink-0" />
      {sidebarOpen && <span>Logout</span>}
    </button>
  );
}
