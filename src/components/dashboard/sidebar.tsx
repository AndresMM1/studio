"use client";
import Link from "next/link";
import { AlertOctagon, GitPullRequestIcon, Cog, User, LayoutDashboard } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

export function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <div className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center justify-center border-sidebar-border lg:h-[60px] px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-primary-foreground">
              <img src="https://www.goupayments.com.co/o/theme-gou/images/favicon.ico" className="h-8 w-8" />
              <span className="sr-only">Gestión de Incidentes</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8
                      ${pathname === "/" ? "bg-sidebar-accent text-sidebar-accent-foreground hover:text-sidebar-primary-foreground" : "text-sidebar-foreground hover:text-sidebar-primary-foreground"}
                    `}
                  >
                    <AlertOctagon className="h-5 w-5" />
                    <span className="sr-only">Incidentes</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Incidentes</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard"
                    className={`mt-2 flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8
                      ${pathname === "/dashboard" ? "bg-sidebar-accent text-sidebar-accent-foreground hover:text-sidebar-primary-foreground" : "text-sidebar-foreground hover:text-sidebar-primary-foreground"}
                    `}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="sr-only">Servicios</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Servicios</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className={`mt-2 flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8
                      ${pathname === "/" ? "bg-sidebar-accent text-sidebar-accent-foreground hover:text-sidebar-primary-foreground" : "text-sidebar-foreground hover:text-sidebar-primary-foreground"}
                    `}
                  >
                    <GitPullRequestIcon className="h-5 w-5" />
                    <span className="sr-only">Cambios</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Cambios</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/toil"
                    className={`mt-2 flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8
                      ${pathname === "/toil" ? "bg-sidebar-accent text-sidebar-accent-foreground hover:text-sidebar-primary-foreground" : "text-sidebar-foreground hover:text-sidebar-primary-foreground"}
                    `}
                  >
                    <Cog className="h-5 w-5" />
                    <span className="sr-only">Toil</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Toil</TooltipContent>
              </Tooltip>
            </nav>
          </div>
          <div className="mt-auto p-4 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent cursor-pointer">
                  <User className="h-5 w-5 text-sidebar-accent-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-bold">{user?.name}</p>
                <p className="text-sm">{user?.email}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}