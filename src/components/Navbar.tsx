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
          { path: "/profile", label: "My Profile", icon: User },
        ];
      case "admin":
        return [
          { path: "/admin", label: "Command Center", icon: LayoutDashboard },
          { path: "/profile", label: "My Profile", icon: User },
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
  const roleColors: Record<string, string> = {
    student: "bg-blue-100 text-blue-700",
    faculty: "bg-emerald-100 text-emerald-700",
    admin:   "bg-amber-100 text-amber-700",
  };
  const roleBadge = roleColors[role] || roleColors.student;

  return (
    <>
      <nav
        className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] max-w-6xl z-50 rounded-2xl transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border border-blue-100 shadow-lg shadow-blue-900/8 py-2.5 px-4"
            : "bg-white/80 backdrop-blur-md border border-blue-100/60 shadow-md shadow-blue-900/6 py-3 px-5"
        }`}
      >
        <div className="flex items-center justify-between">

          {/* Brand */}
          <Link to={`/${role}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-black text-sm text-slate-800" style={{fontFamily:'"Cormorant Garamond", Georgia, serif', fontSize:'1.15rem', letterSpacing:'0.04em'}}>Edutwin AI</span>
              <span className="block text-[9px] text-blue-400 font-bold uppercase tracking-widest -mt-0.5 hidden xs:block">
                Smart Education
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
            {menuLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm shadow-blue-500/30"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: User + Logout + Hamburger */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {userName ? userName.split(" ")[0] : "Member"}
              </span>
              <span className={`text-[9px] font-bold capitalize px-1.5 py-0.5 rounded-full ${roleBadge}`}>{role}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Log Out"
              className="hidden md:flex items-center justify-center w-8 h-8 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 hover:border-red-200 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl cursor-pointer transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-[70px] left-1/2 -translate-x-1/2 w-[94%] bg-white border border-blue-100 rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-sky-50">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-black text-sm shrink-0">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800">{userName || "Academic Member"}</span>
                <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full ${roleBadge}`}>{role} Portal</span>
              </div>
            </div>

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
                        ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="px-3 pb-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100 cursor-pointer transition"
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
