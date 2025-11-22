import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[60px_1fr] lg:grid-cols-[60px_1fr]">
            <DashboardSidebar />
            <div className="flex flex-col overflow-auto h-screen">
                <Outlet />
            </div>
        </div>
    );
}
