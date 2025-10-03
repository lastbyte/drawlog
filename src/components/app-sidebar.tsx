"use client";

import {
  AudioWaveform,
  Command,
  PlusCircleIcon,
  PresentationIcon,
} from "lucide-react";
import * as React from "react";

import { NavFavorites } from "./nav-favorites";
import { NavMain } from "./nav-main";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Whiteboards",
      url: "/discover",
      icon: PresentationIcon,
    },
    {
      title: "New Board",
      url: "/whiteboard",
      icon: PlusCircleIcon,
    },
  ],
  favorites: [
    {
      name: "Design Youtube",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Design a distributed key-value store",
      url: "#",
      emoji: "🍳",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={data.favorites} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
