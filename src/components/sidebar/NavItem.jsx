import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function NavItem({ navItems, title, collapsed }) {
    const pathname = usePathname();

    return (
        <div className="bg-white m-2">
            {!collapsed && (
                <p className="px-4 pt-4 text-sm text-gray-500 font-semibold">{title}</p>
            )}

            <nav className={`p-2 ${collapsed ? "flex flex-col items-center" : ""}`}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 p-3 rounded-lg transition my-2
                ${collapsed ? "justify-center w-full" : ""}
                ${isActive
                                    ? "bg-gray-100 text-cyan-700 font-semibold shadow-lg"
                                    : "text-gray-700 hover:shadow-lg hover:bg-blue-50 hover:text-cyan-600"
                                }
              `}
                        >
                            <span
                                className={`p-2 rounded-md ${isActive ? "bg-cyan-800 text-white" : "bg-cyan-600 text-white"
                                    }`}
                            >
                                {item.icon}
                            </span>

                            {!collapsed && item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default NavItem;
