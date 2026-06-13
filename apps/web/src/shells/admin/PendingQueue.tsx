import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "@office/shared";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ApproveStaffDialog } from "./ApproveStaffDialog";

export function PendingQueue() {
  const { signOut } = useAuth();
  const [pending, setPending] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffTarget, setStaffTarget] = useState<User | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPending(await api.listPending());
    } catch {
      toast.error("Could not load pending signups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function approveEmployee(user: User) {
    setActing(user.id);
    try {
      await api.approve(user.id);
      toast.success(`${user.nameEn} approved`);
      await load();
    } catch {
      toast.error("Approval failed");
    } finally {
      setActing(null);
    }
  }

  async function rejectUser(user: User) {
    setActing(user.id);
    try {
      await api.reject(user.id);
      toast.success(`${user.nameEn} rejected`);
      await load();
    } catch {
      toast.error("Rejection failed");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-normal leading-8 text-dark-blue">Signup approvals</h1>
            <p className="text-sm text-lead">Review pending employee and staff registrations</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-6">
        {loading ? (
          <p className="text-lead">Loading queue…</p>
        ) : pending.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-lead">
              No pending signups. New requests will appear here.
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3">
            {pending.map((user) => (
              <li key={user.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt=""
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-full bg-surface text-lead">
                        <Icon name="person" className="size-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{user.nameEn}</p>
                      <p className="truncate text-sm text-lead">{user.email}</p>
                    </div>
                    <Badge variant={user.role === "staff" ? "default" : "muted"}>
                      {user.role === "staff" ? "Staff" : "Employee"}
                    </Badge>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                      <Button
                        size="sm"
                        disabled={acting === user.id}
                        onClick={() =>
                          user.role === "staff"
                            ? setStaffTarget(user)
                            : void approveEmployee(user)
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={acting === user.id}
                        onClick={() => void rejectUser(user)}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ApproveStaffDialog
        user={staffTarget}
        open={!!staffTarget}
        onOpenChange={(open) => !open && setStaffTarget(null)}
        onApproved={async () => {
          setStaffTarget(null);
          toast.success("Staff member approved");
          await load();
        }}
      />
    </div>
  );
}
