import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOutUser } from "../services/authService";
import { getProfile } from "../services/profileService";
import {
  LayoutDashboard,
  UploadCloud,
  User,
  LogOut,
  Award,
  BarChart3,
  Sparkles,
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
          { path: "/faculty", label: "Approval Panel", icon: LayoutDashboard },
          { path: "/admin",   label: "NAAC Analytics", icon: BarChart3 },
          { path: "/profile", label: "Profile",         icon: User },
        ];
      case "admin":
        return [
          { path: "/admin",   label: "Admin Dashboard", icon: LayoutDashboard },
          { path: "/faculty", label: "Approval Review", icon: Award },
          { path: "/profile", label: "Profile",          icon: User },
        ];
      case "student":
      default:
        return [
          { path: "/student",     label: "Dashboard",        icon: LayoutDashboard },
          { path: "/activities",  label: "Track Activities",  icon: UploadCloud },
          { path: "/profile",     label: "My Profile",        icon: User },
        ];
    }
  };

  const menuLinks = getMenuLinks();

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 rounded-2xl transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border border-orange-500/20 shadow-lg shadow-black/60 py-3 px-6"
          : "bg-[#0e0a04]/90 backdrop-blur-md border border-orange-500/15 shadow-xl shadow-black/40 py-4 px-8"
      }`}
    >
      <div className="flex items-center justify-between">

        {/* Brand */}
        <Link to={`/${role}`} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D7263D] via-[#FF6A00] to-[#FFC247] flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-base bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
              Edutwin AI
            </span>
            <span className="block text-[10px] text-orange-400 font-bold uppercase tracking-widest -mt-0.5">
              {role} portal
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-orange-500/5 p-1.5 rounded-xl border border-orange-500/10 relative">
          {menuLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "text-white bg-gradient-to-r from-[#D7263D]/80 via-[#FF6A00]/70 to-[#FFC247]/60 shadow-md shadow-orange-900/30"
                    : "text-orange-300/60 hover:text-orange-200 hover:bg-orange-500/8"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-orange-400/50"}`} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: User info + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-white/80">
              {userName || "Academic Member"}
            </span>
            <span className="text-[10px] text-orange-400/50">Verified Profile</span>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex items-center justify-center gap-2 bg-orange-500/8 hover:bg-red-900/40 text-orange-400/60 hover:text-red-400 p-2.5 rounded-xl border border-orange-500/15 hover:border-red-500/30 transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </nav>
  );
}
