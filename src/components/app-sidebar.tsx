"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AudioLinesIcon,
  BellIcon,
  BookOpenIcon,
  BotIcon,
  GalleryVerticalEndIcon,
  MessageCircle,
  Settings2Icon,
  TerminalIcon,
  TerminalSquareIcon,
} from "lucide-react";

// This is sample data.
const data = {
  user: {
    name: "Chargement...",
    email: "",
    avatar: "",
  },
  teams: [
    {
      name: "Gouvernance Cybersecurite",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: <TerminalSquareIcon />,
      
    },
    {
      title: "Managment des serveurs",
      url: "/dashboard/management",
      icon: <BotIcon />,
     
    },
    {
      title: "Rapport et statistique",
      url: "/dashboard/statistique",
      icon: <BookOpenIcon />,
      
    },
    {
      title: "Gestion des comptes",
      url: "/dashboard/accounts",
      icon: <Settings2Icon />,
     
    },
  ],
  projects: [
    {
      name: "Notifications",
      url: "/dashboard/notifications",
      icon: <BellIcon />,
    },
    {
      name: "Chat",
      url: "/dashboard/chat",
      icon: <MessageCircle />,
    }
  ],
  
};

export function AppSidebar({ role, ...props }: React.ComponentProps<typeof Sidebar> & { role?: string | null }) {
  const filteredNavMain = data.navMain.filter(item => {
    if (item.url === "/dashboard/accounts") {
      return role === "ADMIN"
    }
    return true
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
