export const dynamic = "force-dynamic";
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/toggle-mode-button";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import type { Metadata } from "next";

import { getCurrentUserRole } from "@/actions/management.actions";

export const metadata: Metadata = {
  title: {
    template: "%s | Gouvernance",
    default: "Gouvernance",
  },
  description: "Plateforme de gouvernance Cybersécurité",
};


export default async function DashbaordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = await getCurrentUserRole();

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 justify-between items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4 px-4">
            <NotificationBell />
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
