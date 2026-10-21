type StatCardProps = {
  title: string;
  value: number;
  variant?: "default" | "info" | "warning" | "success" | "danger";
};

export default function StatCard({
    title,
    value,
    variant = "default"
}: StatCardProps) {
  return (
      <div className={`stat-card stat-card--${variant}`}>
        <span className="stat-card__title">
          {title}
        </span>

        <h2 className="stat-card__value">
          {value}
        </h2>
      </div>
  );
}
