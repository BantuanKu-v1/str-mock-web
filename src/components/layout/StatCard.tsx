import { CheckCircle2, Clock3, Files, Send, XCircle } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number;
  variant?: "default" | "info" | "warning" | "success" | "danger";
};

const variants = {
  default: {
    icon: Files,
    color: "#64748b",
    background: "#f1f5f9"
  },
  info: {
    icon: Send,
    color: "#2563eb",
    background: "#eff6ff"
  },
  warning: {
    icon: Clock3,
    color: "#d97706",
    background: "#fffbeb"
  },
  success: {
    icon: CheckCircle2,
    color: "#16a34a",
    background: "#f0fdf4"
  },
  danger: {
    icon: XCircle,
    color: "#dc2626",
    background: "#fef2f2"
  }
};

export default function StatCard({
  title,
  value,
  variant = "default"
}: StatCardProps) {
  const style = variants[variant];
  const Icon = style.icon;

  return (
      <div className="stat-card">
        <div className="stat-card__header">
          <span className="stat-card__title">{title}</span>

          <div
              className="stat-card__icon"
              style={{
                color: style.color,
                backgroundColor: style.background
              }}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        </div>

        <strong className="stat-card__value">
          {value.toLocaleString()}
        </strong>
      </div>
  );
}
