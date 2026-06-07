import { ResponsiveContainer, LineChart, Line } from "recharts";
import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: "default" | "primary" | "success" | "warning";
  trend?: number[];
  hint?: string;
}

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-emerald-600",
  warning: "text-amber-600",
};

const strokeMap: Record<NonNullable<Props["accent"]>, string> = {
  default: "hsl(var(--foreground))",
  primary: "hsl(var(--primary))",
  success: "rgb(5 150 105)",
  warning: "rgb(217 119 6)",
};

export const StatCard = ({ label, value, icon: Icon, accent = "default", trend, hint }: Props) => {
  const data = (trend ?? []).map((v, i) => ({ i, v }));
  return (
    <article className="bg-background border border-border rounded-lg p-5 flex flex-col gap-2 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${accentMap[accent]}`} />}
      </div>
      <p className={`text-3xl font-heading font-bold ${accentMap[accent]}`}>{value}</p>
      {data.length > 1 && (
        <div className="h-8 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="v" stroke={strokeMap[accent]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </article>
  );
};
