import React, { useContext } from "react";
import { SidebarItem } from "./sidebaritem";
import { Layout, Compass } from "lucide-react";
import mycontext from "../../configs/mycontext";
import { Link } from "react-router-dom";

const NavbarRoutes = () => {
    const [user, dispatch] = useContext(mycontext);

    let guestRoutes = [];
    if (user === null) {
        guestRoutes = [
            {
                icon: Layout,
                label: "Dashboard",
                href: "/login",
            },
            {
                icon: Compass,
                label: "My Learning",
                href: "/login",
            },
        ];
    } else if (user.is_teacher) {
        guestRoutes = [
            {
                icon: Layout,
                label: "Course",
                href: "/teawall/course",
            },
            {
                icon: Compass,
                label: "Analysis",
                href: "/teawall/analyst",
            },
        ];
    } else if (user.is_student) {
        guestRoutes = [
            {
                icon: Layout,
                label: "Dashboard",
                href: "/stuwall/dashboard",
            },
            {
                icon: Compass,
                label: "My Learning",
                href: "/stuwall/my-course",
            },
        ];
    }

    return (
        <div className="flex flex-col w-full">
            <ul className="flex gap-8 m-0 p-0">
                {guestRoutes.map((route) => (
                    <li>
                        <Link
                            className="no-underline text-slate-950 font-normal"
                            key={route.href}
                            to={route.href}
                        >
                            {route.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NavbarRoutes;