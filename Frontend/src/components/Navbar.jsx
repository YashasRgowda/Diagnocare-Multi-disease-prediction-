import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/diagnocare.png";
import { UserContext } from "../context/UserContext";

function Navbar() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchProfile();

    const handleResize = () => {
      if (window.innerWidth > 954 && isMobile) {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/users/profile",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData);
      } else {
        setUserInfo(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUserInfo(null);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/users/logout",
        {
          credentials: "include",
          method: "POST",
        }
      );
      if (response.ok) {
        setUserInfo(null);
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout failed with error:", error);
    }
  };

  const isLoggedIn = userInfo?.data?.username;

  const toggleMobileMenu = () => {
    setIsMobile(!isMobile);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobile(false);
    }
  };

  return (
    <nav className="bg-white shadow-md py-4 px-4 sm:px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="PredictiX" className="h-10 lg:h-10" />
        </div>
        
        {/* Desktop Menu */}
        <div className={`hidden md:flex items-center space-x-4 lg:space-x-6`}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive 
                ? "text-blue-600 font-medium" 
                : "text-gray-700 hover:text-blue-600 transition-colors duration-200"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/predictors"
            className={({ isActive }) =>
              isActive 
                ? "text-blue-600 font-medium" 
                : "text-gray-700 hover:text-blue-600 transition-colors duration-200"
            }
          >
            Predictors
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive 
                ? "text-blue-600 font-medium" 
                : "text-gray-700 hover:text-blue-600 transition-colors duration-200"
            }
          >
            About us
          </NavLink>
          
          {isLoggedIn ? (
            <div className="ml-4 lg:ml-8 flex items-center gap-3 lg:gap-4">
              <span className="text-gray-800 font-semibold text-sm lg:text-base">
                Hello, {userInfo.data.username}
              </span>
              <NavLink
                to="/"
                onClick={logout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 lg:px-4 lg:py-2 rounded-md text-sm lg:text-base font-medium transition-colors duration-200"
              >
                Logout
              </NavLink>
            </div>
          ) : (
            <div className="ml-4 lg:ml-8 flex items-center gap-3 lg:gap-4">
              <NavLink
                to="/login"
                className="text-blue-600 hover:text-blue-800 px-3 py-1.5 lg:px-4 lg:py-2 text-sm lg:text-base font-medium transition-colors duration-200"
              >
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-md text-sm lg:text-base font-medium transition-colors duration-200"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden cursor-pointer z-50" onClick={toggleMobileMenu}>
          {isMobile ? 
            <FaTimes size={24} className="text-gray-800" /> : 
            <FaBars size={24} className="text-gray-800" />
          }
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobile && (
          <div className="fixed inset-0 bg-white z-40 pt-20 px-6 md:hidden">
            <div className="flex flex-col items-center space-y-6 text-center">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive 
                    ? "text-blue-600 font-medium text-lg" 
                    : "text-gray-700 hover:text-blue-600 text-lg transition-colors duration-200"
                }
                onClick={handleLinkClick}
              >
                Home
              </NavLink>
              <NavLink
                to="/predictors"
                className={({ isActive }) =>
                  isActive 
                    ? "text-blue-600 font-medium text-lg" 
                    : "text-gray-700 hover:text-blue-600 text-lg transition-colors duration-200"
                }
                onClick={handleLinkClick}
              >
                Predictors
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive 
                    ? "text-blue-600 font-medium text-lg" 
                    : "text-gray-700 hover:text-blue-600 text-lg transition-colors duration-200"
                }
                onClick={handleLinkClick}
              >
                About us
              </NavLink>
              
              {isLoggedIn ? (
                <div className="mt-6 flex flex-col items-center gap-4">
                  <span className="text-gray-800 font-semibold text-lg">
                    Hello, {userInfo.data.username}
                  </span>
                  <NavLink
                    to="/"
                    onClick={(e) => {
                      logout();
                      handleLinkClick();
                    }}
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-8 py-2 rounded-md font-medium text-lg transition-colors duration-200"
                  >
                    Logout
                  </NavLink>
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center gap-4">
                  <NavLink
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 px-8 py-2 font-medium text-lg transition-colors duration-200"
                    onClick={handleLinkClick}
                  >
                    Log In
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium text-lg transition-colors duration-200"
                    onClick={handleLinkClick}
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;