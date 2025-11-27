"use client";

import { useState } from "react";
import NavItem from "./NavItem";
import { navItems, navItems1, navItems2 } from "./sidebarData";
import { BsLayoutSidebar, BsLayoutSidebarReverse,BsArrowsCollapse,BsPcDisplayHorizontal,BsArrowBarLeft,BsArrowBarRight } from "react-icons/bs";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex relative bg-gray-50 text-nowrap">
            <div
                className={`
          fixed md:relative h-screen bg-gray-100 shadow-lg flex flex-col transition-all duration-500 overflow-hidden
          ${collapsed ? "w-20" : "w-[380px]"}
          z-50
        `}
            >
                <div
                    className={`relative font-bold p-6 h-20 border-b border-gray-200 bg-gradient-to-r from-cyan-900 via-cyan-800 to-cyan-700 text-white 
          ${collapsed ? "text-center text-xl p-4" : "text-3xl text-center"}
        `}
                >
                    <img src="/images/icons/aaa.png" alt="logo" className="w-11 h-11 absolute left-1 top-5" />
                    {!collapsed && <span className="text-2xl font-semibold" >Doctor's AI Assistant</span>}

                    <div className="absolute right-2 top-2 cursor-pointer">
                        {!collapsed && (
                            <button onClick={() => setCollapsed(true)} className="text-white cursor-pointer">
                                {/* <BsLayoutSidebar size={20} /> */}
                                  <BsArrowBarLeft size={20} />
                            </button>
                        )}
                    </div>

                    <div className="absolute right-2 top-2 cursor-pointer">
                        {collapsed && (
                            <button
                                onClick={() => setCollapsed(false)}
                                className="text-white cursor-pointer"
                            >
                                <BsArrowBarRight size={20} />
                            </button>
                        )}
                    </div>


                </div>

                <div className="flex-1 overflow-y-auto">
                    <NavItem navItems={navItems} title="Knowledge Base" collapsed={collapsed} />

                    <NavItem navItems={navItems1} title="Generate" collapsed={collapsed} />
                    <NavItem navItems={navItems2} title="AI Analyst" collapsed={collapsed} />
                </div>

                {!collapsed && (
                    <div className="mt-auto p-4 border-t border-gray-400 text-center text-sm text-cyan-700">
                        © 2025 Doctor AI Assistant
                    </div>
                )}
            </div>

            {!collapsed && (
                <div
                    className="md:hidden fixed top-0 left-0 w-full h-full bg-black/30 z-40"
                    onClick={() => setCollapsed(true)}
                />
            )}

        </div>
    );
}
