import React, { useContext } from 'react';
import { SidebarItem } from './sidebaritem';
import { Layout, Compass } from 'lucide-react';
import mycontext from '../../configs/mycontext';

const SidebarRoutes = () => {
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
      }
    ];
  }

  else if (user.is_teacher) {
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
      }
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
      }
    ];
  }

  return (
    <div className="flex flex-col w-full">
      {guestRoutes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};

export default SidebarRoutes;
