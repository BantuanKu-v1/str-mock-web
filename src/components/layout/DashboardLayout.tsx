import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { SidebarPage } from "./Sidebar";

type DashboardLayoutProps = {
  activePage: SidebarPage;
  onNavigate: (page: SidebarPage) => void;
  title: string;
  description?: string;
  adminUsername: string;
  onLogout: () => void;
  isLoggingOut: boolean;
  children: ReactNode;
};

export default function DashboardLayout({
    activePage,
    onNavigate,
    title,
    description,
    adminUsername,
    onLogout,
    isLoggingOut,
    children
}: DashboardLayoutProps) {
  return (
      <div className="app-layout">
        <Sidebar
            activePage={activePage}
            onNavigate={onNavigate}
        />

        <div className="app-layout__main">
          <Header
              title={title}
              description={description}
              adminUsername={adminUsername}
              onLogout={onLogout}
              isLoggingOut={isLoggingOut}
          />

          <main className="app-layout__content">
            {children}
          </main>
        </div>
      </div>
  );
}
