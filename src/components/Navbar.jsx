import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// List navigasi
const navItems = [
  { id: "publications", label: "Daftar Publikasi", path: "/publications" },
  { id: "add", label: "Tambah Publikasi", path: "/publications/add" },
  { id: "logout", label: "Logout", path: "/logout" },
];

function BpsLogo() {
  return (
    <img
      src="https://res.cloudinary.com/djcm0swgo/image/upload/v1751775675/bps-logo_1_ldppzk.png"
      alt="BPS Logo"
      className="h-12 w-auto object-contain"
    />
  );
}

export default function Navbar() {
  const { logoutAction, loading, error, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logoutAction();
      navigate("/login", { replace: true });
    } catch (err) {
      alert("Gagal logout: " + err.message);
    }
  };

  const handleChangePhoto = () => {
    setShowChangePhotoModal(true);
    setShowProfileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }; document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Jangan tampilkan navbar di halaman login/register
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  if (error) return <div className="text-red-500">Terjadi Kesalahan: Reload Page</div>;

  return (
    <nav className="bg-blue-800 backdrop-blur sticky top-0 z-50 shadow-md font-[Inter]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-4">
            <BpsLogo />
            <span className="text-white text-lg font-semibold tracking-wide hidden sm:block">
              BPS PROVINSI SULAWESI TENGAH
            </span>
          </div>


          <div className="flex items-center gap-4">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.id === "add" && location.pathname.startsWith("/publications/add")) ||
                (item.id === "publications" && location.pathname === "/publications");

              if (item.id === "logout") {
                return (
                  <div key={item.id} className="relative">
                    <button
                      ref={profileButtonRef}
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center space-x-2 p-1 rounded-full cursor-pointer hover:scale-90 transition-scale duration-500"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={user?.profilePhoto || "/default-avatar.png"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="w-full h-full hover:bg-red-400 bg-red-600 hidden items-center justify-center text-white text-sm transition-color duration-300">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </div>
                    </button>

                    {/*Profile Menu*/}
                    {showProfileMenu && (
                      <div
                        ref={profileMenuRef}
                        className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transition-all duration-1000"
                      >
                        <div className="px-4 py-2 border-b border-gray-100 ">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img
                                src={user?.profilePhoto || "/default-avatar.png"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div
                                className="w-full h-full  bg-red-600 hidden items-center justify-center text-white text-sm select-none"
                                onClick={handleChangePhoto}
                              >
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {user?.name || "User"}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {user?.email || ""}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className="w-full flex items-center gap-3 font-medium cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                          onClick={handleLogout}
                          disabled={loading}
                        >
                          <span class="material-symbols-outlined text-red-400">
                            logout
                          </span>
                          {loading ? "Logging out..." : "Logout"}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="relative group text-white font-medium text-sm px-2 py-1"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className={`absolute left-0 -bottom-2 h-[3px] transition-all duration-800 ease-in-out ${isActive
                        ? "w-full bg-white"
                        : "w-0 group-hover:w-full bg-white"
                      }`}
                  ></span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
