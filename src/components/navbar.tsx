"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PiggyBank, LineChart, Menu, X, LayoutDashboard, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ButtonConnectWallet = dynamic(() => import("./ui/ButtonConnectWallet"), {
  ssr: false,
});

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-3 transition-colors py-4 px-6 w-full group relative
        ${
          isActive
            ? "text-white"
            : "text-gray-200 hover:text-[#b721ff]"
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 " />
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 animate-gradient-x bg-gradient-to-r from-[#b721ff] to-[#21d4fd]" />
      )}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest("nav")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-[#0d0d21]/80 backdrop-blur-md " />
      <div className="relative flex items-center justify-between h-16 px-4 md:px-16 max-w-9xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-[#b721ff] to-[#21d4fd] 
              animate-gradient-x bg-[length:200%_100%] 
              bg-clip-text text-transparent 
              hover:opacity-80 transition-opacity"
          >
            TraCrafter
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/lending">
            <Wallet className="h-3 w-3 group-hover:scale-110 transition-transform"  />
              <span>Lending</span>
            </NavLink>
            <NavLink href="/borrow">
              <PiggyBank className="h-3 w-3 group-hover:scale-110 transition-transform" />
              <span>Borrow</span>
            </NavLink>
            <NavLink href="/trade">
              <LineChart className="h-3 w-3 group-hover:scale-110 transition-transform" />
              <span>Trade</span>
            </NavLink>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <ButtonConnectWallet />
        </div>

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-200 hover:text-white transition-colors"
          aria-label="Toggle menu"
          type="button"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-4 h-4" />}
        </button>

        {isOpen && (
          <div className="md:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-md"
              onClick={closeMenu}
              role="presentation"
            />
            <div
              className="fixed top-0 right-0 h-full w-full bg-gradient-to-b from-[#0d0d21] to-[#0d0d21]/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
            >
              <div className="flex justify-between items-center px-6 h-16 border-b border-white/10">
                <span className="text-lg font-semibold bg-gradient-to-r from-[#b721ff] to-[#21d4fd] bg-clip-text text-transparent">
                  Menu
                </span>
                <button
                  onClick={closeMenu}
                  className="text-gray-200 hover:text-white transition-colors"
                  aria-label="Close menu"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2">
                <NavLink href="/borrow" onClick={closeMenu}>
                  <PiggyBank className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Borrow</span>
                </NavLink>

                <NavLink href="/lending" onClick={closeMenu}>
                  <LineChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Lending</span>
                </NavLink>

                <NavLink href="/dummy" onClick={closeMenu}>
                  <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Dummy</span>
                </NavLink>

                <div className="px-6 pt-4 mt-4 border-t border-white/10">
                  <ButtonConnectWallet />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
