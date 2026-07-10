import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOutUser } from "../services/authService";
import { getProfile } from "../services/profileService";
import {
  LayoutDashboard,
  UploadCloud,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  forcedRole?: string;
}

export default function Navbar({ forcedRole }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<string>("student");
  const [userName, setUserName] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const cachedRole = localStorage.getItem("user_role");
    const cachedName = localStorage.getItem("user_name");
    if (forcedRole) setRole(forcedRole);
    else if (cachedRole) setRole(cachedRole);
    if (cachedName) setUserName(cachedName);

    getProfile().then(({ data }) => {
      if (data) {
        setRole(data.role || "student");
        setUserName(data.full_name || "");
        localStorage.setItem("user_role", data.role || "student");
        localStorage.setItem("user_name", data.full_name || "");
      }
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [forcedRole]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await signOutUser();
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    navigate("/");
  };

  const getMenuLinks = () => {
    switch (role) {
      case "faculty":
        return [
          { path: "/faculty", label: "Approval Console", icon: LayoutDashboard },
          { path: "/profile", label: "My Profile",       icon: User },
        ];
      case "admin":
        return [
          { path: "/admin",   label: "Command Center",   icon: LayoutDashboard },
          { path: "/profile", label: "My Profile",       icon: User },
        ];
      case "student":
      default:
        return [
          { path: "/student",    label: "Dashboard",       icon: LayoutDashboard },
          { path: "/activities", label: "Track Activities", icon: UploadCloud },
          { path: "/profile",    label: "My Profile",       icon: User },
        ];
    }
  };

  const menuLinks = getMenuLinks();

  return (
    <>
      <nav
        className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl z-50 rounded-2xl transition-all duration-300 ${
          scrolled
            ? "bg-black/85 backdrop-blur-xl border border-orange-500/20 shadow-lg shadow-black/60 py-2.5 px-4"
            : "bg-[#0e0a04]/90 backdrop-blur-md border border-orange-500/15 shadow-xl shadow-black/40 py-3 px-5"
        }`}
      >
        <div className="flex items-center justify-between">

          {/* Brand */}
          <Link to={`/${role}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-sm bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                Edutwin AI
              </span>
              <span className="block text-[9px] text-orange-400 font-bold uppercase tracking-widest -mt-0.5 hidden xs:block">
                {role} portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-orange-500/5 p-1 rounded-xl border border-orange-500/10">
            {menuLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-white bg-gradient-to-r from-[#D7263D]/80 via-[#FF6A00]/70 to-[#FFC247]/60 shadow-md shadow-orange-900/30"
                      : "text-orange-300/60 hover:text-orange-200 hover:bg-orange-500/8"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-orange-400/50"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: User + Logout + Hamburger */}
          <div className="flex items-center gap-2">
            {/* User name (desktop only) */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white/80 leading-tight">
                {userName ? userName.split(" ")[0] : "Member"}
              </span>
              <span className="text-[9px] text-orange-400/50">Verified</span>
            </div>

            {/* Logout (desktop only) */}
            <button
              onClick={handleLogout}
              title="Log Out"
              className="hidden md:flex items-center justify-center bg-orange-500/8 hover:bg-red-900/40 text-orange-400/60 hover:text-red-400 p-2 rounded-xl border border-orange-500/15 hover:border-red-500/30 transition-all duration-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center bg-orange-500/10 border border-orange-500/20 text-orange-400 p-2 rounded-xl cursor-pointer transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-[70px] left-1/2 -translate-x-1/2 w-[94%] bg-[#0e0a04]/98 border border-orange-500/20 rounded-2xl shadow-2xl shadow-black overflow-hidden backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info */}
            <div className="px-5 py-4 border-b border-orange-500/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center text-white font-black text-sm shrink-0">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <span className="block text-sm font-bold text-white">{userName || "Academic Member"}</span>
                <span className="block text-[10px] text-orange-400/50 capitalize">{role} Portal · Verified</span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="p-3 space-y-1">
              {menuLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-white bg-gradient-to-r from-[#D7263D]/70 via-[#FF6A00]/60 to-[#FFC247]/50"
                        : "text-orange-300/60 hover:text-orange-200 hover:bg-orange-500/8"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-orange-400/50"}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="px-3 pb-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 border border-red-500/20 cursor-pointer transition"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
