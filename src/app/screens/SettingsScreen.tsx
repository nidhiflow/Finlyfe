import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Lock, LogOut, Trash2, Shield, Loader2 } from "lucide-react";
import { authAPI } from "../services/api";

export function SettingsScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authAPI.getProfile();
        setUser(profile);
      } catch {
        setUser(authAPI.getCurrentUser());
      } finally { setLoading(false); }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { setError("Both fields required"); return; }
    if (newPassword.length < 6) { setError("New password must be 6+ characters"); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      await authAPI.updatePassword({ currentPassword, newPassword });
      setMessage("Password updated!");
      setCurrentPassword(""); setNewPassword("");
      setTimeout(() => setShowChangePassword(false), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;
    const doubleConfirm = confirm("All your data will be permanently deleted. Continue?");
    if (!doubleConfirm) return;
    try {
      await authAPI.deleteAccount();
      authAPI.logout();
      navigate("/login");
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
    </div>
  );

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Profile */}
      <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#4CC9F0] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{(user?.name || "U")[0].toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.name || "User"}</h2>
            <p className="text-sm text-white/50">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Settings Items */}
      <div className="space-y-2">
        <button onClick={() => setShowChangePassword(!showChangePassword)}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1B2130] border border-white/5 text-left">
          <Lock className="w-5 h-5 text-[#7C5CFF]" />
          <span className="text-sm font-medium text-white flex-1">Change Password</span>
        </button>

        {showChangePassword && (
          <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5 space-y-3">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {message && <p className="text-sm text-[#22C55E]">{message}</p>}
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none" />
            <button onClick={handleChangePassword} disabled={saving}
              className="w-full py-3 bg-[#7C5CFF] rounded-xl text-white text-sm font-medium disabled:opacity-50">
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#1B2130] border border-white/5 text-left">
          <LogOut className="w-5 h-5 text-[#FFA500]" />
          <span className="text-sm font-medium text-white flex-1">Logout</span>
        </button>

        <button onClick={handleDeleteAccount}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-left">
          <Trash2 className="w-5 h-5 text-[#EF4444]" />
          <span className="text-sm font-medium text-[#EF4444] flex-1">Delete Account</span>
        </button>
      </div>

      {/* App Info */}
      <div className="text-center pt-8">
        <p className="text-sm text-white/30">Finly v2.0</p>
        <p className="text-xs text-white/20">Made with ❤️</p>
      </div>
    </div>
  );
}
