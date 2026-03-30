import { Outlet, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Search, Bell, Bookmark, Plus, Home, FileText, BarChart3, Menu as MenuIcon } from "lucide-react";
import { useState } from "react";
import { MoreSheet } from "../components/MoreSheet";

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Finly";
    if (path === "/dashboard/transactions") return "Transactions";
    if (path === "/dashboard/add-transaction") return "Add Transaction";
    if (path.startsWith("/dashboard/edit-transaction")) return "Edit Transaction";
    if (path === "/dashboard/reports") return "Reports";
    if (path === "/dashboard/categories") return "Categories";
    if (path === "/dashboard/accounts") return "Accounts";
    if (path === "/dashboard/calendar") return "Calendar";
    if (path === "/dashboard/budget") return "Budget";
    if (path === "/dashboard/goals") return "Goals";
    if (path === "/dashboard/ai-agent") return "AI Agent";
    if (path === "/dashboard/settings") return "Settings";
    return "Finly";
  };

  const showBackButton = location.pathname !== "/dashboard";
  const showAddButton = ["/dashboard", "/dashboard/transactions"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0D0F14] pb-20">
      <div className="max-w-md mx-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-[#0D0F14]/95 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  onClick={() => navigate(-1)}
                  className="w-9 h-9 rounded-xl bg-[#1B2130] flex items-center justify-center border border-white/5"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-white">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard/transactions")}
                className="w-9 h-9 rounded-xl bg-[#1B2130] flex items-center justify-center border border-white/5"
              >
                <Search className="w-4 h-4 text-white/70" />
              </button>
              <button className="relative w-9 h-9 rounded-xl bg-[#1B2130] flex items-center justify-center border border-white/5">
                <Bell className="w-4 h-4 text-white/70" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></div>
              </button>
              <button className="w-9 h-9 rounded-xl bg-[#1B2130] flex items-center justify-center border border-white/5">
                <Bookmark className="w-4 h-4 text-white/70" />
              </button>
              {showAddButton && (
                <button
                  onClick={() => navigate("/dashboard/add-transaction")}
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/25"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <Outlet />

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1B2130] border-t border-white/10 backdrop-blur-xl z-40">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-around px-2 py-2 relative">
              {/* Home */}
              <button
                onClick={() => navigate("/dashboard")}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                  location.pathname === "/dashboard" ? "text-[#7C5CFF]" : "text-white/40"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-medium">Home</span>
              </button>

              {/* Ledger */}
              <button
                onClick={() => navigate("/dashboard/transactions")}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                  location.pathname === "/dashboard/transactions" ? "text-[#7C5CFF]" : "text-white/40"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-[10px] font-medium">Ledger</span>
              </button>

              {/* Center FAB */}
              <button
                onClick={() => navigate("/dashboard/add-transaction")}
                className="w-14 h-14 -mt-6 rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#4CC9F0] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/50"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>

              {/* Reports */}
              <button
                onClick={() => navigate("/dashboard/reports")}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                  location.pathname === "/dashboard/reports" ? "text-[#7C5CFF]" : "text-white/40"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-[10px] font-medium">Reports</span>
              </button>

              {/* More */}
              <button
                onClick={() => setShowMore(true)}
                className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-white/40"
              >
                <MenuIcon className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </div>
          </div>
        </div>

        {/* More Sheet */}
        <MoreSheet isOpen={showMore} onClose={() => setShowMore(false)} />
      </div>
    </div>
  );
}
