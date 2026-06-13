import { useState } from "react";
import type { User } from "@office/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface ApproveStaffDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void | Promise<void>;
}

export function ApproveStaffDialog({
  user,
  open,
  onOpenChange,
  onApproved,
}: ApproveStaffDialogProps) {
  const [nameBn, setNameBn] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!user || !nameBn.trim()) return;
    setBusy(true);
    try {
      await api.approve(user.id, nameBn.trim());
      setNameBn("");
      await onApproved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve staff member</DialogTitle>
          <DialogDescription>
            Set a Bangla display name for {user?.nameEn}. A brand color will be assigned
            automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="nameBn">Bangla name</Label>
          <Input
            id="nameBn"
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
            placeholder="যেমন: করিম"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={busy || !nameBn.trim()}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
