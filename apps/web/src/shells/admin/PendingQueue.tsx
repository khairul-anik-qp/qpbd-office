import { useState } from "react";
import { toast } from "sonner";
import type { User } from "@office/shared";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/icons/material-symbols";
import { AppHeader } from "@/components/AppHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePendingSignupList } from "@/hooks/usePendingSignupList";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const SIGNUP_ROLE = {
  staff: {
    label: "Staff",
    icon: "groups" satisfies IconName,
    accent: "bg-info",
    chip: "bg-info-soft/70",
    iconClass: "text-info",
  },
  employee: {
    label: "Employee",
    icon: "person" satisfies IconName,
    accent: "bg-electric",
    chip: "bg-electric/10",
    iconClass: "text-electric",
  },
} as const;

function signupRole(role: User["role"]) {
  return role === "staff" ? SIGNUP_ROLE.staff : SIGNUP_ROLE.employee;
}

function formatSignupRequestDate(ts: string): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date}, ${time}`;
}

export function PendingQueue({ bare = false }: { bare?: boolean } = {}) {
  const { pending, loading } = usePendingSignupList();
  const [acting, setActing] = useState<string | null>(null);

  async function approveUser(user: User) {
    setActing(user.id);
    try {
      await api.approve(user.id);
      toast.success(`${user.nameEn} approved`);
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
    } catch {
      toast.error("Rejection failed");
    } finally {
      setActing(null);
    }
  }

  const content = (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-normal leading-8 text-dark-blue">Signup approvals</h1>
        <p className="text-sm text-lead">Review pending employee and staff registrations</p>
      </div>
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
            {pending.map((user) => {
              const role = signupRole(user.role);
              return (
              <li key={user.id}>
                <Card className="overflow-hidden">
                  <CardContent className="flex p-0">
                    <div
                      className={cn("w-1 shrink-0", role.accent)}
                      aria-hidden
                    />
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <div className="flex items-start gap-3">
                        <UserAvatar
                          photoUrl={user.photoUrl}
                          name={user.nameEn}
                          className="size-12 rounded-xl shadow-pop ring-2 ring-border/60"
                          fallbackClassName="bg-surface text-lead"
                          fallback={<Icon name="person" className="size-6" aria-hidden />}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-medium leading-6 text-dark-blue">
                            {user.nameEn}
                          </p>
                          <p className="truncate text-sm leading-5 text-lead">{user.email}</p>
                          <p className="mt-1 text-xs leading-4 text-muted-gray">
                            Requested {formatSignupRequestDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-4">
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5",
                            role.chip,
                          )}
                        >
                          <Icon
                            name={role.icon}
                            className={cn("size-5 shrink-0", role.iconClass)}
                            aria-hidden
                          />
                          <span className="text-sm font-medium text-dark-blue">{role.label}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="min-w-24"
                            disabled={acting === user.id}
                            onClick={() => void approveUser(user)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-w-24"
                            disabled={acting === user.id}
                            onClick={() => void rejectUser(user)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
              );
            })}
          </ul>
        )}
    </div>
  );

  if (bare) return content;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl min-h-0 flex-1 overflow-auto p-6">
        {content}
      </main>
    </div>
  );
}
