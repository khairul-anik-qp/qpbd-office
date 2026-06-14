import { toast } from "sonner";
import type { User } from "@office/shared";
import { LOCATIONS, TYPES, staffFirstName } from "@office/shared";
import { Icon, TypeIcon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AVAILABILITY_LABELS,
  noteTokens,
  staffInitial,
  toggleNoteToken,
  type CreateFormState,
} from "../lib/employee-request";

interface CreateRequestModalProps {
  form: CreateFormState;
  staff: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (patch: Partial<CreateFormState>) => void;
  onSend: () => void;
}

export function CreateRequestModal({
  form,
  staff,
  open,
  onOpenChange,
  onChange,
  onSend,
}: CreateRequestModalProps) {
  const type = form.type;
  const def = type ? TYPES[type] : null;
  const tokens = noteTokens(form.note);
  const options = def?.options ?? [];
  const noteReady = form.note.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 [&>button]:hidden">
        <DialogHeader className="shrink-0 flex-row items-center gap-3 space-y-0 px-6 pt-6">
          {type && def && (
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-[10px]"
              style={{ backgroundColor: def.bg, color: def.fg }}
            >
              <TypeIcon type={type} className="size-[26px]" />
            </span>
          )}
          <DialogTitle className="text-lg font-medium leading-8">New request</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ml-auto flex size-8 items-center justify-center rounded-sm text-lead opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <Icon name="close" className="size-5" />
          </button>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-6 py-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="loc">Where should it go?</Label>
            <select
              id="loc"
              value={form.loc}
              onChange={(e) => onChange({ loc: e.target.value })}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-electric/45"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.en}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium leading-none">Assign to</span>
            <div className="flex flex-wrap gap-2">
              <AssignOption
                selected={form.assignee === null}
                onClick={() => onChange({ assignee: null })}
                icon="groups"
                label="Anyone available"
              />
              {staff.map((member) => {
                const avail = member.availability ?? "away";
                const av = AVAILABILITY_LABELS[avail];
                const color = member.brandColor ?? "#1B87E6";
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      if (avail !== "available") {
                        toast.warning(`${staffFirstName(member.nameEn)} is ${av.en.toLowerCase()} right now.`);
                      }
                      onChange({ assignee: member.id });
                    }}
                    className="grow inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                    style={{
                      borderColor: form.assignee === member.id ? "#1B87E6" : "#D8D8D8",
                      background: form.assignee === member.id ? "#EEF6FE" : "#fff",
                      color: form.assignee === member.id ? "#1B87E6" : "#545E6B",
                    }}
                  >
                    <span
                      className="flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {staffInitial(member.nameEn)}
                    </span>
                    <span className="flex flex-col items-start gap-0.5">
                      <span>{staffFirstName(member.nameEn)}</span>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] leading-[13px]"
                        style={{ color: av.color }}
                      >
                        <span
                          className="size-[7px] rounded-full"
                          style={{ backgroundColor: av.color }}
                          aria-hidden
                        />
                        {av.en}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium leading-none">How soon?</span>
              <span className="text-xs text-muted-gray">Urgent requests appear first in the queue</span>
            </div>
            <div className="flex gap-2">
              <UrgencyButton
                active={form.urg === "normal"}
                onClick={() => onChange({ urg: "normal" })}
                icon="schedule"
                label="Normal"
                color="#1B87E6"
              />
              <UrgencyButton
                active={form.urg === "urgent"}
                onClick={() => onChange({ urg: "urgent" })}
                icon="priority_high"
                label="Urgent"
                color="#CC0000"
              />
            </div>
          </div>

          {options.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium leading-none">Quick options</span>
              <div className="flex flex-wrap gap-2">
                {options.map((label) => {
                  const sel = tokens.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => onChange({ note: toggleNoteToken(form.note, label) })}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] leading-4 transition-colors"
                      style={{
                        borderColor: sel ? "#1B87E6" : "#D8D8D8",
                        background: sel ? "#EEF6FE" : "#fff",
                        color: sel ? "#1B87E6" : "#545E6B",
                      }}
                    >
                      <Icon name={sel ? "check" : "add"} className="size-4" aria-hidden />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note</Label>
            <textarea
              id="note"
              value={form.note}
              onChange={(e) => onChange({ note: e.target.value })}
              rows={3}
              placeholder="Add details…"
              aria-required
              className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm text-ink placeholder:text-muted-gray focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-electric/45"
            />
            {!noteReady && (
              <p className="text-xs text-muted-gray">Pick a quick option or add a note to send.</p>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSend} disabled={!noteReady}>
            <Icon name="send" className="size-4" aria-hidden />
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignOption({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon: "groups" | "person";
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
      style={{
        borderColor: selected ? "#1B87E6" : "#D8D8D8",
        background: selected ? "#EEF6FE" : "#fff",
        color: selected ? "#1B87E6" : "#545E6B",
      }}
    >
      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-divider text-lead">
        <Icon name={icon} className="size-3.5" aria-hidden />
      </span>
      {label}
    </button>
  );
}

function UrgencyButton({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: "schedule" | "priority_high";
  label: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm transition-colors"
      style={{
        borderColor: active ? color : "#D8D8D8",
        background: active ? (color === "#CC0000" ? "#FFF1F1" : "#EEF6FE") : "#fff",
        color: active ? color : "#545E6B",
      }}
    >
      <Icon name={icon} className="size-4" aria-hidden />
      {label}
    </button>
  );
}
