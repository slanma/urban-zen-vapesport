import { ShieldCheck } from "lucide-react";
import { useB2BPartner } from "@/hooks/useB2BPartner";

/**
 * Subtle banner shown to logged-in & approved B2B partners across
 * shop / cart / checkout. Confirms that VOC pricing is active and
 * which company it belongs to.
 */
const B2BModeBanner = ({ className = "" }: { className?: string }) => {
  const { isPartner, profile } = useB2BPartner();
  if (!isPartner) return null;

  return (
    <div
      className={`rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
      <p className="text-sm font-body text-foreground leading-snug">
        <span className="font-semibold">Velkoobchodní režim</span>
        {profile?.company_name ? (
          <> — vidíte VOC ceny pro <span className="font-semibold">{profile.company_name}</span>.</>
        ) : (
          <> — vidíte VOC ceny pro vašeho B2B partnera.</>
        )}{" "}
        <span className="text-muted-foreground">Ceny jsou bez DPH; DPH se dopočítá na faktuře.</span>
      </p>
    </div>
  );
};

export default B2BModeBanner;
