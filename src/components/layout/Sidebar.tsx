export type SidebarPage = "dashboard" | "applications";

type SidebarProps = {
  activePage: SidebarPage;
  onNavigate: (page: SidebarPage) => void;
};

const navigationItems: {
  label: string;
  page: SidebarPage;
}[] = [
  {
    label: "Dashboard",
    page: "dashboard",
  },
  {
    label: "Applications",
    page: "applications",
  },
  // {
  //   label: "API Documentation",
  //   page: "api-docs",
  // },
];

export default function Sidebar({
    activePage,
    onNavigate
}: SidebarProps) {
  return (
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            STR
          </div>

          <div className="sidebar__brand-info">
            <h2>STR Mock</h2>
            <span>Administration Portal</span>
          </div>
        </div>

        <div className="sidebar__content">
          <div className="sidebar__section">
            <span className="sidebar__section-title">
              MAIN MENU
            </span>

            <nav className="sidebar__navigation">
              {navigationItems.map((item) => (
                  <button
                      key={item.page}
                      type="button"
                      className={`sidebar__link ${
                          activePage === item.page
                              ? "sidebar__link--active"
                              : ""
                      }`}
                      onClick={() => onNavigate(item.page)}
                  >
                    <span>{item.label}</span>
                  </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="sidebar__footer">
          <span>STR Mock System</span>
          <small>For Academic Demonstration Only</small>
        </div>
      </aside>
  );
}
