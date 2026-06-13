import { useState } from "react";
import { AVAILABILITY_COLORS, TYPES, type RequestType } from "@office/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BRAND = [
  ["Dark blue", "#1B3380"],
  ["Electric blue", "#1B87E6"],
  ["Amber", "#F5A300"],
];
const GRAYS = [
  ["Lead", "#545E6B"],
  ["Muted", "#9B9B9B"],
  ["Border", "#D8D8D8"],
  ["Divider", "#E8E8E8"],
  ["Surface", "#F5F5F5"],
  ["Ink", "#1A1A1A"],
];
const SEMANTIC = [
  ["Success", "#227700", "#DFF2BF"],
  ["Warning", "#9F6000", "#FEEFB3"],
  ["Info", "#215694", "#E1F0FB"],
  ["Danger", "#CC0000", "#FFF1F1"],
];
const TYPE_SCALE = [
  ["Display-01", "48/56 · 300", 48, 56, 300],
  ["Display-02", "40/48 · 400", 40, 48, 400],
  ["Heading-01", "32/40 · 400", 32, 40, 400],
  ["Heading-02", "24/32 · 400", 24, 32, 400],
  ["Heading-03", "18/32 · 500", 18, 32, 500],
  ["Heading-04", "16/24 · 500", 16, 24, 500],
  ["Body", "14/20 · 400", 14, 20, 400],
] as const;

function Swatch({ name, hex, text = "#fff" }: { name: string; hex: string; text?: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex h-16 items-end p-2" style={{ background: hex, color: text }}>
        <span className="text-xs font-medium">{hex}</span>
      </div>
      <div className="bg-card px-2 py-1 text-xs text-muted-foreground">{name}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-[18px] font-medium leading-8">{title}</h2>
      {children}
    </section>
  );
}

export function TokensPage() {
  const [open, setOpen] = useState(false);
  const types = Object.entries(TYPES) as [RequestType, (typeof TYPES)[RequestType]][];

  return (
    <main className="mx-auto max-w-[1100px] px-7 py-10">
      <h1 className="text-[32px] font-normal leading-10">Design tokens</h1>
      <p className="mb-8 text-lead">QuestionPro Wick · Fira Sans · shadcn — README §Design Tokens</p>

      <Section title="Brand">
        <div className="grid grid-cols-3 gap-3">
          {BRAND.map(([n, h]) => (
            <Swatch key={n} name={n} hex={h} />
          ))}
        </div>
      </Section>

      <Section title="Grays">
        <div className="grid grid-cols-6 gap-3">
          {GRAYS.map(([n, h]) => (
            <Swatch key={n} name={n} hex={h} text={h === "#F5F5F5" || h === "#D8D8D8" || h === "#E8E8E8" ? "#1A1A1A" : "#fff"} />
          ))}
        </div>
      </Section>

      <Section title="Semantic pairs (deep / soft)">
        <div className="grid grid-cols-4 gap-3">
          {SEMANTIC.map(([n, deep, soft]) => (
            <div key={n} className="rounded-md border border-border p-3" style={{ background: soft, color: deep }}>
              <div className="text-sm font-medium">{n}</div>
              <div className="text-xs">{deep} / {soft}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography — Fira Sans (300/400/500)">
        <div className="rounded-md border border-border bg-card p-5">
          {TYPE_SCALE.map(([n, meta, size, lh, w]) => (
            <div key={n} className="flex items-baseline gap-4 border-b border-divider py-2 last:border-0">
              <span className="w-28 shrink-0 text-xs text-muted-foreground">{meta}</span>
              <span style={{ fontSize: size, lineHeight: `${lh}px`, fontWeight: w }}>{n} — অফিস</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Request type tiles (shared TYPES)">
        <div className="grid grid-cols-3 gap-3">
          {types.map(([key, t]) => (
            <div key={key} className="flex items-center gap-3 rounded-[10px] border border-border bg-card p-3">
              <div className="flex size-[46px] items-center justify-center rounded-tile" style={{ background: t.bg, color: t.fg }}>
                <span className="material-symbols-rounded text-[22px]">{t.icon}</span>
              </div>
              <div>
                <div className="font-medium">{t.en}</div>
                <div className="text-sm text-muted-foreground">{t.bn}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Availability chips">
        <div className="flex gap-3">
          {Object.entries(AVAILABILITY_COLORS).map(([k, c]) => (
            <span key={k} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
              style={{ color: c, background: `color-mix(in srgb, ${c} 14%, white)` }}>
              <span className="size-2 rounded-full" style={{ background: c }} />
              {k}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Components">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary (electric)</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Urgent</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="success">Completed</Badge>
          <Badge variant="warning">Waiting</Badge>
          <Badge variant="info">In progress</Badge>
          <Badge variant="danger">Urgent</Badge>
        </div>
        <Card className="mt-4 max-w-sm">
          <CardHeader>
            <CardTitle>Card</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            White surface, 1px #D8D8D8, 10px radius.
          </CardContent>
        </Card>
        <div className="mt-4">
          <Tabs defaultValue="new">
            <TabsList>
              <TabsTrigger value="new">নতুন</TabsTrigger>
              <TabsTrigger value="prog">চলছে</TabsTrigger>
              <TabsTrigger value="done">সম্পন্ন</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="text-sm text-muted-foreground">New tab content</TabsContent>
            <TabsContent value="prog" className="text-sm text-muted-foreground">In progress</TabsContent>
            <TabsContent value="done" className="text-sm text-muted-foreground">Completed</TabsContent>
          </Tabs>
        </div>
        <div className="mt-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Open modal (shadow check)</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New request</DialogTitle>
                <DialogDescription>460px · 16px radius · 0 10px 40px rgba(27,51,128,.15)</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => setOpen(false)}>Send request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Section>
    </main>
  );
}
