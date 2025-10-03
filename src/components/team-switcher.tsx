"use client";

import { LibraryBigIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <Link to="/">
        <SidebarMenuItem>
          <SidebarMenuButton className="w-full px-1.5 cursor-pointer">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center p-0.5 rounded-md">
              <LibraryBigIcon />
            </div>
            <span className="truncate text-xl font-bold">DrawLog</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </Link>
    </SidebarMenu>
  );
}
