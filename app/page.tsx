import Image from "next/image";
import Link from "next/link";
import {
  AiBrainIcon,
  AiChatIcon,
  ArrowRight01Icon,
  BellIcon,
  BoxesIcon,
  Brain03Icon,
  ChartIcon,
  CheckIcon,
  DatabaseIcon,
  Link05Icon,
  PlugIcon,
  Search01Icon,
  Settings01Icon,
  ShieldCheck,
  SparklesIcon,
  WorkflowCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnthropicBlack } from "@/components/ui/svgs/anthropicBlack";
import { Drive } from "@/components/ui/svgs/drive";
import { GithubLight } from "@/components/ui/svgs/githubLight";
import { Gmail } from "@/components/ui/svgs/gmail";
import { GoogleCalendar } from "@/components/ui/svgs/googleCalendar";
import { GoogleSheets } from "@/components/ui/svgs/googleSheets";
import { Openai } from "@/components/ui/svgs/openai";
import { Outlook } from "@/components/ui/svgs/outlook";
import { Slack } from "@/components/ui/svgs/slack";
import { Telegram } from "@/components/ui/svgs/telegram";
import { cn } from "@/lib/utils";

const appUrl = "https://app.atmetai.com";

const connectedTools = [
  Slack,
  Gmail,
  Drive,
  GoogleSheets,
  GoogleCalendar,
  GithubLight,
  Outlook,
  Telegram,
  Openai,
  AnthropicBlack,
];

const mainFeatures = [
  {
    description:
      "Connect the systems your team already uses and let Atmet read across them with permission-aware context.",
    icon: PlugIcon,
    label: "01",
    title: "Connect your tools",
  },
  {
    description:
      "Ask in natural language and get a sourced answer instead of searching every app, tab, and thread yourself.",
    icon: Search01Icon,
    label: "02",
    title: "Ask once",
  },
  {
    description:
      "Turn gaps into reusable company knowledge by asking the right owner and saving the verified answer.",
    icon: Brain03Icon,
    label: "03",
    title: "Keep improving",
  },
] satisfies Array<{
  description: string;
  icon: IconSvgElement;
  label: string;
  title: string;
}>;

const bentoFeatures = [
  {
    className: "lg:col-span-4",
    description:
      "Ask Atmet from one chat surface and route the answer through workspace context, connected tools, and the model your team chooses.",
    icon: AiChatIcon,
    title: "AI chat workspace",
    visual: "chat",
  },
  {
    className: "lg:col-span-2",
    description:
      "Plug in Slack, Gmail, Drive, GitHub, Calendar, Sheets, Outlook, Telegram, OpenAI, Anthropic, and more.",
    icon: PlugIcon,
    title: "Connectors",
    visual: "connectors",
  },
  {
    className: "lg:col-span-3",
    description:
      "Build reusable workflow agents with triggers, scheduled runs, nodes, edges, versions, members, and run history.",
    icon: WorkflowCircleIcon,
    title: "Workflow agents",
    visual: "agents",
  },
  {
    className: "lg:col-span-3",
    description:
      "Create workspace skills and reusable instructions so common work gets handled the same way every time.",
    icon: BoxesIcon,
    title: "Skills",
    visual: "skills",
  },
  {
    className: "lg:col-span-2",
    description:
      "Keep reusable company memory in the workspace brain, enriched by answers, files, and connected activity.",
    icon: Brain03Icon,
    title: "Workspace brain",
    visual: "brain",
  },
  {
    className: "lg:col-span-2",
    description:
      "Require confirmation before sensitive actions and review agent approvals from the same workspace.",
    icon: ShieldCheck,
    title: "Approvals",
    visual: "approvals",
  },
  {
    className: "lg:col-span-2",
    description:
      "Track tokens, files, storage, automations, chats, workflow runs, connectors, and member limits.",
    icon: ChartIcon,
    title: "Usage controls",
    visual: "usage",
  },
  {
    className: "lg:col-span-3",
    description:
      "Choose Atmet default models or connect OpenAI, Anthropic, custom, and local providers for your workspace.",
    icon: Settings01Icon,
    title: "Model and provider setup",
    visual: "models",
  },
  {
    className: "lg:col-span-3",
    description:
      "See workflow events, status changes, usage events, and notifications when important work needs attention.",
    icon: BellIcon,
    title: "Observability and notifications",
    visual: "observability",
  },
] satisfies Array<{
  className: string;
  description: string;
  icon: IconSvgElement;
  title: string;
  visual:
    | "agents"
    | "approvals"
    | "brain"
    | "chat"
    | "connectors"
    | "models"
    | "observability"
    | "skills"
    | "usage";
}>;

const useCases = [
  "Resolve conflicting policy answers",
  "Prepare customer and sales calls",
  "Find the owner of a decision",
  "Create daily team briefings",
  "Onboard new hires faster",
  "Track work across tools",
  "Summarize workspace activity",
  "Preserve tacit knowledge",
];

function AtmetLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <Image
        alt=""
        aria-hidden="true"
        className="size-6"
        height={24}
        src="/Atmet Logos/Atmet Light mode.svg"
        width={24}
      />
      <span>Atmet</span>
    </span>
  );
}

function IconBadge({ icon }: { icon: IconSvgElement }) {
  return (
    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-secondary text-foreground">
      <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8} />
    </span>
  );
}

function ProductMockup() {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f7f7f5,#e9f5ff_48%,#fdfbf7)] p-3 shadow-[0_1px_0_rgba(0,0,0,0.05),0_32px_90px_rgba(28,31,36,0.12)] outline outline-1 outline-black/10">
      <div className="rounded-xl bg-card p-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] outline outline-1 outline-black/10">
        <div className="grid min-h-[520px] grid-cols-1 overflow-hidden rounded-lg bg-background outline outline-1 outline-black/10 md:grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-border bg-sidebar p-4 md:block">
            <AtmetLogo className="text-sm" />
            <nav className="mt-8 space-y-1 text-sm">
              {["Home", "Chats", "Agents", "Brain", "Connectors"].map((item, index) => (
                <div
                  className={cn(
                    "flex h-9 items-center rounded-lg px-3 text-muted-foreground",
                    index === 1 && "bg-background text-foreground shadow-xs",
                  )}
                  key={item}
                >
                  {item}
                </div>
              ))}
            </nav>
            <div className="mt-10 rounded-xl bg-background p-3 shadow-xs outline outline-1 outline-black/10">
              <div className="text-xs font-medium text-muted-foreground">Connected</div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {connectedTools.slice(0, 10).map((Tool, index) => (
                  <span className="flex size-7 items-center justify-center" key={index}>
                    <Tool className="size-4" />
                  </span>
                ))}
              </div>
            </div>
          </aside>
          <main className="flex flex-col p-4 sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-medium">Workspace answer</p>
                <p className="text-sm text-muted-foreground">SLA response time</p>
              </div>
              <Button size="sm" variant="outline">
                <HugeiconsIcon icon={SparklesIcon} />
                Ask Atmet
              </Button>
            </div>
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8">
              <div className="flex gap-3">
                <div className="size-9 rounded-full bg-secondary" />
                <div>
                  <p className="text-sm font-medium">You</p>
                  <p className="mt-1 text-sm text-foreground">
                    What is our response time for enterprise customer tickets?
                  </p>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="size-4 invert"
                    height={16}
                    src="/Atmet Logos/Atmet Dark mode.svg"
                    width={16}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Atmet</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    I found two sources with conflicting details. The support handbook
                    says <span className="font-medium text-foreground">4 hours</span>,
                    while the latest account operations doc says{" "}
                    <span className="font-medium text-foreground">2 hours</span>.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>4 sources used</span>
                    {connectedTools.slice(0, 4).map((Tool, index) => (
                      <span className="flex size-5 items-center justify-center" key={index}>
                        <Tool className="size-4" />
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl bg-secondary p-3 text-sm shadow-xs outline outline-1 outline-black/10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>Ask the support owner to confirm the correct SLA?</span>
                      <div className="flex gap-2">
                        <Button size="xs" variant="outline">
                          Reject
                        </Button>
                        <Button size="xs">Confirm</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function BentoVisual({
  type,
}: {
  type:
    | "agents"
    | "approvals"
    | "brain"
    | "chat"
    | "connectors"
    | "models"
    | "observability"
    | "skills"
    | "usage";
}) {
  if (type === "chat") {
    return (
      <div className="mt-6 rounded-xl bg-background p-4 shadow-sm outline outline-1 outline-black/10">
        <div className="space-y-4 text-sm">
          <div className="flex gap-3">
            <div className="size-7 rounded-full bg-secondary" />
            <p>Summarize the launch blockers across Slack and GitHub.</p>
          </div>
          <div className="rounded-lg bg-card p-3 text-muted-foreground shadow-xs">
            Found 3 blockers, 2 owners, and one pending approval.
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span>Sources</span>
              {connectedTools.slice(0, 4).map((Tool, index) => (
                <Tool className="size-4" key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "connectors") {
    return (
      <div className="mt-6 grid grid-cols-5 gap-3">
        {connectedTools.map((Tool, index) => (
          <span
            className="flex size-10 items-center justify-center rounded-lg bg-background shadow-xs outline outline-1 outline-black/10"
            key={index}
          >
            <Tool className="size-5" />
          </span>
        ))}
      </div>
    );
  }

  if (type === "agents") {
    return (
      <div className="mt-6 rounded-xl bg-background p-4 shadow-sm outline outline-1 outline-black/10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs font-medium">
          <span className="rounded-lg bg-card px-3 py-2 shadow-xs">Trigger</span>
          <span className="h-px w-6 bg-border" />
          <span className="rounded-lg bg-card px-3 py-2 shadow-xs">Run agent</span>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs font-medium">
          <span className="rounded-lg bg-card px-3 py-2 shadow-xs">Approve</span>
          <span className="h-px w-6 bg-border" />
          <span className="rounded-lg bg-card px-3 py-2 shadow-xs">Write back</span>
        </div>
      </div>
    );
  }

  if (type === "skills") {
    return (
      <div className="mt-6 space-y-2">
        {["Sales brief", "Support triage", "Product research"].map((skill, index) => (
          <div
            className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm shadow-xs outline outline-1 outline-black/10"
            key={skill}
          >
            <span>{skill}</span>
            <span className="tabular-nums text-xs text-muted-foreground">0{index + 1}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === "brain") {
    return (
      <div className="mt-6 rounded-xl bg-background p-4 shadow-sm outline outline-1 outline-black/10">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-lg bg-[#e8f5ff] text-[#126aa1]">
            <HugeiconsIcon icon={DatabaseIcon} size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="h-2 rounded-full bg-primary/80" />
            <div className="mt-2 h-2 w-3/4 rounded-full bg-secondary" />
            <div className="mt-2 h-2 w-1/2 rounded-full bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "approvals") {
    return (
      <div className="mt-6 rounded-xl bg-background p-4 text-sm shadow-sm outline outline-1 outline-black/10">
        <p className="font-medium">Send update to Slack?</p>
        <div className="mt-4 flex gap-2">
          <Button size="xs" variant="outline">
            Reject
          </Button>
          <Button size="xs">Confirm</Button>
        </div>
      </div>
    );
  }

  if (type === "usage") {
    return (
      <div className="mt-6 space-y-3">
        {[
          ["Tokens", "72%"],
          ["Connectors", "6/10"],
          ["Workflow runs", "128"],
        ].map(([label, value]) => (
          <div className="rounded-lg bg-background p-3 shadow-xs outline outline-1 outline-black/10" key={label}>
            <div className="flex justify-between text-xs font-medium">
              <span>{label}</span>
              <span className="tabular-nums text-muted-foreground">{value}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-2/3 rounded-full bg-[#1e90ff]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "models") {
    return (
      <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
        {["Atmet", "OpenAI", "Anthropic", "Local"].map((model, index) => (
          <div
            className={cn(
              "rounded-lg bg-background px-3 py-2 shadow-xs outline outline-1 outline-black/10",
              index === 0 && "outline-2 outline-[#1e90ff]/60",
            )}
            key={model}
          >
            {model}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-2 text-sm">
      {[
        ["workflow.run", "success"],
        ["usage.tokens", "72%"],
        ["approval.waiting", "1"],
      ].map(([event, status]) => (
        <div
          className="flex items-center justify-between rounded-lg bg-background px-3 py-2 shadow-xs outline outline-1 outline-black/10"
          key={event}
        >
          <span>{event}</span>
          <span className="tabular-nums text-xs text-muted-foreground">{status}</span>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link aria-label="Atmet home" href="/">
            <AtmetLogo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link className="transition-colors hover:text-foreground" href="#features">
              Features
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#use-cases">
              Use cases
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#cta">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button render={<Link href={`${appUrl}/login`} />} size="sm" variant="ghost">
              Log in
            </Button>
            <Button render={<Link href={`${appUrl}/signup`} />} size="sm">
              Get started
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 pt-20 pb-24 sm:pt-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-[#1e90ff]">AI workspace for modern teams</p>
            <h1 className="mt-5 max-w-3xl text-balance font-heading text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
              One place to ask, automate, and know what your company knows
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              Atmet connects chats, files, apps, agents, and workflows into one
              permission-aware AI workspace with answers your team can verify.
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:pb-2">
            <Button render={<Link href="mailto:team@atmetai.com?subject=Atmet demo" />} size="lg">
              Book a demo
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
            <Button render={<Link href={`${appUrl}/signup`} />} size="lg" variant="outline">
              Create account
            </Button>
          </div>
        </div>
        <ProductMockup />
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-24" id="features">
        <h2 className="max-w-xl text-balance font-heading text-3xl font-semibold sm:text-4xl">
          Connect your tools. Ask in plain language. Let Atmet fill the gaps.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {mainFeatures.map((feature) => (
            <div key={feature.title}>
              <div className="flex h-64 items-center justify-center rounded-2xl bg-card shadow-sm outline outline-1 outline-black/10">
                <IconBadge icon={feature.icon} />
              </div>
              <p className="mt-6 text-sm font-semibold text-[#1e90ff]">{feature.label}</p>
              <h3 className="mt-3 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-pretty leading-7 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-24">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-center">
          <div>
            <h2 className="text-balance font-heading text-3xl font-semibold sm:text-4xl">
              Reliable results. For everything.
            </h2>
            <p className="mt-4 text-pretty leading-7 text-muted-foreground">
              Ask across scattered company knowledge and get a clear answer with
              sources, ownership, and next actions.
            </p>
          </div>
          <Card className="min-h-[420px] justify-center p-8">
            <div className="mx-auto max-w-xl">
              <div className="flex gap-3">
                <div className="size-9 rounded-full bg-secondary" />
                <div>
                  <p className="text-sm font-medium">You</p>
                  <p className="mt-1 text-sm">What changed in the enterprise renewal plan?</p>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={SparklesIcon} size={17} />
                </span>
                <div>
                  <p className="text-sm font-medium">Atmet</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    The renewal date moved to Friday, procurement requested a
                    security addendum, and finance approved the discount. I can
                    draft the customer follow-up now.
                  </p>
                  <div className="mt-5 rounded-xl bg-secondary p-3 text-sm shadow-xs outline outline-1 outline-black/10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span>Draft follow-up in Gmail</span>
                      <Button size="xs">
                        <HugeiconsIcon icon={CheckIcon} />
                        Confirm
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-24">
        <h2 className="max-w-3xl text-balance font-heading text-3xl font-semibold sm:text-4xl">
          The Atmet workspace, broken into the pieces your team actually uses
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-6">
          {bentoFeatures.map((feature) => (
            <Card className={cn("min-h-[300px] overflow-hidden p-6", feature.className)} key={feature.title}>
              <div className="flex items-center gap-3">
                <IconBadge icon={feature.icon} />
                <h3 className="font-semibold">{feature.title}</h3>
              </div>
              <BentoVisual type={feature.visual} />
              <p className="mt-auto pt-8 text-pretty leading-7 text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-24" id="use-cases">
        <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
          <div>
            <h2 className="text-balance font-heading text-3xl font-semibold sm:text-4xl">
              Shared knowledge for every team
            </h2>
            <p className="mt-4 text-pretty leading-7 text-muted-foreground">
              From support and sales to product and operations, Atmet gives every
              team a faster way to find context and move work forward.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {useCases.map((useCase) => (
              <div
                className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 text-sm font-medium shadow-xs outline outline-1 outline-black/10"
                key={useCase}
              >
                <span className="inline-flex size-6 items-center justify-center rounded-md bg-[#e8f5ff] text-[#126aa1]">
                  <HugeiconsIcon icon={CheckIcon} size={15} strokeWidth={2} />
                </span>
                {useCase}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-24" id="cta">
        <div className="rounded-2xl bg-primary px-6 py-12 text-primary-foreground shadow-[0_20px_70px_rgba(28,31,36,0.20)] sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="max-w-2xl text-balance font-heading text-3xl font-semibold sm:text-4xl">
                Give your team one place to ask across every tool.
              </h2>
              <p className="mt-4 max-w-2xl text-pretty leading-7 text-primary-foreground/72">
                Bring Atmet into your workspace and turn scattered knowledge into
                sourced answers, workflows, and reusable team memory.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button render={<Link href="mailto:team@atmetai.com?subject=Atmet demo" />} size="lg" variant="outline">
                Book a demo
              </Button>
              <Button render={<Link href={`${appUrl}/signup`} />} size="lg" variant="secondary">
                Create account
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <AtmetLogo className="text-foreground" />
          <div className="flex flex-wrap gap-5">
            <Link className="transition-colors hover:text-foreground" href="mailto:team@atmetai.com">
              Contact
            </Link>
            <Link className="transition-colors hover:text-foreground" href={`${appUrl}/login`}>
              Log in
            </Link>
            <span className="tabular-nums">© 2026 Atmet</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
