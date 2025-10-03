import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { RootState } from "./store";
import { useSelector, useDispatch } from "react-redux";
import { setSidebarCollapsed } from "./store/slices/appSlice";
import { Link, Route, Routes } from "react-router-dom";
import Discover from "./pages/discover";
import Home from "./pages/Home";
import Whiteboard from "./pages/Whiteboard";

export default function App() {
  const dispatch = useDispatch();
  const breadcrumbs = useSelector((state: RootState) => state.app.breadcrumbs);
  const isSidebarCollapsed = useSelector(
    (state: RootState) => state.app.isSidebarCollapsed
  );

  const handleSidebarOpenChange = (open: boolean) => {
    dispatch(setSidebarCollapsed(!open));
  };

  return (
    <SidebarProvider
      open={!isSidebarCollapsed}
      onOpenChange={handleSidebarOpenChange}
    >
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 sticky top-0 z-10 border-b bg-background/50 backdrop-blur">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs?.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="line-clamp-1">
                          <Link to={crumb.location} className="cursor-pointer">
                            {crumb.title}
                          </Link>
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Routes>
            <Route path="" element={<Home />} />
            <Route path="discover" element={<Discover />} />
            <Route path="whiteboard" element={<Whiteboard />} />
          </Routes>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
