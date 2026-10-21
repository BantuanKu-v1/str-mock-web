type HeaderProps = {
  title: string;
  description?: string;
};

export default function Header({
    title,
    description
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
            A
          </div>

          <div className="header__admin-info">
            <span className="header__admin-name">
              Administrator
            </span>

            <span className="header__admin-role">
              System Admin
            </span>
          </div>
        </div>
      </header>
  );
}
