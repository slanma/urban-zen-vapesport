import { Check, X, Battery, Bike } from "lucide-react";

interface Props {
  integratedBattery: boolean | null;
  fullSuspension: boolean | null;
  lowStep?: boolean | null;
}

const Badge = ({
  ok,
  icon: Icon,
  label,
}: {
  ok: boolean | null;
  icon: typeof Check;
  label: string;
}) => {
  if (ok === null) return null;
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-body font-semibold ${
        ok
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-full bg-background/60 text-[10px] uppercase tracking-wider">
        {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        {ok ? "Ano" : "Ne"}
      </span>
    </div>
  );
};

const EbikeBadges = ({ integratedBattery, fullSuspension, lowStep }: Props) => {
  if (integratedBattery === null && fullSuspension === null && (lowStep ?? null) === null) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <Badge ok={integratedBattery} icon={Battery} label="Integrovaná baterie" />
      <Badge ok={fullSuspension} icon={Bike} label="Celoodpružené (Full)" />
      <Badge ok={lowStep ?? null} icon={Bike} label="Low-step rám" />
    </div>
  );
};

export default EbikeBadges;
