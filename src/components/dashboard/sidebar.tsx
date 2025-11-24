import { Link, useLocation } from "react-router-dom";
import { AlertOctagon, User, Moon, Sun } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";

import gouLogo from "@/assets/gou-logo.ico";

export function DashboardSidebar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <TooltipProvider>
      <div className="hidden border-r bg-gradient-to-b from-sidebar to-primary/5 text-sidebar-foreground md:block shadow-xl z-10">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center justify-center border-sidebar-border lg:h-[60px]">
            <Link to="/" className="flex h-10 w-10 items-center justify-center">
              <img src={gouLogo} alt="Gou Payments" className="h-8 w-8" />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="flex flex-col items-center gap-4 px-2 py-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/"
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8
                      ${pathname === "/" ? "bg-primary/10 text-primary" : "text-gray-500 hover:text-primary hover:bg-primary/10"}
                    `}
                  >
                    <AlertOctagon className="h-5 w-5" />
                    <span className="sr-only">Incidentes</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Incidentes</TooltipContent>
              </Tooltip>
            </nav>
          </div>
          <div className="mt-auto p-4 flex flex-col items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
              </TooltipContent>
            </Tooltip>
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 cursor-pointer">
                    <User className="h-5 w-5 text-primary" />
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
      </div>
    </TooltipProvider>
  );
}