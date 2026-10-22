type HeaderProps = {
  title: string;
  description?: string;
  adminUsername: string;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export default function Header({
    title,
    description,
    adminUsername,
    onLogout,
    isLoggingOut
}: HeaderProps) {
  return (
      <header className="header">
        <div className="header__content">
          <h1 className="header__title">{title}</h1>

          {description && (
              <p className="header__description">
                {description}
              </p>
          )}
        </div>

        <div className="header__admin">
          <div className="header__avatar">
            {adminUsername.charAt(0).toUpperCase()}
          </div>

          <div className="header__admin-info">
            <span className="header__admin-name">
              {adminUsername}
            </span>

            <span className="header__admin-role">
              System Admin
            </span>
          </div>

          <button
            type="button"
            className="header__logout"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging Out..." : "Logout"}
          </button>
        </div>
      </header>
  );
}
