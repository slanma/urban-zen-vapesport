import { Target, Wrench, Bike } from "lucide-react";

interface Props {
  problem: string | null;
  fn: string | null;
  usage: string | null;
}

const Row = ({
  icon: Icon,
  title,
  text,
  iconClass,
}: {
  icon: typeof Target;
  title: string;
  text: string;
  iconClass: string;
}) => (
  <li className="flex gap-4 items-start">
    <div
      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-border ${iconClass}`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="font-body text-sm text-foreground mt-1 leading-relaxed">{text}</p>
    </div>
  </li>
);

const ProblemSolutionBullets = ({ problem, fn, usage }: Props) => {
  const hasAny = problem || fn || usage;
  if (!hasAny) return null;
  return (
    <ul className="space-y-5">
      {problem && (
        <Row icon={Target} iconClass="bg-primary/10 text-primary" title="Problém, který řeší" text={problem} />
      )}
      {fn && (
        <Row icon={Wrench} iconClass="bg-foreground/5 text-foreground" title="Funkce" text={fn} />
      )}
      {usage && (
        <Row icon={Bike} iconClass="bg-accent/30 text-foreground" title="Použití" text={usage} />
      )}
    </ul>
  );
};

export default ProblemSolutionBullets;
