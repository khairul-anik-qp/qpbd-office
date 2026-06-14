import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { bnNum, type PhoneTab } from "../lib/staff-format";

export type StaffTab = PhoneTab;

interface StaffTabsProps {
  active: StaffTab;
  counts: Record<StaffTab, number>;
  onChange: (tab: StaffTab) => void;
}

const TABS: { key: StaffTab; label: string }[] = [
  { key: "new", label: "নতুন" },
  { key: "progress", label: "চলছে" },
  { key: "done", label: "সম্পন্ন" },
];

const triggerClass = cn(
  "flex min-h-11 flex-1 items-center justify-center gap-[7px]",
  "rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent bg-transparent px-2 py-3 shadow-none",
  "text-sm font-medium leading-4 text-muted-gray transition-colors",
  "hover:text-lead",
  "data-[state=active]:border-b-electric data-[state=active]:bg-transparent data-[state=active]:text-muted-gray data-[state=active]:shadow-none",
);

const badgeClass =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-divider px-1.5 text-[11px] font-medium leading-none text-lead";

export function StaffTabs({ active, counts, onChange }: StaffTabsProps) {
  return (
    <div className="shrink-0 border-b border-divider bg-card">
      <Tabs
        value={active}
        onValueChange={(value) => onChange(value as StaffTab)}
        className="w-full"
      >
        <TabsList className="-mb-px flex h-auto w-full gap-0 rounded-none bg-transparent p-0">
          {TABS.map(({ key, label }, index) => (
            <TabsTrigger
              key={key}
              value={key}
              className={cn(triggerClass, index < TABS.length - 1 && "border-r border-divider")}
            >
              {label}
              <span className={badgeClass}>{bnNum(counts[key])}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
