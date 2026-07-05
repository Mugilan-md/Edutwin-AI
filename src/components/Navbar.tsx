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
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    const cachedRole = localStorage.getItem("user_role");
    const cachedName = localStorage.getItem("user_name");

    if (forcedRole) {
      setRole(forcedRole);
    } else if (cachedRole) {
      setRole(cachedRole);
    }

    if (cachedName) {
      setUserName(cachedName);
    }

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
          {
            path: "/faculty",
            label: "Approval Panel",
            icon: LayoutDashboard,
          },
          {
            path: "/admin",
            label: "NAAC Analytics",
            icon: BarChart3,
          },
          {
            path: "/profile",
            label: "Profile",
            icon: User,
          },
        ];
      case "admin":
        return [
          {
            path: "/admin",
            label: "Admin Dashboard",
            icon: LayoutDashboard,
          },
          {
            path: "/faculty",
            label: "Approval Review",
            icon: Award,
          },
          {
            path: "/profile",
            label: "Profile",
            icon: User,
          },
        ];
      case "student":
      default:
        return [
          {
            path: "/student",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            path: "/activities",
            label: "Track Activities",
            icon: UploadCloud,
          },
          {
            path: "/profile",
            label: "My Profile",
            icon: User,
          },
        ];
    }
  };

  const menuLinks = getMenuLinks();

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 rounded-2xl transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg py-3 px-6"
          : "bg-white border border-gray-100 shadow-md py-4 px-8"
      }`}
    >
      <div className="flex items-center justify-between">
        <Link to={`/${role}`} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Edutwin AI
            </span>
            <span className="block text-[10px] text-indigo-600 font-semibold uppercase tracking-wider -mt-1">
              {role} portal
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 bg-gray-100/60 p-1.5 rounded-xl border border-gray-200/20 relative">
          {menuLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-indigo-600 bg-white shadow-sm font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-gray-800">
              {userName || "Academic Member"}
            </span>
            <span className="text-[10px] text-gray-400">Verified Profile</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 p-2.5 rounded-xl border border-gray-200/50 hover:border-red-200 transition-all duration-300 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
