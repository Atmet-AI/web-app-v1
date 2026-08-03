"use client";

import Image from "next/image";
import { palettes as oreoAvatarPalettes } from "@oreo-design/avatar";
import { Avatar as OreoAvatar } from "@oreo-design/avatar/react";
import { GradientSpin } from "gradient-spin";
import {
  Ai as AiLogoIcon,
  AiBrainIcon,
  AiChatIcon,
  AiMagicIcon,
  AppWindowIcon,
  AppWindowMacIcon,
  ArrowRight01Icon,
  BellIcon,
  BookOpenIcon,
  BoxesIcon,
  Brain03Icon,
  BuildingIcon,
  CalendarClockIcon,
  Cancel01Icon,
  ChartIcon,
  Chat01Icon,
  ChevronDownIcon,
  CheckIcon,
  ClipboardCopyIcon,
  CodeIcon,
  Copy01Icon,
  CopyLinkIcon,
  CreditCardIcon,
  DatabaseIcon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  EyeIcon,
  File01Icon,
  FileUploadIcon,
  Heading01Icon,
  Link05Icon,
  ListViewIcon,
  HelpCircleIcon,
  LifebuoyIcon,
  Logout03Icon,
  MoreHorizontalIcon,
  Moon02Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PauseCircleIcon,
  PencilEdit02Icon,
  PinIcon,
  PinOffIcon,
  PlayIcon,
  ProfileIcon,
  PlugIcon,
  PlusSignIcon,
  QuoteUpIcon,
  RefreshIcon,
  SaveIcon,
  Search01Icon,
  SendHorizontal,
  Settings01Icon,
  ShieldCheck,
  SparklesIcon,
  SourceCodeIcon,
  Sun03Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextNumberSignIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Unlink01Icon,
  UserAdd01Icon,
  UserRound,
  Users,
  WalletCardsIcon,
  WorkflowCircleIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFrame,
  CardFrameAction,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import CommandPalette, {
  type CommandPaletteGroup,
} from "@/components/p-command-1";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Frame,
  FramePanel,
} from "@/components/ui/frame";
import {
  Group,
  GroupSeparator,
} from "@/components/ui/group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnthropicBlack } from "@/components/ui/svgs/anthropicBlack";
import { Openai } from "@/components/ui/svgs/openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { summarizeChatTitle } from "@/lib/chats/title";
import {
  bindAtmetSounds,
  playAtmetSound,
  playAtmetSuccessSound,
  setAtmetSoundEnabled,
  warmAtmetAudio,
} from "@/lib/sound";
import {
  blueCtaButtonClassName,
  getInitialCtaAccentPreference,
  saveCtaAccentPreference,
  type CtaAccentPreference,
} from "@/lib/cta-accent";
import {
  connectorCatalog,
  connectorCatalogKeys,
  getConnectorCatalogEntry,
} from "@/lib/connectors/catalog";

type PageKey =
  | "chat"
  | "brain"
  | "agents"
  | "skills"
  | "connectors"
  | "usage"
  | "notifications"
  | "changelogs"
  | "settings"
  | "admin";

const pageKeyValues: PageKey[] = [
  "chat",
  "brain",
  "agents",
  "skills",
  "connectors",
  "usage",
  "notifications",
  "changelogs",
  "settings",
  "admin",
];

type NavigationItem = {
  icon: IconSvgElement;
  key: PageKey;
  label: string;
};

const primaryNavigation = [
  { key: "chat", label: "New chat", icon: PlusSignIcon },
  { key: "agents", label: "Workflow Agents", icon: WorkflowCircleIcon },
  { key: "brain", label: "Brain", icon: Brain03Icon },
  { key: "skills", label: "Skills", icon: BoxesIcon },
  { key: "connectors", label: "Connectors", icon: PlugIcon },
  { key: "usage", label: "Usage", icon: ChartIcon },
] satisfies NavigationItem[];

const secondaryNavigation = [
  { key: "admin", label: "Admin Console", icon: ShieldCheck },
  { key: "changelogs", label: "Changelogs", icon: File01Icon },
] satisfies NavigationItem[];

const settingsNavigation = {
  key: "settings",
  label: "Settings",
  icon: Settings01Icon,
} satisfies NavigationItem;

const backgroundHydrationPageKeys = new Set<PageKey>([
  "agents",
  "brain",
  "skills",
  "connectors",
  "usage",
  "settings",
]);

type Agent = {
  id?: string;
  appLogos: string[];
  gradient: string;
  modelKey: string;
  name: string;
  runtime: "paused" | "running";
  schedule?: string | null;
  status: string;
  tokenUsage: number;
  tone: "info" | "outline" | "success" | "warning";
  workflowCards?: PlaygroundCard[];
  workflowConnections?: PlaygroundConnection[];
};

type SkillItem = {
  content: string;
  description: string;
  gradient: string;
  id: string;
  icon: IconSvgElement;
  name: string;
  source: "custom" | "default";
};

type PlaygroundCard = {
  apps: string[];
  chatId?: string;
  id: string;
  modelKey: string;
  runtime: "paused" | "running";
  title: string;
  x: number;
  y: number;
};

type PlaygroundCardRunState = "complete" | "idle" | "running";

type PlaygroundConnection = {
  from: string;
  to: string;
};

type AgentObservabilityData = {
  approvals: DatabaseRecord[];
  runs: DatabaseRecord[];
  versions: DatabaseRecord[];
};

type PlaygroundDrag = {
  from: string;
  x: number;
  y: number;
} | null;

type NodeDrag = {
  cardId: string;
  offsetX: number;
  offsetY: number;
} | null;

type PlaygroundContextMenu = {
  targetId: string | null;
  x: number;
  y: number;
} | null;

const PLAYGROUND_CARD_HEIGHT = 128;
const PLAYGROUND_CARD_WIDTH = 240;
const PLAYGROUND_EDGE_GAP = 24;
const PLAYGROUND_HANDLE_OVERHANG = 8;
const PLAYGROUND_MENU_EDGE_GAP = 8;
const PLAYGROUND_MENU_HEIGHT = 136;
const PLAYGROUND_MENU_WIDTH = 192;
const PLAYGROUND_MIN_HEIGHT = 496;
const PLAYGROUND_MIN_WIDTH = 1088;
const PLAYGROUND_SCROLLBAR_GAP = 18;
const WORKFLOW_NODE_STEP_MS = 850;

const skillIconOptions = [
  Search01Icon,
  BookOpenIcon,
  BuildingIcon,
  DatabaseIcon,
  WorkflowCircleIcon,
  LifebuoyIcon,
  AiMagicIcon,
  CodeIcon,
  SparklesIcon,
  BoxesIcon,
  Brain03Icon,
  File01Icon,
] satisfies IconSvgElement[];

const skillGradientOptions = [
  "from-sky-100 via-stone-50 to-emerald-100 dark:from-sky-950/40 dark:via-stone-950 dark:to-emerald-950/40",
  "from-violet-100 via-stone-50 to-amber-100 dark:from-violet-950/40 dark:via-stone-950 dark:to-amber-950/40",
  "from-rose-100 via-stone-50 to-cyan-100 dark:from-rose-950/40 dark:via-stone-950 dark:to-cyan-950/40",
  "from-lime-100 via-stone-50 to-blue-100 dark:from-lime-950/40 dark:via-stone-950 dark:to-blue-950/40",
  "from-orange-100 via-stone-50 to-teal-100 dark:from-orange-950/40 dark:via-stone-950 dark:to-teal-950/40",
  "from-fuchsia-100 via-stone-50 to-yellow-100 dark:from-fuchsia-950/40 dark:via-stone-950 dark:to-yellow-950/40",
] satisfies string[];

type ConnectorItem = {
  key?: string;
  category: string;
  description: string;
  gradient: string;
  logo: string;
  name: string;
  paragraph: string;
};

const connectorCatalogKeySet = new Set<string>(connectorCatalogKeys);

const defaultConnectorCatalog = connectorCatalog satisfies DatabaseRecord[];

const defaultConnectorList = defaultConnectorCatalog
  .map((app, index) => mapConnector(app, new Set<string>(), index))
  .filter((item): item is ConnectorItem => Boolean(item));

function getConnectorForLogo(logo?: string | null) {
  const raw = asString(logo).toLowerCase();
  if (!raw) {
    return null;
  }

  return connectorCatalog.find((connector) => {
    const labels = [connector.key, connector.logo, connector.name]
      .filter(Boolean)
      .map((label) => label.toLowerCase());

    return labels.includes(raw);
  }) ?? null;
}

function normalizeAppLogoKeys(logos: readonly string[]) {
  const keys = new Set<string>();

  for (const logo of logos) {
    const value = asString(logo);
    if (!value) {
      continue;
    }

    const connector = getConnectorForLogo(value);
    keys.add(connector?.key ?? value);
  }

  return Array.from(keys);
}

function getAppLogoKeysFromText(text: string) {
  const content = asString(text).toLowerCase();
  if (!content) {
    return [];
  }

  const matches = new Set<string>();
  const appMatchers = [
    { key: "gmail", pattern: /\bgmail\b|\bgoogle\s+mail\b|\bemail\b|\bmail\b/ },
    { key: "telegram", pattern: /\btelegram\b/ },
    { key: "google-sheets", pattern: /\bgoogle\s+sheets?\b|\bsheets?\b|\bspreadsheet\b/ },
    { key: "calendar", pattern: /\bcalendar\b|\bgoogle\s+calendar\b/ },
    { key: "drive", pattern: /\bgoogle\s+drive\b|\bdrive\b/ },
    { key: "instagram", pattern: /\binstagram\b|\binsta\b/ },
    { key: "outlook", pattern: /\boutlook\b|\bmicrosoft\s+mail\b/ },
    { key: "slack", pattern: /\bslack\b/ },
    { key: "github", pattern: /\bgithub\b|\bgit\s*hub\b/ },
    { key: "chatgpt", pattern: /\bchatgpt\b|\bopenai\b|\bgpt\b/ },
    { key: "claude", pattern: /\bclaude\b|\banthropic\b/ },
  ] satisfies { key: string; pattern: RegExp }[];

  appMatchers.forEach((matcher) => {
    if (matcher.pattern.test(content)) {
      matches.add(matcher.key);
    }
  });

  return Array.from(matches);
}

function getAgentNodeAppLogoKeys(title: string, appKeys: readonly string[]) {
  const normalizedAppKeys = normalizeAppLogoKeys(appKeys);
  return mergeAppLogoKeys(normalizedAppKeys, getAppLogoKeysFromText(title));
}

function mergeAppLogoKeys(current: readonly string[], next: readonly string[]) {
  return normalizeAppLogoKeys([...current, ...next]);
}

const settingsTabs = [
  { value: "profile", label: "Profile", icon: UserRound },
  { value: "workspace", label: "Workspace", icon: BuildingIcon },
  { value: "general", label: "General", icon: Settings01Icon },
  { value: "data", label: "Data controls", icon: DatabaseIcon },
  { value: "refer", label: "Affiliate program", icon: WalletCardsIcon },
  { value: "billing", label: "Billing", icon: CreditCardIcon },
  { value: "docs", label: "Help docs", icon: BookOpenIcon },
  { value: "support", label: "Contact support", icon: HelpCircleIcon },
];

const adminTabs = [
  { value: "overview", label: "Admin overview", icon: ChartIcon },
  { value: "workspaces", label: "Workspaces and users", icon: BuildingIcon },
  { value: "requests", label: "Requests", icon: File01Icon },
  { value: "roles", label: "Roles and permissions", icon: ShieldCheck },
  { value: "usage", label: "Control usage", icon: DatabaseIcon },
];

const adminTabValues = [
  "overview",
  "workspaces",
  "requests",
  "roles",
  "usage",
] as const;

type AdminTabKey = (typeof adminTabValues)[number];

function isPageKey(value: string | null): value is PageKey {
  return Boolean(value && pageKeyValues.includes(value as PageKey));
}

function isAdminTabKey(value: string | null): value is AdminTabKey {
  return Boolean(
    value && adminTabValues.includes(value as AdminTabKey),
  );
}

function getInitialPage(): PageKey {
  if (typeof window === "undefined") {
    return "chat";
  }

  const page = new URLSearchParams(window.location.search).get("page");
  return isPageKey(page) ? page : "chat";
}

function getInitialAdminTab(): AdminTabKey {
  if (typeof window === "undefined") {
    return "overview";
  }

  const tab = new URLSearchParams(window.location.search).get("adminTab");
  return isAdminTabKey(tab) ? tab : "overview";
}

function getInitialChatId() {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("chat");
}

function getInitialAgentName() {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("agent");
}

function getInitialAdminProfileView(): AdminProfileView | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const type = params.get("adminProfileType");
  const name = params.get("adminProfileName");

  if ((type === "user" || type === "workspace") && name) {
    return { name, type };
  }

  return null;
}

function updateAppRouteState({
  adminTab,
  adminProfile,
  agentName,
  chatId,
  page,
  replace = false,
}: {
  adminTab?: AdminTabKey;
  adminProfile?: AdminProfileView | null;
  agentName?: string | null;
  chatId?: string | null;
  page?: PageKey;
  replace?: boolean;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const currentPage = url.searchParams.get("page");
  const nextPage = page ?? (isPageKey(currentPage) ? currentPage : "chat");

  url.searchParams.set("page", nextPage);

  if (adminTab) {
    url.searchParams.set("adminTab", adminTab);
  } else if (nextPage !== "admin") {
    url.searchParams.delete("adminTab");
  }

  if (adminProfile !== undefined) {
    if (adminProfile) {
      url.searchParams.set("adminProfileType", adminProfile.type);
      url.searchParams.set("adminProfileName", adminProfile.name);
    } else {
      url.searchParams.delete("adminProfileType");
      url.searchParams.delete("adminProfileName");
    }
  } else if (nextPage !== "admin") {
    url.searchParams.delete("adminProfileType");
    url.searchParams.delete("adminProfileName");
  }

  if (chatId !== undefined) {
    if (chatId) {
      url.searchParams.set("chat", chatId);
    } else {
      url.searchParams.delete("chat");
    }
  } else if (nextPage !== "chat") {
    url.searchParams.delete("chat");
  }

  if (agentName !== undefined) {
    if (agentName) {
      url.searchParams.set("agent", agentName);
    } else {
      url.searchParams.delete("agent");
    }
  } else if (nextPage !== "agents") {
    url.searchParams.delete("agent");
  }

  const nextPath = `${url.pathname}${url.search}${url.hash}`;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextPath === currentPath) {
    window.history.replaceState(
      {
        ...(window.history.state ?? {}),
        adminProfile,
        adminTab,
        agentName,
        atmet: true,
        chatId,
        page: nextPage,
      },
      "",
      nextPath,
    );
    return;
  }

  const nextState = {
    ...(window.history.state ?? {}),
    adminProfile,
    adminTab,
    agentName,
    atmet: true,
    chatId,
    page: nextPage,
  };
  const historyMethod = replace ? "replaceState" : "pushState";
  window.history[historyMethod](nextState, "", nextPath);
}

type AdminWorkspaceRow = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];
type AdminRequestRow = {
  companySize: string;
  company: string;
  country: string;
  email: string;
  id: string;
  name: string;
  notes: string;
  roleTitle: string;
  source: string;
  status: string;
  submitted: string;
  useCase: string;
  workType: string;
};
type AdminLogRow = {
  detail: string;
  event: string;
  sortTime: string;
  source: "AI" | "Activity" | "Session" | "Usage" | "Workflow";
  status: string;
  time: string;
  user: string;
  workspace: string;
};
type AdminUserRow = [string, string, string, string, string, string, string];
type AdminRoleRow = [string, string, string];

type AdminProfileView =
  | { name: string; type: "user" }
  | { name: string; type: "workspace" };

type AdminAIFeedback = {
  assistantDislikes: number;
  assistantLikes: number;
  assistantPositiveRate: number;
  assistantTotal: number;
  dislikes: number;
  likes: number;
  total: number;
};

type AdminAIPerformance = {
  avgLatencyMs: number;
  completed: number;
  failed: number;
  runs: number;
  successRate: number;
};

type AdminData = {
  aiFeedback: AdminAIFeedback;
  aiPerformance: AdminAIPerformance;
  activityLogs: AdminLogRow[];
  requests: AdminRequestRow[];
  roles: AdminRoleRow[];
  sessionLogs: AdminLogRow[];
  usageControls: DatabaseRecord[];
  users: AdminUserRow[];
  workspaces: AdminWorkspaceRow[];
};

const emptyAdminAIFeedback: AdminAIFeedback = {
  assistantDislikes: 0,
  assistantLikes: 0,
  assistantPositiveRate: 0,
  assistantTotal: 0,
  dislikes: 0,
  likes: 0,
  total: 0,
};

const emptyAdminAIPerformance: AdminAIPerformance = {
  avgLatencyMs: 0,
  completed: 0,
  failed: 0,
  runs: 0,
  successRate: 0,
};

const emptyAdminData: AdminData = {
  aiFeedback: emptyAdminAIFeedback,
  aiPerformance: emptyAdminAIPerformance,
  activityLogs: [],
  requests: [],
  roles: [],
  sessionLogs: [],
  usageControls: [],
  users: [],
  workspaces: [],
};

function mapAdminWorkspace(row: unknown): AdminWorkspaceRow | null {
  const record = asRecord(row);
  const name = asString(record.name);
  if (!name) {
    return null;
  }

  const status = asString(record.status, "active");
  return [
    name,
    asString(record.owner_name, "Unassigned"),
    asString(record.plan_key, "No plan"),
    String(asNumber(record.member_count)),
    status[0]?.toUpperCase() + status.slice(1),
    "0%",
    formatDateLabel(record.created_at) || "",
    asString(record.id),
    asString(record.avatar_url),
  ];
}

function mapAdminUser(row: unknown): AdminUserRow | null {
  const record = asRecord(row);
  const email = asString(record.email);
  const name = asString(record.full_name, email);
  if (!name && !email) {
    return null;
  }

  return [
    name,
    email,
    asString(record.default_workspace_name, ""),
    asString(record.role, "member")
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(" "),
    asString(record.membership_status, "active")
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase() + word.slice(1))
      .join(" "),
    formatDateTimeLabel(record.last_seen_at) || "Never",
    asString(record.avatar_url),
  ];
}

function mapAdminRequest(row: unknown): AdminRequestRow | null {
  const record = asRecord(row);
  const email = asString(record.email);
  if (!email) {
    return null;
  }

  const workType = asString(record.work_type);

  return {
    companySize: asString(record.company_size),
    company: asString(record.company_name),
    country: asString(record.country),
    email,
    id: asString(record.id, email),
    name: asString(record.full_name, email),
    notes: asString(record.notes),
    roleTitle: asString(record.role_title),
    source: asString(record.source),
    status: formatStatusLabel(asString(record.derived_status, asString(record.status, "pending"))),
    submitted: formatDateLabel(record.created_at) || "",
    useCase: asString(record.use_case, workType),
    workType,
  };
}

function mapAdminLog(
  row: unknown,
  source: AdminLogRow["source"],
): AdminLogRow | null {
  const record = asRecord(row);
  const profile = getRecordByKey(record, "profiles");
  const workspace = getRecordByKey(record, "workspaces");
  const createdAt = asString(record.created_at);
  const metadata = asRecord(record.metadata);
  const user = asString(
    profile.full_name,
    asString(profile.email, asString(metadata.email, "System")),
  );
  const workspaceName = asString(
    workspace.name,
    asString(metadata.workspaceName, "All workspaces"),
  );

  if (source === "Session") {
    return {
      detail: formatAdminLogDetail({
        fallback: asString(record.ip_address, "Unknown location"),
        metadata,
        primary: asString(record.ip_address),
      }),
      event: asString(record.event, "Session"),
      sortTime: createdAt,
      source,
      status: formatStatusLabel(asString(record.event, "Active")),
      time: formatDateTimeLabel(createdAt) || "",
      user,
      workspace: workspaceName,
    };
  }

  if (source === "Usage") {
    const resource = asString(record.resource, "usage");
    const quantity = asNumber(record.quantity);

    return {
      detail: formatAdminLogDetail({
        fallback: `${quantity.toLocaleString()} ${resource}`,
        metadata,
        primary: `${quantity.toLocaleString()} ${resource}`,
      }),
      event: `usage.${resource}`,
      sortTime: createdAt,
      source,
      status: "Recorded",
      time: formatDateTimeLabel(createdAt) || "",
      user,
      workspace: workspaceName,
    };
  }

  if (source === "AI") {
    const inputTokens = asNumber(record.input_tokens);
    const outputTokens = asNumber(record.output_tokens);
    const totalTokens = inputTokens + outputTokens;

    return {
      detail: [
        asString(record.provider_key),
        asString(record.model_key),
        totalTokens > 0 ? `${totalTokens.toLocaleString()} tokens` : "",
        asString(record.error),
      ]
        .filter(Boolean)
        .join(" / "),
      event: `ai.model.${asString(record.status, "run")}`,
      sortTime: createdAt,
      source,
      status: formatStatusLabel(asString(record.status, "Recorded")),
      time: formatDateTimeLabel(createdAt) || "",
      user,
      workspace: workspaceName,
    };
  }

  if (source === "Workflow") {
    const workflowRun = getRecordByKey(record, "workflow_runs");
    const workflowAgent = getRecordByKey(workflowRun, "workflow_agents");
    const workflowWorkspace = getRecordByKey(workflowAgent, "workspaces");

    return {
      detail: formatAdminLogDetail({
        fallback: asString(record.message, asString(record.event_type)),
        metadata,
        primary: [
          asString(workflowAgent.name),
          asString(record.message),
          asString(record.node_id),
        ]
          .filter(Boolean)
          .join(" / "),
      }),
      event: `workflow.${asString(record.event_type, "event")}`,
      sortTime: createdAt,
      source,
      status: formatStatusLabel(asString(record.event_type, "Recorded")),
      time: formatDateTimeLabel(createdAt) || "",
      user,
      workspace: asString(workflowWorkspace.name, workspaceName),
    };
  }

  return {
    detail: formatAdminLogDetail({
      fallback: asString(record.target_type, asString(record.target_id)),
      metadata,
      primary: [asString(record.target_type), asString(record.target_id)]
        .filter(Boolean)
        .join(" "),
    }),
    event: asString(record.action, "Activity"),
    sortTime: createdAt,
    source,
    status: "Recorded",
    time: formatDateTimeLabel(createdAt) || "",
    user,
    workspace: workspaceName,
  };
}

function formatAdminLogDetail({
  fallback,
  metadata,
  primary,
}: {
  fallback: string;
  metadata: Record<string, unknown>;
  primary: string;
}) {
  const details = [
    primary,
    asString(metadata.workspaceName),
    asString(metadata.chatTitle),
    asString(metadata.agentName),
    asString(metadata.appKey),
    asString(metadata.model),
    asString(metadata.email),
    asString(metadata.ipAddress),
    asString(metadata.path),
  ].filter(Boolean);
  const uniqueDetails = Array.from(new Set(details));

  if (uniqueDetails.length > 0) {
    return uniqueDetails.slice(0, 5).join(" / ");
  }

  return fallback || "No extra details";
}

function mapAdminRole(row: unknown): AdminRoleRow | null {
  const record = asRecord(row);
  const name = asString(record.name);
  if (!name) {
    return null;
  }

  return [
    name,
    asString(record.description),
    String(asRecordArray(record.workspace_custom_role_permissions).length),
  ];
}

const pageDescriptions = {
  admin:
    "Govern workspace access, requests, roles, and usage controls from one console.",
  agents:
    "Build and monitor agent workflows that can run across connected apps.",
  brain:
    "Personalize Atmet with your preferences, business details, and output style.",
  changelogs:
    "Track product updates, release notes, and workspace-facing changes.",
  connectors:
    "Connect apps so Atmet can work with files, messages, tasks, and calendars.",
  notifications:
    "Review workspace invites, approvals, updates, and account activity sent to you.",
  settings:
    "Manage profile, workspace preferences, billing, data, and support options.",
  skills:
    "Add reusable capabilities that agents and chats can call when work gets specific.",
  usage:
    "Usage summary for workspace activity, personal usage, and member limits.",
} satisfies Partial<Record<PageKey, string>>;

type SidebarChat = {
  id: string;
  appKeys?: string[];
  pinned: boolean;
  title: string;
};

type WorkflowChatNode = {
  appKeys?: string[];
  chatId: string;
  nodeId?: string;
  title: string;
};

type WorkflowSidebarChatMeta = {
  agentName: string;
  running: boolean;
  title: string;
};

type ChatDraftRequest = {
  chatId: string;
  prompt: string;
  requestId: number;
};

const lastSelectedChatModelKey = "atmet.chat.selected-model";
const chatAttachmentAccept = [
  "image/*",
  ".csv",
  ".docx",
  ".epub",
  ".html",
  ".json",
  ".md",
  ".odp",
  ".ods",
  ".odt",
  ".pdf",
  ".pptx",
  ".rtf",
  ".txt",
  ".xlsx",
  ".xml",
  ".yaml",
  ".yml",
].join(",");
const maxComposerAttachments = 6;
const maxComposerAttachmentBytes = 150 * 1024 * 1024;
const initialSidebarChats: SidebarChat[] = [];

type ChatModelLogo = "anthropic" | "atmet" | "openai";

type ChatModelOption = {
  description?: string;
  icon?: IconSvgElement;
  id: string;
  logo?: ChatModelLogo;
  logoAsset?: {
    dark?: string;
    light: string;
  };
  name: string;
  providerKey?: string;
  setupOnly?: boolean;
};

const modelOptions = [
  {
    description: "Balanced Atmet model",
    id: "atmet",
    logo: "atmet",
    logoAsset: {
      dark: "/Atmet%20default%20models/dark%20mode%20default.svg",
      light: "/Atmet%20default%20models/light%20mode%20default.svg",
    },
    name: "Atmet Default",
    providerKey: "atmet",
  },
  {
    description: "Higher reasoning for complex work",
    id: "atmet-sol",
    logo: "atmet",
    logoAsset: {
      light: "/Atmet%20default%20models/high%20model%20atmet.svg",
    },
    name: "Atmet High",
    providerKey: "atmet",
  },
  {
    description: "Fast, lighter Atmet model",
    id: "atmet-luna",
    logo: "atmet",
    logoAsset: {
      light: "/Atmet%20default%20models/lite%20model%20atmet.svg",
    },
    name: "Atmet Lite",
    providerKey: "atmet",
  },
  {
    description: "Balanced OpenAI model",
    id: "chatgpt",
    logo: "openai",
    name: "ChatGPT Auto",
    providerKey: "openai",
  },
  {
    description: "Flagship OpenAI reasoning",
    id: "gpt-5",
    logo: "openai",
    name: "GPT-5",
    providerKey: "openai",
  },
  {
    description: "Fast OpenAI model",
    id: "gpt-5-mini",
    logo: "openai",
    name: "GPT-5 mini",
    providerKey: "openai",
  },
  {
    description: "Light OpenAI fallback",
    id: "gpt-4o-mini",
    logo: "openai",
    name: "GPT-4o mini",
    providerKey: "openai",
  },
  {
    description: "Balanced Anthropic model",
    id: "claude-sonnet",
    logo: "anthropic",
    name: "Claude Sonnet",
    providerKey: "anthropic",
  },
  {
    description: "Stronger Anthropic reasoning",
    id: "claude-opus",
    logo: "anthropic",
    name: "Claude Opus",
    providerKey: "anthropic",
  },
  {
    description: "Fast Anthropic model",
    id: "claude-haiku",
    logo: "anthropic",
    name: "Claude Haiku",
    providerKey: "anthropic",
  },
] satisfies ChatModelOption[];

const setupModelOptions = [
  {
    description: "Add your API key in Settings",
    icon: CodeIcon,
    id: "setup-custom-api",
    name: "Custom API",
    providerKey: "custom",
    setupOnly: true,
  },
  {
    description: "Coming soon",
    icon: DatabaseIcon,
    id: "setup-local-model",
    name: "Local model",
    providerKey: "local",
    setupOnly: true,
  },
] satisfies ChatModelOption[];

function getChatModelOption(modelKey?: string | null): ChatModelOption {
  const key = modelKey || "atmet";

  return (
    modelOptions.find((model) => model.id === key) ??
    setupModelOptions.find((model) => model.id === key) ?? {
      description: "Workspace model",
      icon: AiChatIcon,
      id: key,
      name: key,
      providerKey: "custom",
    }
  );
}

type ComposerOption = {
  id: string;
  kind: "apps" | "skills";
  connectorKey?: string;
  logo?: string;
  name: string;
  icon?: IconSvgElement;
};

type AiOutputVariant =
  | "code-block"
  | "comparison-table"
  | "data-table"
  | "file-diff"
  | "image-generation"
  | "inline-citations"
  | "reasoning"
  | "streaming-text"
  | "text-response"
  | "thinking"
  | "todo-list"
  | "web-search";

type ChatMessage = {
  approval?: ChatApprovalRequest | null;
  attachments?: ChatMessageAttachment[];
  content: string;
  feedback?: "dislike" | "like" | null;
  id: string;
  mentions?: ChatMessageMention[];
  role: "assistant" | "user";
  state?: "complete" | "thinking" | "typing";
  variant?: AiOutputVariant;
};

type ChatApprovalRequest = {
  agentId: string;
  appKeys: string[];
  approvalId: string;
  nodeId: string;
  runId: string;
  status: string;
};

type ChatMessageAttachment = {
  error?: string | null;
  kind?: string;
  name: string;
  previewData?: string | null;
  size: number;
  type: string;
};

type ChatMessageMention = {
  key?: string;
  kind: "apps" | "skills";
  logo?: string;
  name: string;
};

type ComposerAttachment = {
  data: string;
  id: string;
  kind: "document" | "image" | "text" | "unknown";
  name: string;
  size: number;
  type: string;
};

type AiTextSegment =
  | { text: string; type: "text" }
  | { code: string; language?: string; type: "code" }
  | { items: AiTaskListItem[]; type: "task-list" }
  | { headers: string[]; rows: string[][]; type: "table" };

type AiTaskListItem = {
  checked: boolean;
  text: string;
};

type DatabaseRecord = Record<string, unknown>;

type DashboardData = {
  agents?: unknown[];
  apps?: unknown[];
  brain?: unknown;
  changelogs?: unknown[];
  chats?: unknown[];
  connections?: unknown[];
  members?: unknown[];
  notifications?: unknown[];
  partial?: unknown;
  preferences?: unknown;
  profile?: unknown;
  setupUrl?: unknown;
  skills?: unknown[];
  subscription?: unknown;
  usage?: unknown;
  workspace?: unknown;
  workspaceSettings?: unknown;
  workspaces?: unknown[];
};

type WorkspaceSummary = {
  avatarUrl?: string;
  category?: string;
  createdAt?: string;
  id: string;
  name: string;
  slug: string;
  status?: string;
};

type WorkspaceUser = {
  avatarUrl?: string;
  email: string;
  id: string;
  initials: string;
  lastActive: string;
  name: string;
  role: string;
  status: "Active" | "Invited" | "Limited";
};

type NotificationItem = {
  actionStatus: "none" | "pending" | "accepted" | "rejected";
  actorId?: string;
  body: string;
  createdAt: string;
  id: string;
  inviteId?: string;
  metadata: DatabaseRecord;
  status: "unread" | "read" | "archived";
  title: string;
  type: string;
  workspaceId?: string;
};

type UsageData = {
  agentLimit: number;
  automations: number;
  chats: number;
  files: number;
  storage: number;
  storageLimit: number;
  tokenLimit: number;
  tokens: number;
  userLimits: DatabaseRecord[];
};

function asRecord(value: unknown): DatabaseRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as DatabaseRecord)
    : {};
}

function asRecordArray(value: unknown): DatabaseRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatStatusLabel(value: unknown, fallback = "Pending") {
  const status = asString(value, fallback).trim().replace(/[_-]+/g, " ");
  if (!status) {
    return fallback;
  }

  return status
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function asNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size >= 10 || unitIndex === 0 ? Math.round(size) : size.toFixed(1)} ${units[unitIndex]}`;
}

function isPreviewableImageType(type: string) {
  return /^image\/(png|jpe?g|webp|gif)$/i.test(type);
}

function getAttachmentKind(type: string, name: string): ComposerAttachment["kind"] {
  if (isPreviewableImageType(type)) {
    return "image";
  }

  if (/\.((txt|md|json|csv|html|xml|ya?ml|js|jsx|ts|tsx|css|py|sql|log))$/i.test(name)) {
    return "text";
  }

  if (
    /(\.pdf|\.docx?|\.xlsx?|\.pptx?|\.rtf|\.odt|\.ods|\.odp|\.epub)$/i.test(name) ||
    /^(application\/pdf|application\/rtf|application\/msword|application\/vnd\.)/i.test(type)
  ) {
    return "document";
  }

  return "unknown";
}

function getAttachmentPreviewSrc(
  attachment: Pick<ChatMessageAttachment, "previewData" | "type">,
) {
  if (!attachment.previewData || !isPreviewableImageType(attachment.type)) {
    return "";
  }

  return attachment.previewData.startsWith("data:")
    ? attachment.previewData
    : `data:${attachment.type};base64,${attachment.previewData}`;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
}

async function fileToComposerAttachment(file: File): Promise<ComposerAttachment> {
  if (file.size > maxComposerAttachmentBytes) {
    throw new Error(`${file.name} is larger than 150 MB.`);
  }

  return {
    data: arrayBufferToBase64(await file.arrayBuffer()),
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    kind: getAttachmentKind(file.type || "", file.name),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  };
}

function getCurrentUserConnectorStatus(connection: DatabaseRecord, userId: string) {
  const settings = asRecord(connection.settings);
  const provider = asString(settings.provider);
  const users = asRecord(settings.users);
  const userConnection = userId ? asRecord(users[userId]) : {};
  const userStatus = asString(userConnection.status).toLowerCase();

  if (userStatus) {
    return userStatus;
  }

  return provider === "composio" ? "" : asString(connection.status).toLowerCase();
}

function getRecordByKey(record: DatabaseRecord, key: string) {
  return asRecord(record[key]);
}

function getInitialsFromText(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "AT";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getStableColorIndex(seed: string, total: number) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return total === 0 ? 0 : hash % total;
}

function OreoFlareAvatar({
  className,
  seed,
  size = 64,
  scale = 1.45,
}: {
  className?: string;
  seed: string;
  scale?: number;
  size?: number;
}) {
  const palette =
    oreoAvatarPalettes[
      getStableColorIndex(seed || "atmet", oreoAvatarPalettes.length)
    ]?.id ?? "rose-milk";

  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <OreoAvatar
        background={null}
        className="absolute left-1/2 top-1/2 [&_svg]:size-full"
        drift={8}
        palette={palette}
        shape="flare"
        size={size}
        style={{
          height: `${scale * 100}%`,
          transform: "translate(-50%, -50%)",
          width: `${scale * 100}%`,
        }}
        variantId={seed || palette}
      />
    </span>
  );
}

function getWorkspaceUserKey(user: Pick<WorkspaceUser, "email" | "id" | "name">) {
  return user.id || user.email || user.name;
}

function formatDateLabel(value: unknown) {
  const date = new Date(asString(value));
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTimeLabel(value: unknown) {
  const date = new Date(asString(value));
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function mapRuntime(value: unknown): "paused" | "running" {
  return asString(value).toLowerCase() === "running" ? "running" : "paused";
}

function mapTone(status: string): Agent["tone"] {
  const normalized = status.toLowerCase();
  if (normalized.includes("active") || normalized.includes("approved")) {
    return "success";
  }
  if (normalized.includes("draft") || normalized.includes("review")) {
    return "warning";
  }
  if (normalized.includes("beta")) {
    return "info";
  }
  return "outline";
}

function mapSkillIcon(value: unknown) {
  const normalized = asString(value).toLowerCase();
  if (normalized.includes("search")) return Search01Icon;
  if (normalized.includes("book") || normalized.includes("document")) return BookOpenIcon;
  if (normalized.includes("business") || normalized.includes("workspace")) return BuildingIcon;
  if (normalized.includes("data")) return DatabaseIcon;
  if (normalized.includes("workflow")) return WorkflowCircleIcon;
  if (normalized.includes("support")) return LifebuoyIcon;
  if (normalized.includes("code")) return CodeIcon;
  if (normalized.includes("brain")) return Brain03Icon;
  if (normalized.includes("file")) return File01Icon;
  return SparklesIcon;
}

function mapWorkspace(value: unknown): WorkspaceSummary | null {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  const name = asString(record.name, "Workspace");
  return {
    avatarUrl: asString(record.avatar_url),
    category: asString(record.category),
    createdAt: asString(record.created_at),
    id,
    name,
    slug: asString(record.slug, name.toLowerCase().replace(/\s+/g, "-")),
    status: asString(record.status, "active"),
  };
}

function mapChat(row: unknown): SidebarChat | null {
  const record = asRecord(row);
  const id = asString(record.id);
  const metadata = asRecord(record.metadata);
  const appKeys = Array.isArray(metadata.appKeys)
    ? metadata.appKeys.map((item) => asString(item)).filter(Boolean)
    : Array.isArray(metadata.app_keys)
      ? metadata.app_keys.map((item) => asString(item)).filter(Boolean)
      : [];
  if (!id) {
    return null;
  }

  return {
    appKeys: normalizeAppLogoKeys(appKeys),
    id,
    pinned: asBoolean(record.pinned),
    title: asString(record.title, "Untitled chat"),
  };
}

function mapChatMessage(row: unknown): ChatMessage | null {
  const record = asRecord(row);
  const id = asString(record.id);
  const role = asString(record.role);
  const metadata = asRecord(record.metadata);

  if (!id || (role !== "assistant" && role !== "user")) {
    return null;
  }

  return {
    approval: mapChatApprovalRequest(metadata),
    attachments: asRecordArray(metadata.attachments)
      .map(mapChatMessageAttachment)
      .filter((attachment): attachment is ChatMessageAttachment =>
        Boolean(attachment),
      ),
    content: asString(record.content),
    feedback:
      asString(metadata.feedback) === "like"
        ? "like"
        : asString(metadata.feedback) === "dislike"
          ? "dislike"
          : null,
    id,
    mentions: asRecordArray(metadata.mentions)
      .map(mapChatMessageMention)
      .filter((mention): mention is ChatMessageMention => Boolean(mention)),
    role,
    state: "complete",
  };
}

function mapChatApprovalRequest(metadata: DatabaseRecord): ChatApprovalRequest | null {
  if (asString(metadata.kind) !== "workflow_approval_request") {
    return null;
  }

  const approvalId = asString(metadata.approvalId);
  if (!approvalId) {
    return null;
  }

  return {
    agentId: asString(metadata.agentId),
    appKeys: Array.isArray(metadata.appKeys)
      ? metadata.appKeys.map((item) => asString(item)).filter(Boolean)
      : [],
    approvalId,
    nodeId: asString(metadata.nodeId),
    runId: asString(metadata.runId),
    status: asString(metadata.status, "pending"),
  };
}

function mapChatMessageAttachment(row: unknown): ChatMessageAttachment | null {
  const record = asRecord(row);
  const name = asString(record.name);
  if (!name) {
    return null;
  }

  const type = asString(record.type, "application/octet-stream");
  return {
    error: asString(record.error) || null,
    kind: asString(record.kind, getAttachmentKind(type, name)),
    name,
    previewData: asString(record.previewData) || null,
    size: asNumber(record.size),
    type,
  };
}

function mapChatMessageMention(row: unknown): ChatMessageMention | null {
  const record = asRecord(row);
  const kind = asString(record.kind);
  const name = asString(record.name);

  if (!name || (kind !== "apps" && kind !== "skills")) {
    return null;
  }

  return {
    key: asString(record.key),
    kind,
    logo: asString(record.logo),
    name,
  };
}

function mapSkill(row: unknown, index: number): SkillItem | null {
  const record = asRecord(row);
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  return {
    content: asString(record.content, ""),
    description: asString(record.description, ""),
    gradient: asString(
      record.gradient,
      skillGradientOptions[index % skillGradientOptions.length],
    ),
    icon: mapSkillIcon(record.icon),
    id,
    name: asString(record.name, "Untitled skill"),
    source: asString(record.source) === "custom" ? "custom" : "default",
  };
}

function getMergedConnectorCatalog(apps: unknown[]) {
  const appsByKey = new Map<string, DatabaseRecord>();

  for (const app of defaultConnectorCatalog) {
    appsByKey.set(asString(app.key), app);
  }

  for (const app of apps) {
    const record = asRecord(app);
    const key = asString(record.key, asString(record.app_key));
    if (key && connectorCatalogKeySet.has(key)) {
      const catalogEntry = appsByKey.get(key);
      appsByKey.set(key, {
        ...catalogEntry,
        ...record,
        key,
        logo: asString(catalogEntry?.logo, asString(record.logo)),
      });
    }
  }

  return connectorCatalogKeys
    .map((key) => appsByKey.get(key))
    .filter((app): app is DatabaseRecord => Boolean(app));
}

function mapConnector(app: unknown, connectionsByKey: Set<string>, index: number): ConnectorItem | null {
  const record = asRecord(app);
  const key = asString(record.key, asString(record.app_key));
  const name = asString(record.name);
  if (!key || !name || !connectorCatalogKeySet.has(key)) {
    return null;
  }

  return {
    category: connectionsByKey.has(key) ? "Connected" : asString(record.category, "App"),
    description: asString(record.description, ""),
    gradient: asString(
      record.gradient,
      skillGradientOptions[index % skillGradientOptions.length],
    ),
    key,
    logo: asString(record.logo, getInitialsFromText(name)),
    name,
    paragraph: asString(
      record.paragraph,
      `${name} can be connected to Atmet when integration credentials are configured.`,
    ),
  };
}

function mapAgent(row: unknown, index: number): Agent | null {
  const record = asRecord(row);
  const id = asString(record.id);
  const name = asString(record.name);
  if (!id || !name) {
    return null;
  }

  const status = asString(record.status, "Draft");
  const settings = asRecord(record.settings);
  const modelKey = asString(settings.modelKey, "atmet");
  const nodeRows = asRecordArray(record.workflow_nodes);
  const edgeRows = asRecordArray(record.workflow_edges);
  const appLogos = normalizeAppLogoKeys(nodeRows
    .flatMap((node) => {
      const record = asRecord(node);
      const title = asString(record.title);
      const appKeys = Array.isArray(record.app_keys)
        ? record.app_keys.map((key) => asString(key)).filter(Boolean)
        : [];

      return getAgentNodeAppLogoKeys(title, appKeys);
    }));
  const workflowCards = nodeRows
    .map((node, nodeIndex) => {
      const nodeId = asString(node.id);
      if (!nodeId) {
        return null;
      }

      const title = asString(node.title, "Empty chat");
      const config = asRecord(node.config);
      const appKeys = getAgentNodeAppLogoKeys(
        title,
        Array.isArray(node.app_keys)
          ? node.app_keys.map((item) => String(item))
          : [],
      );
      const sourceChatId = asString(node.source_chat_id);

      return {
        apps:
          appKeys.length > 0
            ? appKeys
            : ["AT"],
        ...(sourceChatId ? { chatId: sourceChatId } : {}),
        id: nodeId,
        modelKey: asString(config.modelKey, modelKey),
        runtime: mapRuntime(node.runtime_state),
        title,
        x: asNumber(node.position_x, 72 + nodeIndex * 44),
        y: asNumber(node.position_y, 120 + nodeIndex * 36),
      } satisfies PlaygroundCard;
    })
    .filter((item): item is PlaygroundCard => Boolean(item));
  const workflowConnections = edgeRows
    .map((edge) => {
      const from = asString(edge.source_node_id);
      const to = asString(edge.target_node_id);

      if (!from || !to) {
        return null;
      }

      return { from, to } satisfies PlaygroundConnection;
    })
    .filter((item): item is PlaygroundConnection => Boolean(item));

  return {
    appLogos: appLogos.length > 0 ? appLogos.slice(0, 3) : [getInitialsFromText(name)],
    gradient: asString(
      record.gradient,
      skillGradientOptions[index % skillGradientOptions.length],
    ),
    id,
    modelKey,
    name,
    runtime: mapRuntime(record.runtime_state ?? record.runtime),
    schedule: asString(record.schedule) || null,
    status,
    tokenUsage: asNumber(record.token_usage),
    tone: mapTone(status),
    workflowCards,
    workflowConnections,
  };
}

function mapMember(row: unknown): WorkspaceUser | null {
  const record = asRecord(row);
  const profile = getRecordByKey(record, "profiles");
  const email = asString(profile.email);
  const name = asString(profile.full_name, email || "Workspace member");
  if (!email && !name) {
    return null;
  }

  const status = asString(record.status).toLowerCase();
  return {
    avatarUrl: asString(profile.avatar_url),
    email,
    id: asString(record.user_id, asString(profile.id, email || name)),
    initials: getInitialsFromText(name || email),
    lastActive: formatDateTimeLabel(profile.last_seen_at) || "Never",
    name,
    role: asString(record.role, "Member"),
    status: status === "invited" ? "Invited" : status === "limited" ? "Limited" : "Active",
  };
}

function mapNotification(row: unknown): NotificationItem | null {
  const record = asRecord(row);
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  const status = asString(record.status, "unread");
  const actionStatus = asString(record.action_status, "none");

  return {
    actionStatus:
      actionStatus === "pending" ||
      actionStatus === "accepted" ||
      actionStatus === "rejected"
        ? actionStatus
        : "none",
    actorId: asString(record.actor_id),
    body: asString(record.body),
    createdAt: asString(record.created_at),
    id,
    inviteId: asString(record.invite_id),
    metadata: asRecord(record.metadata),
    status:
      status === "read" || status === "archived" || status === "unread"
        ? status
        : "unread",
    title: asString(record.title, "Notification"),
    type: asString(record.type),
    workspaceId: asString(record.workspace_id),
  };
}

function mapUsage(value: unknown, chatsCount: number, agentsCount: number): UsageData {
  const record = asRecord(value);
  const totals = asRecord(record.totals);
  return {
    agentLimit: asNumber(totals.agent_limit, 25),
    automations: asNumber(totals.automation_runs, agentsCount),
    chats: asNumber(totals.chats, chatsCount),
    files: asNumber(totals.files),
    storage: asNumber(totals.storage_gb),
    storageLimit: asNumber(totals.storage_limit_gb, 25),
    tokenLimit: asNumber(totals.token_limit, 50000),
    tokens: asNumber(totals.tokens),
    userLimits: asRecordArray(record.userLimits),
  };
}

async function getResponseError(response: Response, fallback: string) {
  const payload = asRecord(await response.json().catch(() => ({})));
  return asString(payload.error, fallback);
}

function mergeNotifications(
  nextNotifications: NotificationItem[],
  currentNotifications: NotificationItem[],
) {
  const notificationsById = new Map(
    currentNotifications.map((notification) => [notification.id, notification]),
  );

  for (const notification of nextNotifications) {
    notificationsById.set(notification.id, notification);
  }

  return Array.from(notificationsById.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

const dashboardCacheKey = "atmet.dashboard.shell.v6";
const dashboardCacheMaxAgeMs = 1000 * 60 * 10;

function getCacheableDashboardPayload(payload: DashboardData): DashboardData {
  return {
    apps: asRecordArray(payload.apps).map((app) => {
      const record = asRecord(app);
      return {
        app_key: record.app_key,
        category: record.category,
        description: record.description,
        enabled: record.enabled,
        gradient: record.gradient,
        icon: record.icon,
        key: record.key,
        logo: record.logo,
        name: record.name,
        paragraph: record.paragraph,
      };
    }),
    chats: asRecordArray(payload.chats).map((chat) => {
      const record = asRecord(chat);
      return {
        id: record.id,
        pinned: record.pinned,
        title: record.title,
      };
    }),
    connections: asRecordArray(payload.connections).map((connection) => {
      const record = asRecord(connection);
      return {
        app_key: record.app_key,
        settings: record.settings,
        status: record.status,
      };
    }),
    agents: asRecordArray(payload.agents),
    brain: asRecord(payload.brain),
    members: asRecordArray(payload.members),
    notifications: asRecordArray(payload.notifications),
    partial: asBoolean(asRecord(payload).partial),
    profile: asRecord(payload.profile),
    skills: asRecordArray(payload.skills).map((skill) => {
      const record = asRecord(skill);
      return {
        description: record.description,
        gradient: record.gradient,
        icon: record.icon,
        id: record.id,
        name: record.name,
        source: record.source,
      };
    }),
    subscription: asRecord(payload.subscription),
    usage: asRecord(payload.usage),
    workspace: asRecord(payload.workspace),
    workspaceSettings: asRecord(payload.workspaceSettings),
    workspaces: asRecordArray(payload.workspaces),
  };
}

export default function Home() {
  const [activePage, setActivePage] = useState<PageKey>(getInitialPage);
  const [agentsPlaygroundOpen, setAgentsPlaygroundOpen] = useState(
    () => getInitialPage() === "agents" && Boolean(getInitialAgentName()),
  );
  const [bootstrapError, setBootstrapError] = useState("");
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);
  const [isBootstrapRefreshing, setIsBootstrapRefreshing] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [profile, setProfile] = useState<DatabaseRecord | null>(null);
  const [members, setMembers] = useState<WorkspaceUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationActionId, setNotificationActionId] = useState<string | null>(
    null,
  );
  const [skillList, setSkillList] = useState<SkillItem[]>([]);
  const [connectorList, setConnectorList] =
    useState<ConnectorItem[]>(defaultConnectorList);
  const [connectedConnectorKeys, setConnectedConnectorKeys] = useState<string[]>(
    [],
  );
  const [areConnectorsHydrating, setAreConnectorsHydrating] = useState(true);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [brainData, setBrainData] = useState<DatabaseRecord | null>(null);
  const [subscriptionData, setSubscriptionData] =
    useState<DatabaseRecord | null>(null);
  const [workspaceSettings, setWorkspaceSettings] =
    useState<DatabaseRecord | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(
    () => (getInitialPage() === "agents" ? getInitialAgentName() : null),
  );
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [activeSidebarChatId, setActiveSidebarChatId] = useState<string | null>(
    null,
  );
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  const [sidebarChats, setSidebarChats] =
    useState<SidebarChat[]>(initialSidebarChats);
  const [creatingChat, setCreatingChat] = useState(false);
  const [chatParticipantIdsByChat, setChatParticipantIdsByChat] = useState<
    Record<string, string[]>
  >({});
  const [workflowChatNodesByAgent, setWorkflowChatNodesByAgent] = useState<
    Record<string, WorkflowChatNode[]>
  >({});
  const [chatDraftRequest, setChatDraftRequest] =
    useState<ChatDraftRequest | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    getInitialThemePreference,
  );
  const [ctaAccentPreference, setCtaAccentPreference] =
    useState<CtaAccentPreference>(getInitialCtaAccentPreference);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarChatCounterRef = useRef(initialSidebarChats.length + 1);
  const chatDraftCounterRef = useRef(1);
  const activeSidebarChat =
    activePage === "chat"
      ? sidebarChats.find((chat) => chat.id === activeSidebarChatId) ?? null
      : null;
  const activeWorkspaceId = workspace?.id ?? null;
  const isSuperAdmin = asBoolean(profile?.is_super_admin);
  const visibleSecondaryNavigation = isSuperAdmin
    ? secondaryNavigation
    : secondaryNavigation.filter((item) => item.key !== "admin");
  const isBackgroundHydrating = isBootstrapRefreshing && !isBootstrapLoading;
  const activePageHydrating =
    (isBootstrapLoading && activePage === "chat") ||
    (isBackgroundHydrating && backgroundHydrationPageKeys.has(activePage));
  const workflowSidebarChatMeta = new Map<string, WorkflowSidebarChatMeta>();

  for (const agent of agentList) {
    for (const card of agent.workflowCards ?? []) {
      if (!card.chatId) {
        continue;
      }

      workflowSidebarChatMeta.set(card.chatId, {
        agentName: agent.name,
        running: agent.runtime === "running",
        title: card.title,
      });
    }
  }

  for (const [agentName, nodes] of Object.entries(workflowChatNodesByAgent)) {
    const agent = agentList.find((item) => item.name === agentName);

    for (const node of nodes) {
      workflowSidebarChatMeta.set(node.chatId, {
        agentName,
        running: agent?.runtime === "running",
        title: node.title,
      });
    }
  }

  useEffect(() => {
    bindAtmetSounds();

    function playErrorCue() {
      void playAtmetSound("error");
    }

    window.addEventListener("error", playErrorCue);
    window.addEventListener("unhandledrejection", playErrorCue);

    return () => {
      window.removeEventListener("error", playErrorCue);
      window.removeEventListener("unhandledrejection", playErrorCue);
    };
  }, []);

  useEffect(() => {
    if (bootstrapError) {
      void playAtmetSound("error");
    }
  }, [bootstrapError]);

  useEffect(() => {
    if (!isBootstrapLoading && activePage === "admin" && !isSuperAdmin) {
      selectPage("chat", { chatId: activeSidebarChatId });
    }
  }, [activePage, activeSidebarChatId, isBootstrapLoading, isSuperAdmin]);

  const dynamicComposerOptions: ComposerOption[] = [
    ...connectorList.map((connector) => ({
      connectorKey: connector.key,
      id: `app-${connector.key ?? connector.name}`,
      kind: "apps" as const,
      logo: connector.logo,
      name: connector.name,
    })),
    ...skillList.map((skill) => ({
      id: `skill-${skill.id}`,
      icon: skill.icon,
      kind: "skills" as const,
      name: skill.name,
    })),
  ];

  useEffect(() => {
    applyThemePreference(themePreference);

    if (themePreference !== "default") {
      return;
    }

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => applyThemePreference("default");
    query.addEventListener("change", syncSystemTheme);
    return () => query.removeEventListener("change", syncSystemTheme);
  }, [themePreference]);

  function cycleThemePreference() {
    setThemePreference((current) =>
      current === "default" ? "light" : current === "light" ? "dark" : "default",
    );
  }

  function updateCtaAccentPreference(preference: CtaAccentPreference) {
    setCtaAccentPreference(preference);
    saveCtaAccentPreference(preference);
  }

  useEffect(() => {
    let cancelled = false;

    async function refreshNotifications() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = asRecord(await response.json());
        const nextNotifications = asRecordArray(payload.notifications)
          .map(mapNotification)
          .filter((item): item is NotificationItem => Boolean(item));

        if (!cancelled) {
          setNotifications(nextNotifications);
        }
      } catch {
        // Notification polling should never interrupt the workspace shell.
      }
    }

    const intervalId = window.setInterval(refreshNotifications, 60_000);
    window.addEventListener("focus", refreshNotifications);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshNotifications);
    };
  }, []);

  useEffect(() => {
    const hasScheduledRunningAgent = agentList.some(
      (agent) => agent.runtime === "running" && Boolean(agent.schedule),
    );

    if (!hasScheduledRunningAgent || !activeWorkspaceId) {
      return;
    }

    let cancelled = false;
    async function runScheduledAgents() {
      if (cancelled) {
        return;
      }

      try {
        await fetch("/api/agents/scheduled", {
          body: JSON.stringify({ workspaceId: activeWorkspaceId }),
          cache: "no-store",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        // Browser-assisted scheduler polling is best effort; cron or a worker should run it in production too.
      }
    }

    const initialTickId = window.setTimeout(runScheduledAgents, 1_000);
    const intervalId = window.setInterval(runScheduledAgents, 60_000);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTickId);
      window.clearInterval(intervalId);
    };
  }, [activeWorkspaceId, agentList]);

  async function handleNotificationAction(
    notificationId: string,
    action: "accept" | "archive" | "reject" | "read",
  ) {
    if (notificationActionId) {
      return;
    }

    setNotificationActionId(notificationId);

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(
          await getResponseError(response, "Could not update notification"),
        );
      }

      const payload = asRecord(await response.json());
      const nextNotifications = asRecordArray(payload.notifications)
        .map(mapNotification)
        .filter((item): item is NotificationItem => Boolean(item));

      setNotifications(nextNotifications);
    } catch (error) {
      void playAtmetSound("error");
      window.alert(
        error instanceof Error ? error.message : "Could not update notification",
      );
    } finally {
      setNotificationActionId(null);
    }
  }

  async function openNotificationsPage() {
    selectPage("notifications");

    try {
      const response = await fetch("/api/notifications?limit=100", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = asRecord(await response.json());
      const nextNotifications = asRecordArray(payload.notifications)
        .map(mapNotification)
        .filter((item): item is NotificationItem => Boolean(item));

      setNotifications(nextNotifications);
    } catch {
      // The page can still render the notifications already loaded in memory.
    }
  }

  useEffect(() => {
    function syncRouteFromHistory() {
      const nextPage = getInitialPage();
      const nextAgentName = getInitialAgentName();
      setActivePage(nextPage);
      setActiveSidebarChatId(nextPage === "chat" ? getInitialChatId() : null);
      if (nextPage === "agents") {
        setSelectedAgentName(nextAgentName);
        setAgentsPlaygroundOpen(Boolean(nextAgentName));
      } else {
        setAgentsPlaygroundOpen(false);
        setSelectedAgentName(null);
      }
    }

    updateAppRouteState({
      adminProfile: getInitialPage() === "admin" ? getInitialAdminProfileView() : null,
      adminTab: getInitialPage() === "admin" ? getInitialAdminTab() : undefined,
      agentName: getInitialPage() === "agents" ? getInitialAgentName() : null,
      chatId: getInitialPage() === "chat" ? getInitialChatId() : null,
      page: getInitialPage(),
      replace: true,
    });
    syncRouteFromHistory();
    window.addEventListener("popstate", syncRouteFromHistory);

    return () => {
      window.removeEventListener("popstate", syncRouteFromHistory);
    };
  }, []);

  function applyDashboardPayload(
    payload: DashboardData,
    options: { completeConnectorHydration?: boolean } = {},
  ) {
    const isPartialPayload = asBoolean(asRecord(payload).partial);
    const profileRecord = asRecord(payload.profile);
    const mappedWorkspaces = asRecordArray(payload.workspaces)
      .map(mapWorkspace)
      .filter((item): item is WorkspaceSummary => Boolean(item));
    const mappedWorkspace = mapWorkspace(payload.workspace);
    const connectionRows = asRecordArray(payload.connections);
    const currentUserId = asString(profileRecord.id);
    const connectedKeys = connectionRows
      .filter(
        (connection) =>
          getCurrentUserConnectorStatus(connection, currentUserId) ===
          "connected",
      )
      .map((connection) => asString(connection.app_key))
      .filter(Boolean);
    const connectionKeySet = new Set(connectedKeys);
    const mappedChats = asRecordArray(payload.chats)
      .map(mapChat)
      .filter((item): item is SidebarChat => Boolean(item));
    const mappedAgents = asRecordArray(payload.agents)
      .map(mapAgent)
      .filter((item): item is Agent => Boolean(item));
    const mappedSkills = asRecordArray(payload.skills)
      .map(mapSkill)
      .filter((item): item is SkillItem => Boolean(item));
    const mappedConnectors = getMergedConnectorCatalog(asRecordArray(payload.apps))
      .map((app, index) => mapConnector(app, connectionKeySet, index))
      .filter((item): item is ConnectorItem => Boolean(item));
    const mappedMembers = asRecordArray(payload.members)
      .map(mapMember)
      .filter((item): item is WorkspaceUser => Boolean(item));
    const mappedNotifications = asRecordArray(payload.notifications)
      .map(mapNotification)
      .filter((item): item is NotificationItem => Boolean(item));
    const mappedWorkspaceSettings = asRecord(payload.workspaceSettings);

    setWorkspace(mappedWorkspace);
    setWorkspaces(mappedWorkspaces);
    setProfile(profileRecord);
    if (!isPartialPayload) {
      setMembers(mappedMembers);
    }
    setNotifications(mappedNotifications);
    setSidebarChats(mappedChats);
    setActiveSidebarChatId((current) =>
      current && mappedChats.some((chat) => chat.id === current)
        ? current
        : mappedChats[0]?.id ?? null,
    );
    if (!isPartialPayload) {
      setAgentList(mappedAgents);
      setSkillList(mappedSkills);
      setConnectorList(mappedConnectors);
      setConnectedConnectorKeys(connectedKeys);
      if (options.completeConnectorHydration) {
        setAreConnectorsHydrating(false);
      }
      setUsageData(mapUsage(payload.usage, mappedChats.length, mappedAgents.length));
      setBrainData(asRecord(payload.brain));
      setSubscriptionData(asRecord(payload.subscription));
      setWorkspaceSettings(mappedWorkspaceSettings);
      void setAtmetSoundEnabled(asBoolean(mappedWorkspaceSettings.sound_enabled, true));
    }
  }

  useEffect(() => {
    let cancelled = false;
    let appliedCachedPayload = false;

    async function loadDashboard() {
      setBootstrapError("");
      setIsBootstrapLoading(true);
      setAreConnectorsHydrating(true);

      try {
        const cached = window.localStorage.getItem(dashboardCacheKey);
        if (cached) {
          const cacheRecord = asRecord(JSON.parse(cached));
          const cachedAt = Number(cacheRecord.cachedAt ?? 0);
          const payload = asRecord(cacheRecord.payload) as DashboardData;

          if (Date.now() - cachedAt < dashboardCacheMaxAgeMs) {
            applyDashboardPayload(payload);
            appliedCachedPayload = true;
            setIsBootstrapLoading(false);
            setIsBootstrapRefreshing(true);
          }
        }
      } catch {
        window.localStorage.removeItem(dashboardCacheKey);
      }

      try {
        const response = await fetch("/api/bootstrap?mode=core", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          const message = await getResponseError(
            response,
            `Could not load workspace data (${response.status})`,
          );
          if (response.status === 401) {
            window.localStorage.removeItem(dashboardCacheKey);
          }
          if (!appliedCachedPayload) {
            setBootstrapError(message);
          }
          return;
        }

        const payload = (await response.json()) as DashboardData;
        if (cancelled) {
          return;
        }

        const setupUrl = asString(payload.setupUrl);
        if (setupUrl) {
          window.localStorage.removeItem(dashboardCacheKey);
          window.location.href = setupUrl;
          return;
        }

        applyDashboardPayload(payload);
        setIsBootstrapLoading(false);
        if (!asBoolean(asRecord(payload).partial)) {
          try {
            window.localStorage.setItem(
              dashboardCacheKey,
              JSON.stringify({
                cachedAt: Date.now(),
                payload: getCacheableDashboardPayload(payload),
              }),
            );
          } catch {
            window.localStorage.removeItem(dashboardCacheKey);
          }
        }

        setIsBootstrapRefreshing(true);
        const secondaryResponse = await fetch("/api/bootstrap", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (cancelled) {
          return;
        }

        if (!secondaryResponse.ok) {
          setAreConnectorsHydrating(false);
          setIsBootstrapRefreshing(false);
          return;
        }

        const secondaryPayload = (await secondaryResponse.json()) as DashboardData;
        if (cancelled) {
          return;
        }

        applyDashboardPayload(secondaryPayload, {
          completeConnectorHydration: true,
        });
        setIsBootstrapRefreshing(false);
        try {
          window.localStorage.setItem(
            dashboardCacheKey,
            JSON.stringify({
              cachedAt: Date.now(),
              payload: getCacheableDashboardPayload(secondaryPayload),
            }),
          );
        } catch {
          window.localStorage.removeItem(dashboardCacheKey);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          if (!appliedCachedPayload) {
          setBootstrapError(
            error instanceof Error
              ? error.message
              : "Could not load workspace data",
          );
            setIsBootstrapLoading(false);
          }
          setAreConnectorsHydrating(false);
          setIsBootstrapRefreshing(false);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapLoading(false);
          setIsBootstrapRefreshing(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  function selectPage(
    page: PageKey,
    options: { agentName?: string | null; chatId?: string | null } = {},
  ) {
    if (page === "admin" && !isSuperAdmin) {
      page = "chat";
      options = { chatId: activeSidebarChatId };
    }

    setActivePage(page);
    updateAppRouteState({
      agentName: options.agentName,
      chatId: options.chatId,
      page,
    });
    if (page === "agents" && options.agentName !== undefined) {
      setSelectedAgentName(options.agentName);
      setAgentsPlaygroundOpen(Boolean(options.agentName));
    } else if (page !== "agents") {
      setAgentsPlaygroundOpen(false);
      setSelectedAgentName(null);
    }
  }

  function openAgentPlayground(agentName: string | null) {
    selectPage("agents", { agentName });
  }

  async function createAgent(name: string) {
    if (activeWorkspaceId) {
      try {
        const response = await fetch(`/api/workspaces/${activeWorkspaceId}/agents`, {
          body: JSON.stringify({ name }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (response.ok) {
          const payload = asRecord(await response.json());
          const created = mapAgent(payload.agent, agentList.length);
          if (created) {
            setAgentList((current) => [...current, created]);
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    setAgentList((current) => [
      ...current,
      {
        appLogos: [getInitialsFromText(name)],
        gradient:
          "from-stone-100 via-stone-50 to-emerald-100 dark:from-stone-900 dark:via-stone-950 dark:to-emerald-950/40",
        modelKey: "atmet",
        name,
        runtime: "paused",
        schedule: null,
        status: "Draft",
        tokenUsage: 0,
        tone: "warning",
      },
    ]);
  }

  async function createSidebarChat(
    title?: string,
    options: { activate?: boolean } = {},
  ) {
    if (creatingChat) {
      return activeSidebarChatId ?? "";
    }

    const shouldActivate = options.activate ?? true;
    setCreatingChat(true);
    const nextIndex = sidebarChatCounterRef.current;
    sidebarChatCounterRef.current += 1;
    const trimmedTitle = title?.trim();
    const nextTitle = trimmedTitle
      ? trimmedTitle.slice(0, 80)
      : `New chat ${nextIndex}`;
    let createdChat: SidebarChat | null = null;

    if (activeWorkspaceId) {
      try {
        const response = await fetch(`/api/workspaces/${activeWorkspaceId}/chats`, {
          body: JSON.stringify({ title: nextTitle }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (response.ok) {
          const payload = asRecord(await response.json());
          createdChat = mapChat(payload.chat);
        }
      } catch (error) {
        console.error(error);
      }
    }

    const id = createdChat?.id ?? `chat-${nextIndex}`;
    const chat = createdChat ?? { id, pinned: false, title: nextTitle };

    setSidebarChats((current) => [
      chat,
      ...current,
    ]);
    if (shouldActivate) {
      setActiveSidebarChatId(id);
    }
    setChatHistoryOpen(true);
    if (shouldActivate) {
      selectPage("chat", { chatId: id });
    }
    setCreatingChat(false);

    return id;
  }

  function renameSidebarChat(chatId: string) {
    const currentTitle =
      sidebarChats.find((chat) => chat.id === chatId)?.title ?? "";
    const nextTitle = window.prompt("Rename chat", currentTitle)?.trim();

    if (!nextTitle) {
      return;
    }

    setSidebarChats((current) =>
      current.map((chat) =>
        chat.id === chatId ? { ...chat, title: nextTitle } : chat,
      ),
    );
    void fetch(`/api/chats/${chatId}`, {
      body: JSON.stringify({ title: nextTitle }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    }).catch(() => undefined);
  }

  function toggleSidebarChatPin(chatId: string) {
    const nextPinned =
      !sidebarChats.find((chat) => chat.id === chatId)?.pinned;
    setSidebarChats((current) =>
      current.map((chat) =>
        chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
    void fetch(`/api/chats/${chatId}`, {
      body: JSON.stringify({ pinned: nextPinned }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    }).catch(() => undefined);
  }

  function deleteSidebarChat(chatId: string) {
    setSidebarChats((current) => current.filter((chat) => chat.id !== chatId));
    if (activeSidebarChatId === chatId) {
      setActiveSidebarChatId(null);
      updateAppRouteState({ chatId: null, page: "chat" });
    }
    void fetch(`/api/chats/${chatId}`, { method: "DELETE" }).catch(
      () => undefined,
    );
  }

  function updateAgentRuntime(agentName: string, runtime: "paused" | "running") {
    setAgentList((current) =>
      current.map((agent) =>
        agent.name === agentName ? { ...agent, runtime } : agent,
      ),
    );
    const agentId = agentList.find((agent) => agent.name === agentName)?.id;
    if (agentId) {
      void fetch(`/api/agents/${agentId}`, {
        body: JSON.stringify({ runtimeState: runtime }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }).catch(() => undefined);
    }
  }

  function updateAgentSchedule(agentName: string, schedule: string | null) {
    setAgentList((current) =>
      current.map((agent) =>
        agent.name === agentName
          ? {
              ...agent,
              schedule,
              ...(schedule ? { runtime: "running" as const } : {}),
            }
          : agent,
      ),
    );
    const agentId = agentList.find((agent) => agent.name === agentName)?.id;
    if (agentId) {
      void fetch(`/api/agents/${agentId}`, {
        body: JSON.stringify({
          schedule: schedule ?? "manual",
          ...(schedule ? { runtimeState: "running" } : {}),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }).catch(() => undefined);
    }
  }

  function copyChatValue(value: string) {
    navigator.clipboard?.writeText(value).catch(() => undefined);
  }

  function openSidebarChat(chatId: string) {
    setActiveSidebarChatId(chatId);
    selectPage("chat", { chatId });
  }

  function startBlankChat() {
    setActiveSidebarChatId(null);
    setChatDraftRequest(null);
    selectPage("chat", { chatId: null });
  }

  function insertSkillIntoChat(skill: SkillItem, chatId: string) {
    const prompt = `Use /"${skill.name}" to `;

    setActiveSidebarChatId(chatId);
    setChatDraftRequest({
      chatId,
      prompt,
      requestId: chatDraftCounterRef.current,
    });
    chatDraftCounterRef.current += 1;
    selectPage("chat", { chatId });
  }

  async function insertSkillIntoNewChat(skill: SkillItem) {
    const chatId = await createSidebarChat(`Use ${skill.name}`);
    insertSkillIntoChat(skill, chatId);
  }

  function addMemberToChat(chatId: string, memberId: string) {
    setChatParticipantIdsByChat((current) => {
      const currentIds = current[chatId] ?? [];
      if (currentIds.includes(memberId)) {
        return current;
      }

      return {
        ...current,
        [chatId]: [...currentIds, memberId],
      };
    });
  }

  function removeMemberFromChat(chatId: string, memberId: string) {
    setChatParticipantIdsByChat((current) => ({
      ...current,
      [chatId]: (current[chatId] ?? []).filter((id) => id !== memberId),
    }));
  }

  function addChatToAgentWorkflow(agentName: string, chat: SidebarChat) {
    const existingWorkflowNodes = workflowChatNodesByAgent[agentName] ?? [];
    const optimisticAppKeys = getAgentNodeAppLogoKeys(chat.title, chat.appKeys ?? []);
    const chatAlreadyInWorkflow = existingWorkflowNodes.some(
      (node) => node.chatId === chat.id,
    );

    setWorkflowChatNodesByAgent((current) => {
      const existingNodes = current[agentName] ?? [];
      const alreadyAdded = existingNodes.some(
        (node) => node.chatId === chat.id,
      );

      return {
        ...current,
        [agentName]: alreadyAdded
          ? existingNodes
          : [...existingNodes, { appKeys: optimisticAppKeys, chatId: chat.id, title: chat.title }],
      };
    });
    const agent = agentList.find((item) => item.name === agentName);
    if (agent?.id && !chatAlreadyInWorkflow) {
      void fetch(`/api/agents/${agent.id}/nodes`, {
        body: JSON.stringify({
          appKeys: optimisticAppKeys,
          sourceChatId: chat.id,
          title: chat.title,
          x: 120,
          y: 120,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
        .then(async (response) => {
          if (!response.ok) {
            return;
          }

          const payload = asRecord(await response.json().catch(() => ({})));
          const node = asRecord(payload.node);
          const title = asString(node.title, chat.title);
          const appKeys = getAgentNodeAppLogoKeys(
            title,
            Array.isArray(node.app_keys)
              ? node.app_keys.map((item) => asString(item)).filter(Boolean)
              : optimisticAppKeys,
          );
          const nodeId = asString(node.id);

          if (!nodeId) {
            return;
          }

          setAgentList((current) =>
            current.map((item) =>
              item.id === agent.id
                ? {
                    ...item,
                    appLogos: appKeys.length > 0 ? mergeAppLogoKeys(item.appLogos, appKeys).slice(0, 3) : item.appLogos,
                    workflowCards: [
                      ...(item.workflowCards ?? []).filter(
                        (card) => card.chatId !== chat.id && card.id !== nodeId,
                      ),
                      {
                        apps: appKeys.length > 0 ? appKeys : ["AT"],
                        chatId: chat.id,
                        id: nodeId,
                        modelKey: agent.modelKey,
                        runtime: mapRuntime(node.runtime_state),
                        title,
                        x: asNumber(node.position_x, 120),
                        y: asNumber(node.position_y, 120),
                      },
                    ],
                  }
                : item,
            ),
          );
        })
        .catch(() => undefined);
    }
    setSelectedAgentName(agentName);
    setAgentsPlaygroundOpen(true);
    selectPage("agents", { agentName });
  }

  async function createWorkflowChatNode(agentName: string, title: string) {
    const chatId = await createSidebarChat(`${agentName} / ${title}`, {
      activate: false,
    });
    if (!chatId) {
      return null;
    }

    const node = { chatId, title };
    setWorkflowChatNodesByAgent((current) => {
      const existingNodes = current[agentName] ?? [];
      if (existingNodes.some((item) => item.chatId === chatId)) {
        return current;
      }

      return {
        ...current,
        [agentName]: [...existingNodes, node],
      };
    });

    return node;
  }

  function deleteWorkflowChatNode(agentName: string, chatId: string) {
    setWorkflowChatNodesByAgent((current) => ({
      ...current,
      [agentName]: (current[agentName] ?? []).filter(
        (node) => node.chatId !== chatId,
      ),
    }));
    setAgentList((current) =>
      current.map((agent) =>
        agent.name === agentName
          ? {
              ...agent,
            workflowCards: (agent.workflowCards ?? []).filter(
                (card) => card.chatId !== chatId,
              ),
            }
          : agent,
      ),
    );
    deleteSidebarChat(chatId);
  }

  function disconnectChatFromAgentWorkflow(agentName: string, chatId: string) {
    setWorkflowChatNodesByAgent((current) => ({
      ...current,
      [agentName]: (current[agentName] ?? []).filter(
        (node) => node.chatId !== chatId,
      ),
    }));
    setAgentList((current) =>
      current.map((agent) =>
        agent.name === agentName
          ? {
              ...agent,
              workflowCards: (agent.workflowCards ?? []).filter(
                (card) => card.chatId !== chatId,
              ),
            }
          : agent,
      ),
    );

    const agent = agentList.find((item) => item.name === agentName);
    if (agent?.id) {
      const params = new URLSearchParams();
      params.set("sourceChatId", chatId);
      void fetch(`/api/agents/${agent.id}/nodes?${params.toString()}`, {
        method: "DELETE",
      }).catch(() => undefined);
    }
  }

  const commandPaletteGroups: CommandPaletteGroup[] = [
    {
      items: [
        ...primaryNavigation,
        ...visibleSecondaryNavigation,
        settingsNavigation,
      ].map((item, index) => ({
        action: () =>
          item.key === "agents"
            ? selectPage("agents", { agentName: null })
            : selectPage(item.key),
        icon: (
          <Icon
            className="mr-2 size-4 text-muted-foreground"
            icon={item.icon}
          />
        ),
        label: item.label,
        shortcut: index < 9 ? `⌘${index + 1}` : undefined,
        value: `${item.key}-page`,
      })),
      value: "Pages",
    },
    {
      items: sidebarChats.map((chat) => ({
        action: () => openSidebarChat(chat.id),
        icon: (
          <Icon
            className="mr-2 size-4 text-muted-foreground"
            icon={Chat01Icon}
          />
        ),
        label: chat.title,
        suffix: chat.pinned ? (
          <Icon
            className="ml-2 size-3.5 text-muted-foreground"
            icon={PinIcon}
          />
        ) : undefined,
        value: `${chat.id}-chat`,
      })),
      value: "Chats",
    },
    {
      items: connectorList.map((connector) => ({
        action: () => selectPage("connectors"),
        icon: (
          <span className="mr-2 grid size-4 shrink-0 place-items-center rounded bg-white text-[0.5rem] text-stone-900 shadow-xs/5">
            <ConnectorLogo
              className="size-3"
              connector={connector}
              fallback={connector.logo}
            />
          </span>
        ),
        label: connector.name,
        suffix: connectedConnectorKeys.includes(connector.key ?? connector.name) ? (
          <Badge className="ml-2 h-5 px-1.5 text-[0.65rem]" variant="success">
            Connected
          </Badge>
        ) : undefined,
        value: `${connector.key ?? connector.name}-app`,
      })),
      value: "Apps",
    },
    {
      items: members.map((member) => ({
        action: () => selectPage("settings"),
        icon: (
          <AvatarTile
            className="mr-2 size-5 rounded-md border-0 bg-muted text-[0.56rem] shadow-none"
            initials={member.initials}
            src={member.avatarUrl}
          />
        ),
        label: member.name,
        suffix: (
          <span className="ml-2 max-w-28 truncate text-xs text-muted-foreground">
            {member.role}
          </span>
        ),
        value: `${getWorkspaceUserKey(member)}-member`,
      })),
      value: "People",
    },
  ];

  return (
  <main className="h-svh overflow-hidden bg-sidebar text-foreground">
    {!sidebarOpen && (
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              aria-label="Open sidebar"
              className="fixed bottom-3 left-3 z-40 grid size-9 place-items-center bg-transparent text-stone-700 transition-[color,scale] hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] dark:text-stone-300 dark:hover:text-white"
              onClick={() => setSidebarOpen(true)}
              type="button"
            />
          }
        >
          <Icon className="size-4" icon={PanelLeftCloseIcon} />
        </TooltipTrigger>
        <TooltipPopup>Open sidebar</TooltipPopup>
      </Tooltip>
    )}
    <div className="flex h-svh min-h-0 flex-col">
        <div className="grid h-10 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-3 py-1 md:px-4">
          <div className="relative flex min-w-0 items-center gap-2">
            <WorkspaceIdentity
              activeChat={activeSidebarChat}
              agents={agentList}
              chatParticipantIds={
                activeSidebarChatId
                  ? chatParticipantIdsByChat[activeSidebarChatId] ?? []
                  : []
              }
              collapsed={!sidebarOpen}
              loading={isBootstrapLoading}
              members={members}
              onCreateWorkspace={async (workspaceName) => {
                try {
                  const response = await fetch("/api/workspaces", {
                    body: JSON.stringify({ name: workspaceName }),
                    headers: { "Content-Type": "application/json" },
                    method: "POST",
                  });
                  if (!response.ok) return;
                  const payload = asRecord(await response.json());
                  const created = mapWorkspace(payload.workspace);
                  if (!created) return;
                  setWorkspaces((current) => [created, ...current]);
                  setWorkspace(created);
                } catch (error) {
                  console.error(error);
                }
              }}
              onInvitePeople={async (email) => {
                if (!activeWorkspaceId) {
                  throw new Error("Choose a workspace before sending an invite");
                }

                const response = await fetch(
                  `/api/workspaces/${activeWorkspaceId}/members`,
                  {
                    body: JSON.stringify({ email, role: "member" }),
                    headers: { "Content-Type": "application/json" },
                    method: "POST",
                  },
                );

                if (!response.ok) {
                  const payload = asRecord(await response.json().catch(() => ({})));
                  throw new Error(asString(payload.error, "Could not send invite"));
                }

                const payload = asRecord(await response.json().catch(() => ({})));
                const nextNotifications = asRecordArray(payload.notifications)
                  .map(mapNotification)
                  .filter((item): item is NotificationItem => Boolean(item));

                if (nextNotifications.length > 0) {
                  setNotifications((current) =>
                    mergeNotifications(nextNotifications, current),
                  );
                }
              }}
              onSelectWorkspace={(nextWorkspace) => setWorkspace(nextWorkspace)}
              onAddChatToAgentWorkflow={addChatToAgentWorkflow}
              onCopyChatValue={copyChatValue}
              onCreateAgent={createAgent}
              onDeleteChat={deleteSidebarChat}
              onDisconnectChatFromAgentWorkflow={
                disconnectChatFromAgentWorkflow
              }
              onRemoveMemberFromChat={removeMemberFromChat}
              onJumpToAgentWorkflow={openAgentPlayground}
              onRenameChat={renameSidebarChat}
              onTogglePin={toggleSidebarChatPin}
              selectedWorkspace={workspace}
              workflowChatMeta={
                activeSidebarChatId
                  ? workflowSidebarChatMeta.get(activeSidebarChatId)
                  : undefined
              }
              workspaces={workspaces}
            />
          </div>
          <CommandPalette
            groups={commandPaletteGroups}
            triggerIcon={<Icon className="size-3.5" icon={Search01Icon} />}
            triggerLabel="Search or command"
          />
          <div className="flex min-w-0 items-center justify-end gap-1">
            <NotificationCenter
              busyId={notificationActionId}
              notifications={notifications}
              onAction={handleNotificationAction}
              onSeeAll={() => void openNotificationsPage()}
            />
            <UserIdentity
              loading={isBootstrapLoading}
              onSelectPage={selectPage}
              profile={profile}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-0">
          <aside
            aria-hidden={!sidebarOpen}
            className={cn(
              "hidden shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground transition-[width,opacity] duration-300 ease-out md:flex",
              sidebarOpen ? "w-60 opacity-100" : "w-0 opacity-0",
            )}
          >
          <div
            className={cn(
              "flex min-h-0 w-60 shrink-0 flex-col pb-3 pl-2 pr-0 pt-2 transition-[opacity,translate] duration-300 ease-out",
              sidebarOpen
                ? "translate-x-0 opacity-100"
                : "-translate-x-2 opacity-0 pointer-events-none",
            )}
          >
            <nav className="grid gap-0.5 pr-1">
              {primaryNavigation.map((item) => (
                <NavButton
                  key={item.key}
                  active={activePage === item.key}
                  item={item}
                  onClick={() =>
                    item.key === "chat"
                      ? startBlankChat()
                      : item.key === "agents"
                        ? selectPage("agents", { agentName: null })
                        : selectPage(item.key)
                  }
                />
              ))}
            </nav>

            <SidebarChatHistory
              activeChatId={activePage === "chat" ? activeSidebarChatId : null}
              chats={sidebarChats}
              onDeleteChat={deleteSidebarChat}
              onJumpToAgentWorkflow={openAgentPlayground}
              onOpenChange={setChatHistoryOpen}
              onOpenChat={openSidebarChat}
              onRenameChat={renameSidebarChat}
              onTogglePin={toggleSidebarChatPin}
              open={chatHistoryOpen}
              workflowChatMeta={workflowSidebarChatMeta}
            />

            <nav className="mt-auto grid gap-0.5 pr-1">
              {visibleSecondaryNavigation.map((item) => (
                <NavButton
                  key={item.key}
                  active={activePage === item.key}
                  item={item}
                  onClick={() => selectPage(item.key)}
                />
              ))}
              <div className="flex items-center gap-1">
                <div className="min-w-0 flex-1">
                  <NavButton
                    active={activePage === settingsNavigation.key}
                    item={settingsNavigation}
                    onClick={() => selectPage(settingsNavigation.key)}
                  />
                </div>
                <SidebarThemeToggle
                  onCycle={cycleThemePreference}
                  preference={themePreference}
                />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        aria-label="Close sidebar"
                        className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-[color] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                        onClick={() => setSidebarOpen(false)}
                        type="button"
                      />
                    }
                  >
                    <Icon icon={PanelLeftOpenIcon} />
                  </TooltipTrigger>
                  <TooltipPopup>Close sidebar</TooltipPopup>
                </Tooltip>
              </div>
            </nav>
          </div>
          </aside>

        <section className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-sidebar px-1.5 pb-1.5 md:px-2 md:pb-2">
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-black/5 bg-background dark:border-white/6">
            <div
              className={cn(
                "mx-auto flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-3 md:px-6 md:py-4 lg:px-6 lg:py-5",
                activePage === "agents" && agentsPlaygroundOpen
                  ? "max-w-none"
                  : "max-w-5xl",
              )}
            >
              {bootstrapError && <BootstrapErrorBanner error={bootstrapError} />}
              {activePageHydrating && <PageHydrationSpinner />}
              {activePage === "chat" && (
                <ChatPage
                  activeChat={activeSidebarChat}
                  activeChatId={activeSidebarChatId}
                  agents={agentList}
                  chatParticipantIds={
                    activeSidebarChatId
                      ? chatParticipantIdsByChat[activeSidebarChatId] ?? []
                      : []
                  }
                  composerOptions={dynamicComposerOptions}
                  ctaAccentPreference={ctaAccentPreference}
                  draftRequest={chatDraftRequest}
                  members={members}
                  onAddChatToAgentWorkflow={addChatToAgentWorkflow}
                  onAddMemberToChat={addMemberToChat}
                  onCreateAgent={createAgent}
                  onCreateChat={createSidebarChat}
                  onUpdateChatTitle={(chatId, title) => {
                    setSidebarChats((current) =>
                      current.map((chat) =>
                        chat.id === chatId ? { ...chat, title } : chat,
                      ),
                    );
                  }}
                  workspaceId={activeWorkspaceId}
                />
              )}
              {activePage === "agents" && (
                <AgentsPage
                  agents={agentList}
                  composerOptions={dynamicComposerOptions}
                  onCreateAgent={createAgent}
                  onCreateWorkflowChatNode={createWorkflowChatNode}
                  onDeleteWorkflowChatNode={deleteWorkflowChatNode}
                  onAgentRuntimeChange={updateAgentRuntime}
                  onAgentScheduleChange={updateAgentSchedule}
                  onPlaygroundChange={setAgentsPlaygroundOpen}
                  onSelectAgentName={openAgentPlayground}
                  selectedAgentName={selectedAgentName}
                  workspaceId={activeWorkspaceId}
                  workflowChatNodesByAgent={workflowChatNodesByAgent}
                />
              )}
              {activePage === "brain" && (
                <BrainPage
                  brain={brainData}
                  key={activeWorkspaceId ?? "brain"}
                  workspaceId={activeWorkspaceId}
                />
              )}
              {activePage === "skills" && (
                <SkillsPage
                  chats={sidebarChats}
                  onSkillsChange={setSkillList}
                  onUseSkillInChat={insertSkillIntoChat}
                  onUseSkillInNewChat={insertSkillIntoNewChat}
                  skills={skillList}
                  workspaceId={activeWorkspaceId}
                />
              )}
              {activePage === "connectors" && (
                <ConnectorsPage
                  connectionsLoading={areConnectorsHydrating}
                  connectedConnectorKeys={connectedConnectorKeys}
                  connectors={connectorList}
                  onConnectedConnectorKeysChange={setConnectedConnectorKeys}
                  workspaceId={activeWorkspaceId}
                />
              )}
              {activePage === "usage" && (
                <UsagePage usage={usageData} workspaceId={activeWorkspaceId} />
              )}
              {activePage === "notifications" && (
                <NotificationsPage
                  busyId={notificationActionId}
                  notifications={notifications}
                  onAction={handleNotificationAction}
                />
              )}
              {activePage === "changelogs" && (
                <EmptyPage
                  description={pageDescriptions.changelogs}
                  title="Changelogs"
                />
              )}
              {activePage === "settings" && (
                <SettingsPage
                  agentsCount={agentList.length}
                  connectorsCount={connectedConnectorKeys.length}
                  members={members}
                  onProfileChange={setProfile}
                  onCtaAccentPreferenceChange={updateCtaAccentPreference}
                  onWorkspaceChange={setWorkspace}
                  onWorkspaceSettingsChange={setWorkspaceSettings}
                  profile={profile}
                  ctaAccentPreference={ctaAccentPreference}
                  connectedConnectors={connectorList.filter((connector) =>
                    connectedConnectorKeys.includes(connector.key ?? connector.name),
                  )}
                  subscription={subscriptionData}
                  workspace={workspace}
                  workspaceSettings={workspaceSettings}
                />
              )}
              {activePage === "admin" && isSuperAdmin && <AdminPage />}
            </div>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}

function WorkspaceIdentity({
  activeChat,
  agents,
  chatParticipantIds,
  collapsed = false,
  loading = false,
  members,
  onAddChatToAgentWorkflow,
  onCopyChatValue,
  onCreateAgent,
  onCreateWorkspace,
  onDeleteChat,
  onDisconnectChatFromAgentWorkflow,
  onInvitePeople,
  onJumpToAgentWorkflow,
  onRemoveMemberFromChat,
  onRenameChat,
  onSelectWorkspace,
  onTogglePin,
  selectedWorkspace,
  workflowChatMeta,
  workspaces,
}: {
  activeChat: SidebarChat | null;
  agents: Agent[];
  chatParticipantIds: string[];
  collapsed?: boolean;
  loading?: boolean;
  members: WorkspaceUser[];
  onAddChatToAgentWorkflow: (agentName: string, chat: SidebarChat) => void;
  onCopyChatValue: (value: string) => void;
  onCreateAgent: (name: string) => void | Promise<void>;
  onCreateWorkspace: (workspaceName: string) => void | Promise<void>;
  onDeleteChat: (chatId: string) => void;
  onDisconnectChatFromAgentWorkflow: (agentName: string, chatId: string) => void;
  onInvitePeople: (email: string) => void | Promise<void>;
  onJumpToAgentWorkflow: (agentName: string) => void;
  onRemoveMemberFromChat: (chatId: string, memberId: string) => void;
  onRenameChat: (chatId: string) => void;
  onSelectWorkspace: (workspace: WorkspaceSummary) => void;
  onTogglePin: (chatId: string) => void;
  selectedWorkspace: WorkspaceSummary | null;
  workflowChatMeta?: WorkflowSidebarChatMeta;
  workspaces: WorkspaceSummary[];
}) {
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [invitePeopleOpen, setInvitePeopleOpen] = useState(false);
  const workspaceName = selectedWorkspace?.name ?? "Workspace";
  const workspaceAvatarUrl = selectedWorkspace?.avatarUrl;

  if (loading) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <AtmetLogo className="size-5" plain />
        <div className="h-4 w-px shrink-0 bg-sidebar-border" />
        <div className="flex min-w-0 items-center gap-1.5 px-1.5 py-1">
          <SkeletonBlock className="size-6 rounded-md" />
          <SkeletonBlock className="hidden h-3 w-24 sm:block" />
          <SkeletonBlock className="size-3.5 rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <AtmetLogo
        className="size-5"
        plain
      />
      <div className="h-4 w-px shrink-0 bg-sidebar-border" />
      <Menu>
        <MenuTrigger className="flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 outline-none transition-[background-color] hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <AvatarTile
            className="size-6 rounded-md border-0 bg-background text-[0.625rem] shadow-none"
            initials={getOptionInitials(workspaceName)}
            src={workspaceAvatarUrl}
          />
          <p className="truncate text-xs font-medium leading-none text-sidebar-foreground">
            {workspaceName}
          </p>
          <Icon
            className="size-3.5 text-muted-foreground"
            icon={ChevronDownIcon}
          />
        </MenuTrigger>
        <MenuPopup align="start" className="min-w-64" sideOffset={8}>
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Workspaces
          </div>
          {workspaces.map((workspace) => (
            <MenuItem
              key={workspace.id}
              onClick={() => onSelectWorkspace(workspace)}
            >
              <AvatarTile
                className="size-6 rounded-md border-0 bg-muted text-[0.625rem] shadow-none"
                initials={getOptionInitials(workspace.name)}
                src={workspace.avatarUrl}
              />
              <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
              <Icon
                className={cn(
                  selectedWorkspace?.id === workspace.id
                    ? "opacity-100"
                    : "opacity-0",
                )}
                icon={CheckIcon}
              />
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem onClick={() => setCreateWorkspaceOpen(true)}>
            <Icon icon={PlusSignIcon} />
            Create workspace
          </MenuItem>
          <MenuItem onClick={() => setInvitePeopleOpen(true)}>
            <Icon icon={Users} />
            Invite people
          </MenuItem>
        </MenuPopup>
      </Menu>
      <WorkspaceCreateDialog
        onCreate={onCreateWorkspace}
        onOpenChange={setCreateWorkspaceOpen}
        open={createWorkspaceOpen}
      />
      <WorkspaceInviteDialog
        onInvite={onInvitePeople}
        onOpenChange={setInvitePeopleOpen}
        open={invitePeopleOpen}
        workspaceName={workspaceName}
      />
      {activeChat && (
        <>
          <span className="shrink-0 text-xs text-muted-foreground">/</span>
          <div className="flex min-w-0 items-center gap-1">
            <p className="max-w-44 truncate text-xs font-medium leading-none text-sidebar-foreground">
              {activeChat.title}
            </p>
            <ChatActionsMenu
              agents={agents}
              chat={activeChat}
              chatParticipantIds={chatParticipantIds}
              members={members}
              onAddChatToAgentWorkflow={onAddChatToAgentWorkflow}
              onCopyChatValue={onCopyChatValue}
              onCreateAgent={onCreateAgent}
              onDeleteChat={onDeleteChat}
              onDisconnectChatFromAgentWorkflow={onDisconnectChatFromAgentWorkflow}
              onJumpToAgentWorkflow={onJumpToAgentWorkflow}
              onRemoveMemberFromChat={onRemoveMemberFromChat}
              onRenameChat={onRenameChat}
              onTogglePin={onTogglePin}
              workflowChatMeta={workflowChatMeta}
            />
          </div>
        </>
      )}
    </div>
  );
}

function WorkspaceCreateDialog({
  onCreate,
  onOpenChange,
  open,
}: {
  onCreate: (workspaceName: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [name, setName] = useState("");
  const trimmedName = name.trim();

  function resetForm() {
    setName("");
  }

  function submitWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedName) {
      return;
    }

    onCreate(trimmedName);
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
      open={open}
    >
      <DialogPopup className="max-w-md rounded-xl">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitWorkspace}>
          <DialogHeader className="gap-1 border-b border-border/70 px-4 py-3">
            <DialogTitle className="text-base leading-6">
              Create workspace
            </DialogTitle>
            <DialogDescription className="text-xs leading-5">
              Create a new workspace and switch to it in this dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="grid gap-2 p-4" scrollFade={false}>
            <Label htmlFor="workspace-create-name">Workspace name</Label>
            <Input
              autoFocus
              id="workspace-create-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Acme Operations"
              value={name}
            />
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button disabled={!trimmedName} type="submit">
              Create workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

function WorkspaceInviteDialog({
  onInvite,
  onOpenChange,
  open,
  workspaceName,
}: {
  onInvite: (email: string) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  workspaceName: string;
}) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccessfully, setSentSuccessfully] = useState(false);
  const trimmedEmailInput = emailInput.trim();
  const canSendInvite = emails.length > 0 || trimmedEmailInput.length > 0;

  useEffect(() => {
    if (errorMessage) {
      void playAtmetSound("error");
    }
  }, [errorMessage]);

  function normalizeInviteEmail(value: string) {
    return value.trim().replace(/[,\s;]+$/g, "").toLowerCase();
  }

  function addInviteEmail(value: string) {
    const nextEmail = normalizeInviteEmail(value);

    if (!nextEmail) {
      return false;
    }

    if (!nextEmail.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      return false;
    }

    setEmails((currentEmails) =>
      currentEmails.includes(nextEmail)
        ? currentEmails
        : [...currentEmails, nextEmail],
    );
    setEmailInput("");
    setErrorMessage("");
    setSentSuccessfully(false);
    return true;
  }

  function removeInviteEmail(emailToRemove: string) {
    setEmails((currentEmails) =>
      currentEmails.filter((currentEmail) => currentEmail !== emailToRemove),
    );
    setSentSuccessfully(false);
  }

  function resetForm() {
    setEmailInput("");
    setEmails([]);
    setErrorMessage("");
    setIsSending(false);
    setSentSuccessfully(false);
  }

  async function submitInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSendInvite || isSending) {
      return;
    }

    const pendingEmails = emails.length
      ? emails
      : [normalizeInviteEmail(emailInput)];

    if (pendingEmails.some((pendingEmail) => !pendingEmail.includes("@"))) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setIsSending(true);
    setSentSuccessfully(false);

    try {
      for (const inviteEmail of pendingEmails) {
        await onInvite(inviteEmail);
      }

      setEmailInput("");
      setEmails([]);
      setErrorMessage("");
      setSentSuccessfully(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not send invite",
      );
      setSentSuccessfully(false);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
      open={open}
    >
      <DialogPopup className="max-w-md rounded-xl">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitInvite}>
          <DialogHeader className="gap-1 border-b border-border/70 px-4 py-3">
            <DialogTitle className="text-base leading-6">
              Invite people
            </DialogTitle>
            <DialogDescription className="text-xs leading-5">
              Invite teammates to {workspaceName}.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="grid gap-2 p-4" scrollFade={false}>
            <Label htmlFor="workspace-invite-email">Email address</Label>
            <div
              className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-1 text-sm shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20"
              onClick={(event) => {
                const input = event.currentTarget.querySelector("input");
                input?.focus();
              }}
            >
              {emails.map((inviteEmail) => (
                <span
                  className="inline-flex h-6 max-w-full items-center gap-1 rounded-md border border-border/70 bg-muted px-2 text-xs text-foreground"
                  key={inviteEmail}
                >
                  <span className="max-w-48 truncate">{inviteEmail}</span>
                  <button
                    aria-label={`Remove ${inviteEmail}`}
                    className="-mr-1 grid size-4 place-items-center rounded text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    disabled={isSending}
                    onClick={(event) => {
                      event.preventDefault();
                      removeInviteEmail(inviteEmail);
                    }}
                    type="button"
                  >
                    x
                  </button>
                </span>
              ))}
              <input
                autoFocus
                className="h-7 min-w-36 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSending}
                id="workspace-invite-email"
                onBlur={() => {
                  if (trimmedEmailInput.includes("@")) {
                    addInviteEmail(trimmedEmailInput);
                  }
                }}
                onChange={(event) => {
                  setEmailInput(event.target.value);
                  setSentSuccessfully(false);
                }}
                onKeyDown={(event) => {
                  if (
                    [" ", "Enter", ","].includes(event.key) &&
                    trimmedEmailInput
                  ) {
                    event.preventDefault();
                    addInviteEmail(trimmedEmailInput);
                  }

                  if (
                    event.key === "Backspace" &&
                    !emailInput &&
                    emails.length > 0
                  ) {
                    event.preventDefault();
                    removeInviteEmail(emails[emails.length - 1]);
                  }
                }}
                placeholder={
                  emails.length ? "Add another email" : "teammate@company.com"
                }
                type="text"
                value={emailInput}
              />
            </div>
            {errorMessage && (
              <p className="text-xs leading-5 text-destructive">
                {errorMessage}
              </p>
            )}
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button loading={isSending} disabled={!canSendInvite} type="submit">
              {sentSuccessfully ? (
                <>
                  <Icon className="size-3.5" icon={CheckIcon} />
                  Sent successfully
                </>
              ) : (
                "Send invite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

function ChatActionsMenu({
  agents,
  chat,
  chatParticipantIds,
  members,
  onAddChatToAgentWorkflow,
  onCopyChatValue,
  onCreateAgent,
  onDeleteChat,
  onDisconnectChatFromAgentWorkflow,
  onJumpToAgentWorkflow,
  onRemoveMemberFromChat,
  onRenameChat,
  onTogglePin,
  workflowChatMeta,
}: {
  agents: Agent[];
  chat: SidebarChat;
  chatParticipantIds: string[];
  members: WorkspaceUser[];
  onAddChatToAgentWorkflow: (agentName: string, chat: SidebarChat) => void;
  onCopyChatValue: (value: string) => void;
  onCreateAgent: (name: string) => void | Promise<void>;
  onDeleteChat: (chatId: string) => void;
  onDisconnectChatFromAgentWorkflow: (agentName: string, chatId: string) => void;
  onJumpToAgentWorkflow: (agentName: string) => void;
  onRemoveMemberFromChat: (chatId: string, memberId: string) => void;
  onRenameChat: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  workflowChatMeta?: WorkflowSidebarChatMeta;
}) {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const participantMembers = members.filter((member) =>
    chatParticipantIds.includes(getWorkspaceUserKey(member)),
  );
  const shortcuts = {
    copy: "⇧⌘C",
    deeplink: "⌥⌘L",
    pin: "⌥⌘P",
    rename: "⌥⌘R",
    session: "⌥⌘C",
  };

  return (
    <>
      <Menu>
        <MenuTrigger className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-[background-color,color] hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <Icon className="size-3.5" icon={MoreHorizontalIcon} />
        </MenuTrigger>
        <MenuPopup align="start" className="min-w-64" sideOffset={8}>
          <ChatActionItem
            icon={chat.pinned ? PinOffIcon : PinIcon}
            label={chat.pinned ? "Unpin chat" : "Pin chat"}
            onClick={() => onTogglePin(chat.id)}
            shortcut={shortcuts.pin}
          />
          <ChatActionItem
            icon={Edit02Icon}
            label="Rename chat"
            onClick={() => onRenameChat(chat.id)}
            shortcut={shortcuts.rename}
          />
          <ChatActionItem
            destructive
            icon={Delete02Icon}
            label="Delete chat"
            onClick={() => setDeleteDialogOpen(true)}
          />
          <MenuSeparator />
          <ChatActionItem
            icon={ClipboardCopyIcon}
            label="Copy working directory"
            onClick={() => onCopyChatValue("/atmet/workspace")}
            shortcut={shortcuts.copy}
          />
          <ChatActionItem
            icon={CopyLinkIcon}
            label="Copy session ID"
            onClick={() => onCopyChatValue(chat.id)}
            shortcut={shortcuts.session}
          />
          <ChatActionItem
            icon={Link05Icon}
            label="Copy deeplink"
            onClick={() => onCopyChatValue(`atmet://chat/${chat.id}`)}
            shortcut={shortcuts.deeplink}
          />
          <MenuSeparator />
          {workflowChatMeta ? (
            <>
              <ChatActionItem
                icon={ArrowRight01Icon}
                label="Jump to agent"
                onClick={() => onJumpToAgentWorkflow(workflowChatMeta.agentName)}
              />
              <ChatActionItem
                icon={Unlink01Icon}
                label="Disconnect from agent"
                onClick={() =>
                  onDisconnectChatFromAgentWorkflow(
                    workflowChatMeta.agentName,
                    chat.id,
                  )
                }
              />
            </>
          ) : (
            <ChatActionItem
              icon={WorkflowSquare01Icon}
              label="Add in an agent workflow"
              onClick={() => setWorkflowDialogOpen(true)}
            />
          )}
          <MenuSeparator />
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            People in this chat
          </div>
          {participantMembers.length > 0 ? (
            participantMembers.map((member) => (
              <MenuItem
                className="min-h-10"
                key={getWorkspaceUserKey(member)}
                onClick={() =>
                  onRemoveMemberFromChat(chat.id, getWorkspaceUserKey(member))
                }
              >
                <AvatarTile
                  className="size-6 rounded-md border-0 bg-muted text-[0.625rem] shadow-none"
                  initials={member.initials}
                  src={member.avatarUrl}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{member.name}</span>
                  <span className="block truncate text-muted-foreground text-xs">
                    {member.email || member.role}
                  </span>
                </span>
                <Button
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-600 dark:text-red-500"
                  size="xs"
                  variant="ghost"
                >
                  Remove
                </Button>
              </MenuItem>
            ))
          ) : (
            <div className="px-2 py-2 text-xs leading-5 text-muted-foreground">
              No people added yet.
            </div>
          )}
          <MenuSeparator />
          <ChatActionItem
            icon={AppWindowMacIcon}
            label="Open in new tab"
            onClick={() =>
              window.open(window.location.href, "_blank", "noopener,noreferrer")
            }
          />
        </MenuPopup>
      </Menu>
      <AddChatToAgentWorkflowDialog
        agents={agents}
        chat={chat}
        onCreateAgent={onCreateAgent}
        onOpenChange={setWorkflowDialogOpen}
        onSelectAgent={(agentName) => {
          onAddChatToAgentWorkflow(agentName, chat);
          setWorkflowDialogOpen(false);
        }}
        open={workflowDialogOpen}
      />
      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogPopup className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete chat</DialogTitle>
            <DialogDescription>
              Delete &quot;{chat.title}&quot; from this workspace. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => {
                onDeleteChat(chat.id);
                setDeleteDialogOpen(false);
              }}
              type="button"
              variant="destructive"
            >
              Delete chat
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  );
}

function AddChatToAgentWorkflowDialog({
  agents,
  chat,
  onCreateAgent,
  onOpenChange,
  onSelectAgent,
  open,
}: {
  agents: Agent[];
  chat: SidebarChat;
  onCreateAgent: (name: string) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  onSelectAgent: (agentName: string) => void;
  open: boolean;
}) {
  const [agentName, setAgentName] = useState("");
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const trimmedAgentName = agentName.trim();

  async function submitAgent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedAgentName || isCreatingAgent) {
      return;
    }

    setIsCreatingAgent(true);
    try {
      await onCreateAgent(trimmedAgentName);
      setAgentName("");
    } finally {
      setIsCreatingAgent(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup
        className="max-w-[27rem] rounded-xl"
        closeProps={{ className: "absolute end-3 top-3" }}
      >
        <DialogHeader className="gap-1 border-b border-border/70 px-4 py-3">
          <DialogTitle className="text-base leading-6">Choose workflow</DialogTitle>
          <DialogDescription className="max-w-[22rem] text-xs leading-5">
            Create a node from &quot;{chat.title}&quot; in one of your agents.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="p-2" scrollFade={false}>
          <div className="grid gap-2">
            <form
              className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 p-2"
              onSubmit={submitAgent}
            >
              <Input
                aria-label="New agent name"
                className="min-w-0 flex-1"
                onChange={(event) => setAgentName(event.target.value)}
                placeholder="Create agent..."
                size="sm"
                value={agentName}
              />
              <Button
                disabled={!trimmedAgentName || isCreatingAgent}
                size="sm"
                type="submit"
              >
                <Icon icon={PlusSignIcon} />
                Create
              </Button>
            </form>
            <div className="grid gap-1 rounded-lg border border-border/70 bg-muted/35 p-1">
              {agents.length > 0 ? (
                agents.map((agent) => (
                  <AgentWorkflowChoice
                    agent={agent}
                    key={agent.name}
                    onSelect={() => onSelectAgent(agent.name)}
                  />
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Create an agent first, then add this chat as a node.
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}

function AgentWorkflowChoice({
  agent,
  onSelect,
}: {
  agent: Agent;
  onSelect: () => void;
}) {
  const running = agent.runtime === "running";

  return (
    <button
      className="group flex min-h-12 w-full items-center gap-3 rounded-md px-2.5 py-2 text-left outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-background focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
      onClick={onSelect}
      type="button"
    >
      <AgentWorkflowChoiceLogo logos={agent.appLogos} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-5">
          {agent.name}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs leading-none text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              running ? "bg-success" : "bg-muted-foreground/50",
            )}
          />
          {running ? "Running" : "Paused"}
        </span>
      </span>
      <Icon
        className="size-4 shrink-0 text-muted-foreground opacity-45 transition-[opacity,translate] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
        icon={ArrowRight01Icon}
      />
    </button>
  );
}

function AgentWorkflowChoiceLogo({
  logos,
}: {
  logos: readonly string[];
}) {
  return (
    <span className="relative grid size-9 shrink-0 place-items-center">
      <AgentAppLogo
        className="absolute left-0 top-2 size-6 rounded-md text-[0.5rem]"
        logo={logos[1]}
      />
      <AgentAppLogo
        className="absolute right-0 top-2 size-6 rounded-md text-[0.5rem]"
        logo={logos[2]}
      />
      <AgentAppLogo
        className="relative z-10 size-7 rounded-lg text-[0.56rem] shadow-xs/5"
        logo={logos[0]}
      />
    </span>
  );
}

function ChatActionItem({
  destructive,
  icon,
  label,
  onClick,
  shortcut,
}: {
  destructive?: boolean;
  icon: IconSvgElement;
  label: string;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <MenuItem onClick={onClick} variant={destructive ? "destructive" : undefined}>
      <Icon icon={icon} />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="ml-4 text-xs text-muted-foreground">{shortcut}</span>
      )}
    </MenuItem>
  );
}

function NotificationCenter({
  busyId,
  notifications,
  onAction,
  onSeeAll,
}: {
  busyId: string | null;
  notifications: NotificationItem[];
  onAction: (
    notificationId: string,
    action: "accept" | "archive" | "reject" | "read",
  ) => void;
  onSeeAll: () => void;
}) {
  const unreadCount = notifications.filter(
    (notification) => notification.status === "unread",
  ).length;

  return (
    <Menu>
      <MenuTrigger
        aria-label="Open notifications"
        className="relative grid size-8 shrink-0 place-items-center rounded-lg text-sidebar-foreground outline-none transition-[background-color,color] hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Icon className="size-4 text-muted-foreground" icon={BellIcon} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-success shadow-[0_0_0_2px_hsl(var(--sidebar-background))]" />
        )}
      </MenuTrigger>
      <MenuPopup align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] p-1" sideOffset={8}>
        <div className="flex items-center justify-between px-2 py-2">
          <p className="text-sm font-medium leading-none">Notifications</p>
          {unreadCount > 0 && (
            <Badge className="h-5 px-1.5 text-[0.65rem]" variant="success">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="px-2 pb-3 pt-1 text-xs leading-5 text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-1">
            {notifications.map((notification) => (
              <NotificationRow
                busy={busyId === notification.id}
                disabled={Boolean(busyId)}
                key={notification.id}
                notification={notification}
                onAction={onAction}
              />
            ))}
          </div>
        )}
        <MenuSeparator />
        <MenuItem
          className="justify-between"
          onClick={onSeeAll}
        >
          <span>See all notifications</span>
          <Icon className="size-3.5 text-muted-foreground" icon={ArrowRight01Icon} />
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}

function NotificationsPage({
  busyId,
  notifications,
  onAction,
}: {
  busyId: string | null;
  notifications: NotificationItem[];
  onAction: (
    notificationId: string,
    action: "accept" | "archive" | "reject" | "read",
  ) => void;
}) {
  const unreadCount = notifications.filter(
    (notification) => notification.status === "unread",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <PageHeader
        actions={
          <Badge className="h-7 px-2 text-xs" variant="outline">
            {notifications.length} total / {unreadCount} unread
          </Badge>
        }
        description={pageDescriptions.notifications}
        title="Notifications"
      />
      <CardFrame>
        <CardFrameHeader>
          <div>
            <CardFrameTitle>Inbox</CardFrameTitle>
            <CardFrameDescription>
              Workspace invites, approvals, account updates, and system notices.
            </CardFrameDescription>
          </div>
          {unreadCount > 0 ? (
            <Badge className="h-6 px-2 text-xs" variant="success">
              {unreadCount} new
            </Badge>
          ) : null}
        </CardFrameHeader>
        <CardPanel className="p-1">
          {notifications.length === 0 ? (
            <div className="grid min-h-64 place-items-center px-6 text-center">
              <div>
                <div className="mx-auto grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-5" icon={BellIcon} />
                </div>
                <p className="mt-3 text-sm font-medium">No notifications yet.</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  New workspace activity and approvals will show up here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-1">
              {notifications.map((notification) => (
                <NotificationRow
                  busy={busyId === notification.id}
                  disabled={Boolean(busyId)}
                  key={notification.id}
                  notification={notification}
                  onAction={onAction}
                />
              ))}
            </div>
          )}
        </CardPanel>
      </CardFrame>
    </div>
  );
}

function NotificationRow({
  busy,
  disabled,
  notification,
  onAction,
}: {
  busy: boolean;
  disabled: boolean;
  notification: NotificationItem;
  onAction: (
    notificationId: string,
    action: "accept" | "archive" | "reject" | "read",
  ) => void;
}) {
  const actionable =
    notification.type === "workspace_invite" &&
    notification.actionStatus === "pending";
  const invitedEmail = asString(notification.metadata.invitedEmail);
  const workspaceName = asString(notification.metadata.workspaceName);

  return (
    <div
      className={cn(
        "group rounded-lg px-2 py-2 transition-[background-color]",
        notification.status === "unread" ? "bg-sidebar-accent/70" : "hover:bg-sidebar-accent/55",
      )}
      onClick={() => {
        if (notification.status === "unread" && !actionable) {
          onAction(notification.id, "read");
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <Icon
            className="size-4"
            icon={
              notification.type === "workspace_invite_accepted"
                ? CheckIcon
                : notification.type === "workspace_invite_rejected"
                  ? Delete02Icon
                  : Users
            }
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-medium leading-5">
              {notification.title}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <NotificationStatusBadge notification={notification} />
              <button
                aria-label="Dismiss notification"
                className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 transition-[background-color,color,opacity] hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={disabled}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onAction(notification.id, "archive");
                }}
                type="button"
              >
                {busy ? (
                  <Spinner className="size-3" />
                ) : (
                  <Icon className="size-3.5" icon={Cancel01Icon} />
                )}
              </button>
            </div>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {notification.body}
          </p>
          {(workspaceName || invitedEmail) && (
            <p className="mt-1 truncate text-[0.68rem] leading-none text-muted-foreground/75">
              {[workspaceName, invitedEmail].filter(Boolean).join(" / ")}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[0.68rem] leading-none text-muted-foreground/75">
              {formatDateTimeLabel(notification.createdAt)}
            </span>
            {actionable && (
              <div className="flex items-center gap-1">
                <Button
                  className="h-7 px-2 text-xs"
                  disabled={disabled}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAction(notification.id, "reject");
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Reject
                </Button>
                <Button
                  className="h-7 px-2 text-xs"
                  disabled={disabled}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAction(notification.id, "accept");
                  }}
                  size="sm"
                  type="button"
                >
                  {busy ? <Spinner className="size-3" /> : "Accept"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationStatusBadge({
  notification,
}: {
  notification: NotificationItem;
}) {
  if (notification.actionStatus === "accepted") {
    return (
      <Badge className="h-5 px-1.5 text-[0.65rem]" variant="success">
        Accepted
      </Badge>
    );
  }

  if (notification.actionStatus === "rejected") {
    return (
      <Badge className="h-5 px-1.5 text-[0.65rem]" variant="destructive">
        Rejected
      </Badge>
    );
  }

  if (notification.actionStatus === "pending") {
    return (
      <Badge className="h-5 px-1.5 text-[0.65rem]" variant="warning">
        Pending
      </Badge>
    );
  }

  if (notification.status === "unread") {
    return (
      <Badge className="h-5 px-1.5 text-[0.65rem]" variant="outline">
        New
      </Badge>
    );
  }

  return null;
}

function UserIdentity({
  loading = false,
  onSelectPage,
  profile,
}: {
  loading?: boolean;
  onSelectPage: (page: PageKey) => void;
  profile: DatabaseRecord | null;
}) {
  const displayName = asString(profile?.full_name, asString(profile?.email, "User"));
  const initials = getInitialsFromText(displayName);
  const avatarUrl = asString(profile?.avatar_url);

  if (loading) {
    return (
      <div className="flex min-w-0 items-center gap-1.5 px-1.5 py-1">
        <SkeletonBlock className="size-6 rounded-md" />
        <SkeletonBlock className="hidden h-3 w-16 sm:block" />
        <SkeletonBlock className="size-3.5 rounded-sm" />
      </div>
    );
  }

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
    window.localStorage.removeItem(dashboardCacheKey);
    window.location.href = "/login";
  }

  return (
    <Menu>
      <MenuTrigger className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-lg px-1.5 py-1 outline-none transition-[background-color] hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <AvatarTile
          className="size-6 rounded-md border-0 bg-background text-[0.625rem] shadow-none"
          initials={initials}
          src={avatarUrl}
        />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-xs font-medium leading-none text-sidebar-foreground">
            {displayName}
          </p>
        </div>
        <Icon
          className="size-3.5 text-muted-foreground"
          icon={ChevronDownIcon}
        />
      </MenuTrigger>
      <MenuPopup align="end" className="min-w-40" sideOffset={8}>
        <MenuItem onClick={() => onSelectPage("settings")}>
          <Icon icon={ProfileIcon} />
          My profile
        </MenuItem>
        <MenuItem onClick={() => onSelectPage("settings")}>
          <Icon icon={Settings01Icon} />
          Settings
        </MenuItem>
        <MenuSeparator />
        <MenuItem onClick={signOut} variant="destructive">
          <Icon icon={Logout03Icon} />
          Logout
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}

function NavButton({
  active,
  item,
  loading = false,
  onClick,
}: {
  active: boolean;
  item: NavigationItem;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={item.label}
      className={cn(
        "flex h-7 items-center gap-2 rounded-md text-left text-xs font-medium text-sidebar-foreground transition-[background-color,color,box-shadow]",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "px-2",
        active &&
          "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_1px_0_rgba(0,0,0,0.04)]",
      )}
      onClick={onClick}
      type="button"
    >
      {loading ? (
        <Spinner className="size-4" />
      ) : (
        <Icon className="size-4" icon={item.icon} />
      )}
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="min-w-0 truncate">{item.label}</span>
        {item.key === "brain" && <Badge variant="destructive">Soon</Badge>}
      </span>
      {active && <Icon className="size-4 opacity-60" icon={ArrowRight01Icon} />}
    </button>
  );
}

function SidebarThemeToggle({
  onCycle,
  preference,
}: {
  onCycle: () => void;
  preference: ThemePreference;
}) {
  const icon =
    preference === "light"
      ? Sun03Icon
      : preference === "dark"
        ? Moon02Icon
        : AppWindowMacIcon;
  const label =
    preference === "light"
      ? "Light theme"
      : preference === "dark"
        ? "Dark theme"
        : "System theme";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            aria-label={label}
            className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-[background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            onClick={onCycle}
            type="button"
          />
        }
      >
        <Icon className="size-4" icon={icon} />
      </TooltipTrigger>
      <TooltipPopup>{label}</TooltipPopup>
    </Tooltip>
  );
}

function WorkflowChatSpinnerIcon({ running }: { running: boolean }) {
  const color = running ? "#22c55e" : "#8a8a8a";

  return (
    <span className="grid size-3.5 shrink-0 place-items-center">
      <GradientSpin
        cellGap={1}
        cellRadius={1}
        cellSize={2}
        colorBy="row"
        dim={0.12}
        gradient={[
          { color, position: 0 },
          { color, position: 1 },
        ]}
        label={running ? "Workflow agent running" : "Workflow chat"}
        pattern="arrow-up"
        period={600}
        rows={4}
        cols={4}
      />
    </span>
  );
}

function SidebarChatHistory({
  activeChatId,
  chats,
  onDeleteChat,
  onJumpToAgentWorkflow,
  onOpenChange,
  onOpenChat,
  onRenameChat,
  onTogglePin,
  open,
  workflowChatMeta,
}: {
  activeChatId: string | null;
  chats: SidebarChat[];
  onDeleteChat: (chatId: string) => void;
  onJumpToAgentWorkflow: (agentName: string) => void;
  onOpenChange: (open: boolean) => void;
  onOpenChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  open: boolean;
  workflowChatMeta: ReadonlyMap<string, WorkflowSidebarChatMeta>;
}) {
  const orderedChats = [...chats].sort((first, second) =>
    Number(second.pinned) - Number(first.pinned),
  );

  return (
    <Collapsible onOpenChange={onOpenChange} open={open}>
      <div className="mt-3 pr-1">
        <CollapsibleTrigger className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-muted-foreground transition-[background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <Icon
            className={cn("size-3.5 transition-transform", open && "rotate-180")}
            icon={ChevronDownIcon}
          />
          <span className="min-w-0 flex-1 truncate">Chats</span>
          <span className="text-[0.625rem] tabular-nums">{chats.length}</span>
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <div className="mt-1 grid gap-0.5">
            {orderedChats.map((chat) => {
              const workflowMeta = workflowChatMeta.get(chat.id);
              const isWorkflowChat = Boolean(workflowMeta);
              const chatTitle = workflowMeta
                ? `${workflowMeta.agentName} / ${workflowMeta.title || chat.title}`
                : chat.title;

              return (
                <div
                  className={cn(
                    "group flex h-7 items-center gap-1 overflow-hidden rounded-md px-2 text-xs transition-[background-color,color]",
                    activeChatId === chat.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  key={chat.id}
                >
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden pr-1 text-left outline-none"
                    onClick={() => onOpenChat(chat.id)}
                    type="button"
                  >
                    {isWorkflowChat ? (
                      <WorkflowChatSpinnerIcon
                        running={Boolean(workflowMeta?.running)}
                      />
                    ) : (
                      <Icon className="size-3.5 opacity-70" icon={Chat01Icon} />
                    )}
                    <span className="min-w-0 flex-1 truncate">{chatTitle}</span>
                    {chat.pinned && (
                      <Icon className="size-3 opacity-60" icon={PinIcon} />
                    )}
                  </button>
                  <Menu>
                    <MenuTrigger
                      className="relative z-10 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 outline-none transition-[background-color,color,opacity] hover:bg-background/70 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring group-hover:opacity-100"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Icon className="size-3.5" icon={MoreHorizontalIcon} />
                    </MenuTrigger>
                    <MenuPopup align="end" className="min-w-36" sideOffset={6}>
                      {workflowMeta ? (
                        <>
                          <MenuItem
                            onClick={() =>
                              onJumpToAgentWorkflow(workflowMeta.agentName)
                            }
                          >
                            <Icon icon={ArrowRight01Icon} />
                            Jump to agent
                          </MenuItem>
                          <MenuSeparator />
                        </>
                      ) : null}
                      <MenuItem onClick={() => onTogglePin(chat.id)}>
                        <Icon icon={chat.pinned ? PinOffIcon : PinIcon} />
                        {chat.pinned ? "Unpin" : "Pin"}
                      </MenuItem>
                      <MenuItem onClick={() => onRenameChat(chat.id)}>
                        <Icon icon={Edit02Icon} />
                        Rename
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem
                        onClick={() => onDeleteChat(chat.id)}
                        variant="destructive"
                      >
                        <Icon icon={Delete02Icon} />
                        Delete
                      </MenuItem>
                    </MenuPopup>
                  </Menu>
                </div>
              );
            })}
          </div>
        </CollapsiblePanel>
      </div>
    </Collapsible>
  );
}

function PageHeader({
  actions,
  description,
  title,
}: {
  actions?: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-2xl">
        <h1 className="text-balance text-xl font-semibold tracking-normal text-foreground">
          {title}
        </h1>
        <p className="mt-1 max-w-xl text-pretty text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

function ChatPage({
  activeChat,
  activeChatId,
  agents,
  chatParticipantIds,
  composerOptions,
  ctaAccentPreference,
  draftRequest,
  members,
  onAddChatToAgentWorkflow,
  onAddMemberToChat,
  onCreateAgent,
  onCreateChat,
  onUpdateChatTitle,
  workspaceId,
}: {
  activeChat: SidebarChat | null;
  activeChatId: string | null;
  agents: Agent[];
  chatParticipantIds: string[];
  composerOptions: ComposerOption[];
  ctaAccentPreference: CtaAccentPreference;
  draftRequest: ChatDraftRequest | null;
  members: WorkspaceUser[];
  onAddChatToAgentWorkflow: (agentName: string, chat: SidebarChat) => void;
  onAddMemberToChat: (chatId: string, memberId: string) => void;
  onCreateAgent: (name: string) => void | Promise<void>;
  onCreateChat: (title: string) => Promise<string>;
  onUpdateChatTitle: (chatId: string, title: string) => void;
  workspaceId: string | null;
}) {
  return (
    <ChatExperience
      activeChat={activeChat}
      activeChatId={activeChatId}
      agents={agents}
      chatParticipantIds={chatParticipantIds}
      composerOptions={composerOptions}
      ctaAccentPreference={ctaAccentPreference}
      draftRequest={
        draftRequest?.chatId === activeChatId ? draftRequest : null
      }
      members={members}
      onAddChatToAgentWorkflow={onAddChatToAgentWorkflow}
      onAddMemberToChat={onAddMemberToChat}
      onCreateAgent={onCreateAgent}
      onCreateChat={onCreateChat}
      onUpdateChatTitle={onUpdateChatTitle}
      workspaceId={workspaceId}
    />
  );
}

function ChatExperience({
  activeChat = null,
  activeChatId = null,
  agents = [],
  chatParticipantIds = [],
  compact = false,
  composerOptions = [],
  ctaAccentPreference = "current",
  draftRequest = null,
  members = [],
  onAddChatToAgentWorkflow,
  onAddMemberToChat,
  onCreateAgent,
  onCreateChat,
  onUpdateChatTitle,
  workspaceId = null,
}: {
  activeChat?: SidebarChat | null;
  activeChatId?: string | null;
  agents?: Agent[];
  chatParticipantIds?: string[];
  compact?: boolean;
  composerOptions?: ComposerOption[];
  ctaAccentPreference?: CtaAccentPreference;
  draftRequest?: ChatDraftRequest | null;
  members?: WorkspaceUser[];
  onAddChatToAgentWorkflow?: (agentName: string, chat: SidebarChat) => void;
  onAddMemberToChat?: (chatId: string, memberId: string) => void;
  onCreateAgent?: (name: string) => void | Promise<void>;
  onCreateChat?: (title: string) => Promise<string>;
  onUpdateChatTitle?: (chatId: string, title: string) => void;
  workspaceId?: string | null;
}) {
  const [selectedModel, setSelectedModel] = useState<ChatModelOption>(
    modelOptions[0],
  );
  const [userModelOptions, setUserModelOptions] = useState<ChatModelOption[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageDraft, setEditingMessageDraft] = useState("");
  const [composerIsEmpty, setComposerIsEmpty] = useState(true);
  const [lastResponseUsedApp, setLastResponseUsedApp] = useState(false);
  const [createAgentDialogOpen, setCreateAgentDialogOpen] = useState(false);
  const [customModelDialogOpen, setCustomModelDialogOpen] = useState(false);
  const [composerAttachments, setComposerAttachments] = useState<
    ComposerAttachment[]
  >([]);
  const [mention, setMention] = useState<{
    kind: ComposerOption["kind"];
    query: string;
  } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const messageScrollerViewportRef = useRef<HTMLDivElement>(null);
  const mentionPopupRef = useRef<HTMLDivElement>(null);
  const mentionRangeRef = useRef<Range | null>(null);
  const keepChatAtEndRef = useRef(false);
  const keepChatAtEndFrameRef = useRef<number | null>(null);
  const skipNextMessageLoadRef = useRef(false);
  const skipNextMessageLoadForChatIdRef = useRef<string | null>(null);
  const hasMessages = messages.length > 0;
  const availableModelOptions = [...modelOptions, ...userModelOptions];
  const atmetModelOptions = availableModelOptions.filter(
    (model) => model.providerKey === "atmet",
  );
  const openaiModelOptions = modelOptions.filter(
    (model) => model.providerKey === "openai",
  );
  const anthropicModelOptions = modelOptions.filter(
    (model) => model.providerKey === "anthropic",
  );
  const customModelOptions = userModelOptions.filter(
    (model) => model.providerKey === "custom",
  );
  const customSetupModel = setupModelOptions.find(
    (option) => option.providerKey === "custom",
  );
  const localSetupModel = setupModelOptions.find(
    (option) => option.providerKey === "local",
  );
  const mentionOptions = mention
    ? composerOptions.filter(
        (option) =>
          option.kind === mention.kind &&
          option.name.toLowerCase().includes(mention.query.toLowerCase()),
      )
    : [];
  const availableMembers = members.filter(
    (member) => !chatParticipantIds.includes(getWorkspaceUserKey(member)),
  );

  function keepChatAtEndOnNextPaint() {
    keepChatAtEndRef.current = true;
    if (keepChatAtEndFrameRef.current !== null) {
      return;
    }

    keepChatAtEndFrameRef.current = requestAnimationFrame(() => {
      keepChatAtEndFrameRef.current = null;
      const viewport = messageScrollerViewportRef.current;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    });
  }

  useEffect(() => {
    if (!keepChatAtEndRef.current) {
      return;
    }

    const scrollToEnd = () => {
      const viewport = messageScrollerViewportRef.current;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    };

    const firstFrameId = requestAnimationFrame(scrollToEnd);
    const secondFrameId = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToEnd);
    });
    const settleTimeoutId = window.setTimeout(() => {
      scrollToEnd();
      keepChatAtEndRef.current = false;
    }, 160);

    return () => {
      cancelAnimationFrame(firstFrameId);
      cancelAnimationFrame(secondFrameId);
      window.clearTimeout(settleTimeoutId);
    };
  }, [messages]);

  function selectModel(model: ChatModelOption) {
    setSelectedModel(model);
    try {
      window.localStorage.setItem(lastSelectedChatModelKey, model.id);
    } catch {
      // Model selection still works if localStorage is unavailable.
    }
  }

  async function loadUserModels(cancelled = false) {
    try {
      const response = await fetch("/api/user-model-connections", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = asRecord(await response.json());
      const connections = asRecordArray(payload.connections)
        .filter((connection) => asBoolean(connection.enabled, true))
        .filter((connection) => asString(connection.providerKey) === "custom")
        .map((connection) => {
          const displayName = asString(connection.displayName, "Custom API");
          return {
            icon: CodeIcon,
            description: asString(connection.modelId, "Your connected model"),
            id: `user-connection:${asString(connection.id)}`,
            name: displayName,
            providerKey: "custom",
          };
        })
        .filter((option) => option.id !== "user-connection:");

      if (!cancelled) {
        setUserModelOptions(connections);
        try {
          const storedModelId = window.localStorage.getItem(lastSelectedChatModelKey);
          const storedModel = [...modelOptions, ...connections].find(
            (model) => model.id === storedModelId,
          );
          if (storedModel) {
            setSelectedModel(storedModel);
          }
        } catch {
          // Ignore storage failures.
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    try {
      const storedModelId = window.localStorage.getItem(lastSelectedChatModelKey);
      const storedModel = modelOptions.find((model) => model.id === storedModelId);
      if (storedModel) {
        setSelectedModel(storedModel);
      }
    } catch {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadUserModels(cancelled);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mention) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        mentionPopupRef.current?.contains(target)
      ) {
        return;
      }

      setMention(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mention]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!activeChatId) {
        setMessages([]);
        setLastResponseUsedApp(false);
        setCreateAgentDialogOpen(false);
        return;
      }

      if (
        skipNextMessageLoadRef.current &&
        (!skipNextMessageLoadForChatIdRef.current ||
          skipNextMessageLoadForChatIdRef.current === activeChatId)
      ) {
        skipNextMessageLoadRef.current = false;
        skipNextMessageLoadForChatIdRef.current = null;
        return;
      }

      try {
        const response = await fetch(`/api/chats/${activeChatId}/messages`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = asRecord(await response.json());
        const loadedMessages = asRecordArray(payload.messages)
          .map(mapChatMessage)
          .filter((message): message is ChatMessage => Boolean(message));

        if (!cancelled) {
          keepChatAtEndOnNextPaint();
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.error(error);
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeChatId]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!draftRequest || !editor) {
      return;
    }

    editor.textContent = draftRequest.prompt;
    setComposerIsEmpty(false);
    setMention(null);
    mentionRangeRef.current = null;
    requestAnimationFrame(() => {
      editor.focus();
      placeCaretAtEnd(editor);
    });
  }, [draftRequest]);

  function openMention(kind: ComposerOption["kind"]) {
    mentionRangeRef.current = null;
    setMention({ kind, query: "" });
    setHighlightedIndex(0);
    requestAnimationFrame(() => editorRef.current?.focus());
  }

  function updateComposerState() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    setComposerIsEmpty(editor.textContent?.trim().length === 0);
  }

  function startEditingUserMessage(message: ChatMessage) {
    if (message.role !== "user") {
      return;
    }

    setEditingMessageId(message.id);
    setEditingMessageDraft(message.content);
  }

  function cancelEditingUserMessage() {
    setEditingMessageId(null);
    setEditingMessageDraft("");
  }

  async function editUserMessage(message: ChatMessage, nextContent: string) {
    if (!activeChatId || message.role !== "user") {
      return;
    }

    const trimmedContent = nextContent.trim();
    if (!trimmedContent) {
      return;
    }

    if (trimmedContent === message.content) {
      cancelEditingUserMessage();
      return;
    }

    try {
      const response = await fetch(`/api/chats/${activeChatId}/messages`, {
        body: JSON.stringify({
          action: "edit",
          content: trimmedContent,
          messageId: message.id,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = asRecord(await response.json().catch(() => ({})));
      if (!response.ok) {
        throw new Error(asString(payload.error, "Could not edit message."));
      }

      const editedMessage = mapChatMessage(payload.message);
      setMessages((current) => {
        const index = current.findIndex((item) => item.id === message.id);
        if (index === -1) {
          return current;
        }

        return [
          ...current.slice(0, index),
          editedMessage ?? { ...message, content: trimmedContent },
        ];
      });
      cancelEditingUserMessage();
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not edit message.");
    }
  }

  async function setMessageFeedback(message: ChatMessage, feedback: "dislike" | "like") {
    if (!activeChatId) {
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id ? { ...item, feedback } : item,
      ),
    );

    try {
      const response = await fetch(`/api/chats/${activeChatId}/messages`, {
        body: JSON.stringify({
          action: "feedback",
          feedback,
          messageId: message.id,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        const payload = asRecord(await response.json().catch(() => ({})));
        throw new Error(asString(payload.error, "Could not save feedback."));
      }
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not save feedback.");
    }
  }

  async function decideWorkflowApproval(
    message: ChatMessage,
    decision: "approved" | "auto_approved" | "rejected",
  ) {
    const approval = message.approval;
    if (!approval?.approvalId) {
      return;
    }
    const approvalId = approval.approvalId;
    const originalStatus = approval.status;

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id && item.approval
          ? {
              ...item,
              approval: { ...item.approval, status: decision },
            }
          : item,
      ),
    );

    try {
      const response = await fetch(`/api/workflow-approvals/${approvalId}`, {
        body: JSON.stringify({ decision }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = asRecord(await response.json().catch(() => ({})));

      if (!response.ok) {
        throw new Error(asString(payload.error, "Could not update approval."));
      }

      void playAtmetSuccessSound();
      if (activeChatId) {
        const messagesResponse = await fetch(`/api/chats/${activeChatId}/messages`, {
          cache: "no-store",
        });
        if (messagesResponse.ok) {
          const messagesPayload = asRecord(await messagesResponse.json());
          const loadedMessages = asRecordArray(messagesPayload.messages)
            .map(mapChatMessage)
            .filter((item): item is ChatMessage => Boolean(item));
          keepChatAtEndOnNextPaint();
          setMessages(loadedMessages);
        }
      }
    } catch (error) {
      void playAtmetSound("error");
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id && item.approval
            ? {
                ...item,
                approval: { ...item.approval, status: originalStatus },
              }
            : item,
        ),
      );
      window.alert(
        error instanceof Error ? error.message : "Could not update approval.",
      );
    }
  }

  function copyMessageContent(message: ChatMessage) {
    navigator.clipboard?.writeText(message.content).catch(() => undefined);
  }

  async function regenerateFromMessage(message: ChatMessage) {
    if (!activeChatId || !workspaceId || isSending) {
      return;
    }

    const targetMessage =
      message.role === "user"
        ? message
        : [...messages]
            .slice(0, messages.findIndex((item) => item.id === message.id))
            .reverse()
            .find((item) => item.role === "user");

    if (!targetMessage) {
      return;
    }

    const targetIndex = messages.findIndex((item) => item.id === targetMessage.id);
    const assistantPendingId = `regenerate-${Date.now()}`;
    const selectedAppKeys = (targetMessage.mentions ?? [])
      .filter((mention) => mention.kind === "apps")
      .map((mention) => mention.key || mention.name)
      .filter(Boolean);

    keepChatAtEndOnNextPaint();
    setMessages((current) => {
      const index = current.findIndex((item) => item.id === targetMessage.id);
      if (index === -1) {
        return current;
      }

      return [
        ...current.slice(0, index + 1),
        {
          content: "",
          id: assistantPendingId,
          role: "assistant" as const,
          state: "thinking" as const,
        },
      ];
    });
    setIsSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        body: JSON.stringify({
          appKeys: selectedAppKeys,
          chatId: activeChatId,
          regenerateMessageId: targetMessage.id,
          modelKey: selectedModel.id,
          workspaceId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = asRecord(await response.json().catch(() => ({})));
      if (!response.ok) {
        throw new Error(
          asString(payload.error) ||
            asString(payload.message) ||
            "Atmet could not regenerate this response.",
        );
      }

      const savedAssistantMessage = mapChatMessage(payload.assistantMessage);
      keepChatAtEndOnNextPaint();
      setMessages((current) =>
        current.map((currentMessage) =>
          currentMessage.id === assistantPendingId && savedAssistantMessage
            ? { ...savedAssistantMessage, state: "typing" as const }
            : currentMessage,
        ),
      );
    } catch (error) {
      void playAtmetSound("error");
      const errorMessage =
        error instanceof Error ? error.message : "Could not regenerate response.";
      setMessages((current) => {
        const trimmed =
          targetIndex >= 0 ? current.slice(0, targetIndex + 1) : current;
        return [
          ...trimmed,
          {
            content: `Atmet could not complete this message: ${errorMessage}`,
            id: assistantPendingId,
            role: "assistant" as const,
            state: "complete" as const,
          },
        ];
      });
    } finally {
      setIsSending(false);
    }
  }

  function updateMentionFromEditor() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0 ||
      !selection.isCollapsed ||
      !editor.contains(selection.anchorNode)
    ) {
      setMention(null);
      mentionRangeRef.current = null;
      return;
    }

    const activeRange = selection.getRangeAt(0);
    const beforeCaretRange = activeRange.cloneRange();
    beforeCaretRange.selectNodeContents(editor);
    beforeCaretRange.setEnd(activeRange.startContainer, activeRange.startOffset);

    const textBeforeCaret = beforeCaretRange.toString();
    const slashIndex = textBeforeCaret.lastIndexOf("/");
    const appIndex = textBeforeCaret.lastIndexOf("@");
    const triggerIndex = Math.max(slashIndex, appIndex);
    if (triggerIndex === -1) {
      setMention(null);
      mentionRangeRef.current = null;
      return;
    }

    const query = textBeforeCaret.slice(triggerIndex + 1);
    if (/\s/.test(query)) {
      setMention(null);
      mentionRangeRef.current = null;
      return;
    }

    mentionRangeRef.current = getTextRange(editor, triggerIndex, textBeforeCaret.length);
    setMention({
      kind: textBeforeCaret[triggerIndex] === "@" ? "apps" : "skills",
      query,
    });
    setHighlightedIndex(0);
  }

  function handleEditorInput() {
    updateComposerState();
    updateMentionFromEditor();
  }

  function selectComposerOption(option: ComposerOption) {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    const insertionRange = mentionRangeRef.current;

    if (insertionRange && selection) {
      selection.removeAllRanges();
      selection.addRange(insertionRange);
    } else {
      placeCaretAtEnd(editor);
    }

    insertComposerBadge(option);
    setMention(null);
    mentionRangeRef.current = null;
    setHighlightedIndex(0);
    updateComposerState();
  }

  async function handleComposerFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    if (files.length === 0) {
      return;
    }

    try {
      const openSlots = Math.max(0, maxComposerAttachments - composerAttachments.length);
      const nextFiles = files.slice(0, openSlots);

      if (nextFiles.length === 0) {
        throw new Error(`You can attach up to ${maxComposerAttachments} files.`);
      }

      const attachments = await Promise.all(
        nextFiles.map(fileToComposerAttachment),
      );
      setComposerAttachments((current) => [
        ...current,
        ...attachments,
      ].slice(0, maxComposerAttachments));
    } catch (error) {
      void playAtmetSound("error");
      window.alert(
        error instanceof Error ? error.message : "Could not attach that file.",
      );
    }
  }

  async function sendComposerMessage() {
    const editor = editorRef.current;
    if (!editor || isSending) {
      return;
    }

    const typedContent = getComposerPlainText(editor);
    const selectedAttachments = composerAttachments;
    const content =
      typedContent ||
      (selectedAttachments.length > 0 ? "Please read the attached file(s)." : "");
    if (!content) {
      editor.focus();
      return;
    }

    warmAtmetAudio();

    const selectedAppKeys = getSelectedComposerAppKeys(editor);
    const selectedMentions = getSelectedComposerMentions(editor);
    setLastResponseUsedApp(false);
    setCreateAgentDialogOpen(false);

    const optimisticMessage = {
      attachments: selectedAttachments.map((attachment) => ({
        kind: attachment.kind,
        name: attachment.name,
        previewData: attachment.kind === "image" ? attachment.data : null,
        size: attachment.size,
        type: attachment.type,
      })),
      content,
      id: `pending-${Date.now()}`,
      mentions: selectedMentions,
      role: "user" as const,
    };
    const assistantPendingId = `thinking-${Date.now()}`;
    const thinkingMessage = {
      content: "",
      id: assistantPendingId,
      role: "assistant" as const,
      state: "thinking" as const,
    };
    keepChatAtEndOnNextPaint();
    setMessages((current) => [...current, optimisticMessage, thinkingMessage]);

    editor.innerHTML = "";
    setComposerIsEmpty(true);
    setComposerAttachments([]);
    setMention(null);
    mentionRangeRef.current = null;

    setIsSending(true);
    let targetChatId = activeChatId ?? "";
    const createdChatForMessage = !targetChatId;

    if (!targetChatId && workspaceId && onCreateChat) {
      skipNextMessageLoadRef.current = true;
      targetChatId = await onCreateChat(summarizeChatTitle(content));
      skipNextMessageLoadForChatIdRef.current = targetChatId || null;
    }

    if (!targetChatId) {
      skipNextMessageLoadRef.current = false;
      skipNextMessageLoadForChatIdRef.current = null;
    }

    if (!targetChatId || !workspaceId) {
      keepChatAtEndOnNextPaint();
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantPendingId
            ? {
                ...message,
                content: "Create or select a chat before sending a message.",
                state: "complete",
              }
            : message,
        ),
      );
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch("/api/ai/chat", {
        body: JSON.stringify({
          appKeys: selectedAppKeys,
          chatId: targetChatId,
          content,
          attachments: selectedAttachments.map((attachment) => ({
            data: attachment.data,
            name: attachment.name,
            size: attachment.size,
            type: attachment.type,
          })),
          mentions: selectedMentions,
          modelKey: selectedModel.id,
          workspaceId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = asRecord(await response.json().catch(() => ({})));
      if (!response.ok) {
        throw new Error(
          asString(payload.error) ||
            asString(payload.message) ||
            "Atmet could not send this message.",
        );
      }

      const savedUserMessage = mapChatMessage(payload.userMessage);
      const savedAssistantMessage = mapChatMessage(payload.assistantMessage);
      const savedChatTitle = asString(payload.chatTitle);

      if (savedAssistantMessage) {
        setLastResponseUsedApp(selectedAppKeys.length > 0);
        void playAtmetSuccessSound({ fallback: createdChatForMessage });
      }

      if (savedChatTitle && targetChatId) {
        onUpdateChatTitle?.(targetChatId, savedChatTitle);
      }

      keepChatAtEndOnNextPaint();
      setMessages((current) =>
        current.map((message) => {
          if (message.id === optimisticMessage.id && savedUserMessage) {
            return savedUserMessage;
          }

          if (message.id === assistantPendingId && savedAssistantMessage) {
            return {
              ...savedAssistantMessage,
              state: "typing" as const,
            };
          }

          return message;
        }),
      );
    } catch (error) {
      console.error(error);
      void playAtmetSound("error");
      const message =
        error instanceof Error ? error.message : "Unexpected AI error.";
      keepChatAtEndOnNextPaint();
      setMessages((current) =>
        current.map((currentMessage) =>
          currentMessage.id === assistantPendingId
            ? {
                ...currentMessage,
                content: `Atmet could not complete this message: ${message}`,
                state: "complete",
              }
            : currentMessage,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      sendComposerMessage();
      return;
    }

    if (event.key === "Backspace" && deletePreviousBadge()) {
      event.preventDefault();
      setMention(null);
      mentionRangeRef.current = null;
      updateComposerState();
      return;
    }

    if (event.key === "Enter" && !mention) {
      event.preventDefault();
      if (event.shiftKey) {
        document.execCommand("insertLineBreak");
        requestAnimationFrame(() => {
          updateComposerState();
          updateMentionFromEditor();
        });
      } else {
        sendComposerMessage();
      }
      return;
    }

    if (event.key === " " && mention) {
      setMention(null);
      mentionRangeRef.current = null;
      return;
    }

    if (event.key === "@" || event.key === "/") {
      requestAnimationFrame(() => {
        updateComposerState();
        updateMentionFromEditor();
      });
      return;
    }

    if (event.key === "Backspace" || event.key.length === 1) {
      requestAnimationFrame(() => {
        updateComposerState();
        updateMentionFromEditor();
      });
    }

    if (event.key === "Escape" && mention) {
      event.preventDefault();
      setMention(null);
      mentionRangeRef.current = null;
      return;
    }

    if (mention && mentionOptions.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((index) => (index + 1) % mentionOptions.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex(
          (index) => (index - 1 + mentionOptions.length) % mentionOptions.length,
        );
        return;
      }

      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        selectComposerOption(mentionOptions[highlightedIndex]);
        return;
      }
    }
  }

  function deletePreviousBadge() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0 ||
      !selection.isCollapsed ||
      !editor.contains(selection.anchorNode)
    ) {
      return false;
    }

    const range = selection.getRangeAt(0);
    let previousNode: Node | null = null;

    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      const textNode = range.startContainer;
      const textBeforeCaret = textNode.textContent?.slice(0, range.startOffset) ?? "";
      const textAfterCaret = textNode.textContent?.slice(range.startOffset) ?? "";
      const spacerBeforeBadge = /^[\u00a0 ]$/.test(textBeforeCaret);
      const possibleBadge = textNode.previousSibling;

      if (spacerBeforeBadge && isComposerBadgeNode(possibleBadge)) {
        possibleBadge.remove();
        textNode.textContent = textAfterCaret;
        requestAnimationFrame(updateComposerState);

        const nextRange = document.createRange();
        nextRange.setStart(textNode, 0);
        nextRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(nextRange);
        return true;
      }

      if (range.startOffset > 0) {
        return false;
      }

      previousNode = range.startContainer.previousSibling;
    } else {
      previousNode = range.startContainer.childNodes[range.startOffset - 1] ?? null;
    }

    while (previousNode?.nodeType === Node.TEXT_NODE && previousNode.textContent === "") {
      previousNode = previousNode.previousSibling;
    }

    if (!isComposerBadgeNode(previousNode)) {
      return false;
    }

    previousNode.remove();
    requestAnimationFrame(updateComposerState);
    return true;
  }

  const showCreateAgentFrame =
    !compact &&
    lastResponseUsedApp &&
    Boolean(activeChat) &&
    Boolean(onAddChatToAgentWorkflow) &&
    Boolean(onCreateAgent);

  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col",
        compact
          ? "min-h-full justify-end"
          : "min-h-[calc(100svh-8rem)]",
        !compact &&
          (hasMessages ? "justify-end overflow-hidden py-4" : "justify-center py-8"),
      )}
    >
      {hasMessages && (
        <MessageScrollerProvider
          autoScroll
          defaultScrollPosition="end"
          scrollPreviousItemPeek={48}
        >
          <div
            className={cn(
              "relative mx-auto min-h-0 w-full flex-1",
              compact ? "max-w-none" : "max-w-[min(100%,96rem)]",
            )}
          >
            <MessageScroller className="min-h-0">
              <MessageScrollerViewport
                className={cn(
                  "px-3 sm:px-4 lg:px-6",
                  showCreateAgentFrame ? "pb-52" : "pb-40",
                )}
                ref={messageScrollerViewportRef}
              >
                <MessageScrollerContent>
                  {messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                    >
                      <ChatMessageBubble
                        editValue={
                          editingMessageId === message.id
                            ? editingMessageDraft
                            : undefined
                        }
                        isEditing={editingMessageId === message.id}
                        message={message}
                        onCancelEdit={cancelEditingUserMessage}
                        onCopy={copyMessageContent}
                        onEdit={startEditingUserMessage}
                        onEditValueChange={setEditingMessageDraft}
                        onFeedback={setMessageFeedback}
                        onApprovalDecision={decideWorkflowApproval}
                        onRegenerate={regenerateFromMessage}
                        onSaveEdit={(nextContent) => editUserMessage(message, nextContent)}
                        onTypingFrame={keepChatAtEndOnNextPaint}
                        onTypingComplete={(messageId) => {
                          setMessages((current) =>
                            current.map((currentMessage) =>
                              currentMessage.id === messageId &&
                              currentMessage.state === "typing"
                                ? { ...currentMessage, state: "complete" }
                                : currentMessage,
                            ),
                          );
                        }}
                      />
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </div>
        </MessageScrollerProvider>
      )}

      <div
        className={cn(
          "relative mx-auto w-full max-w-3xl rounded-2xl border border-black/10 bg-white/28 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/[0.035]",
          hasMessages && "absolute inset-x-0 bottom-1 z-10",
        )}
      >
          {showCreateAgentFrame && (
            <button
              className="absolute -top-7 left-5 z-10 inline-flex h-7 items-center gap-1.5 rounded-t-xl border border-b-0 border-black/10 bg-background/82 px-3 text-xs font-medium text-foreground backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,color] hover:bg-background/95 dark:border-white/10 dark:bg-background/75 dark:hover:bg-background/90"
              onClick={() => setCreateAgentDialogOpen(true)}
              type="button"
            >
              <Icon className="size-3.5" icon={WorkflowSquare01Icon} />
              Create Agent
            </button>
          )}
          <div
            aria-label="Message Atmet"
            className="relative min-h-[7.25rem] cursor-text px-4 py-3 text-base leading-6 outline-none sm:text-sm"
            onClick={() => editorRef.current?.focus()}
            role="textbox"
          >
            {composerIsEmpty && (
              <span className="pointer-events-none absolute left-4 top-4 text-muted-foreground">
                Use / to add a skill or @ to connect an app.
              </span>
            )}
            <div
              className="relative z-10 min-h-[5rem] whitespace-pre-wrap break-words leading-6 outline-none"
              contentEditable
              onInput={handleEditorInput}
              onKeyDown={handleComposerKeyDown}
              ref={editorRef}
              suppressContentEditableWarning
            />
          </div>
          {mention && (
            <div
              className="absolute bottom-14 left-3 z-20 w-72 rounded-xl border border-black/8 bg-popover p-1 shadow-lg/5 dark:border-white/8"
              ref={mentionPopupRef}
            >
              <div className="px-2 py-1.5 text-muted-foreground text-xs">
                {mention.kind === "apps" ? "Connect an app" : "Add a skill"}
              </div>
              <div className="grid gap-0.5">
                {mentionOptions.length > 0 ? (
                  mentionOptions.map((option, index) => (
                    <button
                      className={cn(
                        "flex min-h-8 items-center gap-2 rounded-lg px-2 py-1 text-left text-sm outline-none",
                        index === highlightedIndex
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent",
                      )}
                      key={option.id}
                      onClick={() => selectComposerOption(option)}
                      onMouseDown={(event) => event.preventDefault()}
                      type="button"
                    >
                      <ComposerOptionIcon option={option} />
                      <span className="min-w-0 flex-1 truncate">
                        {option.name}
                      </span>
                      {index === highlightedIndex && (
                        <Icon className="text-info" icon={CheckIcon} />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-2 py-3 text-muted-foreground text-sm">
                    No matches
                  </div>
                )}
              </div>
            </div>
          )}
          {composerAttachments.length > 0 ? (
            <div className="px-3 pb-1">
              <div className="flex max-h-48 flex-wrap items-start gap-2 overflow-y-auto pr-1">
              {composerAttachments.map((attachment) => (
                <ChatAttachmentPreview
                  attachment={{
                    kind: attachment.kind,
                    name: attachment.name,
                    previewData: attachment.kind === "image" ? attachment.data : null,
                    size: attachment.size,
                    type: attachment.type,
                  }}
                  key={attachment.id}
                  onRemove={() =>
                    setComposerAttachments((current) =>
                      current.filter((item) => item.id !== attachment.id),
                    )
                  }
                />
              ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-2">
            <Menu>
              <MenuTrigger className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-sm font-medium text-muted-foreground outline-none transition-[background-color,color] hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                <ChatModelMark className="size-5" model={selectedModel} />
                {selectedModel.name}
                <Icon className="size-3.5 opacity-70" icon={ChevronDownIcon} />
              </MenuTrigger>
              <MenuPopup
                align="start"
                className="min-w-64 overflow-visible [&>div]:overflow-visible"
                sideOffset={8}
              >
                {atmetModelOptions.length > 0 ? (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Atmet models
                    </div>
                    {atmetModelOptions.map((model) => (
                      <ChatModelMenuItem
                        key={model.id}
                        model={model}
                        onSelect={() => selectModel(model)}
                        selected={selectedModel.id === model.id}
                      />
                    ))}
                  </>
                ) : null}
                <MenuSeparator />
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Other models
                </div>
                <ChatModelProviderMenuItem
                  description="Choose a specific OpenAI model"
                  logo="openai"
                  models={openaiModelOptions}
                  name="ChatGPT"
                  onSelectModel={selectModel}
                  selectedModelId={selectedModel.id}
                />
                <ChatModelProviderMenuItem
                  description="Choose a specific Anthropic model"
                  logo="anthropic"
                  models={anthropicModelOptions}
                  name="Claude"
                  onSelectModel={selectModel}
                  selectedModelId={selectedModel.id}
                />
                {customModelOptions.length > 0 ? (
                  <>
                    <MenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Custom API LLMs
                    </div>
                    {customModelOptions.map((model) => (
                      <ChatModelMenuItem
                        key={model.id}
                        model={model}
                        onSelect={() => selectModel(model)}
                        selected={selectedModel.id === model.id}
                      />
                    ))}
                  </>
                ) : null}
                <MenuSeparator />
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Add models
                </div>
                {customSetupModel ? (
                  <ChatModelSetupMenuItem
                    model={customSetupModel}
                    onClick={() => setCustomModelDialogOpen(true)}
                  />
                ) : null}
                {localSetupModel ? (
                  <ChatModelSetupMenuItem model={localSetupModel} soon />
                ) : null}
              </MenuPopup>
            </Menu>
            <CustomLlmDialog
              onOpenChange={setCustomModelDialogOpen}
              onSaved={async () => {
                await loadUserModels(false);
              }}
              open={customModelDialogOpen}
            />

            <div className="h-5 w-px bg-border" />

            <Button
              onClick={() => openMention("apps")}
              size="sm"
              variant="ghost"
            >
              Apps
              <Icon icon={PlusSignIcon} />
            </Button>
            <Button
              onClick={() => openMention("skills")}
              size="sm"
              variant="ghost"
            >
              Skills
              <Icon icon={PlusSignIcon} />
            </Button>

            <div className="min-w-3 flex-1" />

            <Menu>
              <MenuTrigger
                render={
                  <Button size="sm" variant="ghost">
                    Add
                    <Icon icon={PlusSignIcon} />
                  </Button>
                }
              />
              <MenuPopup align="end" className="min-w-64" sideOffset={8}>
                <MenuItem onClick={() => fileInputRef.current?.click()}>
                  <Icon icon={FileUploadIcon} />
                  Upload file
                </MenuItem>
                <MenuSeparator />
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Add people
                </div>
                {activeChatId ? (
                  availableMembers.length > 0 ? (
                    availableMembers.map((member) => (
                      <MenuItem
                        className="min-h-10"
                        key={getWorkspaceUserKey(member)}
                        onClick={() =>
                          onAddMemberToChat?.(
                            activeChatId,
                            getWorkspaceUserKey(member),
                          )
                        }
                      >
                        <AvatarTile
                          className="size-6 rounded-md border-0 bg-muted text-[0.625rem] shadow-none"
                          initials={member.initials}
                          src={member.avatarUrl}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{member.name}</span>
                          <span className="block truncate text-muted-foreground text-xs">
                            {member.email || member.role}
                          </span>
                        </span>
                        <Icon className="text-info" icon={UserAdd01Icon} />
                      </MenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-xs leading-5 text-muted-foreground">
                      Everyone is already in this chat.
                    </div>
                  )
                ) : (
                  <div className="px-2 py-2 text-xs leading-5 text-muted-foreground">
                    Send the first message before adding people.
                  </div>
                )}
              </MenuPopup>
            </Menu>
            <input
              accept={chatAttachmentAccept}
              className="hidden"
              multiple
              onChange={handleComposerFileChange}
              ref={fileInputRef}
              type="file"
            />
            <Button
              className={cn(
                ctaAccentPreference === "blue" && blueCtaButtonClassName,
              )}
              disabled={isSending}
              onClick={sendComposerMessage}
              size="sm"
            >
              Send
              {isSending ? (
                <Spinner className="size-3.5" />
              ) : (
                <Icon icon={SendHorizontal} />
              )}
            </Button>
          </div>
      </div>
      {activeChat && onAddChatToAgentWorkflow && onCreateAgent ? (
        <AddChatToAgentWorkflowDialog
          agents={agents}
          chat={activeChat}
          onCreateAgent={onCreateAgent}
          onOpenChange={setCreateAgentDialogOpen}
          onSelectAgent={(agentName) => {
            onAddChatToAgentWorkflow(agentName, activeChat);
            setCreateAgentDialogOpen(false);
          }}
          open={createAgentDialogOpen}
        />
      ) : null}
    </div>
  );
}

function ConnectorLogo({
  className,
  connector,
  fallback,
}: {
  className?: string;
  connector?: Pick<ConnectorItem, "key" | "logo" | "name"> | null;
  fallback?: string;
}) {
  const logoClassName = cn("size-full object-contain", className);
  const logo = connector?.logo ?? fallback;

  if (logo?.startsWith("http")) {
    return (
      <img
        alt={connector?.name ? `${connector.name} logo` : ""}
        className={logoClassName}
        loading="lazy"
        src={logo}
      />
    );
  }

  return (
    <span>
      {connector?.logo ?? fallback ?? getOptionInitials(connector?.name ?? "")}
    </span>
  );
}

function ComposerOptionIcon({
  compact = false,
  option,
}: {
  compact?: boolean;
  option: ComposerOption;
}) {
  if (option.icon) {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md bg-background text-foreground",
          compact ? "size-4" : "size-5",
        )}
      >
        <Icon className={compact ? "size-3" : "size-3.5"} icon={option.icon} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-md border border-black/8 bg-white font-semibold text-stone-900 shadow-xs/5 dark:border-white/10",
        compact ? "size-4 text-[0.55rem]" : "size-5 text-[0.625rem]",
      )}
    >
      <ConnectorLogo
        className={compact ? "size-2.5" : "size-3.5"}
        connector={{
          key: option.connectorKey,
          logo: option.logo ?? getOptionInitials(option.name),
          name: option.name,
        }}
      />
    </span>
  );
}

function ChatModelMenuItem({
  model,
  onSelect,
  selected,
}: {
  model: ChatModelOption;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <MenuItem onClick={onSelect}>
      <ChatModelMark model={model} />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{model.name}</span>
        {model.description ? (
          <span className="block truncate text-muted-foreground text-xs">
            {model.description}
          </span>
        ) : null}
      </span>
      {selected ? <Icon className="text-info" icon={CheckIcon} /> : null}
    </MenuItem>
  );
}

function ChatModelProviderMenuItem({
  description,
  logo,
  models,
  name,
  onSelectModel,
  selectedModelId,
}: {
  description: string;
  logo: ChatModelLogo;
  models: ChatModelOption[];
  name: string;
  onSelectModel: (model: ChatModelOption) => void;
  selectedModelId: string;
}) {
  const selected = models.some((model) => model.id === selectedModelId);
  const representative = models[0] ?? {
    id: name,
    logo,
    name,
  };

  return (
    <div className="group/model-provider relative">
      <MenuItem
        className="cursor-default"
        closeOnClick={false}
        onClick={(event) => event.preventDefault()}
      >
        <ChatModelMark model={{ ...representative, logo, name }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{name}</span>
          <span className="block truncate text-muted-foreground text-xs">
            {description}
          </span>
        </span>
        {selected ? <Icon className="text-info" icon={CheckIcon} /> : null}
        <Icon className="opacity-60" icon={ArrowRight01Icon} />
      </MenuItem>
      <div className="absolute left-full top-0 z-50 hidden pl-2 group-hover/model-provider:block group-focus-within/model-provider:block">
        <div className="absolute left-0 top-0 h-full w-2" />
        <div className="relative grid w-72 gap-1 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]">
          {models.map((model) => (
            <button
              className={cn(
                "flex min-h-8 w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm transition-[background-color,color] hover:bg-accent hover:text-accent-foreground",
                selectedModelId === model.id && "bg-accent text-accent-foreground",
              )}
              key={model.id}
              onClick={() => onSelectModel(model)}
              type="button"
            >
              <ChatModelMark model={model} />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{model.name}</span>
                {model.description ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {model.description}
                  </span>
                ) : null}
              </span>
              {selectedModelId === model.id ? (
                <Icon className="text-info" icon={CheckIcon} />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatModelSetupMenuItem({
  model,
  onClick,
  soon = false,
}: {
  model: ChatModelOption;
  onClick?: () => void;
  soon?: boolean;
}) {
  return (
    <MenuItem disabled={soon} onClick={onClick}>
      <ChatModelMark model={model} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 truncate">
          <span className="truncate">{model.name}</span>
          {soon ? <Badge variant="destructive">Soon</Badge> : null}
        </span>
        <span className="block truncate text-muted-foreground text-xs">
          {model.description}
        </span>
      </span>
    </MenuItem>
  );
}

function CustomLlmDialog({
  onOpenChange,
  onSaved,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void | Promise<void>;
  open: boolean;
}) {
  const [connections, setConnections] = useState<DatabaseRecord[]>([]);
  const [form, setForm] = useState<UserModelConnectionForm>(() =>
    getDefaultUserModelConnectionForm("custom"),
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadConnections() {
    setLoading(true);
    try {
      const response = await fetch("/api/user-model-connections", {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }

      const payload = asRecord(await response.json().catch(() => ({})));
      setConnections(
        asRecordArray(payload.connections).filter(
          (connection) => asString(connection.providerKey) === "custom",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      void loadConnections();
    }
  }, [open]);

  function updateForm(key: keyof UserModelConnectionForm, value: string) {
    setErrorMessage("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveCustomModel() {
    setSaving(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/user-model-connections", {
        body: JSON.stringify({
          apiKey: form.apiKey,
          baseUrl: form.baseUrl,
          displayName: form.displayName,
          modelId: form.modelId,
          providerKey: "custom",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = asRecord(await response.json().catch(() => ({})));
      if (!response.ok) {
        throw new Error(asString(payload.error, "Could not add custom LLM"));
      }

      setForm(getDefaultUserModelConnectionForm("custom"));
      await loadConnections();
      await onSaved?.();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not add custom LLM");
    } finally {
      setSaving(false);
    }
  }

  async function removeCustomModel(connectionId: string) {
    if (!connectionId || deletingId) {
      return;
    }

    const connection = connections.find(
      (item) => asString(item.id) === connectionId,
    );
    const confirmed = window.confirm(
      `Remove ${asString(connection?.displayName, "this custom LLM")}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(connectionId);
    setErrorMessage("");
    try {
      const response = await fetch(
        `/api/user-model-connections?id=${encodeURIComponent(connectionId)}`,
        { method: "DELETE" },
      );
      const payload = asRecord(await response.json().catch(() => ({})));
      if (!response.ok) {
        throw new Error(asString(payload.error, "Could not remove custom LLM"));
      }

      await loadConnections();
      await onSaved?.();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not remove custom LLM");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Custom API LLMs</DialogTitle>
          <DialogDescription>
            Add OpenAI-compatible endpoints and choose them from the model picker.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="grid gap-4">
          <div className="rounded-xl border border-border/70">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-2">
              <p className="text-sm font-semibold">Your custom API LLMs</p>
              {loading ? <Spinner className="size-4 text-muted-foreground" /> : null}
            </div>
            <div className="grid max-h-48 gap-2 overflow-y-auto p-3">
              {connections.length > 0 ? (
                connections.map((connection) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/70 p-3"
                    key={asString(connection.id)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {asString(connection.displayName, "Custom API")}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {asString(connection.modelId)} · {asString(connection.baseUrl)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {asBoolean(connection.hasApiKey) ? (
                        <Badge variant="success">Saved key</Badge>
                      ) : (
                        <Badge variant="outline">No key</Badge>
                      )}
                      <Button
                        className="h-8 text-red-600 hover:text-red-600 dark:text-red-500 dark:hover:text-red-500"
                        disabled={Boolean(deletingId)}
                        loading={deletingId === asString(connection.id)}
                        onClick={() => void removeCustomModel(asString(connection.id))}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Icon icon={Delete02Icon} />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No custom API LLMs yet.
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border/70 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Add custom LLM</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use any OpenAI-compatible API with your own key.
                </p>
              </div>
              <Badge variant="outline">Custom API</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ModelConnectionField
                label="Display name"
                onChange={(value) => updateForm("displayName", value)}
                placeholder="My production LLM"
                value={form.displayName}
              />
              <ModelConnectionField
                label="Model ID"
                onChange={(value) => updateForm("modelId", value)}
                placeholder="gpt-5-mini"
                value={form.modelId}
              />
              <ModelConnectionField
                description="For OpenAI, keep this default. For another provider, paste its OpenAI-compatible API root, usually ending in /v1."
                label="Base URL"
                onChange={(value) => updateForm("baseUrl", value)}
                placeholder="https://api.openai.com/v1"
                value={form.baseUrl}
              />
              <ModelConnectionField
                label="API key"
                onChange={(value) => updateForm("apiKey", value)}
                placeholder="sk-..."
                type="password"
                value={form.apiKey}
              />
            </div>
            {errorMessage ? (
              <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-500">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Close
          </DialogClose>
          <Button
            loading={saving}
            onClick={() => void saveCustomModel()}
            type="button"
          >
            <Icon icon={PlusSignIcon} />
            Add custom LLM
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function ChatModelMark({
  className,
  model,
}: {
  className?: string;
  model: ChatModelOption;
}) {
  const logoClassName = cn("size-4 shrink-0", className);

  if (model.logoAsset) {
    return (
      <span className={cn("relative block overflow-hidden", logoClassName)}>
        <Image
          alt={`${model.name} logo`}
          className={cn("size-full object-contain", model.logoAsset.dark && "dark:hidden")}
          height={20}
          src={model.logoAsset.light}
          width={20}
        />
        {model.logoAsset.dark ? (
          <Image
            alt=""
            aria-hidden="true"
            className="hidden size-full object-contain dark:block"
            height={20}
            src={model.logoAsset.dark}
            width={20}
          />
        ) : null}
      </span>
    );
  }

  if (model.logo === "atmet") {
    return <AtmetLogo className={logoClassName} plain />;
  }

  if (model.logo === "openai") {
    return <Openai className={cn(logoClassName, "dark:invert")} />;
  }

  if (model.logo === "anthropic") {
    return <AnthropicBlack className={cn(logoClassName, "dark:invert")} />;
  }

  return <Icon className={logoClassName} icon={model.icon ?? AiChatIcon} />;
}

function ChatMessageBubble({
  editValue,
  isEditing = false,
  message,
  onApprovalDecision,
  onCancelEdit,
  onCopy,
  onEdit,
  onEditValueChange,
  onFeedback,
  onRegenerate,
  onSaveEdit,
  onTypingFrame,
  onTypingComplete,
}: {
  editValue?: string;
  isEditing?: boolean;
  message: ChatMessage;
  onApprovalDecision?: (
    message: ChatMessage,
    decision: "approved" | "auto_approved" | "rejected",
  ) => void;
  onCancelEdit?: () => void;
  onCopy?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onEditValueChange?: (value: string) => void;
  onFeedback?: (message: ChatMessage, feedback: "dislike" | "like") => void;
  onRegenerate?: (message: ChatMessage) => void;
  onSaveEdit?: (value: string) => void;
  onTypingFrame?: () => void;
  onTypingComplete?: (messageId: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="group flex justify-end px-1 sm:px-2 lg:px-3">
        <div
          className={cn(
            "grid justify-items-end gap-1",
            isEditing ? "max-w-full" : "max-w-full",
          )}
        >
          {message.attachments && message.attachments.length > 0 ? (
            <ChatAttachmentGrid
              attachments={message.attachments}
              align="end"
            />
          ) : null}
          <div
            className={cn(
              "rounded-xl bg-secondary px-3 py-2 text-sm leading-6 text-secondary-foreground",
              isEditing
                ? "min-w-[min(22rem,80vw)] max-w-[80%]"
                : "w-fit max-w-[80%]",
            )}
          >
            {isEditing ? (
              <InlineMessageEditor
                onCancel={onCancelEdit}
                onChange={onEditValueChange}
                onSave={onSaveEdit}
                value={editValue ?? message.content}
              />
            ) : (
              <UserMessageContent
                content={message.content}
                mentions={message.mentions ?? []}
              />
            )}
          </div>
          {isEditing ? null : (
            <MessageActionBar
              message={message}
              onCopy={onCopy}
              onEdit={onEdit}
              onFeedback={onFeedback}
              onRegenerate={onRegenerate}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex justify-start px-1 sm:px-2 lg:px-3">
      <div className="grid w-full max-w-full gap-3">
        {message.state === "thinking" ? (
          <AiThinkingState />
        ) : message.state === "typing" ? (
          <AiTypingTextResponse
            messageId={message.id}
            onFrame={onTypingFrame}
            onComplete={onTypingComplete}
            text={message.content}
          />
        ) : message.approval ? (
          <WorkflowApprovalCard
            approval={message.approval}
            message={message}
            onDecision={onApprovalDecision}
          />
        ) : (
          <AiTextResponse text={message.content} />
        )}
        {message.state === "complete" ? (
          <MessageActionBar
            message={message}
            onCopy={onCopy}
            onFeedback={onFeedback}
            onRegenerate={onRegenerate}
          />
        ) : null}
      </div>
    </div>
  );
}

function WorkflowApprovalCard({
  approval,
  message,
  onDecision,
}: {
  approval: ChatApprovalRequest;
  message: ChatMessage;
  onDecision?: (
    message: ChatMessage,
    decision: "approved" | "auto_approved" | "rejected",
  ) => void;
}) {
  const pending = approval.status === "pending";
  const statusLabel =
    approval.status === "auto_approved"
      ? "Auto approved"
      : approval.status === "approved"
        ? "Approved"
        : approval.status === "rejected"
          ? "Rejected"
          : "Waiting for approval";

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border border-black/8 bg-background text-sm shadow-xs/5 dark:border-white/8">
      <div className="flex items-start gap-3 border-b border-border/70 px-3 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/12 text-amber-600 dark:text-amber-300">
          <Icon className="size-4.5" icon={ShieldCheck} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">Approval checkpoint</p>
            <Badge
              variant={approval.status === "rejected" ? "destructive" : pending ? "warning" : "success"}
            >
              {statusLabel}
            </Badge>
          </div>
          <p className="mt-1 text-pretty text-xs leading-5 text-muted-foreground">
            {message.content}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div className="flex flex-wrap gap-1.5">
          {approval.appKeys.map((appKey) => (
            <span
              className="inline-flex h-7 items-center gap-1.5 rounded-md bg-muted px-2 text-xs font-medium text-muted-foreground"
              key={appKey}
            >
              <AgentAppLogo className="size-4 rounded-sm text-[0.5rem]" logo={appKey} />
              {formatStatusLabel(appKey)}
            </span>
          ))}
        </div>
        {pending ? (
          <div className="flex flex-wrap justify-end gap-1">
            <Button
              onClick={() => onDecision?.(message, "rejected")}
              size="sm"
              type="button"
              variant="ghost"
            >
              Reject
            </Button>
            <Button
              onClick={() => onDecision?.(message, "auto_approved")}
              size="sm"
              type="button"
              variant="outline"
            >
              Auto approve
            </Button>
            <Button
              onClick={() => onDecision?.(message, "approved")}
              size="sm"
              type="button"
            >
              Approve
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InlineMessageEditor({
  onCancel,
  onChange,
  onSave,
  value,
}: {
  onCancel?: () => void;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  value: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const syncTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.focus();
    textarea.selectionStart = textarea.value.length;
    textarea.selectionEnd = textarea.value.length;
    syncTextareaHeight();
  }, [syncTextareaHeight]);

  useEffect(() => {
    syncTextareaHeight();
  }, [syncTextareaHeight, value]);

  return (
    <div className="w-full min-w-0">
      <textarea
        aria-label="Edit message"
        className="block max-h-60 min-h-[1.5rem] w-full min-w-0 resize-none border-0 bg-transparent p-0 text-sm leading-6 text-secondary-foreground outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0"
        onChange={(event) => {
          onChange?.(event.target.value);
          syncTextareaHeight();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel?.();
          }

          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            onSave?.(value);
          }
        }}
        ref={textareaRef}
        value={value}
      />
      <div className="mt-2 flex justify-end gap-1">
        <button
          className="inline-flex h-7 items-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-[color,scale] hover:text-foreground active:scale-[0.96]"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="inline-flex h-7 items-center rounded-md bg-foreground px-2.5 text-xs font-medium text-background transition-[opacity,scale] hover:opacity-90 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40"
          disabled={!value.trim()}
          onClick={() => onSave?.(value)}
          type="button"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ChatAttachmentGrid({
  align = "start",
  attachments,
  onRemove,
}: {
  align?: "end" | "start";
  attachments: readonly ChatMessageAttachment[];
  onRemove?: (attachment: ChatMessageAttachment) => void;
}) {
  return (
    <div
      className={cn(
        "flex max-w-[min(36rem,100%)] flex-wrap items-start gap-2",
        align === "end" ? "justify-end" : "justify-start",
      )}
    >
      {attachments.map((attachment) => (
        <ChatAttachmentPreview
          attachment={attachment}
          key={`${attachment.name}-${attachment.size}-${attachment.type}`}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function ChatAttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment: ChatMessageAttachment;
  onRemove?: (attachment: ChatMessageAttachment) => void;
}) {
  const previewSrc = getAttachmentPreviewSrc(attachment);
  const typeLabel =
    attachment.kind === "image"
      ? "Image"
      : attachment.kind === "text"
        ? "Text"
        : attachment.kind === "document"
          ? "Document"
          : "File";

  if (previewSrc) {
    return (
      <figure className="group/attachment relative overflow-hidden rounded-lg border border-border bg-muted/30 shadow-xs/5">
        <img
          alt={attachment.name}
          className="h-28 w-40 object-cover"
          src={previewSrc}
        />
        <figcaption className="absolute inset-x-0 bottom-0 bg-background/88 px-2 py-1 backdrop-blur-md">
          <span className="block truncate text-[0.6875rem] font-medium">
            {attachment.name}
          </span>
          <span className="block text-[0.625rem] text-muted-foreground">
            {formatFileSize(attachment.size)}
          </span>
        </figcaption>
        {onRemove ? (
          <button
            aria-label={`Remove ${attachment.name}`}
            className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md bg-background/90 text-muted-foreground opacity-0 shadow-xs/5 transition-opacity hover:text-foreground group-hover/attachment:opacity-100"
            onClick={() => onRemove(attachment)}
            type="button"
          >
            <Icon className="size-3.5" icon={Delete02Icon} />
          </button>
        ) : null}
      </figure>
    );
  }

  return (
    <div className="group/attachment relative flex min-h-16 w-64 max-w-full items-center self-start rounded-lg border border-border bg-muted/30 p-2 shadow-xs/5">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-background text-muted-foreground">
        <Icon className="size-5" icon={File01Icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">{attachment.name}</span>
        <span className="mt-0.5 block truncate text-[0.6875rem] text-muted-foreground">
          {typeLabel} · {formatFileSize(attachment.size)}
        </span>
        {attachment.error ? (
          <span className="mt-0.5 block truncate text-[0.6875rem] text-destructive">
            Text extraction warning
          </span>
        ) : null}
      </span>
      {onRemove ? (
        <button
          aria-label={`Remove ${attachment.name}`}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-[background-color,color,opacity] hover:bg-background hover:text-foreground group-hover/attachment:opacity-100"
          onClick={() => onRemove(attachment)}
          type="button"
        >
          <Icon className="size-3.5" icon={Delete02Icon} />
        </button>
      ) : null}
    </div>
  );
}

function MessageActionBar({
  message,
  onCopy,
  onEdit,
  onFeedback,
  onRegenerate,
}: {
  message: ChatMessage;
  onCopy?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onFeedback?: (message: ChatMessage, feedback: "dislike" | "like") => void;
  onRegenerate?: (message: ChatMessage) => void;
}) {
  return (
    <div className="flex min-h-8 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      {message.role === "user" ? (
        <button
          aria-label="Edit message"
          className="grid size-8 place-items-center rounded-md text-muted-foreground transition-[background-color,color,scale] hover:bg-muted hover:text-foreground active:scale-[0.96]"
          onClick={() => onEdit?.(message)}
          type="button"
        >
          <Icon className="size-4" icon={PencilEdit02Icon} />
        </button>
      ) : null}
      <button
        aria-label="Regenerate"
        className="grid size-8 place-items-center rounded-md text-muted-foreground transition-[background-color,color,scale] hover:bg-muted hover:text-foreground active:scale-[0.96]"
        onClick={() => onRegenerate?.(message)}
        type="button"
      >
        <Icon className="size-4" icon={RefreshIcon} />
      </button>
      <button
        aria-label="Like"
        className={cn(
          "grid size-8 place-items-center rounded-md transition-[background-color,color,scale] active:scale-[0.96]",
          message.feedback === "like"
            ? "bg-success/15 text-success-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        onClick={() => onFeedback?.(message, "like")}
        type="button"
      >
        <Icon className="size-4" icon={ThumbsUpIcon} />
      </button>
      <button
        aria-label="Dislike"
        className={cn(
          "grid size-8 place-items-center rounded-md transition-[background-color,color,scale] active:scale-[0.96]",
          message.feedback === "dislike"
            ? "bg-destructive/15 text-destructive"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        onClick={() => onFeedback?.(message, "dislike")}
        type="button"
      >
        <Icon className="size-4" icon={ThumbsDownIcon} />
      </button>
      <button
        aria-label="Copy"
        className="grid size-8 place-items-center rounded-md text-muted-foreground transition-[background-color,color,scale] hover:bg-muted hover:text-foreground active:scale-[0.96]"
        onClick={() => onCopy?.(message)}
        type="button"
      >
        <Icon className="size-4" icon={Copy01Icon} />
      </button>
    </div>
  );
}

function AiTypingTextResponse({
  messageId,
  onComplete,
  onFrame,
  text,
}: {
  messageId: string;
  onComplete?: (messageId: string) => void;
  onFrame?: () => void;
  text: string;
}) {
  const [visibleLength, setVisibleLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onFrameRef.current = onFrame;
  }, [onComplete, onFrame]);

  useEffect(() => {
    setVisibleLength(0);
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      onCompleteRef.current?.(messageId);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleLength(text.length);
      setIsComplete(true);
      onCompleteRef.current?.(messageId);
      return;
    }

    const chunkSize = Math.max(4, Math.ceil(text.length / 90));
    const intervalId = window.setInterval(() => {
      setVisibleLength((current) => {
        const next = Math.min(text.length, current + chunkSize);
        if (next >= text.length) {
          window.clearInterval(intervalId);
          setIsComplete(true);
          onCompleteRef.current?.(messageId);
        }

        return next;
      });
      onFrameRef.current?.();
    }, 12);

    return () => window.clearInterval(intervalId);
  }, [messageId, text]);

  const visibleText = isComplete ? text : text.slice(0, visibleLength);

  return <AiTextResponse text={visibleText} />;
}

function UserMessageContent({
  content,
  mentions,
}: {
  content: string;
  mentions: ChatMessageMention[];
}) {
  const nodes: React.ReactNode[] = [content];

  mentions.forEach((mention, mentionIndex) => {
    const mentionName = mention.name.trim();
    if (!mentionName) {
      return;
    }

    const nextNodes: React.ReactNode[] = [];
    let replaced = false;

    nodes.forEach((node, nodeIndex) => {
      if (typeof node !== "string" || replaced) {
        nextNodes.push(node);
        return;
      }

      const match = findStandaloneMentionMatch(node, mentionName);
      if (!match) {
        nextNodes.push(node);
        return;
      }

      const before = node.slice(0, match.index);
      const after = node.slice(match.index + match.length);
      if (before) {
        nextNodes.push(before);
      }
      nextNodes.push(
        <ChatMentionBadge
          key={`${mention.kind}-${mention.key}-${mention.name}-${mentionIndex}-${nodeIndex}`}
          mention={mention}
        />,
      );
      if (after) {
        nextNodes.push(after);
      }
      replaced = true;
    });

    if (!replaced && mention.kind !== "apps") {
      nextNodes.unshift(
        <ChatMentionBadge
          key={`${mention.kind}-${mention.key}-${mention.name}-${mentionIndex}-prefix`}
          mention={mention}
        />,
        " ",
      );
    }

    nodes.splice(0, nodes.length, ...nextNodes);
  });

  return <div className="whitespace-pre-wrap break-words">{nodes}</div>;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findStandaloneMentionMatch(text: string, label: string) {
  const pattern = new RegExp(
    `(^|\\s)(${escapeRegExp(label)})(?=$|\\s|[,;:!?\\)\\]])`,
    "i",
  );
  const match = pattern.exec(text);

  if (!match || typeof match.index !== "number") {
    return null;
  }

  const prefixLength = match[1]?.length ?? 0;
  const mentionText = match[2] ?? label;

  return {
    index: match.index + prefixLength,
    length: mentionText.length,
  };
}

function ChatMentionBadge({ mention }: { mention: ChatMessageMention }) {
  const isApp = mention.kind === "apps";

  return (
    <span
      className={cn(
        "mx-0.5 inline-flex h-[1.65em] translate-y-[-0.04em] items-center gap-1.5 rounded-sm px-2 align-baseline text-[0.82em] font-medium leading-none",
        isApp
          ? "bg-[#ddf4ff] text-[#0969da] dark:bg-[#1f6feb]/24 dark:text-[#0969da]"
          : "bg-pink-500/16 text-pink-700 dark:text-pink-200",
      )}
    >
      <span
        className={cn(
          "grid size-[1.08em] shrink-0 place-items-center overflow-hidden rounded-sm",
          isApp
            ? "text-current [&_svg]:text-[initial]"
            : "text-pink-700 dark:text-pink-200",
        )}
      >
        {isApp ? (
          <ConnectorLogo
            className="size-full"
            connector={{
              key: mention.key,
              logo: mention.logo || getOptionInitials(mention.name),
              name: mention.name,
            }}
          />
        ) : (
          "/"
        )}
      </span>
      <span>{mention.name}</span>
    </span>
  );
}

function AiOutputDemo({ variant }: { variant: AiOutputVariant }) {
  switch (variant) {
    case "thinking":
      return <AiThinkingState />;
    case "reasoning":
      return <AiReasoningState />;
    case "web-search":
      return <AiWebSearchState />;
    case "file-diff":
      return <AiFileDiffState />;
    case "image-generation":
      return <AiImageGenerationState />;
    case "text-response":
      return (
        <AiTextResponse text="Here's a quick summary. The migration touches three modules and is safe to run incrementally." />
      );
    case "streaming-text":
      return <AiStreamingText />;
    case "inline-citations":
      return <AiInlineCitations />;
    case "code-block":
      return <AiCodeBlock />;
    case "todo-list":
      return <AiTodoList />;
    case "data-table":
      return <AiDataTable />;
    case "comparison-table":
      return <AiComparisonTable />;
  }
}

function AiThinkingState() {
  return (
    <div
      aria-label="Atmet is generating"
      className="grid w-fit place-items-center px-1 py-1"
    >
      <GradientSpin
        cellGap={1}
        cellRadius={1}
        cellSize={5}
        colorBy="row"
        dim={0.1}
        gradient={[
          { color: "#000000", position: 0 },
          { color: "#000000", position: 1 },
        ]}
        label="Atmet is thinking"
        pattern="arrow-up"
        period={600}
        rows={4}
        cols={4}
        className="dark:invert"
      />
    </div>
  );
}

function AiReasoningState() {
  return <AiThinkingState />;
}

function AiToolState() {
  return (
    <div className="w-fit rounded-lg border border-black/8 bg-background p-2.5 text-sm dark:border-white/8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5" icon={Search01Icon} />
        Checking connected context
      </div>
      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-1 rounded-full bg-info" />
          Workspace knowledge
        </div>
        <div className="flex items-center gap-2">
          <span className="size-1 rounded-full bg-info" />
          Selected apps and skills
        </div>
      </div>
    </div>
  );
}

function AiWebSearchState() {
  const results = [
    "JWT verification best practices",
    "Node.js authentication security guide",
    "JWT attacks - Web Security Academy",
  ];

  return (
    <div className="w-full max-w-full rounded-xl bg-background p-3 text-sm shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="flex items-center gap-2 font-medium">
        <Icon className="size-3.5 text-muted-foreground" icon={Search01Icon} />
        {"Searching \"JWT auth vulnerabilities\""}
      </div>
      <div className="mt-2 grid gap-1 border-l border-border pl-3 text-muted-foreground">
        {results.map((result) => (
          <div className="flex items-center gap-2" key={result}>
            <Icon className="size-3 text-success" icon={CheckIcon} />
            {result}
          </div>
        ))}
      </div>
    </div>
  );
}

function AiFileDiffState() {
  return (
    <div className="w-full max-w-full rounded-xl border border-black/8 bg-background text-sm dark:border-white/8">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Icon className="size-3.5 text-muted-foreground" icon={File01Icon} />
          src/auth.ts
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-success">+4</span>
          <span className="text-destructive">-1</span>
        </div>
      </div>
      <pre className="overflow-hidden p-3 text-xs leading-5">
        <code>
          <span className="text-muted-foreground">12 12  export function getToken() {"\n"}</span>
          <span className="bg-destructive/10 text-destructive">13 -   return localStorage.token;{"\n"}</span>
          <span className="bg-success/10 text-success">
            {"13 +   const t = cookies.get(\"session\");\n"}
          </span>
          <span className="bg-success/10 text-success">
            {"14 +   if (!t) throw new Error(\"no session\");\n"}
          </span>
          <span className="bg-success/10 text-success">15 +   return t;{"\n"}</span>
          <span className="text-muted-foreground">14 16  {"}"}</span>
        </code>
      </pre>
    </div>
  );
}

function AiImageGenerationState() {
  return (
    <div className="w-full max-w-full rounded-xl bg-background p-3 text-sm shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="mx-auto grid size-28 place-items-center rounded-lg border border-dashed border-border bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-[length:8px_8px] text-muted-foreground">
        <span className="rounded bg-background px-1.5 py-0.5 text-xs">
          1024 x 1024
        </span>
      </div>
      <div className="mt-3 font-medium">Generating image</div>
      <div className="text-muted-foreground">
        {"\"a calm mountain lake at dawn\""}
      </div>
    </div>
  );
}

function AiTextResponse({ text }: { text: string }) {
  const segments = parseAiTextSegments(text);
  const requestedExportKind = detectRequestedExportKind(text);

  return (
    <div className="grid max-w-[min(100%,52rem)] gap-3 text-sm leading-6 text-foreground">
      {segments.map((segment, index) => {
        if (segment.type === "code") {
          return (
            <AiCodeBlock
              code={segment.code}
              filename={
                segment.language ? `snippet.${segment.language}` : "snippet.txt"
              }
              key={`${segment.type}-${index}`}
            />
          );
        }

        if (segment.type === "task-list") {
          return (
            <AiTaskList
              items={segment.items}
              key={`${segment.type}-${index}`}
            />
          );
        }

        if (segment.type === "table") {
          return (
            <AiMarkdownTable
              exportKind={requestedExportKind}
              headers={segment.headers}
              key={`${segment.type}-${index}`}
              rows={segment.rows}
            />
          );
        }

        return (
          <AiMarkdownTextBlock
            key={`${segment.type}-${index}`}
            text={segment.text}
          />
        );
      })}
    </div>
  );
}

function parseAiTextSegments(text: string): AiTextSegment[] {
  const fallbackText = text.trim() || "Atmet returned an empty response.";
  const segments: AiTextSegment[] = [];
  const fencePattern = /```([a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)```/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  function pushTextSegments(value: string) {
    const parsedSegments = parseMarkdownTextSegments(value);
    segments.push(...parsedSegments);
  }

  while ((match = fencePattern.exec(fallbackText))) {
    const textBefore = fallbackText.slice(cursor, match.index).trim();
    if (textBefore) {
      pushTextSegments(textBefore);
    }

    segments.push({
      code: match[2].trimEnd(),
      language: match[1],
      type: "code",
    });
    cursor = match.index + match[0].length;
  }

  const textAfter = fallbackText.slice(cursor).trim();
  if (textAfter) {
    pushTextSegments(textAfter);
  }

  return segments.length ? segments : [{ text: fallbackText, type: "text" }];
}

function parseMarkdownTextSegments(text: string): AiTextSegment[] {
  const output: AiTextSegment[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const textBuffer: string[] = [];

  function flushText() {
    const value = textBuffer.join("\n").trim();
    if (value) {
      output.push({ text: value, type: "text" });
    }
    textBuffer.length = 0;
  }

  for (let index = 0; index < lines.length; ) {
    if (isMarkdownTaskListStart(lines[index] ?? "")) {
      flushText();
      const taskLines: string[] = [];

      while (index < lines.length && isMarkdownTaskListStart(lines[index] ?? "")) {
        taskLines.push(lines[index]);
        index += 1;
      }

      output.push({ items: parseMarkdownTaskList(taskLines), type: "task-list" });
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      flushText();
      const tableLines = [lines[index]];
      index += 1;

      if (isMarkdownTableSeparator(lines[index] ?? "")) {
        tableLines.push(lines[index]);
        index += 1;
      }

      while (index < lines.length && isMarkdownTableRow(lines[index] ?? "")) {
        tableLines.push(lines[index]);
        index += 1;
      }

      output.push(parseMarkdownTable(tableLines));
      continue;
    }

    textBuffer.push(lines[index]);
    index += 1;
  }

  flushText();
  return output;
}

function isMarkdownTaskListStart(line: string) {
  return /^\s*[-*]\s+\[[ xX]\]\s+/.test(line);
}

function parseMarkdownTaskList(lines: string[]): AiTaskListItem[] {
  return lines
    .map((line) => {
      const match = /^\s*[-*]\s+\[([ xX])\]\s+(.+)$/.exec(line.trim());

      return {
        checked: match?.[1]?.toLowerCase() === "x",
        text: match?.[2] ?? line.trim(),
      };
    })
    .filter((item) => item.text.trim().length > 0);
}

function isMarkdownTableStart(lines: string[], index: number) {
  const current = lines[index] ?? "";
  const next = lines[index + 1] ?? "";

  return Boolean(
    isMarkdownTableRow(current) &&
      (isMarkdownTableSeparator(next) || isMarkdownTableRow(next)),
  );
}

function isMarkdownTableRow(line: string) {
  return splitMarkdownTableRow(line).length > 1;
}

function isMarkdownTableSeparator(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitMarkdownTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseMarkdownTable(lines: string[]): AiTextSegment {
  const headers = splitMarkdownTableRow(lines[0] ?? "");
  const hasSeparator = isMarkdownTableSeparator(lines[1] ?? "");
  const rows = normalizeMarkdownTableRows(
    headers,
    lines.slice(hasSeparator ? 2 : 1).map(splitMarkdownTableRow),
  );

  return {
    headers: headers.length ? headers : ["Column"],
    rows,
    type: "table",
  };
}

function normalizeMarkdownTableRows(headers: string[], rows: string[][]) {
  const columnCount = Math.max(headers.length, 1);
  const normalizedRows: string[][] = [];

  rows.forEach((row) => {
    if (!row.some(Boolean)) {
      return;
    }

    if (row.length < columnCount && normalizedRows.length) {
      const previous = normalizedRows[normalizedRows.length - 1];
      previous[columnCount - 1] = [previous[columnCount - 1], row.join(" ")]
        .filter(Boolean)
        .join(" ");
      return;
    }

    normalizedRows.push(
      Array.from({ length: columnCount }, (_, index) => row[index] ?? ""),
    );
  });

  return normalizedRows;
}

function AiMarkdownTextBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const className = cn(
        "font-semibold tracking-normal text-foreground",
        level === 1 && "text-xl leading-7",
        level === 2 && "text-lg leading-7",
        level >= 3 && "text-base leading-6",
      );
      elements.push(
        <div className={className} key={`heading-${index}`}>
          {renderInlineMarkdown(heading[2])}
        </div>,
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      elements.push(
        <ul className="grid gap-1.5" key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li
              className="grid grid-cols-[0.875rem_1fr] gap-2"
              key={`${item}-${itemIndex}`}
            >
              <span className="mt-[0.62em] size-1.5 rounded-full bg-muted-foreground/45" />
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      elements.push(
        <ol className="grid gap-1.5 [counter-reset:item]" key={`ordered-${index}`}>
          {items.map((item, itemIndex) => (
            <li
              className="grid grid-cols-[1.5rem_1fr] gap-2 [counter-increment:item]"
              key={`${item}-${itemIndex}`}
            >
              <span className="mt-0.5 text-right text-xs tabular-nums text-muted-foreground before:content-[counter(item)'.']" />
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      elements.push(
        <blockquote
          className="border-l border-border pl-3 text-muted-foreground"
          key={`quote-${index}`}
        >
          {renderInlineMarkdown(quoteLines.join(" "))}
        </blockquote>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const paragraphLine = lines[index].trim();
      if (
        !paragraphLine ||
        /^(#{1,4})\s+/.test(paragraphLine) ||
        /^[-*]\s+/.test(paragraphLine) ||
        /^\d+\.\s+/.test(paragraphLine) ||
        /^>\s?/.test(paragraphLine)
      ) {
        break;
      }
      paragraphLines.push(paragraphLine);
      index += 1;
    }

    elements.push(
      <AiParagraphBlock
        key={`paragraph-${index}`}
        text={paragraphLines.join(" ")}
      />,
    );
  }

  return <div className="grid gap-3">{elements}</div>;
}

function AiParagraphBlock({ text }: { text: string }) {
  const actionLink = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+|#[^)\s]+)\)\.?$/.exec(
    text.trim(),
  );

  if (actionLink) {
    return (
      <AiActionLinkCard
        href={actionLink[2]}
        label={actionLink[1]}
      />
    );
  }

  return (
    <p className="whitespace-pre-wrap">
      {renderInlineMarkdown(text)}
    </p>
  );
}

function getArtifactKind(label: string, hrefOrFilename = "") {
  const value = `${label} ${hrefOrFilename}`.toLowerCase();

  if (value.includes("google sheet") || value.includes("sheets.google")) {
    return "google-sheets";
  }

  if (value.includes("google doc") || value.includes("docs.google")) {
    return "google-docs";
  }

  if (value.includes("pdf") || value.endsWith(".pdf")) {
    return "pdf";
  }

  if (value.includes("excel") || /\.xlsx?$/.test(value)) {
    return "excel";
  }

  if (value.includes("word") || /\.docx?$/.test(value)) {
    return "word";
  }

  if (value.includes("csv") || value.endsWith(".csv")) {
    return "csv";
  }

  if (value.includes("markdown") || value.endsWith(".md")) {
    return "markdown";
  }

  return "file";
}

function ArtifactIconTile({
  className,
  filename,
  label,
}: {
  className?: string;
  filename?: string;
  label: string;
}) {
  const kind = getArtifactKind(label, filename);
  const compact = className?.includes("size-");
  const iconClassName = compact ? "size-3.5" : "size-6";

  if (kind === "google-sheets") {
    return (
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl border border-black/8 bg-white p-2 shadow-xs/5 dark:border-white/10",
          className,
        )}
      >
        <ConnectorLogo
          connector={{ key: "google-sheets", logo: "GS", name: "Google Sheets" }}
        />
      </span>
    );
  }

  const colors: Record<string, string> = {
    csv: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    excel: "bg-green-500/12 text-green-600 dark:text-green-400",
    file: "bg-muted text-muted-foreground",
    markdown: "bg-zinc-500/12 text-zinc-700 dark:text-zinc-200",
    pdf: "bg-red-500/12 text-red-600 dark:text-red-400",
    word: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
  };

  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl border border-black/8 shadow-xs/5 dark:border-white/10",
        colors[kind] ?? colors.file,
        className,
      )}
    >
      <FileKindLogo className={iconClassName} kind={kind} />
    </span>
  );
}

function FileKindLogo({
  className,
  kind,
}: {
  className?: string;
  kind: string;
}) {
  if (kind === "pdf") {
    return <PdfFileLogo className={className} />;
  }

  if (kind === "csv") {
    return <CsvFileLogo className={className} />;
  }

  if (kind === "excel") {
    return <ExcelFileLogo className={className} />;
  }

  if (kind === "word") {
    return <WordFileLogo className={className} />;
  }

  if (kind === "markdown") {
    return <MarkdownFileLogo className={className} />;
  }

  return <Icon className={className} icon={File01Icon} />;
}

function PdfFileLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" {...props}>
      <path
        d="M8 3.5h11.5L25 9v19.5H8z"
        fill="#ef4444"
        opacity="0.16"
      />
      <path
        d="M8 3.5h11.5L25 9v19.5H8z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M19.5 3.5V9H25" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M10.5 20.5c5.7-1.7 8.3-5.4 7.5-8.1-.4-1.3-1.9-.8-1.8.8.2 2.8 2.5 5.5 5.4 6.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M10.5 24h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function CsvFileLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" {...props}>
      <path d="M7 4h18v24H7z" fill="#10b981" opacity="0.16" />
      <path d="M7 4h18v24H7z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M11 11h10M11 16h10M11 21h10M15.5 8v17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M10.2 26h11.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function ExcelFileLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" {...props}>
      <path d="M10 5h15v22H10z" fill="#22c55e" opacity="0.16" />
      <path d="M10 5h15v22H10z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M6 9.5h10v13H6z" fill="currentColor" opacity="0.9" />
      <path d="M8.8 13l4.4 6M13.2 13l-4.4 6" stroke="var(--background)" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M18.5 11h3.5M18.5 15h3.5M18.5 19h3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
    </svg>
  );
}

function WordFileLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" {...props}>
      <path d="M10 5h15v22H10z" fill="#3b82f6" opacity="0.16" />
      <path d="M10 5h15v22H10z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M6 9.5h10v13H6z" fill="currentColor" opacity="0.9" />
      <path d="M8.4 13l1.2 6 1.4-4.2 1.4 4.2 1.2-6" stroke="var(--background)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M18.5 11h3.5M18.5 15h3.5M18.5 19h3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
    </svg>
  );
}

function MarkdownFileLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" {...props}>
      <path d="M5.5 8h21v16h-21z" fill="currentColor" opacity="0.12" />
      <path d="M5.5 8h21v16h-21z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M9 20v-8l3 4 3-4v8M20 12v7M17.5 16.5 20 19l2.5-2.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
    </svg>
  );
}

function AiActionLinkCard({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const kind = getArtifactKind(label, href);
  const subtitle =
    kind === "google-sheets"
      ? "Google Sheets document"
      : kind === "google-docs"
        ? "Google Docs document"
        : "Generated artifact";

  return (
    <a
      className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-black/8 bg-background p-3 text-foreground shadow-xs/5 transition-[background-color,border-color,scale] hover:border-foreground/15 hover:bg-muted/35 active:scale-[0.99] dark:border-white/8"
      href={href}
      rel="noreferrer"
      target={href.startsWith("http") ? "_blank" : undefined}
    >
      <ArtifactIconTile label={label} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{label}</span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-foreground px-2.5 text-xs font-medium text-background">
        Open
        <Icon className="size-3.5" icon={ArrowRight01Icon} />
      </span>
    </a>
  );
}

function renderInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  const pattern =
    /(\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]+|#[^)\s]+)\)|`[^`]+?`|\*\*[^*]+?\*\*|\[\d{1,3}\])/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    if (token.startsWith("[") && token.includes("](")) {
      const labelEnd = token.indexOf("](");
      const label = token.slice(1, labelEnd);
      const href = token.slice(labelEnd + 2, -1);
      parts.push(
        <a
          className="underline underline-offset-4"
          href={href}
          key={`${token}-${match.index}`}
          rel="noreferrer"
          target={href.startsWith("http") ? "_blank" : undefined}
        >
          {label}
        </a>,
      );
    } else if (/^\[\d{1,3}\]$/.test(token)) {
      parts.push(
        <sup
          className="mx-0.5 inline-flex size-4 items-center justify-center rounded-full bg-secondary text-[0.65rem] font-medium leading-none text-muted-foreground align-super"
          key={`${token}-${match.index}`}
        >
          {token.slice(1, -1)}
        </sup>,
      );
    } else if (token.startsWith("**")) {
      parts.push(
        <strong className="font-semibold" key={`${token}-${match.index}`}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.92em]"
          key={`${token}-${match.index}`}
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts.length ? parts : text;
}

function AiMarkdownTable({
  exportKind,
  headers,
  rows,
}: {
  exportKind?: TableExportKind;
  headers: string[];
  rows: string[][];
}) {
  const table = normalizeAiTableData(headers, rows);
  const comparison =
    table.headers.length > 2 &&
    /^(feature|capability|item|plan|tier|resource)$/i.test(
      table.headers[0] ?? "",
    );

  return (
    <AiGeneratedTable
      headers={table.headers}
      rows={table.rows}
      exportKind={exportKind}
      variant={comparison ? "comparison" : "data"}
    />
  );
}

type TableExportKind = "csv" | "excel" | "markdown" | "pdf" | "word";

function detectRequestedExportKind(text: string): TableExportKind | undefined {
  const normalizedText = text.toLowerCase();

  if (/\bpdf\b|\.pdf\b/.test(normalizedText)) {
    return "pdf";
  }

  if (/\bcsv\b|\.csv\b/.test(normalizedText)) {
    return "csv";
  }

  if (/\bexcel\b|\bxlsx?\b|\.xlsx?\b/.test(normalizedText)) {
    return "excel";
  }

  if (/\bword\b|\bdocx?\b|\.docx?\b/.test(normalizedText)) {
    return "word";
  }

  if (/\bmarkdown\b|\bmd\b|\.md\b/.test(normalizedText)) {
    return "markdown";
  }

  return undefined;
}

function normalizeAiTableData(headers: string[], rows: string[][]) {
  const columnCount = Math.max(
    1,
    headers.length,
    ...rows.map((row) => row.length),
  );
  const normalizedHeaders = Array.from(
    { length: columnCount },
    (_, index) => headers[index] || `Column ${index + 1}`,
  );

  return {
    headers: normalizedHeaders,
    rows: rows.map((row) =>
      normalizedHeaders.map((_, index) => row[index] ?? ""),
    ),
  };
}

function AiGeneratedTable({
  exportKind = "pdf",
  headers,
  rows,
  variant = "data",
}: {
  exportKind?: TableExportKind;
  headers: string[];
  rows: string[][];
  variant?: "comparison" | "data";
}) {
  const exportAction = getTableExportAction(exportKind, headers, rows);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-black/8 bg-background text-sm text-foreground dark:border-white/8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <ArtifactIconTile
            filename={exportAction.filename}
            label={exportAction.filename}
          />
          <div className="min-w-0">
            <p className="truncate font-mono text-xs font-semibold">
              {exportAction.filename}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Table preview
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <button
            className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-[background-color,color,scale] hover:bg-muted hover:text-foreground active:scale-[0.96]"
            onClick={exportAction.onClick}
            type="button"
          >
            <ArtifactIconTile
              className="size-5 rounded-md border-0 shadow-none"
              filename={exportAction.filename}
              label={exportAction.label}
            />
            <span>{exportAction.label}</span>
            <Icon className="size-3.5" icon={Download01Icon} />
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-max border-separate border-spacing-0">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  className={cn(
                    "h-9 whitespace-nowrap border-b border-r border-border/55 bg-muted/25 px-3 text-left align-middle text-xs font-medium text-muted-foreground last:border-r-0",
                    variant === "comparison" && index > 0 && "text-center",
                  )}
                  key={`${header}-${index}`}
                >
                  {renderInlineMarkdown(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((_, cellIndex) => (
                  <td
                    className={cn(
                      "h-10 min-w-28 border-b border-r border-border/45 px-3 align-middle last:border-r-0",
                      rowIndex === rows.length - 1 && "border-b-0",
                      variant === "comparison" &&
                        cellIndex > 0 &&
                        "text-center",
                      cellIndex === 0 && "max-w-60 font-medium",
                    )}
                    key={`${rowIndex}-${cellIndex}`}
                  >
                    {renderAiTableValue(
                      row[cellIndex] ?? "",
                      variant === "comparison" && cellIndex > 0,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderAiTableValue(value: string, symbolic = false) {
  const normalizedValue = value.trim();
  const positive = /^(check|checked|yes|true|done|included|✓|✅)$/i.test(
    normalizedValue,
  );
  const negative = /^(-|—|no|false|none|n\/a|x|✕|❌)$/i.test(normalizedValue);

  if (symbolic && positive) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-success/10 text-success">
        <Icon className="size-3.5" icon={CheckIcon} />
      </span>
    );
  }

  if (symbolic && negative) {
    return <span className="text-muted-foreground">—</span>;
  }

  return renderInlineMarkdown(value);
}

function AiStreamingText({
  text = "Generating your release notes for v2.4 - summarizing the 28 merged pull requests",
}: {
  text?: string;
} = {}) {
  return (
    <div className="max-w-prose text-sm leading-6 text-foreground">
      {text}
      <span className="ml-0.5 inline-block h-4 w-1 translate-y-0.5 animate-caret-blink bg-foreground" />
    </div>
  );
}

function AiInlineCitations() {
  return (
    <div className="max-w-prose text-sm leading-6 text-foreground">
      <p>
        Transformers scale well with data and compute
        <sup className="mx-0.5 text-muted-foreground">1</sup>, though attention
        is quadratic in sequence length
        <sup className="mx-0.5 text-muted-foreground">2</sup>.
      </p>
      <div className="mt-3 grid gap-1 border-t border-border pt-2 text-muted-foreground">
        <div>1 Attention Is All You Need - arxiv.org</div>
        <div>2 Efficient Transformers: A Survey - arxiv.org</div>
      </div>
    </div>
  );
}

function AiCodeBlock({
  code,
  filename = "utils.ts",
}: {
  code?: string;
  filename?: string;
} = {}) {
  const fallbackCode =
    "export const sum = (a: number, b: number) =>\n  a + b;\n\nexport const clamp = (n: number, min: number, max: number) =>\n  Math.min(Math.max(n, min), max);";
  const content = code?.trimEnd() || fallbackCode;
  const lines = content.split("\n");
  const language = getCodeLanguage(filename);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-black/8 bg-background text-sm dark:border-white/8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <ArtifactIconTile filename={filename} label={filename} />
          <div className="min-w-0">
            <p className="truncate font-mono text-xs font-semibold">{filename}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Generated file preview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground"
            onClick={() => {
              navigator.clipboard?.writeText(content).catch(() => undefined);
            }}
            type="button"
          >
            <Icon className="size-3.5" icon={Copy01Icon} />
            Copy
          </button>
          <button
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground"
            onClick={() => downloadTextFile(filename, content)}
            type="button"
          >
            <Icon className="size-3.5" icon={Download01Icon} />
            Download
          </button>
        </div>
      </div>
      <pre className="max-w-full overflow-x-auto p-3 text-xs leading-5 text-foreground">
        <code className="font-mono">
          {lines.map((line, index) => (
            <span className="block" key={`${index}-${line}`}>
              <span className="mr-3 inline-block w-6 select-none text-right tabular-nums text-muted-foreground/70">
                {index + 1}
              </span>
              <span>{renderHighlightedCodeLine(line, language, index)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function getCodeLanguage(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  const aliases: Record<string, string> = {
    bash: "shell",
    cjs: "javascript",
    css: "css",
    html: "html",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    mjs: "javascript",
    py: "python",
    python: "python",
    sh: "shell",
    sql: "sql",
    ts: "typescript",
    tsx: "typescript",
    xml: "html",
    yaml: "yaml",
    yml: "yaml",
  };

  return aliases[extension] ?? extension;
}

function renderHighlightedCodeLine(
  line: string,
  language: string,
  lineIndex: number,
) {
  const parts = splitCodeLine(line, language);

  return parts.map((part, index) => {
    if (part.kind === "plain") {
      return renderHighlightedPlainCode(part.text, language, `${lineIndex}-${index}`);
    }

    return (
      <span
        className={cn(
          part.kind === "comment" && "text-muted-foreground/75 italic",
          part.kind === "string" && "text-emerald-600 dark:text-emerald-400",
        )}
        key={`${lineIndex}-${index}-${part.kind}`}
      >
        {part.text}
      </span>
    );
  });
}

function splitCodeLine(line: string, language: string) {
  const parts: { kind: "comment" | "plain" | "string"; text: string }[] = [];
  const commentMarkers = getCodeCommentMarkers(language);
  let cursor = 0;

  const pushPlain = (text: string) => {
    if (text) {
      parts.push({ kind: "plain", text });
    }
  };

  while (cursor < line.length) {
    const marker = commentMarkers.find((candidate) =>
      line.startsWith(candidate, cursor),
    );

    if (marker) {
      parts.push({ kind: "comment", text: line.slice(cursor) });
      break;
    }

    const char = line[cursor];
    if (char === '"' || char === "'" || char === "`") {
      let end = cursor + 1;
      while (end < line.length) {
        if (line[end] === "\\" && end + 1 < line.length) {
          end += 2;
          continue;
        }

        if (line[end] === char) {
          end += 1;
          break;
        }

        end += 1;
      }

      parts.push({ kind: "string", text: line.slice(cursor, end) });
      cursor = end;
      continue;
    }

    const nextSpecialIndexes = [
      ...commentMarkers
        .map((candidate) => line.indexOf(candidate, cursor + 1))
        .filter((index) => index >= 0),
      ...['"', "'", "`"]
        .map((candidate) => line.indexOf(candidate, cursor + 1))
        .filter((index) => index >= 0),
    ];
    const nextSpecial =
      nextSpecialIndexes.length > 0 ? Math.min(...nextSpecialIndexes) : line.length;

    pushPlain(line.slice(cursor, nextSpecial));
    cursor = nextSpecial;
  }

  return parts.length ? parts : [{ kind: "plain" as const, text: line }];
}

function getCodeCommentMarkers(language: string) {
  if (["python", "shell", "yaml"].includes(language)) {
    return ["#"];
  }

  if (["sql"].includes(language)) {
    return ["--"];
  }

  return ["//"];
}

function renderHighlightedPlainCode(
  text: string,
  language: string,
  keyPrefix: string,
) {
  const keywordSet = getCodeKeywords(language);
  const tokens: React.ReactNode[] = [];
  const tokenPattern =
    /([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|(\b\d+(?:\.\d+)?\b)|([{}()[\].,;:+\-*/%=<>!|&]+)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text))) {
    if (match.index > cursor) {
      tokens.push(text.slice(cursor, match.index));
    }

    const [token, functionName, identifier, number, operator] = match;
    const className = cn(
      functionName && !keywordSet.has(functionName)
        ? "text-cyan-600 dark:text-cyan-300"
        : undefined,
      identifier && keywordSet.has(identifier)
        ? "text-blue-600 dark:text-blue-300"
        : undefined,
      identifier && /^(true|false|null|none|undefined)$/i.test(identifier)
        ? "text-purple-600 dark:text-purple-300"
        : undefined,
      number && "text-purple-600 dark:text-purple-300",
      operator && "text-muted-foreground",
    );

    tokens.push(
      className ? (
        <span className={className} key={`${keyPrefix}-${match.index}`}>
          {token}
        </span>
      ) : (
        token
      ),
    );
    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    tokens.push(text.slice(cursor));
  }

  return tokens.length ? tokens : text;
}

function getCodeKeywords(language: string) {
  const common = [
    "as",
    "async",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "def",
    "delete",
    "do",
    "else",
    "except",
    "export",
    "extends",
    "finally",
    "for",
    "from",
    "function",
    "if",
    "import",
    "in",
    "interface",
    "let",
    "new",
    "return",
    "switch",
    "throw",
    "try",
    "type",
    "var",
    "while",
    "with",
    "yield",
  ];
  const byLanguage: Record<string, string[]> = {
    python: ["and", "elif", "false", "is", "lambda", "none", "not", "or", "pass", "true"],
    sql: ["and", "by", "create", "delete", "from", "group", "insert", "join", "limit", "order", "select", "table", "update", "values", "where"],
  };

  return new Set([...(byLanguage[language] ?? []), ...common]);
}

function AiTaskList({ items }: { items: AiTaskListItem[] }) {
  const completedCount = items.filter((item) => item.checked).length;
  return (
    <div className="w-fit min-w-72 max-w-full rounded-xl bg-background p-3 text-sm shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <Icon className="size-3.5 text-success" icon={CheckIcon} />
          To-dos
        </div>
        <span className="tabular-nums text-muted-foreground">
          {completedCount}/{items.length}
        </span>
      </div>
      <div className="grid gap-1.5">
        {items.map((item, index) => (
          <div
            className={cn(
              "flex items-center gap-2",
              item.checked ? "text-muted-foreground" : "text-foreground",
            )}
            key={`${item.text}-${index}`}
          >
            <span
              className={cn(
                "grid size-3.5 place-items-center rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.18)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.18)]",
                item.checked && "bg-success text-success-foreground shadow-none",
              )}
            >
              {item.checked && <Icon className="size-2.5" icon={CheckIcon} />}
            </span>
            <span className={cn(item.checked && "line-through")}>
              {renderInlineMarkdown(item.text)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiTodoList() {
  const todos = [
    "Scaffold the project structure",
    "Build the component registry",
    "Implement entitlement gating",
    "Wire up Stripe checkout",
    "Polish the landing page",
  ];

  return (
    <AiTaskList
      items={todos.map((todo) => ({
        checked: true,
        text: todo,
      }))}
    />
  );
}

function AiDataTable() {
  const rows = [
    ["gpt-4o", "128k", "$5.00"],
    ["claude-3.5", "200k", "$3.00"],
    ["llama-3.1", "128k", "$0.90"],
  ];

  return <AiGeneratedTable headers={["Model", "Context", "$/1M in"]} rows={rows} />;
}

function AiComparisonTable() {
  const rows = [
    ["Unlimited projects", "check", "check"],
    ["All components", "check", "check"],
    ["Team-wide usage", "-", "check"],
    ["Priority support", "-", "check"],
  ];

  return (
    <AiGeneratedTable
      headers={["Feature", "Personal", "Enterprise"]}
      rows={rows}
      variant="comparison"
    />
  );
}

function AtmetLogo({
  className,
  plain = false,
}: {
  className?: string;
  plain?: boolean;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden",
        !plain && "rounded-md bg-background",
        className,
      )}
    >
      <Image
        alt="Atmet"
        className={cn("size-full dark:hidden", !plain && "p-1")}
        height={24}
        src="/Atmet Logos/Atmet Light mode.svg"
        width={24}
      />
      <Image
        alt="Atmet"
        className={cn("hidden size-full dark:block", !plain && "p-1")}
        height={24}
        src="/Atmet Logos/Atmet Dark mode.svg"
        width={24}
      />
    </span>
  );
}

function getComposerAppLogoSvg(key?: string) {
  const connector = key ? getConnectorCatalogEntry(key) : null;
  const src = connector?.logo;

  return src?.startsWith("http")
    ? `<img alt="" aria-hidden="true" src="${src}" />`
    : "";
}

function createComposerBadge(option: ComposerOption) {
  const badge = document.createElement("span");
  const isApp = option.kind === "apps";
  badge.className = isApp
    ? "mx-0.5 inline-flex h-[1.65em] translate-y-[-0.04em] items-center gap-1.5 rounded-sm bg-[#ddf4ff] px-2 align-baseline text-[0.82em] font-medium leading-none text-[#0969da] dark:bg-[#1f6feb]/24 dark:text-[#0969da]"
    : "mx-0.5 inline-flex h-[1.65em] translate-y-[-0.04em] items-center gap-1.5 rounded-sm bg-pink-500/16 px-2 align-baseline text-[0.82em] font-medium leading-none text-pink-700 dark:text-pink-200";
  badge.contentEditable = "false";
  badge.dataset.composerToken = "true";
  badge.dataset.composerLabel = option.name;
  badge.dataset.composerKind = option.kind;
  if (option.logo) {
    badge.dataset.composerLogo = option.logo;
  }
  if (isApp && option.connectorKey) {
    badge.dataset.composerAppKey = option.connectorKey;
  }

  const icon = document.createElement("span");
  icon.className = isApp
    ? "grid size-[1.08em] shrink-0 place-items-center overflow-hidden rounded-sm"
    : "grid size-[1.08em] shrink-0 place-items-center rounded-sm text-pink-700 dark:text-pink-200";
  const appLogoSvg = isApp ? getComposerAppLogoSvg(option.connectorKey) : "";
  if (appLogoSvg) {
    icon.innerHTML = appLogoSvg;
    icon.firstElementChild?.classList.add("size-full");
  } else {
    icon.textContent = isApp
      ? option.logo ?? getOptionInitials(option.name)
      : "/";
  }

  const label = document.createElement("span");
  label.textContent = option.name;

  badge.append(icon, label);
  return badge;
}

function getComposerPlainText(root: HTMLElement) {
  let text = "";

  function visit(node: Node) {
    if (isComposerBadgeNode(node)) {
      text += ` ${node.dataset.composerLabel ?? node.textContent ?? ""} `;
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? "";
      return;
    }

    if (node instanceof HTMLBRElement) {
      text += "\n";
      return;
    }

    node.childNodes.forEach(visit);
  }

  root.childNodes.forEach(visit);

  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function getSelectedComposerAppKeys(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>('[data-composer-kind="apps"]'),
  )
    .map((node) => node.dataset.composerAppKey ?? "")
    .filter(Boolean);
}

function getSelectedComposerMentions(root: HTMLElement): ChatMessageMention[] {
  const mentions = Array.from(
    root.querySelectorAll<HTMLElement>("[data-composer-token='true']"),
  )
    .map((node): ChatMessageMention | null => {
      const kind = node.dataset.composerKind;
      const name = node.dataset.composerLabel ?? "";

      if (!name || (kind !== "apps" && kind !== "skills")) {
        return null;
      }

      return {
        key: node.dataset.composerAppKey ?? "",
        kind,
        logo: node.dataset.composerLogo ?? "",
        name,
      };
    })
    .filter((mention): mention is ChatMessageMention => Boolean(mention));

  return mentions;
}

function getOptionInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getTextRange(root: HTMLElement, startOffset: number, endOffset: number) {
  const range = document.createRange();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;
  let node = walker.nextNode();

  while (node) {
    const textLength = node.textContent?.length ?? 0;
    const nextOffset = currentOffset + textLength;

    if (currentOffset <= startOffset && startOffset <= nextOffset) {
      range.setStart(node, startOffset - currentOffset);
    }

    if (currentOffset <= endOffset && endOffset <= nextOffset) {
      range.setEnd(node, endOffset - currentOffset);
      return range;
    }

    currentOffset = nextOffset;
    node = walker.nextNode();
  }

  range.selectNodeContents(root);
  range.collapse(false);
  return range;
}

function insertComposerBadge(option: ComposerOption) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const badge = createComposerBadge(option);
  const spacer = document.createTextNode("\u00a0");

  range.insertNode(badge);
  range.setStartAfter(badge);
  range.collapse(true);
  range.insertNode(spacer);
  range.setStartAfter(spacer);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);
}

function isComposerBadgeNode(node: Node | null): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    node.dataset.composerToken === "true"
  );
}

function placeCaretAtEnd(element: HTMLElement | null) {
  if (!element) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

type AgentFilter = "all" | "paused" | "running";

function AgentsPage({
  agents,
  composerOptions,
  onAgentRuntimeChange,
  onAgentScheduleChange,
  onCreateAgent,
  onCreateWorkflowChatNode,
  onDeleteWorkflowChatNode,
  onPlaygroundChange,
  onSelectAgentName,
  selectedAgentName,
  workspaceId,
  workflowChatNodesByAgent,
}: {
  agents: Agent[];
  composerOptions: ComposerOption[];
  onAgentRuntimeChange: (agentName: string, runtime: "paused" | "running") => void;
  onAgentScheduleChange: (agentName: string, schedule: string | null) => void;
  onCreateAgent: (name: string) => void;
  onCreateWorkflowChatNode: (
    agentName: string,
    title: string,
  ) => Promise<WorkflowChatNode | null>;
  onDeleteWorkflowChatNode: (agentName: string, chatId: string) => void;
  onPlaygroundChange: (open: boolean) => void;
  onSelectAgentName: (name: string | null) => void;
  selectedAgentName: string | null;
  workspaceId: string | null;
  workflowChatNodesByAgent: Record<string, WorkflowChatNode[]>;
}) {
  const [agentFilter, setAgentFilter] = useState<AgentFilter>("all");
  const [agentSearch, setAgentSearch] = useState("");
  const selectedAgent = selectedAgentName
    ? agents.find((agent) => agent.name === selectedAgentName) ?? null
    : null;
  const visibleAgents = agents.filter((agent) => {
    const matchesFilter =
      agentFilter === "all" ||
      agent.runtime === agentFilter;
    const search = agentSearch.trim().toLowerCase();
    const matchesSearch =
      !search ||
      agent.name.toLowerCase().includes(search) ||
      agent.appLogos.some((logo) => logo.toLowerCase().includes(search));

    return matchesFilter && matchesSearch;
  });

  if (selectedAgent) {
    return (
      <AgentPlayground
        agent={selectedAgent}
        composerOptions={composerOptions}
        key={`${selectedAgent.name}-${
          workflowChatNodesByAgent[selectedAgent.name]?.length ?? 0
        }`}
        onAgentRuntimeChange={onAgentRuntimeChange}
        onAgentScheduleChange={onAgentScheduleChange}
        onCreateWorkflowChatNode={onCreateWorkflowChatNode}
        onDeleteWorkflowChatNode={onDeleteWorkflowChatNode}
        onBack={() => {
          onSelectAgentName(null);
          onPlaygroundChange(false);
        }}
        workspaceId={workspaceId}
        workflowChatNodes={workflowChatNodesByAgent[selectedAgent.name] ?? []}
      />
    );
  }

  return (
    <>
      <PageHeader
        actions={<NewAgentDialog onCreate={onCreateAgent} />}
        description={pageDescriptions.agents}
        title="Workflow Agents"
      />
      {agents.length === 0 ? (
        <AgentsEmptyState onCreateAgent={onCreateAgent} />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Group className="h-9 w-full sm:h-8 sm:w-auto">
              <Input
                aria-label="Search agents"
                className="h-full w-full sm:w-72 [&_[data-slot=input]]:h-full [&_[data-slot=input]]:leading-none sm:[&_[data-slot=input]]:h-full"
                onChange={(event) => setAgentSearch(event.target.value)}
                placeholder="Search agents..."
                value={agentSearch}
              />
              <GroupSeparator />
              <AgentFilterMenu
                filter={agentFilter}
                onFilterChange={setAgentFilter}
              />
            </Group>
            <span className="text-xs text-muted-foreground">
              {visibleAgents.length} of {agents.length} agents
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleAgents.map((agent, index) => (
              <Card className="overflow-hidden" key={`${agent.name}-${index}`}>
                <button
                  className="group text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    onSelectAgentName(agent.name);
                    onPlaygroundChange(true);
                  }}
                  type="button"
                >
                  <CardPanel
                    className={cn(
                      "relative grid min-h-36 place-items-center overflow-hidden rounded-t-2xl bg-linear-to-br p-5 transition-transform group-hover:scale-[1.01]",
                      agent.gradient,
                    )}
                  >
                    <OreoFlareAvatar
                      className="absolute inset-0"
                      scale={2.8}
                      seed={`agent-card-${agent.name}`}
                    />
                    <div className="absolute inset-0 bg-white/10 dark:bg-black/16" />
                    <AgentLogoStack logos={agent.appLogos} />
                  </CardPanel>
                  <CardPanel className="border-t border-border p-4">
                    <CardTitle>{agent.name}</CardTitle>
                    <AgentRuntimeStatus
                      runtime={agent.runtime}
                      tokenUsage={agent.tokenUsage}
                    />
                  </CardPanel>
                </button>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function AgentsEmptyState({
  onCreateAgent,
}: {
  onCreateAgent: (name: string) => void;
}) {
  return (
    <div className="grid min-h-[28rem] place-items-center rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center">
      <div className="mx-auto max-w-md">
        <IsometricAgentIllustration className="mx-auto h-48 w-full max-w-80 text-muted-foreground" />
        <h2 className="mt-6 text-xl font-semibold tracking-tight">
          No agents yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Create a workflow agent, connect the apps it can use, and let it run
          with the right permissions.
        </p>
        <div className="mt-6 flex justify-center">
          <NewAgentDialog
            label="Create your first agent"
            onCreate={onCreateAgent}
            size="default"
          />
        </div>
      </div>
    </div>
  );
}

function IsometricAgentIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 320 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        opacity="0.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      >
        <path d="M42 138 160 70l118 68-118 68L42 138Z" opacity="0.42" />
        <path d="M70 138 160 86l90 52-90 52-90-52Z" />
        <path d="M160 86v104" opacity="0.28" />
        <path d="m70 138 90 52 90-52" opacity="0.28" />
        <path d="M111 113v42l49 28 49-28v-42l-49-28-49 28Z" />
        <path d="m111 113 49 28 49-28" />
        <path d="M160 141v42" />
        <path d="M135 101v-23l25-14 25 14v23" opacity="0.72" />
        <path d="m135 78 25 14 25-14" opacity="0.72" />
        <path d="M160 92v25" opacity="0.72" />
        <path d="M79 118 49 101v-34l30-17 30 17v34l-30 17Z" />
        <path d="m49 67 30 17 30-17" />
        <path d="M79 84v34" />
        <path d="M241 118 211 101v-34l30-17 30 17v34l-30 17Z" />
        <path d="m211 67 30 17 30-17" />
        <path d="M241 84v34" />
        <path d="M103 96 132 82" opacity="0.55" />
        <path d="M217 96 188 82" opacity="0.55" />
        <path d="M88 152v21l28 16 28-16v-21" opacity="0.62" />
        <path d="M176 173v-21l28-16 28 16v21l-28 16-28-16Z" opacity="0.62" />
        <path d="M116 189v-37l44-25 44 25v37" opacity="0.36" />
        <path d="M122 58c8-11 22-18 38-18s30 7 38 18" opacity="0.46" />
        <path d="M147 57h26" />
        <path d="M151 65h18" />
        <path d="M160 40V24" />
        <path d="M154 24h12" />
        <path d="M49 101 29 112v22" opacity="0.42" />
        <path d="M271 101 291 112v22" opacity="0.42" />
        <path d="M29 134 48 145" opacity="0.42" />
        <path d="M291 134 272 145" opacity="0.42" />
      </g>
    </svg>
  );
}

function AgentFilterMenu({
  filter,
  onFilterChange,
}: {
  filter: AgentFilter;
  onFilterChange: (filter: AgentFilter) => void;
}) {
  const labels = {
    all: "All agents",
    paused: "Paused",
    running: "Running",
  } satisfies Record<AgentFilter, string>;

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            className="h-full min-w-36 justify-between sm:h-full"
            variant="outline"
          >
            {labels[filter]}
            <Icon className="opacity-70" icon={ChevronDownIcon} />
          </Button>
        }
      />
      <MenuPopup align="end" className="min-w-40" sideOffset={8}>
        {(["all", "running", "paused"] satisfies AgentFilter[]).map((value) => (
          <MenuItem key={value} onClick={() => onFilterChange(value)}>
            <Icon
              className={cn(filter === value ? "opacity-100" : "opacity-0")}
              icon={CheckIcon}
            />
            {labels[value]}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}

function NewAgentDialog({
  label = "New agent",
  onCreate,
  size = "sm",
}: {
  label?: string;
  onCreate: (name: string) => void;
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const trimmedName = name.trim();

  function submitAgent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedName) {
      return;
    }

    onCreate(trimmedName);
    setName("");
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Button onClick={() => setOpen(true)} size={size}>
        <Icon icon={PlusSignIcon} />
        {label}
      </Button>
      <DialogPopup>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitAgent}>
          <DialogHeader>
            <DialogTitle>Create new agent</DialogTitle>
            <DialogDescription>
              Give this agent a clear name. You can configure its workflow after
              it is created.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="grid gap-2" scrollFade={false}>
            <Label htmlFor="new-agent-name">Agent name</Label>
            <Input
              autoFocus
              id="new-agent-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Customer research agent"
              value={name}
            />
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button disabled={!trimmedName} type="submit">
              Create agent
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

function AgentLogoStack({ logos }: { logos: readonly string[] }) {
  return (
    <div className="relative z-10 my-2 grid h-20 w-32 place-items-center">
      <AgentAppLogo
        className="absolute left-4 top-5 size-10 rotate-[-8deg]"
        logo={logos[1]}
      />
      <AgentAppLogo
        className="absolute right-4 top-5 size-10 rotate-[8deg]"
        logo={logos[2]}
      />
      <AgentAppLogo
        className="relative z-10 size-14 shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
        logo={logos[0]}
      />
    </div>
  );
}

function AgentAppLogo({
  className,
  logo,
}: {
  className?: string;
  logo: string;
}) {
  const connector = getConnectorForLogo(logo);

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-xl bg-white text-xs font-semibold text-stone-900 shadow-xs/5 ring-1 ring-black/8 dark:bg-stone-950 dark:text-stone-100 dark:ring-white/10",
        className,
      )}
    >
      <span className="relative z-10 grid size-full place-items-center rounded-md p-[18%]">
        {connector ? (
          <ConnectorLogo
            className="size-full"
            connector={{
              key: connector.key,
              logo: connector.logo,
              name: connector.name,
            }}
          />
        ) : (
          logo
        )}
      </span>
    </div>
  );
}

function AgentRuntimeStatus({
  runtime,
  tokenUsage = 0,
}: {
  runtime: "paused" | "running";
  tokenUsage?: number;
}) {
  const running = runtime === "running";

  return (
    <div className="mt-3 grid gap-1">
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium",
          running ? "text-success-foreground" : "text-muted-foreground",
        )}
      >
        <Icon
          className="size-3.5"
          icon={running ? PlayIcon : PauseCircleIcon}
        />
        {running ? "Running" : "Paused"}
      </div>
      <p className="text-xs leading-none text-muted-foreground">
        {formatTokenUsage(tokenUsage)} tokens this month
      </p>
    </div>
  );
}

function formatTokenUsage(value: number) {
  return new Intl.NumberFormat("en", {
    compactDisplay: "short",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
    notation: value >= 1000 ? "compact" : "standard",
  }).format(Math.max(0, Math.round(value)));
}

function clearRunTimeouts(ref: React.MutableRefObject<number[]>) {
  ref.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
  ref.current = [];
}

function getWorkflowChatCardId(chatId: string) {
  return `workflow-chat-${chatId}`;
}

function getWorkflowRunOrder(
  cards: PlaygroundCard[],
  connections: PlaygroundConnection[],
) {
  const cardIds = new Set(cards.map((card) => card.id));
  const outgoing = new Map<string, string[]>();
  const incomingCount = new Map<string, number>();

  cards.forEach((card) => {
    outgoing.set(card.id, []);
    incomingCount.set(card.id, 0);
  });

  connections.forEach((connection) => {
    if (!cardIds.has(connection.from) || !cardIds.has(connection.to)) {
      return;
    }

    outgoing.get(connection.from)?.push(connection.to);
    incomingCount.set(
      connection.to,
      (incomingCount.get(connection.to) ?? 0) + 1,
    );
  });

  const cardById = new Map(cards.map((card) => [card.id, card]));
  const sortByPosition = (a: string, b: string) => {
    const cardA = cardById.get(a);
    const cardB = cardById.get(b);

    if (!cardA || !cardB) {
      return 0;
    }

    return cardA.x - cardB.x || cardA.y - cardB.y;
  };
  const queue = cards
    .filter((card) => (incomingCount.get(card.id) ?? 0) === 0)
    .map((card) => card.id)
    .sort(sortByPosition);
  const ordered: string[] = [];

  while (queue.length > 0) {
    const cardId = queue.shift();

    if (!cardId) {
      continue;
    }

    ordered.push(cardId);

    (outgoing.get(cardId) ?? []).sort(sortByPosition).forEach((targetId) => {
      const nextCount = (incomingCount.get(targetId) ?? 0) - 1;
      incomingCount.set(targetId, nextCount);

      if (nextCount === 0) {
        queue.push(targetId);
        queue.sort(sortByPosition);
      }
    });
  }

  const remaining = cards
    .map((card) => card.id)
    .filter((cardId) => !ordered.includes(cardId))
    .sort(sortByPosition);

  return [...ordered, ...remaining];
}

function AgentPlayground({
  agent,
  composerOptions,
  onAgentRuntimeChange,
  onAgentScheduleChange,
  onBack,
  onCreateWorkflowChatNode,
  onDeleteWorkflowChatNode,
  workspaceId,
  workflowChatNodes,
}: {
  agent: Agent;
  composerOptions: ComposerOption[];
  onAgentRuntimeChange: (agentName: string, runtime: "paused" | "running") => void;
  onAgentScheduleChange: (agentName: string, schedule: string | null) => void;
  onBack: () => void;
  onCreateWorkflowChatNode: (
    agentName: string,
    title: string,
  ) => Promise<WorkflowChatNode | null>;
  onDeleteWorkflowChatNode: (agentName: string, chatId: string) => void;
  workspaceId: string | null;
  workflowChatNodes: WorkflowChatNode[];
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const runTimeoutsRef = useRef<number[]>([]);
  const [agentRunning, setAgentRunning] = useState(agent.runtime === "running");
  const [cards, setCards] = useState<PlaygroundCard[]>(() => [
    ...(agent.workflowCards ?? []).map((card) => ({ ...card, apps: [...card.apps] })),
    ...workflowChatNodes.map((node, index) => ({
      apps: node.appKeys && node.appKeys.length > 0
        ? normalizeAppLogoKeys(node.appKeys)
        : ["AT"],
      chatId: node.chatId,
      id: getWorkflowChatCardId(node.chatId),
      modelKey: agent.modelKey,
      runtime: "paused" as const,
      title: node.title,
      x: 72 + index * 44,
      y: 400 + index * 36,
    })),
  ]);
  const [connections, setConnections] = useState<PlaygroundConnection[]>(
    () => agent.workflowConnections ?? [],
  );
  const [drag, setDrag] = useState<PlaygroundDrag>(null);
  const [nodeDrag, setNodeDrag] = useState<NodeDrag>(null);
  const [contextMenu, setContextMenu] = useState<PlaygroundContextMenu>(null);
  const [deleteNodeId, setDeleteNodeId] = useState<string | null>(null);
  const [completedRunCardIds, setCompletedRunCardIds] = useState<string[]>([]);
  const [highlightedCardIds, setHighlightedCardIds] = useState<string[]>(() =>
    workflowChatNodes.map((node) => getWorkflowChatCardId(node.chatId)),
  );
  const [openNodeChatId, setOpenNodeChatId] = useState<string | null>(null);
  const [runningCardId, setRunningCardId] = useState<string | null>(null);
  const [isWorkflowRunPending, setIsWorkflowRunPending] = useState(false);
  const openNodeChat = cards.find((card) => card.id === openNodeChatId);
  const nodeToDelete = cards.find((card) => card.id === deleteNodeId) ?? null;

  useEffect(() => {
    return () => {
      clearRunTimeouts(runTimeoutsRef);
    };
  }, []);

  useEffect(() => {
    const appKeysByCardId = new Map(
      (agent.workflowCards ?? [])
        .filter((card) => card.apps.length > 0 && !card.apps.includes("AT"))
        .map((card) => [card.id, card.apps] as const),
    );
    const appKeysByChatId = new Map(
      (agent.workflowCards ?? [])
        .filter(
          (card) =>
            Boolean(card.chatId) &&
            card.apps.length > 0 &&
            !card.apps.includes("AT"),
        )
        .map((card) => [card.chatId ?? "", card.apps] as const),
    );

    if (appKeysByCardId.size === 0 && appKeysByChatId.size === 0) {
      return;
    }

    setCards((current) =>
      current.map((card) => {
        const nextApps =
          appKeysByCardId.get(card.id) ||
          (card.chatId ? appKeysByChatId.get(card.chatId) : undefined);

        return nextApps ? { ...card, apps: [...nextApps] } : card;
      }),
    );
  }, [agent.workflowCards]);

  useEffect(() => {
    if (highlightedCardIds.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedCardIds([]);
    }, 7000);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedCardIds.length]);

  function getCanvasPoint(event: React.PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: event.clientX - rect.left + (canvasRef.current?.scrollLeft ?? 0),
      y: event.clientY - rect.top + (canvasRef.current?.scrollTop ?? 0),
    };
  }

  function getCanvasMousePoint(event: React.MouseEvent) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: event.clientX - rect.left + (canvasRef.current?.scrollLeft ?? 0),
      y: event.clientY - rect.top + (canvasRef.current?.scrollTop ?? 0),
    };
  }

  function getContextMenuPoint(event: React.MouseEvent) {
    const point = getCanvasMousePoint(event);
    const canvas = canvasRef.current;
    if (!canvas) {
      return point;
    }

    const visibleLeft = canvas.scrollLeft + PLAYGROUND_MENU_EDGE_GAP;
    const visibleTop = canvas.scrollTop + PLAYGROUND_MENU_EDGE_GAP;
    const visibleRight =
      canvas.scrollLeft + canvas.clientWidth - PLAYGROUND_MENU_EDGE_GAP;
    const visibleBottom =
      canvas.scrollTop + canvas.clientHeight - PLAYGROUND_MENU_EDGE_GAP;

    let x = point.x + PLAYGROUND_MENU_EDGE_GAP;
    let y = point.y + PLAYGROUND_MENU_EDGE_GAP;

    if (x + PLAYGROUND_MENU_WIDTH > visibleRight) {
      x = point.x - PLAYGROUND_MENU_WIDTH - PLAYGROUND_MENU_EDGE_GAP;
    }

    if (y + PLAYGROUND_MENU_HEIGHT > visibleBottom) {
      y = point.y - PLAYGROUND_MENU_HEIGHT - PLAYGROUND_MENU_EDGE_GAP;
    }

    return {
      x: Math.max(
        visibleLeft,
        Math.min(visibleRight - PLAYGROUND_MENU_WIDTH, x),
      ),
      y: Math.max(
        visibleTop,
        Math.min(visibleBottom - PLAYGROUND_MENU_HEIGHT, y),
      ),
    };
  }

  function clampCardPosition(x: number, y: number) {
    const canvas = canvasRef.current;
    const stageWidth = Math.max(
      canvas?.scrollWidth ?? 0,
      canvas?.clientWidth ?? 0,
      PLAYGROUND_MIN_WIDTH,
    );
    const stageHeight = Math.max(
      canvas?.scrollHeight ?? 0,
      canvas?.clientHeight ?? 0,
      PLAYGROUND_MIN_HEIGHT,
    );
    const minX = PLAYGROUND_EDGE_GAP + PLAYGROUND_HANDLE_OVERHANG;
    const minY = PLAYGROUND_EDGE_GAP;
    const maxX = Math.max(
      minX,
      stageWidth -
        PLAYGROUND_CARD_WIDTH -
        PLAYGROUND_EDGE_GAP -
        PLAYGROUND_HANDLE_OVERHANG,
    );
    const maxY = Math.max(
      minY,
      stageHeight -
        PLAYGROUND_CARD_HEIGHT -
        PLAYGROUND_EDGE_GAP -
        PLAYGROUND_SCROLLBAR_GAP,
    );

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }

  function startConnection(cardId: string, event: React.PointerEvent) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setContextMenu(null);
    setDrag({ from: cardId, ...getCanvasPoint(event) });
  }

  function moveConnection(event: React.PointerEvent) {
    const point = getCanvasPoint(event);

    if (nodeDrag) {
      setCards((current) =>
        current.map((card) =>
          card.id === nodeDrag.cardId
            ? {
                ...card,
                ...clampCardPosition(
                  point.x - nodeDrag.offsetX,
                  point.y - nodeDrag.offsetY,
                ),
              }
            : card,
        ),
      );
    }

    if (drag) {
      setDrag((current) => (current ? { ...current, ...point } : current));
    }
  }

  function startNodeDrag(card: PlaygroundCard, event: React.PointerEvent) {
    if (event.button !== 0 || drag) {
      return;
    }

    event.preventDefault();
    setContextMenu(null);
    const point = getCanvasPoint(event);
    setNodeDrag({
      cardId: card.id,
      offsetX: point.x - card.x,
      offsetY: point.y - card.y,
    });
  }

  function finishConnection(targetId: string) {
    if (!drag || drag.from === targetId) {
      setDrag(null);
      return;
    }

    const sourceNodeId = drag.from;
    const targetNodeId = targetId;
    setConnections((current) => {
      const exists = current.some(
        (connection) =>
          (connection.from === sourceNodeId && connection.to === targetNodeId) ||
          (connection.from === targetNodeId && connection.to === sourceNodeId),
      );

      return exists ? current : [...current, { from: sourceNodeId, to: targetNodeId }];
    });
    if (agent.id) {
      void fetch(`/api/agents/${agent.id}/edges`, {
        body: JSON.stringify({ sourceNodeId, targetNodeId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }).catch(() => undefined);
    }
    setDrag(null);
  }

  function openContextMenu(event: React.MouseEvent, targetId: string | null) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ targetId, ...getContextMenuPoint(event) });
  }

  async function createEmptyNode() {
    const point = contextMenu ?? { x: 160, y: 120 };
    const title = "Empty chat";
    const workflowNode = await onCreateWorkflowChatNode(agent.name, title);
    const position = clampCardPosition(point.x - 120, point.y - 64);
    let id = workflowNode?.nodeId ?? `node-${Date.now()}`;

    if (agent.id && workflowNode) {
      try {
        const response = await fetch(`/api/agents/${agent.id}/nodes`, {
          body: JSON.stringify({
            sourceChatId: workflowNode.chatId,
            title: workflowNode.title,
            x: position.x,
            y: position.y,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const payload = asRecord(await response.json().catch(() => ({})));
        const node = asRecord(payload.node);
        id = asString(node.id, id);
      } catch (error) {
        console.error(error);
      }
    }

    setCards((current) => [
      ...current,
      {
        apps: [],
        chatId: workflowNode?.chatId,
        id,
        modelKey: agent.modelKey,
        runtime: "paused",
        title: workflowNode?.title ?? title,
        ...position,
      },
    ]);
    setOpenNodeChatId(id);
    setContextMenu(null);
  }

  function setAgentRunningState(running: boolean) {
    const runtime = running ? "running" : "paused";
    setAgentRunning(running);
    onAgentRuntimeChange(agent.name, runtime);
  }

  function requestDeleteNode(cardId: string | null) {
    if (!cardId) {
      return;
    }

    setDeleteNodeId(cardId);
    setContextMenu(null);
  }

  function deleteNode(cardId: string | null) {
    if (!cardId) {
      return;
    }

    const card = cards.find((item) => item.id === cardId);
    setCards((current) => current.filter((card) => card.id !== cardId));
    setConnections((current) =>
      current.filter(
        (connection) => connection.from !== cardId && connection.to !== cardId,
      ),
    );
    if (openNodeChatId === cardId) {
      setOpenNodeChatId(null);
    }
    if (card?.chatId) {
      onDeleteWorkflowChatNode(agent.name, card.chatId);
    }
    if (agent.id) {
      const params = new URLSearchParams({ id: cardId });
      if (card?.chatId) {
        params.set("sourceChatId", card.chatId);
      }
      void fetch(`/api/agents/${agent.id}/nodes?${params.toString()}`, {
        method: "DELETE",
      }).catch(() => undefined);
    }
    setDeleteNodeId(null);
    setContextMenu(null);
  }

  async function runNode(cardId: string | null) {
    if (!cardId) {
      return;
    }

    setContextMenu(null);
    if (!agent.id) {
      return;
    }

    clearRunTimeouts(runTimeoutsRef);
    setCompletedRunCardIds([]);
    setRunningCardId(cardId);
    setIsWorkflowRunPending(true);
    setAgentRunningState(true);

    try {
      const response = await fetch(`/api/agents/${agent.id}/run`, {
        body: JSON.stringify({ nodeId: cardId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        const payload = asRecord(await response.json().catch(() => ({})));
        throw new Error(asString(payload.error, "Could not run node."));
      }

      setCompletedRunCardIds([cardId]);
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not run node.");
    } finally {
      setRunningCardId(null);
      setIsWorkflowRunPending(false);
    }
  }

  async function runAgentWorkflow() {
    const orderedCardIds = getWorkflowRunOrder(cards, connections);
    if (orderedCardIds.length === 0 || !agent.id) {
      return;
    }

    clearRunTimeouts(runTimeoutsRef);
    setAgentRunningState(true);
    setCompletedRunCardIds([]);
    setIsWorkflowRunPending(true);

    orderedCardIds.forEach((cardId, index) => {
      const timeoutId = window.setTimeout(() => {
        setRunningCardId(cardId);

        if (index > 0) {
          const previousCardId = orderedCardIds[index - 1];
          setCompletedRunCardIds((current) =>
            current.includes(previousCardId)
              ? current
              : [...current, previousCardId],
          );
        }
      }, index * WORKFLOW_NODE_STEP_MS);

      runTimeoutsRef.current.push(timeoutId);
    });

    const completionTimeoutId = window.setTimeout(() => {
      setRunningCardId(null);
      setCompletedRunCardIds(orderedCardIds);
    }, orderedCardIds.length * WORKFLOW_NODE_STEP_MS);

    runTimeoutsRef.current.push(completionTimeoutId);

    try {
      const response = await fetch(`/api/agents/${agent.id}/run`, {
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        const payload = asRecord(await response.json().catch(() => ({})));
        throw new Error(asString(payload.error, "Could not run workflow."));
      }

      clearRunTimeouts(runTimeoutsRef);
      setRunningCardId(null);
      setCompletedRunCardIds(orderedCardIds);
    } catch (error) {
      clearRunTimeouts(runTimeoutsRef);
      setRunningCardId(null);
      setCompletedRunCardIds([]);
      void playAtmetSound("error");
      window.alert(
        error instanceof Error ? error.message : "Could not run workflow.",
      );
    } finally {
      setIsWorkflowRunPending(false);
    }
  }

  function pauseAgentWorkflow() {
    clearRunTimeouts(runTimeoutsRef);
    setAgentRunningState(false);
    setRunningCardId(null);
    setCompletedRunCardIds([]);
  }

  function openNodeChatSheet(cardId: string | null) {
    if (!cardId) {
      return;
    }

    setOpenNodeChatId(cardId);
    setContextMenu(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Button onClick={onBack} size="sm" variant="ghost">
            Back
          </Button>
          <h1 className="mt-2 truncate text-lg font-semibold">{agent.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AgentRuntimeStatus
            runtime={agentRunning ? "running" : "paused"}
            tokenUsage={agent.tokenUsage}
          />
          <Button
            disabled={isWorkflowRunPending}
            onClick={() => {
              if (agentRunning && !isWorkflowRunPending) {
                pauseAgentWorkflow();
                return;
              }

              void runAgentWorkflow();
            }}
            size="sm"
            variant={agentRunning ? "outline" : "default"}
          >
            {isWorkflowRunPending ? (
              <Spinner className="size-3.5" />
            ) : (
              <Icon icon={agentRunning ? PauseCircleIcon : PlayIcon} />
            )}
            {isWorkflowRunPending ? "Running" : agentRunning ? "Pause" : "Run"}
          </Button>
          <AgentSettingsSheet
            agent={agent}
            agentRunning={agentRunning}
            onAgentRunningChange={setAgentRunningState}
            onAgentScheduleChange={(schedule) =>
              onAgentScheduleChange(agent.name, schedule)
            }
          />
        </div>
      </div>

      <div
        className="relative min-h-[28rem] flex-1 overflow-auto rounded-2xl border border-black/8 bg-muted/45 dark:border-white/8"
        onContextMenu={(event) => openContextMenu(event, null)}
        onPointerMove={moveConnection}
        onPointerLeave={() => {
          setDrag(null);
          setNodeDrag(null);
        }}
        onPointerDown={() => setContextMenu(null)}
        onPointerUp={() => {
          setDrag(null);
          setNodeDrag(null);
        }}
        ref={canvasRef}
      >
        <div className="relative h-full min-h-[31rem] min-w-[68rem]">
          <AgentPlaygroundWires
            cards={cards}
            connections={connections}
            drag={drag}
          />
          {cards.map((card) => (
            <AgentChatCard
              card={card}
              highlighted={highlightedCardIds.includes(card.id)}
              key={card.id}
              onOpenChat={openNodeChatSheet}
              onFinishConnection={finishConnection}
              onOpenContextMenu={openContextMenu}
              onStartCardDrag={startNodeDrag}
              onStartConnection={startConnection}
              runState={
                runningCardId === card.id
                  ? "running"
                  : completedRunCardIds.includes(card.id)
                    ? "complete"
                    : "idle"
              }
            />
          ))}
          {contextMenu && (
            <AgentPlaygroundContextMenu
              menu={contextMenu}
              onCreateNode={createEmptyNode}
              onDeleteNode={() => requestDeleteNode(contextMenu.targetId)}
              onRunNode={() => runNode(contextMenu.targetId)}
              onUpdateNode={() => openNodeChatSheet(contextMenu.targetId)}
            />
          )}
        </div>
      </div>
      <AgentNodeChatSheet
        card={openNodeChat}
        composerOptions={composerOptions}
        onOpenChange={(open) => {
          if (!open) {
            setOpenNodeChatId(null);
          }
        }}
        open={Boolean(openNodeChat)}
        workspaceId={workspaceId}
      />
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteNodeId(null);
          }
        }}
        open={Boolean(nodeToDelete)}
      >
        <DialogPopup className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete node</DialogTitle>
            <DialogDescription>
              Delete &quot;{nodeToDelete?.title ?? "this node"}&quot; from this
              agent workflow. The linked chat will also be removed from the
              sidebar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              className="text-red-600 hover:text-red-600 dark:text-red-500"
              onClick={() => deleteNode(nodeToDelete?.id ?? null)}
              type="button"
              variant="ghost"
            >
              Delete node
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}

function AgentPlaygroundWires({
  cards,
  connections,
  drag,
}: {
  cards: PlaygroundCard[];
  connections: PlaygroundConnection[];
  drag: PlaygroundDrag;
}) {
  const activeCard = drag
    ? cards.find((card) => card.id === drag.from)
    : null;

  return (
    <svg className="pointer-events-none absolute inset-0 z-10 size-full">
      <defs>
        <marker
          id="workflow-wire-arrow"
          markerHeight="8"
          markerUnits="strokeWidth"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
          viewBox="0 0 8 8"
        >
          <path className="fill-foreground" d="M 0 0 L 8 4 L 0 8 z" />
        </marker>
        <marker
          id="workflow-wire-arrow-active"
          markerHeight="8"
          markerUnits="strokeWidth"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
          viewBox="0 0 8 8"
        >
          <path className="fill-success" d="M 0 0 L 8 4 L 0 8 z" />
        </marker>
      </defs>
      {connections.map((connection) => {
        const from = cards.find((card) => card.id === connection.from);
        const to = cards.find((card) => card.id === connection.to);
        if (!from || !to) {
          return null;
        }

        const start = getCardWirePoint(from, to);
        const end = getCardWirePoint(to, from);

        return (
          <path
            className="stroke-foreground"
            d={getWirePath(start.x, start.y, end.x, end.y)}
            fill="none"
            key={`${connection.from}-${connection.to}`}
            markerEnd="url(#workflow-wire-arrow)"
            strokeWidth="2"
          />
        );
      })}
      {activeCard && drag && (
        <path
          className="stroke-success"
          d={getWirePath(activeCard.x + 240, activeCard.y + 64, drag.x, drag.y)}
          fill="none"
          markerEnd="url(#workflow-wire-arrow-active)"
          strokeDasharray="6 6"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

function AgentPlaygroundContextMenu({
  menu,
  onCreateNode,
  onDeleteNode,
  onRunNode,
  onUpdateNode,
}: {
  menu: NonNullable<PlaygroundContextMenu>;
  onCreateNode: () => void;
  onDeleteNode: () => void;
  onRunNode: () => void;
  onUpdateNode: () => void;
}) {
  const hasTarget = Boolean(menu.targetId);

  return (
    <div
      className="absolute z-40 w-48 rounded-xl border border-black/8 bg-popover p-1 text-popover-foreground shadow-lg dark:border-white/10"
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={(event) => event.stopPropagation()}
      style={{ left: menu.x, top: menu.y }}
    >
      <button
        className="flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        disabled={!hasTarget}
        onClick={onUpdateNode}
        type="button"
      >
        <Icon className="size-3.5" icon={Chat01Icon} />
        Update node
      </button>
      <button
        className="flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-medium hover:bg-muted"
        onClick={onCreateNode}
        type="button"
      >
        <Icon className="size-3.5" icon={PlusSignIcon} />
        New empty node
      </button>
      <button
        className="flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        disabled={!hasTarget}
        onClick={onRunNode}
        type="button"
      >
        <Icon className="size-3.5" icon={PlayIcon} />
        Run node
      </button>
      <button
        className="flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-left text-xs font-medium text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
        disabled={!hasTarget}
        onClick={onDeleteNode}
        type="button"
      >
        <Icon className="size-3.5" icon={Delete02Icon} />
        Delete node
      </button>
    </div>
  );
}

function AgentNodeChatSheet({
  card,
  composerOptions,
  onOpenChange,
  open,
  workspaceId,
}: {
  card?: PlaygroundCard;
  composerOptions: ComposerOption[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  workspaceId: string | null;
}) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup
        className="bg-background sm:max-w-2xl dark:border-white/10 dark:bg-[#211f1d]"
        side="right"
        variant="inset"
      >
        <div className="flex min-h-0 flex-1 flex-col p-4 pt-12">
          <ChatExperience
            activeChatId={card?.chatId ?? null}
            compact
            composerOptions={composerOptions}
            key={card?.chatId ?? card?.id ?? "node-chat"}
            workspaceId={workspaceId}
          />
        </div>
      </SheetPopup>
    </Sheet>
  );
}

function AgentSettingsSheet({
  agent,
  agentRunning,
  onAgentRunningChange,
  onAgentScheduleChange,
}: {
  agent: Agent;
  agentRunning: boolean;
  onAgentRunningChange: (running: boolean) => void;
  onAgentScheduleChange: (schedule: string | null) => void;
}) {
  const agentUrl = `https://app.atmetai.com/agents/${agent.name
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
  const customScheduleMatch = /^every\s+(\d{1,3})\s*(minute|minutes|hour|hours|day|days)$/i.exec(
    agent.schedule ?? "",
  );
  const [customEveryCount, setCustomEveryCount] = useState(
    customScheduleMatch?.[1] ?? "15",
  );
  const [customEveryUnit, setCustomEveryUnit] = useState(
    customScheduleMatch?.[2]?.startsWith("hour")
      ? "hours"
      : customScheduleMatch?.[2]?.startsWith("day")
        ? "days"
        : "minutes",
  );
  const [observability, setObservability] = useState<AgentObservabilityData>({
    approvals: [],
    runs: [],
    versions: [],
  });
  const [observabilityLoading, setObservabilityLoading] = useState(false);
  useEffect(() => {
    const nextScheduleMatch = /^every\s+(\d{1,3})\s*(minute|minutes|hour|hours|day|days)$/i.exec(
      agent.schedule ?? "",
    );

    if (!nextScheduleMatch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCustomEveryCount(nextScheduleMatch[1] ?? "15");
      setCustomEveryUnit(
        nextScheduleMatch[2]?.startsWith("hour")
          ? "hours"
          : nextScheduleMatch[2]?.startsWith("day")
            ? "days"
            : "minutes",
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [agent.schedule]);

  useEffect(() => {
    let cancelled = false;

    async function loadObservability() {
      if (!agent.id) {
        return;
      }

      setObservabilityLoading(true);
      try {
        const response = await fetch(`/api/agents/${agent.id}/observability`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const payload = asRecord(await response.json());
        if (!cancelled) {
          setObservability({
            approvals: asRecordArray(payload.approvals),
            runs: asRecordArray(payload.runs),
            versions: asRecordArray(payload.versions),
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setObservabilityLoading(false);
        }
      }
    }

    void loadObservability();

    return () => {
      cancelled = true;
    };
  }, [agent.id]);
  const selectedScheduleValue =
    agent.schedule &&
    ["hourly", "daily", "weekdays", "weekly"].includes(agent.schedule)
      ? agent.schedule
      : agent.schedule
        ? "custom"
        : "manual";
  const scheduleOptions = [
    { label: "Manual", value: "manual" },
    { label: "Hourly", value: "hourly" },
    { label: "Daily", value: "daily" },
    { label: "Every weekday", value: "weekdays" },
    { label: "Weekly", value: "weekly" },
  ] as const;

  function applyCustomSchedule() {
    const count = Math.max(1, Math.min(999, Number.parseInt(customEveryCount, 10) || 1));
    const unit = count === 1 ? customEveryUnit.replace(/s$/, "") : customEveryUnit;
    onAgentScheduleChange(`every ${count} ${unit}`);
    onAgentRunningChange(true);
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button size="sm" variant="outline" />}>
        <Icon icon={Settings01Icon} />
        Settings
      </SheetTrigger>
      <SheetPopup
        className="w-[calc(100vw-1rem)] max-w-[38rem] overflow-hidden sm:w-[min(92vw,38rem)] sm:max-w-none"
        side="right"
        variant="inset"
      >
        <SheetHeader className="min-w-0">
          <SheetTitle className="min-w-0 truncate pr-8">{agent.name}</SheetTitle>
          <SheetDescription className="max-w-prose text-pretty">
            Configure how this agent runs, shares context, and exposes its
            playground.
          </SheetDescription>
        </SheetHeader>
        <SheetPanel className="grid min-w-0 gap-5 overflow-x-hidden">
          <AgentSheetSection
            icon={PlayIcon}
            title="Run state"
          >
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {agentRunning ? "Agent is running" : "Agent is paused"}
                </p>
                <p className="text-pretty text-xs text-muted-foreground">
                  Toggle temporary execution for the playground.
                </p>
              </div>
              <Switch
                className="shrink-0"
                checked={agentRunning}
                onCheckedChange={onAgentRunningChange}
              />
            </div>
          </AgentSheetSection>

          <AgentSheetSection icon={CalendarClockIcon} title="Run scheduling">
            <div className="grid gap-2">
              <div className="grid gap-2 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Schedule mode</p>
                  <p className="text-xs text-muted-foreground">
                    Runs only while the agent is enabled.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                {scheduleOptions.map((option) => {
                  const isSelected = selectedScheduleValue === option.value;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "flex min-h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-center text-xs font-semibold transition-[background-color,border-color,box-shadow,transform] hover:border-foreground/20 hover:bg-muted/60 active:scale-[0.96]",
                        isSelected &&
                          "border-foreground/18 bg-muted shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
                      )}
                      key={option.value}
                      onClick={() => {
                        const nextSchedule =
                          option.value === "manual" ? null : option.value;
                        onAgentScheduleChange(nextSchedule);
                        if (nextSchedule) {
                          onAgentRunningChange(true);
                        }
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })}
                </div>
              </div>
              <div className="grid gap-2 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Custom interval</p>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 sm:flex sm:flex-wrap sm:items-center">
                  <Input
                    aria-label="Custom schedule count"
                    className="min-w-0 sm:w-24"
                    min={1}
                    onChange={(event) => setCustomEveryCount(event.target.value)}
                    type="number"
                    value={customEveryCount}
                  />
                  <Select
                    onValueChange={(value) => {
                      if (value) {
                        setCustomEveryUnit(value);
                      }
                    }}
                    value={customEveryUnit}
                  >
                    <SelectTrigger className="min-w-0 sm:w-32" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectPopup>
                  </Select>
                  <Button
                    aria-pressed={selectedScheduleValue === "custom"}
                    className="col-span-2 cursor-pointer sm:col-span-1"
                    onClick={applyCustomSchedule}
                    size="sm"
                    type="button"
                    variant={selectedScheduleValue === "custom" ? "default" : "outline"}
                  >
                    Use custom
                  </Button>
                </div>
              </div>
              <AgentSettingRow label="Status" value={agentRunning ? "Enabled" : "Paused"} />
              <AgentSettingRow label="Timezone" value="Asia/Amman" />
            </div>
          </AgentSheetSection>

          <AgentSheetSection icon={CopyLinkIcon} title="Share link">
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border p-2">
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {agentUrl}
              </p>
              <Button
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard?.writeText(agentUrl).catch(() => undefined);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <Icon icon={CopyLinkIcon} />
                Copy
              </Button>
            </div>
          </AgentSheetSection>

          <AgentSheetSection icon={PlugIcon} title="Connected apps">
            <div className="flex flex-wrap gap-2">
              {agent.appLogos.map((logo) => (
                <AgentAppLogo
                  className="size-9 rounded-lg text-[0.625rem]"
                  key={logo}
                  logo={logo}
                />
              ))}
            </div>
          </AgentSheetSection>

          <AgentSheetSection icon={DatabaseIcon} title="Memory and data">
            <div className="grid gap-3">
              <AgentToggleRow
                description="Allow this agent to use saved workspace context."
                label="Workspace memory"
              />
              <AgentToggleRow
                description="Keep a lightweight execution log for review."
                label="Run history"
              />
              <AgentToggleRow
                description="Require approval before writing to connected apps."
                label="Ask before actions"
              />
            </div>
          </AgentSheetSection>

          <AgentSheetSection icon={ShieldCheck} title="Approval checkpoints">
            <AgentApprovalList
              approvals={observability.approvals}
              loading={observabilityLoading}
            />
          </AgentSheetSection>

          <AgentSheetSection icon={ListViewIcon} title="Run observability">
            <AgentRunEventList
              loading={observabilityLoading}
              runs={observability.runs}
            />
          </AgentSheetSection>

          <AgentSheetSection icon={BookOpenIcon} title="Version history">
            <AgentVersionList
              loading={observabilityLoading}
              versions={observability.versions}
            />
          </AgentSheetSection>
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}

function AgentApprovalList({
  approvals,
  loading,
}: {
  approvals: DatabaseRecord[];
  loading: boolean;
}) {
  if (loading && approvals.length === 0) {
    return <p className="text-xs text-muted-foreground">Loading approvals...</p>;
  }

  if (approvals.length === 0) {
    return (
      <p className="rounded-lg border border-border p-3 text-xs leading-5 text-muted-foreground">
        No approval checkpoints yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {approvals.slice(0, 5).map((approval) => {
        const status = asString(approval.status, "pending");
        return (
          <div
            className="grid gap-1 rounded-lg border border-border p-3"
            key={asString(approval.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">
                {asString(approval.summary, "Approval checkpoint")}
              </p>
              <Badge
                variant={
                  status === "rejected"
                    ? "destructive"
                    : status === "pending"
                      ? "warning"
                      : "success"
                }
              >
                {formatStatusLabel(status)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDateTimeLabel(approval.created_at)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function AgentRunEventList({
  loading,
  runs,
}: {
  loading: boolean;
  runs: DatabaseRecord[];
}) {
  if (loading && runs.length === 0) {
    return <p className="text-xs text-muted-foreground">Loading runs...</p>;
  }

  if (runs.length === 0) {
    return (
      <p className="rounded-lg border border-border p-3 text-xs leading-5 text-muted-foreground">
        No runs recorded yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {runs.slice(0, 5).map((run) => {
        const events = asRecordArray(run.workflow_run_events);
        return (
          <div
            className="rounded-lg border border-border p-3"
            key={asString(run.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                Run {asString(run.id).slice(0, 8)}
              </p>
              <Badge
                variant={
                  asString(run.status) === "failed"
                    ? "destructive"
                    : asString(run.status) === "waiting_approval"
                      ? "warning"
                      : asString(run.status) === "completed"
                        ? "success"
                        : "secondary"
                }
              >
                {formatStatusLabel(asString(run.status, "queued"))}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDateTimeLabel(run.created_at)} · {events.length} event(s)
            </p>
            <div className="mt-2 grid gap-1">
              {events.slice(-4).map((event) => (
                <div
                  className="flex min-w-0 items-start gap-2 text-xs"
                  key={asString(event.id)}
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                  <span className="min-w-0">
                    <span className="font-medium">
                      {formatStatusLabel(asString(event.event_type))}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      {asString(event.message)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgentVersionList({
  loading,
  versions,
}: {
  loading: boolean;
  versions: DatabaseRecord[];
}) {
  if (loading && versions.length === 0) {
    return <p className="text-xs text-muted-foreground">Loading versions...</p>;
  }

  if (versions.length === 0) {
    return (
      <p className="rounded-lg border border-border p-3 text-xs leading-5 text-muted-foreground">
        No versions saved yet.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {versions.slice(0, 6).map((version) => (
        <div
          className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          key={asString(version.id)}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              Version {asNumber(version.version_number)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {asString(version.summary, asString(version.change_type))}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDateTimeLabel(version.created_at)}
          </span>
        </div>
      ))}
    </div>
  );
}

function AgentSheetSection({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <section className="grid min-w-0 gap-3">
      <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <Icon className="shrink-0 text-muted-foreground" icon={icon} />
        <span className="min-w-0 truncate">{title}</span>
      </div>
      {children}
    </section>
  );
}

function AgentSettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border px-3 py-2">
      <span className="min-w-0 truncate text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function AgentToggleRow({
  description,
  label,
}: {
  description: string;
  label: string;
}) {
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-pretty text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch className="shrink-0" checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

function AgentNodeRuntimeStatus({
  runState,
  runtime,
}: {
  runState: PlaygroundCardRunState;
  runtime: "paused" | "running";
}) {
  const isActivelyRunning = runState === "running";
  const isComplete = runState === "complete";
  const isRunning = runtime === "running";

  return (
    <div
      className={cn(
        "mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-[color] duration-300",
        (isActivelyRunning || isComplete || isRunning) &&
          "text-success-foreground",
        !isActivelyRunning &&
          !isComplete &&
          !isRunning &&
          "text-muted-foreground",
      )}
    >
      <span className="relative grid size-3.5 place-items-center">
        <Icon
          className={cn(
            "absolute inset-0 size-3.5 transition-[opacity,filter,scale] duration-300 ease-out",
            isActivelyRunning
              ? "scale-100 opacity-100 blur-0"
              : "scale-[0.25] opacity-0 blur-[4px]",
          )}
          icon={PlayIcon}
        />
        <Icon
          className={cn(
            "absolute inset-0 size-3.5 transition-[opacity,filter,scale] duration-300 ease-out",
            isComplete
              ? "scale-100 opacity-100 blur-0"
              : "scale-[0.25] opacity-0 blur-[4px]",
          )}
          icon={CheckIcon}
        />
        <Icon
          className={cn(
            "size-3.5 transition-[opacity,filter,scale] duration-300 ease-out",
            !isActivelyRunning && !isComplete
              ? "scale-100 opacity-100 blur-0"
              : "scale-[0.25] opacity-0 blur-[4px]",
          )}
          icon={isRunning ? PlayIcon : PauseCircleIcon}
        />
      </span>
      {isActivelyRunning
        ? "Running"
        : isComplete
          ? "Complete"
          : isRunning
            ? "Running"
            : "Paused"}
    </div>
  );
}

function AgentChatCard({
  card,
  highlighted,
  onFinishConnection,
  onOpenChat,
  onOpenContextMenu,
  onStartCardDrag,
  onStartConnection,
  runState,
}: {
  card: PlaygroundCard;
  highlighted: boolean;
  onFinishConnection: (cardId: string) => void;
  onOpenChat: (cardId: string) => void;
  onOpenContextMenu: (event: React.MouseEvent, targetId: string | null) => void;
  onStartCardDrag: (card: PlaygroundCard, event: React.PointerEvent) => void;
  onStartConnection: (cardId: string, event: React.PointerEvent) => void;
  runState: PlaygroundCardRunState;
}) {
  return (
    <div
      className={cn(
        "absolute z-20 min-h-32 w-60 cursor-grab rounded-xl border bg-background p-3 shadow-xs/5 transition-[border-color,box-shadow,scale] duration-300 ease-out active:cursor-grabbing",
        runState === "running" &&
          "border-emerald-500/70 shadow-[0_0_0_3px_rgb(16_185_129/0.12),0_14px_34px_rgb(16_185_129/0.14)]",
        runState === "complete" &&
          "border-emerald-500/35 shadow-[0_0_0_2px_rgb(16_185_129/0.08),0_10px_24px_rgb(16_185_129/0.08)]",
        highlighted &&
          "animate-node-import-glow border-orange-400/80 shadow-[0_0_0_3px_rgb(251_146_60/0.18),0_16px_36px_rgb(251_146_60/0.20)]",
        runState === "idle" &&
          !highlighted &&
          "border-black/8 dark:border-white/8",
      )}
      onContextMenu={(event) => onOpenContextMenu(event, card.id)}
      onPointerDown={(event) => onStartCardDrag(card, event)}
      style={{ left: card.x, top: card.y }}
    >
      <button
        aria-label={`Connect from ${card.title}`}
        className="absolute -right-2 top-1/2 size-4 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-background bg-foreground transition-transform hover:scale-125"
        onPointerDown={(event) => onStartConnection(card.id, event)}
        type="button"
      />
      <button
        aria-label={`Connect to ${card.title}`}
        className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-background bg-muted-foreground transition-transform hover:scale-125"
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => {
          event.stopPropagation();
          onFinishConnection(card.id);
        }}
        type="button"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{card.title}</h2>
          <AgentNodeRuntimeStatus
            runState={runState}
            runtime={card.runtime}
          />
        </div>
        <button
          aria-label={`Open ${card.title} chat`}
          className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            onOpenChat(card.id);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <Icon className="size-4" icon={Chat01Icon} />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          {card.apps.map((logo) => (
            <AgentAppLogo
              className="size-8 rounded-lg text-[0.625rem]"
              key={logo}
              logo={logo}
            />
          ))}
        </div>
        <AgentNodeModelBadge modelKey={card.modelKey} />
      </div>
    </div>
  );
}

function AgentNodeModelBadge({ modelKey }: { modelKey: string }) {
  const model = getChatModelOption(modelKey);

  return (
    <div className="mt-2 inline-flex max-w-full items-center gap-1.5 text-[0.68rem] font-medium leading-none text-muted-foreground">
      <ChatModelMark className="size-3.5" model={model} />
      <span className="truncate">{model.name}</span>
    </div>
  );
}

function getCardWirePoint(from: PlaygroundCard, to: PlaygroundCard) {
  const toRight = to.x > from.x;
  return {
    x: from.x + (toRight ? 240 : 0),
    y: from.y + 64,
  };
}

function getWirePath(x1: number, y1: number, x2: number, y2: number) {
  const curve = Math.max(80, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`;
}

function createSkillId(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;
}

function getRandomSkillVisual() {
  return {
    gradient:
      skillGradientOptions[
        Math.floor(Math.random() * skillGradientOptions.length)
      ],
    icon: skillIconOptions[Math.floor(Math.random() * skillIconOptions.length)],
  };
}

function SkillIconTile({
  className,
  icon,
  seed,
}: {
  className?: string;
  icon: IconSvgElement;
  seed: string;
}) {
  return (
    <div
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/8",
        className,
      )}
    >
      <OreoFlareAvatar
        className="absolute inset-[2px] rounded-md"
        scale={1.25}
        seed={seed}
      />
      <span className="relative z-10 grid size-7 place-items-center rounded-md bg-white/82 text-stone-800 shadow-xs/5 backdrop-blur-[1px] dark:bg-stone-950/70 dark:text-stone-100">
        <Icon className="size-4" icon={icon} />
      </span>
    </div>
  );
}

type SkillFilter = "all" | "custom" | "default";

function SkillsPage({
  chats,
  onSkillsChange,
  onUseSkillInChat,
  onUseSkillInNewChat,
  skills: loadedSkills,
  workspaceId,
}: {
  chats: SidebarChat[];
  onSkillsChange: React.Dispatch<React.SetStateAction<SkillItem[]>>;
  onUseSkillInChat: (skill: SkillItem, chatId: string) => void;
  onUseSkillInNewChat: (skill: SkillItem) => void | Promise<void>;
  skills: SkillItem[];
  workspaceId: string | null;
}) {
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(
    null,
  );
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("all");
  const [skillSearch, setSkillSearch] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const selectedSkill = selectedSkillId
    ? loadedSkills.find((skill) => skill.id === selectedSkillId) ?? null
    : null;
  const visibleSkills = loadedSkills.filter((skill) => {
    const matchesFilter =
      skillFilter === "all" || skill.source === skillFilter;
    const search = skillSearch.trim().toLowerCase();
    const matchesSearch =
      !search ||
      skill.name.toLowerCase().includes(search) ||
      skill.description.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  function updateSkill(skillId: string, updates: Partial<SkillItem>) {
    onSkillsChange((current) =>
      current.map((skill) =>
        skill.id === skillId ? { ...skill, ...updates } : skill,
      ),
    );

    if (workspaceId) {
      void fetch(`/api/skills/${skillId}`, {
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }).catch(() => undefined);
    }
  }

  async function createSkill(mode: "ai" | "instructions") {
    const nextIndex = loadedSkills.length + 1;
    const visual = getRandomSkillVisual();
    let skill: SkillItem =
      mode === "ai"
        ? {
            content:
              "# AI-created skill\n\nDescribe the outcome you want and Atmet will turn this into a reusable skill.\n\n## Goal\n\n",
            description: "Generate a reusable skill from a goal.",
            gradient: visual.gradient,
            icon: visual.icon,
            id: createSkillId(`AI skill ${nextIndex}`),
            name: `AI skill ${nextIndex}`,
            source: "custom" as const,
          }
        : {
            content:
              "# Untitled skill\n\nWrite the instructions this skill should follow.\n\n## When to use\n\n\n## Steps\n\n- ",
            description: "Custom instructions written by hand.",
            gradient: visual.gradient,
            icon: visual.icon,
            id: createSkillId(`Custom skill ${nextIndex}`),
            name: `Custom skill ${nextIndex}`,
            source: "custom" as const,
          };

    if (workspaceId) {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/skills`, {
          body: JSON.stringify(skill),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (response.ok) {
          const payload = asRecord(await response.json());
          skill = mapSkill(payload.skill, loadedSkills.length) ?? skill;
        }
      } catch (error) {
        console.error(error);
      }
    }

    onSkillsChange((current) => [...current, skill]);
    setSelectedSkillId(skill.id);
  }

  async function createUploadedSkill({
    content,
    description,
    name,
  }: {
    content: string;
    description: string;
    name: string;
  }) {
    const visual = getRandomSkillVisual();
    let skill: SkillItem = {
      content,
      description,
      gradient: visual.gradient,
      icon: visual.icon,
      id: createSkillId(name),
      name,
      source: "custom" as const,
    };

    if (workspaceId) {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/skills`, {
          body: JSON.stringify(skill),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (response.ok) {
          const payload = asRecord(await response.json());
          skill = mapSkill(payload.skill, loadedSkills.length) ?? skill;
        }
      } catch (error) {
        console.error(error);
      }
    }

    onSkillsChange((current) => [...current, skill]);
    setSelectedSkillId(skill.id);
  }

  if (selectedSkill) {
    return (
      <SkillMarkdownEditor
        onBack={() => setSelectedSkillId(null)}
        onUpdate={(updates) => updateSkill(selectedSkill.id, updates)}
        skill={selectedSkill}
      />
    );
  }

  return (
    <>
      <PageHeader
        actions={
          <AddSkillMenu
            onCreateWithAi={() => createSkill("ai")}
            onTypeInstructions={() => createSkill("instructions")}
            onUploadMarkdown={() => setUploadDialogOpen(true)}
          />
        }
        description={pageDescriptions.skills}
        title="Skills"
      />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Group className="h-9 w-full sm:h-8 sm:w-auto">
          <Input
            aria-label="Search skills"
            className="h-full w-full sm:w-72 [&_[data-slot=input]]:h-full [&_[data-slot=input]]:leading-none sm:[&_[data-slot=input]]:h-full"
            onChange={(event) => setSkillSearch(event.target.value)}
            placeholder="Search skills..."
            value={skillSearch}
          />
          <GroupSeparator />
          <SkillFilterMenu filter={skillFilter} onFilterChange={setSkillFilter} />
        </Group>
        <span className="text-xs text-muted-foreground">
          {visibleSkills.length} of {loadedSkills.length} skills
        </span>
      </div>
      <UploadMarkdownSkillDialog
        onCreate={createUploadedSkill}
        onOpenChange={setUploadDialogOpen}
        open={uploadDialogOpen}
      />
      <div className="grid gap-2">
        {visibleSkills.map((skill) => (
          <Card className="overflow-hidden bg-background dark:bg-background" key={skill.id}>
            <CardPanel className="flex items-center gap-3 p-2.5">
              <div className="flex min-w-0 flex-1 items-center gap-3 p-1.5">
                <SkillIconTile
                  icon={skill.icon}
                  seed={`skill-${skill.id}-${skill.name}`}
                />
                <div className="min-w-0">
                  <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                    <span className="truncate">{skill.name}</span>
                    <Badge
                      className="shrink-0"
                      variant={skill.source === "default" ? "outline" : "info"}
                    >
                      {skill.source === "default" ? "Default" : "Created"}
                    </Badge>
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {skill.description}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  onClick={() => setSelectedSkillId(skill.id)}
                  size="sm"
                  variant="outline"
                >
                  <Icon icon={AppWindowIcon} />
                  Open
                </Button>
                <UseSkillMenu
                  chats={chats}
                  onUseExistingChat={(chatId) =>
                    onUseSkillInChat(skill, chatId)
                  }
                  onUseNewChat={() => onUseSkillInNewChat(skill)}
                  skill={skill}
                />
              </div>
            </CardPanel>
          </Card>
        ))}
      </div>
    </>
  );
}

function SkillFilterMenu({
  filter,
  onFilterChange,
}: {
  filter: SkillFilter;
  onFilterChange: (filter: SkillFilter) => void;
}) {
  const labels = {
    all: "All skills",
    custom: "My skills",
    default: "Default skills",
  } satisfies Record<SkillFilter, string>;

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            className="h-full min-w-36 justify-between sm:h-full"
            variant="outline"
          >
            {labels[filter]}
            <Icon className="opacity-70" icon={ChevronDownIcon} />
          </Button>
        }
      />
      <MenuPopup align="end" className="min-w-40" sideOffset={8}>
        {(["all", "default", "custom"] satisfies SkillFilter[]).map((value) => (
          <MenuItem key={value} onClick={() => onFilterChange(value)}>
            <Icon
              className={cn(filter === value ? "opacity-100" : "opacity-0")}
              icon={CheckIcon}
            />
            {labels[value]}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}

function AddSkillMenu({
  onCreateWithAi,
  onTypeInstructions,
  onUploadMarkdown,
}: {
  onCreateWithAi: () => void;
  onTypeInstructions: () => void;
  onUploadMarkdown: () => void;
}) {
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button size="sm">
            <Icon icon={PlusSignIcon} />
            Add skill
          </Button>
        }
      />
      <MenuPopup align="end" className="min-w-52" sideOffset={8}>
        <MenuItem onClick={onCreateWithAi}>
          <Icon icon={AiMagicIcon} />
          Create with AI
        </MenuItem>
        <MenuItem onClick={onUploadMarkdown}>
          <Icon icon={FileUploadIcon} />
          Upload MD file
        </MenuItem>
        <MenuItem onClick={onTypeInstructions}>
          <Icon icon={PencilEdit02Icon} />
          Type instructions
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}

function UploadMarkdownSkillDialog({
  onCreate,
  onOpenChange,
  open,
}: {
  onCreate: (skill: {
    content: string;
    description: string;
    name: string;
  }) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [description, setDescription] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const trimmedName = name.trim();

  function resetForm() {
    setDescription("");
    setFileContent("");
    setFileName("");
    setName("");
  }

  function readMarkdownFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextName = file.name.replace(/\.md$/i, "");
      setFileContent(String(reader.result ?? ""));
      setFileName(file.name);
      setName((current) => current || nextName || "Uploaded skill");
    };
    reader.readAsText(file);
  }

  function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedName || !fileContent) {
      return;
    }

    onCreate({
      content: fileContent,
      description: description.trim() || "Uploaded markdown instructions.",
      name: trimmedName,
    });
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
      open={open}
    >
      <DialogPopup className="max-w-md rounded-xl">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitUpload}>
          <DialogHeader className="gap-1 border-b border-border/70 px-4 py-3">
            <DialogTitle className="text-base leading-6">
              Upload MD skill
            </DialogTitle>
            <DialogDescription className="text-xs leading-5">
              Name the skill, describe it, then attach a markdown file.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="grid gap-3 p-4" scrollFade={false}>
            <div className="grid gap-1.5">
              <Label htmlFor="upload-skill-name">Name</Label>
              <Input
                id="upload-skill-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Contract review"
                value={name}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="upload-skill-description">Description</Label>
              <Input
                id="upload-skill-description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What this skill helps with"
                value={description}
              />
            </div>
            <label className="grid min-h-24 cursor-pointer place-items-center rounded-xl border border-dashed border-border bg-muted/35 px-4 py-5 text-center transition-[background-color,border-color] hover:border-foreground/20 hover:bg-muted">
              <input
                accept=".md,text/markdown,text/plain"
                className="hidden"
                onChange={readMarkdownFile}
                type="file"
              />
              <span className="grid gap-2">
                <span className="mx-auto grid size-9 place-items-center rounded-lg bg-background text-muted-foreground shadow-xs/5">
                  <Icon className="size-4" icon={FileUploadIcon} />
                </span>
                <span className="text-sm font-medium">
                  {fileName || "Choose markdown file"}
                </span>
                <span className="text-xs text-muted-foreground">
                  .md or plain text
                </span>
              </span>
            </label>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button disabled={!trimmedName || !fileContent} type="submit">
              Upload skill
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

function UseSkillMenu({
  chats,
  onUseExistingChat,
  onUseNewChat,
  skill,
}: {
  chats: SidebarChat[];
  onUseExistingChat: (chatId: string) => void;
  onUseNewChat: () => void;
  skill: SkillItem;
}) {
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  return (
    <>
      <Menu>
        <MenuTrigger
          render={
            <Button size="sm">
              <Icon icon={SendHorizontal} />
              Use skill
            </Button>
          }
        />
        <MenuPopup align="end" className="min-w-48" sideOffset={8}>
          <MenuItem onClick={onUseNewChat}>
            <Icon icon={PlusSignIcon} />
            New chat
          </MenuItem>
          <MenuItem onClick={() => setChatDialogOpen(true)}>
            <Icon icon={Chat01Icon} />
            Existing chat
          </MenuItem>
        </MenuPopup>
      </Menu>
      <UseSkillChatDialog
        chats={chats}
        onOpenChange={setChatDialogOpen}
        onSelectChat={(chatId) => {
          onUseExistingChat(chatId);
          setChatDialogOpen(false);
        }}
        open={chatDialogOpen}
        skill={skill}
      />
    </>
  );
}

function UseSkillChatDialog({
  chats,
  onOpenChange,
  onSelectChat,
  open,
  skill,
}: {
  chats: SidebarChat[];
  onOpenChange: (open: boolean) => void;
  onSelectChat: (chatId: string) => void;
  open: boolean;
  skill: SkillItem;
}) {
  const orderedChats = [...chats].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }

    return a.title.localeCompare(b.title);
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-sm rounded-xl">
        <DialogHeader className="gap-1 border-b border-border/70 px-4 py-3">
          <DialogTitle className="text-base leading-6">Choose chat</DialogTitle>
          <DialogDescription className="text-xs leading-5">
            Use &quot;{skill.name}&quot; in an existing chat.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="p-2" scrollFade={false}>
          <div className="grid gap-1 rounded-lg border border-border/70 bg-muted/35 p-1">
            {orderedChats.map((chat) => (
              <button
                className="group flex min-h-11 items-center gap-2 rounded-md px-2.5 py-2 text-left outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-background focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                type="button"
              >
                <Icon className="size-4 text-muted-foreground" icon={Chat01Icon} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {chat.title}
                </span>
                {chat.pinned && (
                  <Icon className="size-3.5 text-muted-foreground" icon={PinIcon} />
                )}
                <Icon
                  className="size-4 text-muted-foreground opacity-45 transition-[opacity,translate] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
                  icon={ArrowRight01Icon}
                />
              </button>
            ))}
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}

function SkillMarkdownEditor({
  onBack,
  onUpdate,
  skill,
}: {
  onBack: () => void;
  onUpdate: (updates: Partial<SkillItem>) => void;
  skill: SkillItem;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const readOnly = skill.source === "default";
  const previewing = activeTab === "preview";

  function applyFormat(command: MarkdownCommand) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const formatted = formatMarkdownSelection(command, selectedText);
    textarea.setRangeText(formatted, selectionStart, selectionEnd, "select");
    onUpdate({ content: textarea.value });
    requestAnimationFrame(() => textarea.focus());
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Button onClick={onBack} size="sm" variant="ghost">
            Back
          </Button>
          <div className="mt-2 flex items-start gap-3">
            <SkillIconTile
              className="size-10 rounded-xl [&>span]:size-8"
              icon={skill.icon}
              seed={`skill-${skill.id}-${skill.name}`}
            />
            <div className="grid min-w-0 max-w-xl flex-1 gap-2">
              {previewing || readOnly ? (
                <div className="min-w-0 py-0.5">
                  <h1 className="truncate text-lg font-semibold leading-6">
                    {skill.name}
                  </h1>
                  <p className="mt-1 max-w-xl truncate text-sm leading-5 text-muted-foreground">
                    {skill.description}
                  </p>
                </div>
              ) : (
                <>
                  <Input
                    aria-label="Skill title"
                    className="text-lg font-semibold [&_input]:px-2 [&_input]:py-1"
                    onChange={(event) => onUpdate({ name: event.target.value })}
                    value={skill.name}
                  />
                  <Input
                    aria-label="Skill description"
                    className="[&_input]:px-2 [&_input]:py-1"
                    onChange={(event) =>
                      onUpdate({ description: event.target.value })
                    }
                    placeholder="Short description"
                    value={skill.description}
                  />
                </>
              )}
            </div>
          </div>
        </div>
        <Button disabled={readOnly} size="sm" variant="outline">
          <Icon icon={SaveIcon} />
          Save
        </Button>
      </div>

      <Tabs
        className="flex min-h-0 flex-1 flex-col"
        onValueChange={(value) => {
          if (readOnly && value === "edit") {
            return;
          }

          setActiveTab(value);
        }}
        value={activeTab}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/35 p-1">
          <MarkdownToolbar disabled={previewing || readOnly} onFormat={applyFormat} />
          <TabsList>
            <TabsTrigger value="preview">
              <Icon icon={EyeIcon} />
              Preview
            </TabsTrigger>
            <TabsTrigger disabled={readOnly} value="edit">
              <Icon icon={PencilEdit02Icon} />
              Edit
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent className="min-h-0 flex-1 pt-3" value="edit">
          <Textarea
            className="min-h-[calc(100svh-16rem)] [&_textarea]:min-h-[calc(100svh-16rem)]"
            onChange={(event) => onUpdate({ content: event.target.value })}
            ref={textareaRef}
            value={skill.content}
          />
        </TabsContent>
        <TabsContent className="min-h-0 flex-1 pt-3" value="preview">
          <MarkdownPreview content={skill.content} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type MarkdownCommand =
  | "bold"
  | "bullet"
  | "code"
  | "codeblock"
  | "heading"
  | "italic"
  | "link"
  | "numbered"
  | "quote";

function MarkdownToolbar({
  disabled = false,
  onFormat,
}: {
  disabled?: boolean;
  onFormat: (command: MarkdownCommand) => void;
}) {
  const tools = [
    { command: "heading", icon: Heading01Icon, label: "Heading" },
    { command: "bold", icon: TextBoldIcon, label: "Bold" },
    { command: "italic", icon: TextItalicIcon, label: "Italic" },
    { command: "quote", icon: QuoteUpIcon, label: "Quote" },
    { command: "bullet", icon: ListViewIcon, label: "Bullet list" },
    { command: "numbered", icon: TextNumberSignIcon, label: "Numbered list" },
    { command: "code", icon: CodeIcon, label: "Inline code" },
    { command: "codeblock", icon: SourceCodeIcon, label: "Code block" },
    { command: "link", icon: Link05Icon, label: "Link" },
  ] satisfies { command: MarkdownCommand; icon: IconSvgElement; label: string }[];

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tools.map((tool) => (
        <Tooltip key={tool.command}>
          <TooltipTrigger
            render={
              <button
                aria-label={tool.label}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none transition-[background-color,color,scale,opacity] duration-150 hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35"
                disabled={disabled}
                onClick={() => onFormat(tool.command)}
                type="button"
              />
            }
          >
            <Icon className="size-4" icon={tool.icon} />
          </TooltipTrigger>
          <TooltipPopup>{tool.label}</TooltipPopup>
        </Tooltip>
      ))}
    </div>
  );
}

function formatMarkdownSelection(command: MarkdownCommand, selectedText: string) {
  const fallback = selectedText || "text";
  const lines = fallback.split("\n");

  switch (command) {
    case "heading":
      return lines.map((line) => `## ${line.replace(/^#+\s*/, "")}`).join("\n");
    case "bold":
      return `**${fallback}**`;
    case "italic":
      return `*${fallback}*`;
    case "quote":
      return lines.map((line) => `> ${line}`).join("\n");
    case "bullet":
      return lines.map((line) => `- ${line.replace(/^[-*]\s*/, "")}`).join("\n");
    case "numbered":
      return lines
        .map((line, index) => `${index + 1}. ${line.replace(/^\d+\.\s*/, "")}`)
        .join("\n");
    case "code":
      return `\`${fallback}\``;
    case "codeblock":
      return `\`\`\`\n${fallback}\n\`\`\``;
    case "link":
      return `[${fallback}](https://)`;
  }
}

function MarkdownPreview({ content }: { content: string }) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="min-h-[calc(100svh-16rem)] rounded-xl border border-border bg-background p-5 text-sm leading-6 shadow-xs/5">
      <div className="mx-auto grid max-w-3xl gap-3">
        {blocks.map((block, index) => (
          <MarkdownBlock block={block} key={`${block.type}-${index}`} />
        ))}
      </div>
    </div>
  );
}

type MarkdownBlock =
  | { text: string; type: "blockquote" | "code" | "h1" | "h2" | "h3" | "p" }
  | { items: string[]; ordered: boolean; type: "list" };

function parseMarkdownBlocks(content: string) {
  const lines = content.split("\n");
  const blocks: MarkdownBlock[] = [];
  let codeLines: string[] = [];
  let inCode = false;
  let listItems: string[] = [];
  let listOrdered = false;

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({ items: listItems, ordered: listOrdered, type: "list" });
    listItems = [];
  }

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      if (inCode) {
        blocks.push({ text: codeLines.join("\n"), type: "code" });
        codeLines = [];
        inCode = false;
        return;
      }

      flushList();
      inCode = true;
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      flushList();
      return;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);

    if (orderedMatch || bulletMatch) {
      const nextOrdered = Boolean(orderedMatch);
      if (listItems.length > 0 && listOrdered !== nextOrdered) {
        flushList();
      }
      listOrdered = nextOrdered;
      listItems.push((orderedMatch?.[1] ?? bulletMatch?.[1] ?? "").trim());
      return;
    }

    flushList();

    if (line.startsWith("# ")) {
      blocks.push({ text: line.slice(2), type: "h1" });
    } else if (line.startsWith("## ")) {
      blocks.push({ text: line.slice(3), type: "h2" });
    } else if (line.startsWith("### ")) {
      blocks.push({ text: line.slice(4), type: "h3" });
    } else if (line.startsWith("> ")) {
      blocks.push({ text: line.slice(2), type: "blockquote" });
    } else {
      blocks.push({ text: line, type: "p" });
    }
  });

  if (inCode) {
    blocks.push({ text: codeLines.join("\n"), type: "code" });
  }
  flushList();

  return blocks.length > 0 ? blocks : [{ text: "Nothing to preview yet.", type: "p" } satisfies MarkdownBlock];
}

function MarkdownBlock({ block }: { block: MarkdownBlock }) {
  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag
        className={cn(
          "grid gap-1 pl-5 text-foreground",
          block.ordered ? "list-decimal" : "list-disc",
        )}
      >
        {block.items.map((item, index) => (
          <li key={`${item}-${index}`}>{renderSkillInlineMarkdown(item)}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "code") {
    return (
      <pre className="overflow-auto rounded-lg border border-border bg-muted p-3 text-xs leading-5">
        <code>{block.text}</code>
      </pre>
    );
  }

  if (block.type === "h1") {
    return <h1 className="text-xl font-semibold">{renderSkillInlineMarkdown(block.text)}</h1>;
  }

  if (block.type === "h2") {
    return <h2 className="text-base font-semibold">{renderSkillInlineMarkdown(block.text)}</h2>;
  }

  if (block.type === "h3") {
    return <h3 className="text-sm font-semibold">{renderSkillInlineMarkdown(block.text)}</h3>;
  }

  if (block.type === "blockquote") {
    return (
      <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
        {renderSkillInlineMarkdown(block.text)}
      </blockquote>
    );
  }

  return <p className="text-foreground">{renderSkillInlineMarkdown(block.text)}</p>;
}

function renderSkillInlineMarkdown(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
            key={index}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            className="text-info-foreground underline underline-offset-2"
            href={linkMatch[2]}
            key={index}
            rel="noreferrer"
            target="_blank"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return part;
    });
}

function BrainPage({}: {
  brain: DatabaseRecord | null;
  workspaceId: string | null;
}) {
  return (
    <>
      <PageHeader
        description={pageDescriptions.brain}
        title="Brain"
      />

      <BrainSoonState />
    </>
  );
}

function BrainSoonState() {
  return (
    <div className="grid min-h-[28rem] place-items-center rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center">
      <div className="mx-auto max-w-md">
        <IsometricBrainIllustration className="mx-auto h-48 w-full max-w-80 text-muted-foreground" />
        <Badge className="mt-1" variant="destructive">
          Soon
        </Badge>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          Brain is almost ready
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Build a private knowledge base and graph that your agents can search,
          reason over, and use with workspace permissions.
        </p>
      </div>
    </div>
  );
}

function IsometricBrainIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 320 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        opacity="0.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      >
        <path d="M40 154 160 84l120 70-120 70L40 154Z" opacity="0.36" />
        <path d="M78 151 160 104l82 47-82 47-82-47Z" />
        <path d="M78 151v16l82 47 82-47v-16" opacity="0.42" />
        <path d="M160 104v94" opacity="0.26" />
        <path d="M116 122 160 97l44 25-44 25-44-25Z" />
        <path d="M116 122v42l44 25 44-25v-42" />
        <path d="M160 147v42" />
        <path d="M132 133h56" opacity="0.55" />
        <path d="M140 145h40" opacity="0.55" />
        <path d="M145 157h30" opacity="0.55" />
        <path d="M70 106 104 86l34 20-34 20-34-20Z" />
        <path d="M70 106v27l34 20 34-20v-27" />
        <path d="M104 126v27" />
        <path d="M182 106 216 86l34 20-34 20-34-20Z" />
        <path d="M182 106v27l34 20 34-20v-27" />
        <path d="M216 126v27" />
        <path d="M126 117 148 105" opacity="0.48" />
        <path d="M194 117 172 105" opacity="0.48" />
        <path d="M104 153 139 172" opacity="0.48" />
        <path d="M216 153 181 172" opacity="0.48" />
        <path d="M92 72V54" opacity="0.5" />
        <path d="M228 72V54" opacity="0.5" />
        <path d="M134 75 160 60l26 15" opacity="0.5" />
        <path d="M160 60V33" opacity="0.5" />
        <path d="M142 26h36" />
        <path d="M150 18h20" />
        <path d="M60 182h50" opacity="0.28" />
        <path d="M210 182h50" opacity="0.28" />
        <path d="M110 203h100" opacity="0.22" />
      </g>
    </svg>
  );
}

function BuildKnowledgeBaseDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [fileNames, setFileNames] = useState<string[]>([]);

  function resetForm() {
    setFileNames([]);
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
      open={open}
    >
      <DialogPopup className="max-w-md rounded-xl">
        <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="gap-1 border-b border-border/70 px-4 py-3">
            <DialogTitle className="text-base leading-6">
              Build knowledge base/graph
            </DialogTitle>
            <DialogDescription className="text-xs leading-5">
              Upload any data that talks about your business and our model will
              build a knowledge base for you.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="grid gap-4 p-4" scrollFade={false}>
            <label className="grid min-h-36 cursor-pointer place-items-center rounded-xl border border-dashed border-border bg-muted/35 px-4 py-6 text-center transition-[background-color,border-color] hover:border-foreground/20 hover:bg-muted">
              <input
                className="hidden"
                multiple
                onChange={(event) =>
                  setFileNames(
                    Array.from(event.target.files ?? []).map(
                      (file) => file.name,
                    ),
                  )
                }
                type="file"
              />
              <span className="grid gap-2">
                <span className="mx-auto grid size-10 place-items-center rounded-lg bg-background text-muted-foreground shadow-xs/5">
                  <Icon icon={FileUploadIcon} />
                </span>
                <span className="text-sm font-medium">
                  {fileNames.length > 0
                    ? `${fileNames.length} file${fileNames.length === 1 ? "" : "s"} selected`
                    : "Upload business data"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Docs, markdown, PDFs, CSVs, exports, or notes.
                </span>
              </span>
            </label>
            {fileNames.length > 0 && (
              <div className="grid gap-1 rounded-lg border border-border/70 bg-muted/25 p-2">
                {fileNames.map((fileName) => (
                  <p
                    className="truncate text-xs text-muted-foreground"
                    key={fileName}
                  >
                    {fileName}
                  </p>
                ))}
              </div>
            )}
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button disabled={fileNames.length === 0}>Start build</Button>
          </DialogFooter>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

type UsagePeriod = "month" | "quarter" | "week";
type UsageScope = "my" | "workspace";

const usageChartBarClasses = [
  "border border-emerald-400/60 bg-emerald-400/20",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
] as const;

function UsagePage({
  usage,
  workspaceId,
}: {
  usage: UsageData | null;
  workspaceId: string | null;
}) {
  const [period, setPeriod] = useState<UsagePeriod>("month");
  const [scope, setScope] = useState<UsageScope>("my");
  const [liveUsage, setLiveUsage] = useState<UsageData | null>(usage);
  const [isRefreshingUsage, setIsRefreshingUsage] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(() =>
    new Date().toLocaleTimeString("en", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const currentUsage = liveUsage ?? usage;
  const tokenLimit = currentUsage?.tokenLimit ?? 0;
  const storageLimit = currentUsage?.storageLimit ?? 0;
  const agentLimit = currentUsage?.agentLimit ?? 0;
  const tokenPercent = tokenLimit > 0 ? Math.min(100, ((currentUsage?.tokens ?? 0) / tokenLimit) * 100) : 0;
  const storagePercent = storageLimit > 0 ? Math.min(100, ((currentUsage?.storage ?? 0) / storageLimit) * 100) : 0;
  const agentPercent = agentLimit > 0 ? Math.min(100, ((currentUsage?.automations ?? 0) / agentLimit) * 100) : 0;
  const metricRows = [
    { label: "Tokens", value: `${(currentUsage?.tokens ?? 0).toLocaleString()} / ${tokenLimit.toLocaleString()}` },
    { label: "Files", value: `${(currentUsage?.files ?? 0).toLocaleString()}` },
    { label: "Storage", value: `${currentUsage?.storage ?? 0}GB` },
    { label: "Automations", value: `${currentUsage?.automations ?? 0}` },
    { label: "Chats", value: `${currentUsage?.chats ?? 0}` },
  ];
  const resourceRows = [
    {
      limit: tokenLimit.toLocaleString(),
      limitValue: tokenLimit,
      percent: tokenPercent,
      resource: "Tokens",
      usage: (currentUsage?.tokens ?? 0).toLocaleString(),
      usageValue: currentUsage?.tokens ?? 0,
    },
    {
      limit: "No file upload limit set",
      limitValue: null,
      percent: 0,
      resource: "Files",
      usage: (currentUsage?.files ?? 0).toLocaleString(),
      usageValue: currentUsage?.files ?? 0,
    },
    {
      limit: storageLimit > 0 ? `${storageLimit.toLocaleString()} GB` : "No storage limit set",
      limitValue: storageLimit > 0 ? storageLimit : null,
      percent: storagePercent,
      resource: "Storage",
      usage: `${currentUsage?.storage ?? 0} GB`,
      usageValue: currentUsage?.storage ?? 0,
    },
    {
      limit: agentLimit > 0 ? `${agentLimit.toLocaleString()} agents` : "No agent limit set",
      limitValue: agentLimit > 0 ? agentLimit : null,
      percent: agentPercent,
      resource: "Workflow agents",
      usage: (currentUsage?.automations ?? 0).toLocaleString(),
      usageValue: currentUsage?.automations ?? 0,
    },
  ];
  const chartGroups = [
    {
      bars: [
        {
          className: usageChartBarClasses[0],
          detail: tokenLimit > 0
            ? `${(currentUsage?.tokens ?? 0).toLocaleString()} of ${tokenLimit.toLocaleString()} tokens`
            : `${(currentUsage?.tokens ?? 0).toLocaleString()} tokens used`,
          name: "Token usage",
          percent: tokenPercent,
          striped: true,
          value: Math.max(1, tokenPercent),
        },
        {
          className: usageChartBarClasses[1],
          detail: tokenLimit > 0
            ? `${Math.round(tokenPercent)}% of monthly limit`
            : "No token limit set",
          name: "Token limit share",
          percent: tokenPercent,
          value: Math.max(1, tokenPercent),
        },
      ],
      label: "Tokens",
    },
    {
      bars: [{
        className: usageChartBarClasses[2],
        detail: `${(currentUsage?.files ?? 0).toLocaleString()} uploaded files`,
        name: "Files",
        value: Math.max(1, currentUsage?.files ?? 0),
      }],
      label: "Files",
    },
    {
      bars: [{
        className: usageChartBarClasses[3],
        detail: agentLimit > 0
          ? `${(currentUsage?.automations ?? 0).toLocaleString()} of ${agentLimit.toLocaleString()} agents`
          : `${(currentUsage?.automations ?? 0).toLocaleString()} agents`,
        name: "Workflow agents",
        percent: agentPercent,
        value: Math.max(1, currentUsage?.automations ?? 0),
      }],
      label: "Automations",
    },
    {
      bars: [{
        className: usageChartBarClasses[4],
        detail: `${(currentUsage?.chats ?? 0).toLocaleString()} chats in this period`,
        name: "Chats",
        value: Math.max(1, currentUsage?.chats ?? 0),
      }],
      label: "Chats",
    },
  ];

  async function refreshUsage() {
    if (!workspaceId || isRefreshingUsage) {
      return;
    }

    setIsRefreshingUsage(true);
    try {
      const params = new URLSearchParams({ period, scope });
      const response = await fetch(
        `/api/workspaces/${workspaceId}/usage?${params.toString()}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Could not refresh usage"));
      }

      setLiveUsage(mapUsage(await response.json(), currentUsage?.chats ?? 0, currentUsage?.automations ?? 0));
      setRefreshedAt(
        new Date().toLocaleTimeString("en", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not refresh usage.");
    } finally {
      setIsRefreshingUsage(false);
    }
  }

  useEffect(() => {
    setLiveUsage(usage);
  }, [usage]);

  useEffect(() => {
    void refreshUsage();
  }, [period, scope, workspaceId]);

  return (
    <>
      <PageHeader
        description={pageDescriptions.usage}
        title="Usage and limits"
      />

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-normal">
            Usage overview
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Monitor real workspace usage, personal usage, and member limits.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UsageSelectMenu
            label="Usage scope"
            onValueChange={setScope}
            options={[
              ["my", "My usage"],
              ["workspace", "Workspace usage"],
            ]}
            value={scope}
          />
          <UsageSelectMenu
            label="Usage period"
            onValueChange={setPeriod}
            options={[
              ["month", "This month"],
              ["week", "This week"],
              ["quarter", "This quarter"],
            ]}
            value={period}
          />
          <Button
            className="active:scale-[0.96]"
            loading={isRefreshingUsage}
            onClick={() => void refreshUsage()}
            size="sm"
            variant="outline"
          >
            <Icon icon={ChartIcon} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {metricRows.map((metric) => (
          <UsageMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <UsageSnapshotCard chartGroups={chartGroups} refreshedAt={refreshedAt} scope={scope} />
      <UsageResourcesTable resources={resourceRows} />
      <PerUserLimitsCard
        onLimitsSaved={refreshUsage}
        userLimits={currentUsage?.userLimits ?? []}
        workspaceId={workspaceId}
      />
    </>
  );
}

function UsageSelectMenu<TValue extends string>({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string;
  onValueChange: (value: TValue) => void;
  options: [TValue, string][];
  value: TValue;
}) {
  const currentLabel =
    options.find(([optionValue]) => optionValue === value)?.[1] ?? label;

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            aria-label={label}
            className="min-w-36 justify-between active:scale-[0.96]"
            size="sm"
            variant="outline"
          >
            {currentLabel}
            <Icon className="opacity-70" icon={ChevronDownIcon} />
          </Button>
        }
      />
      <MenuPopup align="end" className="min-w-44" sideOffset={8}>
        {options.map(([optionValue, optionLabel]) => (
          <MenuItem
            key={optionValue}
            onClick={() => onValueChange(optionValue)}
          >
            <Icon
              className={cn(
                optionValue === value ? "opacity-100" : "opacity-0",
              )}
              icon={CheckIcon}
            />
            {optionLabel}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}

function UsageMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-xl shadow-xs/5">
      <CardHeader className="gap-3 p-3">
        <CardDescription className="text-xs font-medium">
          {label}
        </CardDescription>
        <p className="whitespace-pre-line text-2xl font-semibold leading-8 tracking-normal text-foreground tabular-nums">
          {value.replace(" / ", " /\n")}
        </p>
      </CardHeader>
    </Card>
  );
}

function UsageSnapshotCard({
  chartGroups,
  refreshedAt,
  scope,
}: {
  chartGroups: {
    bars: {
      className: string;
      detail: string;
      name: string;
      percent?: number;
      striped?: boolean;
      value: number;
    }[];
    label: string;
  }[];
  refreshedAt: string;
  scope: UsageScope;
}) {
  return (
    <CardFrame className="mt-4 overflow-hidden">
      <CardFrameHeader>
        <CardFrameTitle>
          <span className="inline-flex items-center gap-2">
            Usage snapshot
            <Badge variant="info">
              {scope === "workspace" ? "Workspace usage" : "My usage"}
            </Badge>
          </span>
        </CardFrameTitle>
        <CardFrameDescription>
          Live counts for this month. Last refreshed {refreshedAt}.
        </CardFrameDescription>
      </CardFrameHeader>
      <Card className="rounded-xl shadow-none before:hidden">
        <CardPanel className="p-4">
          <div className="flex min-h-80 items-stretch justify-around gap-6">
            {chartGroups.map((group) => (
              <div
                className="flex min-h-80 min-w-24 flex-1 flex-col gap-3"
                key={group.label}
              >
                <p className="text-center text-xs font-semibold text-foreground">
                  {group.label}
                </p>
                <div className="flex min-h-64 flex-1 items-end justify-center gap-2">
                  {group.bars.map((bar, index) => (
                    <div
                      className="flex h-full min-w-16 flex-col items-center justify-end gap-2"
                      key={`${group.label}-${index}`}
                    >
                      <p className="min-h-8 max-w-24 text-center text-[0.68rem] font-medium leading-4 text-muted-foreground">
                        {bar.name}
                      </p>
                      <div className="flex h-52 items-end">
                        <UsageSnapshotBar
                          bar={bar}
                          groupLabel={group.label}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs font-medium text-muted-foreground">
                  {group.label}
                </p>
              </div>
            ))}
          </div>
        </CardPanel>
      </Card>
    </CardFrame>
  );
}

function UsageSnapshotBar({
  bar,
  groupLabel,
}: {
  bar: {
    className: string;
    detail: string;
    name: string;
    percent?: number;
    striped?: boolean;
    value: number;
  };
  groupLabel: string;
}) {
  const percentLabel =
    typeof bar.percent === "number" ? `${Math.round(bar.percent)}%` : null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            aria-label={`${groupLabel}: ${bar.detail}`}
            className={cn(
              "w-16 min-w-1 rounded-t-md outline-none transition-[height,opacity,scale,box-shadow] hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]",
              bar.className,
            )}
            style={{
              backgroundImage: bar.striped
                ? "repeating-linear-gradient(135deg, rgba(14, 165, 233, 0.34) 0, rgba(14, 165, 233, 0.34) 2px, transparent 2px, transparent 6px)"
                : undefined,
              height: `${Math.max(bar.value, 1)}%`,
            }}
            type="button"
          />
        }
      />
      <TooltipPopup className="max-w-56">
        <div className="grid gap-1">
          <p className="font-medium text-foreground">{bar.name}</p>
          <p className="text-muted-foreground">{bar.detail}</p>
          {percentLabel ? (
            <p className="text-muted-foreground">{percentLabel}</p>
          ) : null}
        </div>
      </TooltipPopup>
    </Tooltip>
  );
}

function UsageResourcesTable({
  resources,
}: {
  resources: {
    limit: string;
    limitValue: number | null;
    percent: number;
    resource: string;
    usage: string;
    usageValue: number;
  }[];
}) {
  return (
    <CardFrame className="mt-3 min-h-[22rem] overflow-hidden">
      <CardFrameHeader>
        <CardFrameTitle>Resource limits</CardFrameTitle>
        <CardFrameDescription>
          Track workspace consumption against current caps.
        </CardFrameDescription>
      </CardFrameHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Limit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => {
            const limitValue = resource.limitValue;
            const hasLimit = typeof limitValue === "number" && limitValue > 0;
            const exceeded = hasLimit && resource.usageValue > limitValue;

            return (
              <TableRow key={resource.resource}>
                <TableCell className="font-medium">{resource.resource}</TableCell>
                <TableCell>
                  <div className="max-w-80">
                    <span className="tabular-nums text-muted-foreground">
                      {resource.usage}
                    </span>
                    <UsageProgressBar
                      exceeded={exceeded}
                      percent={resource.percent}
                    />
                  </div>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {resource.limit}
                </TableCell>
                <TableCell>
                  {hasLimit ? (
                    <Badge variant={exceeded ? "destructive" : "success"}>
                      {exceeded ? "Exceeded limit" : "Within limit"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No limit</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </CardFrame>
  );
}

function UsageProgressBar({
  exceeded = false,
  percent,
}: {
  exceeded?: boolean;
  percent: number;
}) {
  return (
    <Progress className="mt-2" max={100} value={percent}>
      <ProgressTrack>
        <ProgressIndicator
          className={cn(
            "h-full rounded-full",
            exceeded ? "bg-destructive" : "bg-sky-500",
          )}
          style={{ width: `${Math.max(percent, 1)}%` }}
        />
      </ProgressTrack>
    </Progress>
  );
}

function PerUserLimitsCard({
  onLimitsSaved,
  userLimits,
  workspaceId,
}: {
  onLimitsSaved: () => void | Promise<void>;
  userLimits: DatabaseRecord[];
  workspaceId: string | null;
}) {
  const [draftCaps, setDraftCaps] = useState<Record<string, string>>({});
  const [savingLimits, setSavingLimits] = useState(false);

  useEffect(() => {
    setDraftCaps(
      Object.fromEntries(
        userLimits.map((limit) => {
          const userId = asString(limit.user_id);
          const cap = asNumber(limit.monthly_token_cap);
          return [userId, cap > 0 ? String(cap) : ""];
        }),
      ),
    );
  }, [userLimits]);

  const changedLimits = userLimits.filter((limit) => {
    const userId = asString(limit.user_id);
    const currentCap = asNumber(limit.monthly_token_cap);
    const draftCap = draftCaps[userId] ?? "";
    return draftCap !== (currentCap > 0 ? String(currentCap) : "");
  });
  const limitsChanged = changedLimits.length > 0;
  const maxSliderCap = Math.max(
    50000,
    ...userLimits.flatMap((limit) => [
      asNumber(limit.monthly_token_cap),
      asNumber(limit.tokens_used),
    ]),
  );

  async function saveLimits() {
    if (!workspaceId || !limitsChanged || savingLimits) {
      return;
    }

    setSavingLimits(true);
    try {
      await Promise.all(
        changedLimits.map(async (limit) => {
          const userId = asString(limit.user_id);
          const response = await fetch(`/api/workspaces/${workspaceId}/usage`, {
            body: JSON.stringify({
              monthlyTokenCap: draftCaps[userId] ?? "",
              userId,
            }),
            headers: { "Content-Type": "application/json" },
            method: "PATCH",
          });

          if (!response.ok) {
            throw new Error(await getResponseError(response, "Could not save usage limit"));
          }
        }),
      );
      await onLimitsSaved();
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not save limits.");
    } finally {
      setSavingLimits(false);
    }
  }

  return (
    <CardFrame className="mt-3 min-h-[34rem] overflow-hidden">
      <CardFrameHeader>
        <CardFrameTitle>Per-user limits</CardFrameTitle>
        <CardFrameDescription>
          Empty values inherit the workspace token cap.
        </CardFrameDescription>
        <CardFrameAction>
          <Button
            className="active:scale-[0.96]"
            disabled={!limitsChanged}
            loading={savingLimits}
            onClick={() => void saveLimits()}
            size="sm"
          >
            <Icon icon={SaveIcon} />
            Save limits
          </Button>
        </CardFrameAction>
      </CardFrameHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Tokens used</TableHead>
            <TableHead>Files</TableHead>
            <TableHead>Storage</TableHead>
            <TableHead className="text-right">Monthly token cap</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userLimits.map((limit) => {
            const profile = getRecordByKey(limit, "profiles");
            const name = asString(profile.full_name, asString(profile.email, "User"));
            const avatarUrl = asString(profile.avatar_url);
            const monthlyCap = asNumber(limit.monthly_token_cap);
            const tokensUsed = asNumber(limit.tokens_used);
            const filesUsed = asNumber(limit.files_used);
            const storageGb = asNumber(limit.storage_gb);

            return (
              <TableRow key={asString(limit.user_id, name)}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <AvatarTile
                      className="size-9 rounded-lg bg-muted/50 text-xs shadow-none"
                      initials={getInitialsFromText(name)}
                      src={avatarUrl}
                    />
                    <div>
                      <p className="font-medium leading-none">{name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {asString(profile.email)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="info">{asString(limit.role, "Member")}</Badge>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {tokensUsed.toLocaleString()}
                  {monthlyCap > 0 ? ` / ${monthlyCap.toLocaleString()}` : ""}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {filesUsed.toLocaleString()}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {storageGb.toLocaleString()} GB
                </TableCell>
                <TableCell className="text-right">
                  <UserTokenLimitSlider
                    max={maxSliderCap}
                    onChange={(value) =>
                      setDraftCaps((current) => ({
                        ...current,
                        [asString(limit.user_id)]: value,
                      }))
                    }
                    tokensUsed={tokensUsed}
                    value={draftCaps[asString(limit.user_id)] ?? ""}
                  />
                </TableCell>
              </TableRow>
            );
          })}
          {userLimits.length === 0 ? (
            <TableRow>
              <TableCell
                className="py-8 text-center text-muted-foreground"
                colSpan={6}
              >
                No workspace members found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </CardFrame>
  );
}

function UserTokenLimitSlider({
  max,
  onChange,
  tokensUsed,
  value,
}: {
  max: number;
  onChange: (value: string) => void;
  tokensUsed: number;
  value: string;
}) {
  const parsedValue = Number.parseInt(value, 10);
  const sliderMax = Math.max(max, parsedValue || 0, tokensUsed, 50000);
  const sliderValue = Number.isFinite(parsedValue) && parsedValue > 0
    ? Math.min(parsedValue, sliderMax)
    : 0;
  const exceeded = sliderValue > 0 && tokensUsed > sliderValue;

  return (
    <div className="ml-auto grid w-72 max-w-full gap-2 text-left">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-xs tabular-nums",
            exceeded ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {sliderValue > 0 ? `${sliderValue.toLocaleString()} tokens` : "Workspace default"}
        </span>
        {exceeded ? (
          <Badge size="sm" variant="destructive">
            Exceeded
          </Badge>
        ) : null}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-2">
        <Slider
          aria-label="Monthly token cap"
          max={sliderMax}
          min={0}
          onValueChange={(nextValue) => {
            const next = Array.isArray(nextValue) ? nextValue[0] : nextValue;
            onChange(next && next > 0 ? String(Math.round(next)) : "");
          }}
          step={1000}
          value={[sliderValue]}
        />
        <Input
          aria-label="Monthly token cap value"
          className="h-8 text-xs tabular-nums"
          min="0"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Default"
          size="sm"
          type="number"
          value={value}
        />
      </div>
    </div>
  );
}

function ConnectorsPage({
  connectionsLoading,
  connectedConnectorKeys,
  connectors,
  onConnectedConnectorKeysChange,
  workspaceId,
}: {
  connectionsLoading: boolean;
  connectedConnectorKeys: string[];
  connectors: ConnectorItem[];
  onConnectedConnectorKeysChange: React.Dispatch<React.SetStateAction<string[]>>;
  workspaceId: string | null;
}) {
  const [connectorFilter, setConnectorFilter] =
    useState<ConnectorFilter>("all");
  const [connectorSearch, setConnectorSearch] = useState("");
  const [connectorActionKey, setConnectorActionKey] = useState<string | null>(
    null,
  );
  const [selectedConnectorName, setSelectedConnectorName] = useState<
    string | null
  >(null);
  const selectedConnector =
    connectors.find((connector) => connector.name === selectedConnectorName) ??
    null;
  const visibleConnectors = connectors.filter((connector) => {
    const matchesSearch =
      connector.name.toLowerCase().includes(connectorSearch.toLowerCase()) ||
      connector.description
        .toLowerCase()
        .includes(connectorSearch.toLowerCase()) ||
      connector.category.toLowerCase().includes(connectorSearch.toLowerCase());
    const connected = connectedConnectorKeys.includes(connector.key ?? connector.name);
    const matchesFilter =
      connectorFilter === "all" ||
      (connectorFilter === "connected" && connected) ||
      (connectorFilter === "available" && !connected);

    return matchesSearch && matchesFilter;
  });

  async function toggleConnector(connector: ConnectorItem) {
    const connectorKey = connector.key ?? connector.name;
    const currentlyConnected = connectedConnectorKeys.includes(connectorKey);

    if (!workspaceId) {
      return;
    }

    setConnectorActionKey(connectorKey);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/connectors`, {
        body: JSON.stringify({
          action: currentlyConnected ? "disconnect" : "connect",
          appKey: connectorKey,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Connector update failed"));
      }

      const payload = asRecord(await response.json());
      const redirectUrl = asString(payload.redirectUrl);

      if (!currentlyConnected && redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      onConnectedConnectorKeysChange((current) =>
        currentlyConnected
          ? current.filter((key) => key !== connectorKey)
          : current.includes(connectorKey)
            ? current
            : [...current, connectorKey],
      );
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Connector update failed",
      );
    } finally {
      setConnectorActionKey(null);
    }
  }

  if (selectedConnector) {
    return (
      <ConnectorProfilePage
        connected={connectedConnectorKeys.includes(
          selectedConnector.key ?? selectedConnector.name,
        )}
        connector={selectedConnector}
        busy={
          connectionsLoading ||
          connectorActionKey === (selectedConnector.key ?? selectedConnector.name)
        }
        connectionsLoading={connectionsLoading}
        onBack={() => setSelectedConnectorName(null)}
        onToggleConnect={() => toggleConnector(selectedConnector)}
      />
    );
  }

  return (
    <>
      <PageHeader
        description={pageDescriptions.connectors}
        title="Connectors"
      />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Group className="h-9 w-full sm:h-8 sm:w-auto">
          <Input
            aria-label="Search connectors"
            className="h-full w-full sm:w-72 [&_[data-slot=input]]:h-full [&_[data-slot=input]]:leading-none sm:[&_[data-slot=input]]:h-full"
            onChange={(event) => setConnectorSearch(event.target.value)}
            placeholder="Search connectors..."
            value={connectorSearch}
          />
          <GroupSeparator />
          <ConnectorFilterMenu
            filter={connectorFilter}
            onFilterChange={setConnectorFilter}
          />
        </Group>
        <span className="text-xs text-muted-foreground">
          {visibleConnectors.length} of {connectors.length} apps
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleConnectors.map((connector) => {
          const connected = connectedConnectorKeys.includes(
            connector.key ?? connector.name,
          );

          return (
            <Card className="min-h-56 bg-background dark:bg-background" key={connector.name}>
              <CardHeader className="flex-1 p-4">
                <div className="flex size-11 items-center justify-center rounded-xl border border-black/8 bg-white p-2 text-sm font-semibold text-stone-900 shadow-xs/5 dark:border-white/10">
                  <ConnectorLogo connector={connector} />
                </div>
                <CardTitle>{connector.name}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {connector.description}
                </CardDescription>
              </CardHeader>
              <CardPanel className="mt-auto flex-none p-4 pt-0">
                <Button
                  className="w-full active:scale-[0.96]"
                  disabled={connectionsLoading}
                  onClick={() => setSelectedConnectorName(connector.name)}
                  size="sm"
                  variant={connected ? "secondary" : "default"}
                >
                  {connectionsLoading ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <Icon icon={PlugIcon} />
                  )}
                  {connectionsLoading ? "Loading" : connected ? "Manage" : "Connect"}
                </Button>
              </CardPanel>
            </Card>
          );
        })}
      </div>
    </>
  );
}

type ConnectorFilter = "all" | "available" | "connected";

function ConnectorFilterMenu({
  filter,
  onFilterChange,
}: {
  filter: ConnectorFilter;
  onFilterChange: (filter: ConnectorFilter) => void;
}) {
  const labels = {
    all: "All apps",
    available: "Available",
    connected: "Connected",
  } satisfies Record<ConnectorFilter, string>;

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            className="h-full min-w-36 justify-between sm:h-full"
            variant="outline"
          >
            {labels[filter]}
            <Icon className="opacity-70" icon={ChevronDownIcon} />
          </Button>
        }
      />
      <MenuPopup align="end" className="min-w-40" sideOffset={8}>
        {(["all", "available", "connected"] satisfies ConnectorFilter[]).map(
          (value) => (
            <MenuItem key={value} onClick={() => onFilterChange(value)}>
              <Icon
                className={cn(filter === value ? "opacity-100" : "opacity-0")}
                icon={CheckIcon}
              />
              {labels[value]}
            </MenuItem>
          ),
        )}
      </MenuPopup>
    </Menu>
  );
}

function ConnectorProfilePage({
  busy,
  connectionsLoading,
  connected,
  connector,
  onBack,
  onToggleConnect,
}: {
  busy: boolean;
  connectionsLoading: boolean;
  connected: boolean;
  connector: ConnectorItem;
  onBack: () => void;
  onToggleConnect: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <Button onClick={onBack} size="sm" variant="ghost">
          Back
        </Button>
      </div>
      <Card className="overflow-hidden rounded-2xl">
        <div
          className={cn(
            "border-b border-border/70 bg-linear-to-br p-5",
            connector.gradient,
          )}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white p-4 text-xl font-semibold text-stone-900 shadow-xs/5 ring-1 ring-black/10 dark:ring-white/10">
                <ConnectorLogo connector={connector} />
              </div>
              <div className="min-w-0">
                <Badge variant={connected ? "success" : "outline"}>
                  {connected ? "Connected" : connector.category}
                </Badge>
                <h1 className="mt-2 truncate text-2xl font-semibold tracking-normal">
                  {connector.name}
                </h1>
                <p className="mt-1 max-w-xl text-pretty text-sm leading-6 text-muted-foreground">
                  {connector.description}
                </p>
              </div>
            </div>
            <Button
              className="active:scale-[0.96]"
              disabled={busy}
              onClick={onToggleConnect}
              size="sm"
              variant={connected ? "secondary" : "default"}
            >
              {busy ? (
                <Spinner className="size-3.5" />
              ) : (
                <Icon icon={PlugIcon} />
              )}
              {connectionsLoading
                ? "Loading"
                : busy
                  ? "Working..."
                  : connected
                    ? "Disconnect"
                    : "Connect"}
            </Button>
          </div>
        </div>
        <CardPanel className="grid gap-4 p-5">
          <p className="max-w-3xl text-pretty text-sm leading-6 text-muted-foreground">
            {connector.paragraph}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["Access", "Read workspace context"],
              ["Use in chats", "Mention with @"],
              ["Agents", "Available in workflows"],
            ].map(([label, value]) => (
              <div
                className="rounded-xl border border-border/70 bg-muted/25 p-3"
                key={label}
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}

const roleTitleOptions = [
  "Founder",
  "Product builder",
  "Operations",
  "Engineer",
  "Designer",
  "Sales",
  "Support",
  "Member",
];

const workspaceRoleOptions = ["owner", "admin", "member", "viewer"];

const timezoneOptions = [
  "Asia/Amman",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Singapore",
];

function AvatarTile({
  className,
  initials,
  seed,
  src,
}: {
  className?: string;
  initials: string;
  seed?: string;
  src?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className={cn(
        "relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-background text-2xl font-semibold shadow-xs/5",
        className,
      )}
    >
      {src && !failed ? (
        <Image
          alt=""
          className="object-cover object-center"
          fill
          onError={() => setFailed(true)}
          src={src}
          unoptimized
        />
      ) : (
        <>
          <OreoFlareAvatar
            className="absolute inset-0 size-full"
            seed={seed ?? initials}
          />
          <span className="relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
            {initials}
          </span>
        </>
      )}
    </div>
  );
}

async function fileToAvatarDataUrl(file: File) {
  const maxInlineAvatarBytes = 2 * 1024 * 1024;

  if (!file.type.startsWith("image/")) {
    throw new Error("Avatar must be an image file.");
  }

  if (file.size > maxInlineAvatarBytes) {
    throw new Error("Avatar image must be 2MB or smaller.");
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read avatar image."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

async function uploadAvatarFile({
  file,
  target,
  workspaceId,
}: {
  file: File;
  target: "profile" | "workspace";
  workspaceId?: string;
}) {
  const avatarUrl = await fileToAvatarDataUrl(file);
  const response =
    target === "workspace"
      ? await fetch(`/api/workspaces/${workspaceId}`, {
          body: JSON.stringify({ workspace: { avatarUrl } }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        })
      : await fetch("/api/profile", {
          body: JSON.stringify({ profile: { avatarUrl } }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        });

  if (!response.ok) {
    const payload = asRecord(await response.json().catch(() => ({})));
    throw new Error(asString(payload.error, "Avatar upload failed"));
  }

  return asRecord(await response.json());
}

function SettingsPage({
  agentsCount,
  connectorsCount,
  connectedConnectors,
  ctaAccentPreference,
  members,
  onCtaAccentPreferenceChange,
  onProfileChange,
  onWorkspaceChange,
  onWorkspaceSettingsChange,
  profile,
  subscription,
  workspace,
  workspaceSettings,
}: {
  agentsCount: number;
  connectorsCount: number;
  connectedConnectors: ConnectorItem[];
  ctaAccentPreference: CtaAccentPreference;
  members: WorkspaceUser[];
  onCtaAccentPreferenceChange: (preference: CtaAccentPreference) => void;
  onProfileChange: (profile: DatabaseRecord | null) => void;
  onWorkspaceChange: (workspace: WorkspaceSummary | null) => void;
  onWorkspaceSettingsChange: (settings: DatabaseRecord | null) => void;
  profile: DatabaseRecord | null;
  subscription: DatabaseRecord | null;
  workspace: WorkspaceSummary | null;
  workspaceSettings: DatabaseRecord | null;
}) {
  return (
    <>
      <PageHeader description={pageDescriptions.settings} title="Settings" />
      <Tabs className="gap-4" defaultValue="profile">
        <TabsList
          className="w-full max-w-full flex-nowrap justify-start gap-x-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          variant="underline"
        >
          {settingsTabs.map((tab) => (
            <TabsTrigger
              className="h-8 px-1.5 text-sm"
              disabled={tab.value === "refer"}
              key={tab.value}
              onClick={(event) => {
                if (tab.value === "docs") {
                  event.preventDefault();
                  window.open(
                    "https://docs.atmetai.com",
                    "_blank",
                    "noopener,noreferrer",
                  );
                }

                if (tab.value === "support") {
                  event.preventDefault();
                  window.location.href = "mailto:team@atmetai.com";
                }
              }}
              value={tab.value}
            >
              <Icon icon={tab.icon} />
              {tab.label}
              {tab.value === "refer" && (
                <Badge className="ml-1" size="sm" variant="outline">
                  Soon
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="profile">
          <SettingsProfileTab
            key={asString(profile?.id, "profile")}
            onProfileChange={onProfileChange}
            profile={profile}
            workspace={workspace}
          />
        </TabsContent>
        <TabsContent value="workspace">
          <SettingsWorkspaceTab
            agentsCount={agentsCount}
            connectorsCount={connectorsCount}
            key={workspace?.id ?? "workspace"}
            members={members}
            onWorkspaceChange={onWorkspaceChange}
            workspace={workspace}
          />
        </TabsContent>
        <TabsContent value="general">
          <SettingsGeneralTab
            ctaAccentPreference={ctaAccentPreference}
            onCtaAccentPreferenceChange={onCtaAccentPreferenceChange}
            onWorkspaceSettingsChange={onWorkspaceSettingsChange}
            workspaceId={workspace?.id ?? null}
            workspaceSettings={workspaceSettings}
          />
        </TabsContent>
        <TabsContent value="data">
          <SettingsDataControlsTab connectors={connectedConnectors} />
        </TabsContent>
        <TabsContent value="billing">
          <SettingsBillingTab subscription={subscription} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function SettingsProfileTab({
  onProfileChange,
  profile,
  workspace,
}: {
  onProfileChange: (profile: DatabaseRecord | null) => void;
  profile: DatabaseRecord | null;
  workspace: WorkspaceSummary | null;
}) {
  const displayName = asString(profile?.full_name, "User");
  const email = asString(profile?.email);
  const initials = getInitialsFromText(displayName || email);
  const initialValues = {
    bio: asString(profile?.bio),
    displayName,
    email,
    phoneNumber: asString(profile?.phone_number),
    roleTitle: asString(profile?.role_title, "Product builder"),
  };
  const [savedValues, setSavedValues] = useState(initialValues);
  const [values, setValues] = useState(initialValues);
  const [avatarUrl, setAvatarUrl] = useState(asString(profile?.avatar_url));
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);
  const profileDirty =
    values.bio !== savedValues.bio ||
    values.displayName !== savedValues.displayName ||
    values.phoneNumber !== savedValues.phoneNumber ||
    values.roleTitle !== savedValues.roleTitle;

  useEffect(() => {
    setSavedValues(initialValues);
    setValues(initialValues);
    setAvatarUrl(asString(profile?.avatar_url));
  }, [
    profile?.avatar_url,
    profile?.bio,
    profile?.email,
    profile?.full_name,
    profile?.phone_number,
    profile?.role_title,
  ]);

  function updateProfileValue(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleProfileAvatarUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setUploadingAvatar(true);
    try {
      const payload = await uploadAvatarFile({ file, target: "profile" });
      const nextProfile = asRecord(payload.profile);
      setAvatarUrl(asString(nextProfile.avatar_url, avatarUrl));
      onProfileChange(nextProfile);
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
      if (profileAvatarInputRef.current) {
        profileAvatarInputRef.current.value = "";
      }
    }
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        body: JSON.stringify({
          profile: {
            bio: values.bio,
            fullName: values.displayName,
            phoneNumber: values.phoneNumber,
            roleTitle: values.roleTitle,
          },
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        const payload = asRecord(await response.json().catch(() => ({})));
        throw new Error(asString(payload.error, "Could not save profile"));
      }

      const payload = asRecord(await response.json());
      const nextProfile = asRecord(payload.profile);
      onProfileChange(nextProfile);
      setSavedValues(values);
      setAvatarUrl(asString(nextProfile.avatar_url, avatarUrl));
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="grid gap-4 pb-6">
      <Frame className="bg-muted/60">
        <FramePanel className="overflow-hidden p-0">
          <div className="grid divide-y divide-border/70 lg:grid-cols-[minmax(0,1fr)_18rem] lg:divide-x lg:divide-y-0">
            <div className="grid gap-x-3 gap-y-2.5 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Avatar</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <AvatarTile initials={initials} src={avatarUrl} />
                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          void handleProfileAvatarUpload(event.target.files?.[0])
                        }
                        ref={profileAvatarInputRef}
                        type="file"
                      />
                      <Button
                        loading={uploadingAvatar}
                        onClick={() => profileAvatarInputRef.current?.click()}
                        size="sm"
                        variant="outline"
                      >
                        Upload photo
                      </Button>
                      <Badge variant="success">Verified</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used in chats, workflow handoffs, and workspace activity.
                    </p>
                  </div>
                </div>
              </div>
              <SettingsProfileField
                label="Display name"
                onChange={(event) =>
                  updateProfileValue("displayName", event.target.value)
                }
                value={values.displayName}
              />
              <SettingsProfileField
                label="Email"
                readOnly
                value={values.email}
              />
              <div className="grid gap-1.5">
                <Label>Role</Label>
                <Select
                  onValueChange={(value) =>
                    updateProfileValue("roleTitle", value ?? "")
                  }
                  value={values.roleTitle}
                >
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectPopup>
                    {roleTitleOptions.map((roleTitle) => (
                      <SelectItem key={roleTitle} value={roleTitle}>
                        {roleTitle}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </div>
              <SettingsProfileField
                label="Phone number"
                onChange={(event) =>
                  updateProfileValue("phoneNumber", event.target.value)
                }
                placeholder="+962 79 000 0000"
                value={values.phoneNumber}
              />
              <div className="sm:col-span-2">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea
                  className="mt-1.5"
                  id="profile-bio"
                  onChange={(event) => updateProfileValue("bio", event.target.value)}
                  size="sm"
                  value={values.bio}
                />
              </div>
              <div className="flex justify-end sm:col-span-2">
                <Button
                  loading={savingProfile}
                  disabled={!profileDirty}
                  onClick={saveProfile}
                  size="sm"
                >
                  Save changes
                </Button>
              </div>
            </div>

            <div className="grid content-start gap-3 p-4">
              <SettingsProfileInsight
                label="Last active"
                value={formatDateTimeLabel(profile?.last_seen_at) || "Not recorded"}
              />
              <SettingsProfileInsight
                label="Default workspace"
                value={workspace?.name ?? "No workspace"}
              />
              <SettingsProfileInsight
                label="Member since"
                value={formatDateLabel(profile?.created_at) || "Not recorded"}
              />
              <SettingsProfileInsight label="Session status" value="Protected" />
            </div>
          </div>
        </FramePanel>
      </Frame>

      <SettingsSection
        description="Send a secure reset link to the account email."
        icon={ShieldCheck}
        title="Reset password"
      >
        <SettingsRow
          description={`We will send reset instructions to ${email || "the account email"}.`}
          title="Password reset"
        >
          <SettingsResetPasswordButton email={email} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function SettingsResetPasswordButton({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function sendResetLink() {
    if (!email) {
      setMessage("This account does not have an email address yet.");
      return;
    }

    setSending(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = asRecord(await response.json().catch(() => ({})));

      if (!response.ok) {
        throw new Error(asString(payload.error, "Could not send reset link"));
      }

      setMessage("Reset link sent. Check your email inbox.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send reset link");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        Send reset link
      </Button>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send password reset</DialogTitle>
          <DialogDescription>
            A password reset link will be sent to {email || "the account email"}.
          </DialogDescription>
        </DialogHeader>
        {message && (
          <DialogPanel className="text-sm text-muted-foreground" scrollFade={false}>
            {message}
          </DialogPanel>
        )}
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Close
          </DialogClose>
          <Button loading={sending} disabled={!email} onClick={sendResetLink} type="button">
            Send link
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function SettingsProfileField({
  label,
  onChange,
  placeholder,
  readOnly = false,
  value,
}: {
  label: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
}) {
  const id = `profile-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        size="sm"
        value={value}
      />
    </div>
  );
}

function SettingsProfileInsight({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/35 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function SettingsWorkspaceTab({
  agentsCount,
  connectorsCount,
  members,
  onWorkspaceChange,
  workspace,
}: {
  agentsCount: number;
  connectorsCount: number;
  members: WorkspaceUser[];
  onWorkspaceChange: (workspace: WorkspaceSummary | null) => void;
  workspace: WorkspaceSummary | null;
}) {
  const workspaceName = workspace?.name ?? "Workspace";
  const workspaceSlug = workspace?.slug ?? "";
  const workspaceInitials = getInitialsFromText(workspaceName);
  const initialValues = {
    category: workspace?.category ?? "",
    name: workspaceName,
    slug: workspaceSlug,
  };
  const [savedValues, setSavedValues] = useState(initialValues);
  const [values, setValues] = useState(initialValues);
  const [avatarUrl, setAvatarUrl] = useState(workspace?.avatarUrl ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const workspaceAvatarInputRef = useRef<HTMLInputElement>(null);
  const workspaceDirty =
    values.category !== savedValues.category ||
    values.name !== savedValues.name ||
    values.slug !== savedValues.slug;

  useEffect(() => {
    setSavedValues(initialValues);
    setValues(initialValues);
    setAvatarUrl(workspace?.avatarUrl ?? "");
  }, [workspace?.avatarUrl, workspace?.category, workspace?.name, workspace?.slug]);

  function updateWorkspaceValue(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleWorkspaceAvatarUpload(file: File | undefined) {
    if (!file || !workspace?.id) {
      return;
    }

    setUploadingAvatar(true);
    try {
      const payload = await uploadAvatarFile({
        file,
        target: "workspace",
        workspaceId: workspace.id,
      });
      const nextWorkspace = mapWorkspace(payload.workspace);
      if (nextWorkspace) {
        setAvatarUrl(nextWorkspace.avatarUrl ?? "");
        onWorkspaceChange(nextWorkspace);
      }
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
      if (workspaceAvatarInputRef.current) {
        workspaceAvatarInputRef.current.value = "";
      }
    }
  }

  async function saveWorkspace() {
    if (!workspace?.id) {
      return;
    }

    setSavingWorkspace(true);
    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        body: JSON.stringify({
          workspace: {
            category: values.category,
            name: values.name,
            slug: values.slug,
          },
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        const payload = asRecord(await response.json().catch(() => ({})));
        throw new Error(asString(payload.error, "Could not save workspace"));
      }

      const payload = asRecord(await response.json());
      const nextWorkspace = mapWorkspace(payload.workspace);
      if (nextWorkspace) {
        onWorkspaceChange(nextWorkspace);
        setSavedValues({
          category: nextWorkspace.category ?? "",
          name: nextWorkspace.name,
          slug: nextWorkspace.slug,
        });
        setAvatarUrl(nextWorkspace.avatarUrl ?? avatarUrl);
      }
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not save workspace");
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function inviteWorkspaceUser(email: string) {
    if (!workspace?.id) {
      return;
    }

    const response = await fetch(`/api/workspaces/${workspace.id}/members`, {
      body: JSON.stringify({ email, role: "member" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const payload = asRecord(await response.json().catch(() => ({})));
      throw new Error(asString(payload.error, "Could not send invite"));
    }
  }

  return (
    <div className="grid gap-4 pb-6">
      <Frame className="bg-muted/60">
        <FramePanel className="overflow-hidden p-0">
          <div className="relative border-b border-border/70">
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-28 bg-linear-to-br from-emerald-100 via-stone-50 to-sky-100 dark:from-emerald-950/35 dark:via-stone-950 dark:to-sky-950/35",
                "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] before:bg-[length:10px_10px] before:text-black/[0.045] dark:before:text-white/[0.055]",
              )}
            />
            <div className="relative flex flex-wrap items-end justify-between gap-4 px-5 pb-5 pt-14">
              <div className="flex min-w-0 items-end gap-4">
                <AvatarTile initials={workspaceInitials} src={avatarUrl} />
                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-semibold leading-7">
                      {values.name || workspaceName}
                    </h2>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    Workspace intelligence dashboard.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{members.length} members</Badge>
                    <Badge variant="outline">{agentsCount} workflow agents</Badge>
                    <Badge variant="outline">{connectorsCount} connectors</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    void handleWorkspaceAvatarUpload(event.target.files?.[0])
                  }
                  ref={workspaceAvatarInputRef}
                  type="file"
                />
                <Button
                  loading={uploadingAvatar}
                  disabled={!workspace?.id}
                  onClick={() => workspaceAvatarInputRef.current?.click()}
                  size="sm"
                  variant="outline"
                >
                  {workspace?.id ? "Upload avatar" : "No workspace"}
                </Button>
                <Button
                  loading={savingWorkspace}
                  disabled={!workspace?.id || !workspaceDirty}
                  onClick={saveWorkspace}
                  size="sm"
                >
                  Save workspace
                </Button>
              </div>
            </div>
          </div>

          <div className="grid divide-y divide-border/70 lg:grid-cols-[minmax(0,1fr)_18rem] lg:divide-x lg:divide-y-0">
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <SettingsWorkspaceField
                label="Workspace name"
                onChange={(event) =>
                  updateWorkspaceValue("name", event.target.value)
                }
                value={values.name}
              />
              <SettingsWorkspaceField
                label="Slug"
                onChange={(event) =>
                  updateWorkspaceValue("slug", event.target.value)
                }
                value={values.slug}
              />
              <SettingsWorkspaceField
                label="Category"
                onChange={(event) =>
                  updateWorkspaceValue("category", event.target.value)
                }
                placeholder="Workspace intelligence"
                value={values.category}
              />
              <div className="sm:col-span-2">
                <Label htmlFor="workspace-url">Workspace URL</Label>
                <Group className="mt-1 h-7">
                  <Input
                    className="h-full w-full text-sm [&_[data-slot=input]]:h-full [&_[data-slot=input]]:leading-none"
                    id="workspace-url"
                    readOnly
                    size="sm"
                    value={`https://app.atmetai.com/workspace/${values.slug}`}
                  />
                  <GroupSeparator />
                  <Button className="h-full" size="sm" variant="outline">
                    Copy
                  </Button>
                </Group>
              </div>
            </div>

            <div className="grid content-start gap-3 p-4">
              <SettingsProfileInsight label="Members" value={`${members.length} active`} />
              <SettingsProfileInsight label="Default role" value="Member" />
              <SettingsProfileInsight label="Approval queue" value="0 requests" />
              <SettingsProfileInsight
                label="Created"
                value={formatDateLabel(workspace?.createdAt) || "Not recorded"}
              />
            </div>
          </div>
        </FramePanel>
      </Frame>

      <SettingsWorkspaceUsersTable
        onInviteUser={inviteWorkspaceUser}
        users={members}
        workspaceName={workspaceName}
      />
    </div>
  );
}

function SettingsWorkspaceUsersTable({
  onInviteUser,
  users,
  workspaceName,
}: {
  onInviteUser: (email: string) => void | Promise<void>;
  users: WorkspaceUser[];
  workspaceName: string;
}) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [memberFilter, setMemberFilter] = useState("all");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");
  const [memberSearch, setMemberSearch] = useState("");
  const memberFilterOptions = getTableFilterOptions(
    users.map((user) => user.status),
    "All statuses",
  );
  const memberRoleFilterOptions = getTableFilterOptions(
    users.map((user) => user.role),
    "All roles",
  );
  const visibleUsers = users.filter((user) => {
    const matchesSearch = matchesTableSearch(
      [user.name, user.email, user.role, user.status, user.lastActive],
      memberSearch,
    );
    const matchesFilter =
      memberFilter === "all" ||
      normalizeFilterValue(user.status) === memberFilter;
    const matchesRole =
      memberRoleFilter === "all" ||
      normalizeFilterValue(user.role) === memberRoleFilter;

    return matchesSearch && matchesFilter && matchesRole;
  });

  return (
    <Frame className="min-w-0 max-w-full bg-muted/60">
      <FramePanel className="min-w-0 max-w-full overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Icon icon={Users} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Workspace users</h2>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                Manage the people who can access this workspace.
              </p>
            </div>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)} size="sm" variant="outline">
            <Icon icon={PlusSignIcon} />
            Invite user
          </Button>
        </div>
        <WorkspaceInviteDialog
          onInvite={onInviteUser}
          onOpenChange={setInviteDialogOpen}
          open={inviteDialogOpen}
          workspaceName={workspaceName}
        />

        <div className="border-b border-border/70 px-4 py-3">
          <TableFilterControls
            filterLabel="Filter members"
            filterOptions={memberFilterOptions}
            filterValue={memberFilter}
            filters={[
              {
                label: "Filter roles",
                onChange: setMemberRoleFilter,
                options: memberRoleFilterOptions,
                value: memberRoleFilter,
              },
            ]}
            onFilterChange={setMemberFilter}
            onSearchChange={setMemberSearch}
            searchPlaceholder="Search workspace users..."
            searchValue={memberSearch}
          />
        </div>

        <div className={tableViewportClassName}>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <AvatarTile
                        className="size-8 rounded-lg border-0 bg-muted text-xs shadow-none"
                        initials={user.initials}
                        src={user.avatarUrl}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium leading-5">
                          {user.name}
                        </p>
                        <p className="truncate text-xs leading-4 text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "Active"
                          ? "success"
                          : user.status === "Invited"
                            ? "warning"
                            : "outline"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.lastActive}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Menu>
                        <MenuTrigger
                          render={
                            <Button
                              aria-label={`Manage ${user.name}`}
                              size="icon-sm"
                              variant="ghost"
                            />
                          }
                        >
                          <Icon icon={MoreHorizontalIcon} />
                        </MenuTrigger>
                        <MenuPopup align="end" className="min-w-36" sideOffset={6}>
                          <MenuItem
                            onClick={() =>
                              window.alert(`Role editor opened for ${user.name}.`)
                            }
                          >
                            <Icon icon={Edit02Icon} />
                            Change role
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              navigator.clipboard
                                ?.writeText(`https://atmetai.com/invite/${user.email}`)
                                .catch(() => undefined);
                              window.alert(`Invite link copied for ${user.name}.`);
                            }}
                          >
                            <Icon icon={CopyLinkIcon} />
                            Copy invite
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem
                            onClick={() =>
                              window.alert(`${user.name} would be removed after confirmation.`)
                            }
                            variant="destructive"
                          >
                            <Icon icon={Delete02Icon} />
                            Remove user
                          </MenuItem>
                        </MenuPopup>
                      </Menu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {visibleUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-muted-foreground"
                    colSpan={5}
                  >
                    No users match these filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </FramePanel>
    </Frame>
  );
}

function SettingsWorkspaceField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  value: string;
}) {
  const id = `workspace-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        className="h-8 text-sm [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:leading-8"
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        size="sm"
        value={value}
      />
    </div>
  );
}

function SettingsGeneralTab({
  ctaAccentPreference,
  onCtaAccentPreferenceChange,
  onWorkspaceSettingsChange,
  workspaceId,
  workspaceSettings,
}: {
  ctaAccentPreference: CtaAccentPreference;
  onCtaAccentPreferenceChange: (preference: CtaAccentPreference) => void;
  onWorkspaceSettingsChange: (settings: DatabaseRecord | null) => void;
  workspaceId: string | null;
  workspaceSettings: DatabaseRecord | null;
}) {
  const [soundEnabled, setSoundEnabled] = useState(
    asBoolean(workspaceSettings?.sound_enabled, true),
  );
  const [timezone, setTimezone] = useState(
    asString(workspaceSettings?.default_timezone, "Asia/Amman"),
  );
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const nextSoundEnabled = asBoolean(workspaceSettings?.sound_enabled, true);
    setSoundEnabled(nextSoundEnabled);
    void setAtmetSoundEnabled(nextSoundEnabled);
    setTimezone(asString(workspaceSettings?.default_timezone, "Asia/Amman"));
  }, [workspaceSettings]);

  async function saveGeneralSetting(patch: DatabaseRecord) {
    if (!workspaceId) {
      return;
    }

    setSavingSettings(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
        body: JSON.stringify(patch),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        const payload = asRecord(await response.json().catch(() => ({})));
        throw new Error(asString(payload.error, "Could not save settings"));
      }

      const payload = asRecord(await response.json());
      onWorkspaceSettingsChange(asRecord(payload.settings));
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  function updateSoundEnabled(checked: boolean) {
    setSoundEnabled(checked);
    void setAtmetSoundEnabled(checked);
    void saveGeneralSetting({ sound_enabled: checked });
  }

  function updateTimezone(value: string) {
    setTimezone(value);
    void saveGeneralSetting({ default_timezone: value });
  }

  return (
    <SettingsTabGrid>
      <SettingsThemeSelector />
      <SettingsModelAccess />
      <SettingsSection
        description="Manage startup, sound, timezone, and formatting."
        icon={Settings01Icon}
        title="General preferences"
      >
        <SettingsSwitchRow
          checked={soundEnabled}
          description="Enable sound effects for notifications and completed actions."
          disabled={savingSettings || !workspaceId}
          onCheckedChange={updateSoundEnabled}
          title="Sound"
        />
        <SettingsRow
          description="Only affects the main login/waitlist buttons and chat send button."
          title="Button color"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => onCtaAccentPreferenceChange("current")}
              size="sm"
              variant={ctaAccentPreference === "current" ? "default" : "outline"}
            >
              Current
            </Button>
            <Button
              className={cn(
                ctaAccentPreference === "blue" && blueCtaButtonClassName,
              )}
              onClick={() => onCtaAccentPreferenceChange("blue")}
              size="sm"
              variant={ctaAccentPreference === "blue" ? "default" : "outline"}
            >
              <span className="size-2 rounded-full bg-[#1e90ff]" />
              Blue #1e90ff
            </Button>
          </div>
        </SettingsRow>
        <SettingsRow
          description="Choose where Atmet opens by default."
          title="Startup page"
        >
          <Button className="justify-between" size="sm" variant="outline">
            New chat
            <Icon icon={ChevronDownIcon} />
          </Button>
        </SettingsRow>
        <SettingsRow description="Used for schedules and run history." title="Timezone">
          <Select
            disabled={savingSettings || !workspaceId}
            onValueChange={(value) => updateTimezone(value ?? "Asia/Amman")}
            value={timezone}
          >
            <SelectTrigger className="min-w-44" size="sm">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectPopup align="end">
              {timezoneOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </SettingsRow>
        <SettingsRow description="Applied to billing, usage, and changelog dates." title="Date format">
          <Button size="sm" variant="outline">System default</Button>
        </SettingsRow>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

type UserModelProviderKey = "custom" | "local";

type UserModelConnectionForm = {
  apiKey: string;
  baseUrl: string;
  displayName: string;
  hasApiKey: boolean;
  modelId: string;
};

function getDefaultUserModelConnectionForm(
  providerKey: UserModelProviderKey,
): UserModelConnectionForm {
  if (providerKey === "local") {
    return {
      apiKey: "",
      baseUrl: "http://localhost:11434/v1",
      displayName: "Local model",
      hasApiKey: false,
      modelId: "llama3.1",
    };
  }

  return {
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    displayName: "Custom API",
    hasApiKey: false,
    modelId: "gpt-5-mini",
  };
}

function SettingsModelAccess() {
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customConnections, setCustomConnections] = useState<DatabaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      void playAtmetSound("error");
    }
  }, [errorMessage]);

  useEffect(() => {
    let alive = true;

    async function loadConnections() {
      try {
        const response = await fetch("/api/user-model-connections", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const payload = asRecord(await response.json().catch(() => ({})));
        const connections = asRecordArray(payload.connections);
        if (!alive) {
          return;
        }

        setCustomConnections(
          connections.filter(
            (connection) => asString(connection.providerKey) === "custom",
          ),
        );
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    void loadConnections();

    return () => {
      alive = false;
    };
  }, []);

  async function refreshCustomConnections() {
    setLoading(true);
    try {
      const response = await fetch("/api/user-model-connections", {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }

      const payload = asRecord(await response.json().catch(() => ({})));
      setCustomConnections(
        asRecordArray(payload.connections).filter(
          (connection) => asString(connection.providerKey) === "custom",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingsSection
      action={
        <div className="flex items-center gap-2">
          {loading ? <Spinner className="size-4 text-muted-foreground" /> : null}
          <Button
            onClick={() => setCustomDialogOpen(true)}
            size="sm"
            type="button"
          >
            <Icon icon={PlusSignIcon} />
            Add custom LLM
          </Button>
        </div>
      }
      description="Manage custom API LLMs. Local model support is coming soon."
      icon={AiBrainIcon}
      title="Model access"
    >
      <div className="grid gap-3 p-4">
        <div className="rounded-xl border border-border/70 bg-background/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Custom API LLMs</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                OpenAI-compatible endpoints connected to your account.
              </p>
            </div>
            <Badge variant="outline">
              {customConnections.length} models
            </Badge>
          </div>
          <div className="mt-3 grid gap-2">
            {customConnections.length > 0 ? (
              customConnections.map((connection) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/25 p-3"
                  key={asString(connection.id)}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {asString(connection.displayName, "Custom API")}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {asString(connection.modelId)} · {asString(connection.baseUrl)}
                    </p>
                  </div>
                  {asBoolean(connection.hasApiKey) ? (
                    <Badge variant="success">Saved key</Badge>
                  ) : (
                    <Badge variant="outline">No key</Badge>
                  )}
                </div>
              ))
            ) : (
              <button
                className="rounded-lg border border-dashed border-border p-4 text-left text-sm text-muted-foreground transition-[background-color,color] hover:bg-muted/40 hover:text-foreground"
                onClick={() => setCustomDialogOpen(true)}
                type="button"
              >
                No custom API LLMs yet. Add your first custom LLM.
              </button>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/70 p-3 opacity-80">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">Local model</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Local OpenAI-compatible endpoints will be available later.
              </p>
            </div>
            <Badge variant="destructive">Soon</Badge>
          </div>
        </div>
      </div>
      {errorMessage ? (
        <div className="px-4 py-3 text-xs font-medium text-red-600 dark:text-red-500">
          {errorMessage}
        </div>
      ) : null}
      <CustomLlmDialog
        onOpenChange={setCustomDialogOpen}
        onSaved={refreshCustomConnections}
        open={customDialogOpen}
      />
    </SettingsSection>
  );
}

function ModelConnectionCard({
  description,
  form,
  onChange,
  onSave,
  saved,
  saving,
  title,
}: {
  description: string;
  form: UserModelConnectionForm;
  onChange: (key: keyof UserModelConnectionForm, value: string) => void;
  onSave: () => void;
  saved: boolean;
  saving: boolean;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        {form.hasApiKey ? <Badge variant="success">Saved key</Badge> : null}
      </div>
      <div className="mt-3 grid gap-2">
        <ModelConnectionField
          label="Display name"
          onChange={(value) => onChange("displayName", value)}
          placeholder="My model"
          value={form.displayName}
        />
        <ModelConnectionField
          label="Model ID"
          onChange={(value) => onChange("modelId", value)}
          placeholder="gpt-5-mini"
          value={form.modelId}
        />
        <ModelConnectionField
          label="Base URL"
          onChange={(value) => onChange("baseUrl", value)}
          placeholder="https://api.openai.com/v1"
          value={form.baseUrl}
        />
        <ModelConnectionField
          label={form.hasApiKey ? "Replace API key" : "API key"}
          onChange={(value) => onChange("apiKey", value)}
          placeholder={form.hasApiKey ? "Leave empty to keep current key" : "sk-..."}
          type="password"
          value={form.apiKey}
        />
      </div>
      <Button
        className="mt-3 h-8"
        disabled={saving}
        onClick={onSave}
        size="sm"
        type="button"
      >
        {saving ? (
          <Spinner className="size-3.5" />
        ) : (
          <Icon className="size-3.5" icon={saved ? CheckIcon : SaveIcon} />
        )}
        {saved ? "Saved" : "Save model"}
      </Button>
    </div>
  );
}

function ModelConnectionField({
  description,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  description?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  const id = `model-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="grid gap-1">
      <Label className="text-xs" htmlFor={id}>
        {label}
      </Label>
      <Input
        className="h-8 text-sm [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:leading-8"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        size="sm"
        type={type}
        value={value}
      />
      {description ? (
        <p className="text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

type ThemePreference = "dark" | "default" | "light";

function getInitialThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "default";
  }

  const stored = window.localStorage.getItem("atmet-theme");
  return stored === "dark" || stored === "light" ? stored : "default";
}

function applyThemePreference(preference: ThemePreference) {
  if (typeof window === "undefined") {
    return;
  }

  if (preference === "default") {
    window.localStorage.removeItem("atmet-theme");
    document.documentElement.classList.toggle(
      "dark",
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
    return;
  }

  window.localStorage.setItem("atmet-theme", preference);
  document.documentElement.classList.toggle("dark", preference === "dark");
}

function SettingsThemeSelector() {
  const [savedThemePreference, setSavedThemePreference] = useState<ThemePreference>(
    getInitialThemePreference,
  );
  const [draftThemePreference, setDraftThemePreference] = useState<ThemePreference>(
    getInitialThemePreference,
  );
  const options = [
    { label: "System default", preview: "system", value: "default" },
    { label: "Light", preview: "light", value: "light" },
    { label: "Dark", preview: "dark", value: "dark" },
  ] satisfies {
    label: string;
    preview: "dark" | "light" | "system";
    value: ThemePreference;
  }[];

  function updateThemePreference() {
    setSavedThemePreference(draftThemePreference);
    applyThemePreference(draftThemePreference);
  }

  return (
    <Frame className="bg-muted/60">
      <FramePanel className="overflow-hidden p-0">
        <div className="border-b border-border/70 px-4 py-3">
          <h2 className="text-sm font-semibold">Dashboard theme</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Choose light, dark, or system theme for this dashboard.
          </p>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {options.map((option) => (
            <button
              aria-pressed={draftThemePreference === option.value}
              className={cn(
                "group rounded-xl border border-border bg-muted/30 p-2 text-left outline-none transition-[border-color,background-color,box-shadow,scale] duration-150 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]",
                draftThemePreference === option.value &&
                  "border-stone-400/70 shadow-[0_0_0_1px_rgb(120_113_108/0.45)] dark:border-stone-500/70 dark:shadow-[0_0_0_1px_rgb(120_113_108/0.45)]",
              )}
              key={option.value}
              onClick={() => setDraftThemePreference(option.value)}
              type="button"
            >
              <ThemePreview kind={option.preview} />
              <div className="mt-2 flex items-center gap-2 px-1">
                <span
                  className={cn(
                    "grid size-4 place-items-center rounded-full border border-muted-foreground/45",
                    draftThemePreference === option.value &&
                      "border-stone-600 dark:border-stone-300",
                  )}
                >
                  {draftThemePreference === option.value && (
                    <span className="size-2 rounded-full bg-stone-800 dark:bg-stone-200" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium text-muted-foreground",
                    draftThemePreference === option.value && "text-foreground",
                  )}
                >
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-end border-t border-border/70 px-4 py-3">
          <Button
            disabled={draftThemePreference === savedThemePreference}
            onClick={updateThemePreference}
            size="sm"
          >
            Update
          </Button>
        </div>
      </FramePanel>
    </Frame>
  );
}

function ThemePreview({ kind }: { kind: "dark" | "light" | "system" }) {
  const isDark = kind === "dark";
  const systemSplit = kind === "system";
  const colors = {
    app: isDark ? "bg-stone-950" : "bg-stone-100",
    border: isDark ? "border-stone-800" : "border-stone-200",
    content: isDark ? "bg-stone-900" : "bg-white",
    line: isDark ? "bg-stone-700" : "bg-stone-300",
    muted: isDark ? "bg-stone-800" : "bg-stone-100",
    sidebar: isDark ? "bg-stone-900" : "bg-stone-50",
    strong: isDark ? "bg-stone-500" : "bg-stone-700",
    topbar: isDark ? "bg-stone-950" : "bg-white",
  };

  return (
    <div
      className={cn(
        "relative h-40 overflow-hidden rounded-lg border",
        colors.border,
        colors.app,
        systemSplit &&
          "bg-[linear-gradient(90deg,#f5f5f4_0%,#f5f5f4_50%,#0c0a09_50%,#0c0a09_100%)]",
      )}
    >
      {systemSplit && (
        <div className="absolute inset-y-0 left-1/2 w-px bg-stone-500/20" />
      )}
      <div
        className={cn(
          "flex h-6 items-center gap-1.5 border-b px-2",
          colors.border,
          colors.topbar,
          systemSplit &&
            "bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_50%,#1c1917_50%,#1c1917_100%)]",
        )}
      >
        <AtmetLogo className="size-3.5" plain />
        <span
          className={cn(
            "grid size-4 place-items-center rounded-md text-[0.45rem] font-semibold",
            isDark ? "bg-stone-800 text-stone-200" : "bg-stone-100 text-stone-800",
            systemSplit && "bg-stone-100 text-stone-800",
          )}
        >
          AW
        </span>
        <span className={cn("h-1.5 w-20 rounded-full", colors.line)} />
        <span className={cn("ml-auto size-4 rounded-md", colors.muted)} />
      </div>
      <div className="flex h-[calc(100%-1.5rem)]">
        <div
          className={cn(
            "w-[27%] border-r p-2",
            colors.border,
            colors.sidebar,
            systemSplit &&
              "bg-[linear-gradient(90deg,#fafaf9_0%,#fafaf9_50%,#1c1917_50%,#1c1917_100%)]",
          )}
        >
          <div className="grid gap-1.5">
            {[0, 1, 2, 3].map((item) => (
              <span
                className={cn(
                  "h-3 rounded-md",
                  item === 1 ? colors.strong : colors.line,
                )}
                key={item}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 p-2">
          <div
            className={cn(
              "grid h-full grid-rows-[1fr_auto] overflow-hidden rounded-lg border p-2",
              colors.border,
              colors.content,
              systemSplit &&
                "bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_50%,#1c1917_50%,#1c1917_100%)]",
            )}
          >
            <div className="grid content-start gap-1.5">
              <span className={cn("h-2 w-24 rounded-full", colors.strong)} />
              <span
                className={cn("h-7 rounded-md border", colors.border, colors.muted)}
              />
              <span
                className={cn("h-7 rounded-md border", colors.border, colors.muted)}
              />
              <span
                className={cn(
                  "h-7 w-2/3 rounded-md border",
                  colors.border,
                  colors.muted,
                )}
              />
            </div>
            <div
              className={cn(
                "mt-2 flex h-8 items-center gap-1.5 rounded-lg border px-2",
                colors.border,
                colors.content,
              )}
            >
              <span className={cn("size-4 rounded-md", colors.strong)} />
              <span className={cn("h-1.5 flex-1 rounded-full", colors.line)} />
              <span className={cn("h-4 w-9 rounded-md", colors.strong)} />
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:10px_10px]",
          isDark ? "text-white/[0.025]" : "text-black/[0.025]",
        )}
      />
    </div>
  );
}

function SettingsDataControlsTab({
  connectors,
}: {
  connectors: ConnectorItem[];
}) {
  return (
    <SettingsTabGrid>
      <SettingsSection
        description="Manage the apps that can provide context to Atmet."
        icon={PlugIcon}
        title="Integration apps"
      >
        {connectors.map((connector) => (
          <SettingsRow
            description="Connected with read-only context access."
            key={connector.name}
            title={connector.name}
          >
            <div className="flex items-center gap-2">
              <Badge variant="success">Connected</Badge>
              <SettingsActionDialogButton
                confirmLabel="Disconnect"
                description={`${connector.name} will stop providing context to Atmet until it is connected again.`}
                title={`Disconnect ${connector.name}?`}
                triggerLabel="Disconnect"
              />
            </div>
          </SettingsRow>
        ))}
      </SettingsSection>

      <SettingsSection
        description="Permanent deletion actions for memory, account, and workspace data."
        icon={Delete02Icon}
        title="Delete controls"
      >
        <SettingsRow
          description="Request removal of saved workspace memory."
          title="Delete saved memory"
        >
          <SettingsDeleteConfirmButton
            confirmLabel="Delete memory"
            description="This removes saved workspace memory used for future chats and agent runs. Existing chats stay available."
            title="Delete saved memory?"
            triggerLabel="Delete memory"
          />
        </SettingsRow>
        <SettingsRow
          description="Permanently remove your user account from Atmet."
          title="Delete account"
        >
          <SettingsDeleteConfirmButton
            confirmLabel="Delete account"
            description="This will remove your profile, personal settings, and access to this workspace. This action cannot be undone."
            title="Delete account?"
            triggerLabel="Delete account"
          />
        </SettingsRow>
        <SettingsRow
          description="Permanently delete this workspace and all workspace-owned data."
          title="Delete workspace"
        >
          <SettingsDeleteConfirmButton
            confirmLabel="Delete workspace"
            description="This will delete the current workspace, including workspace settings, users, agents, skills, and connected app configuration. This action cannot be undone."
            title="Delete workspace?"
            triggerLabel="Delete workspace"
          />
        </SettingsRow>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function SettingsDeleteConfirmButton({
  confirmLabel,
  description,
  title,
  triggerLabel,
}: {
  confirmLabel: string;
  description: string;
  title: string;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        variant="destructive-outline"
      >
        {triggerLabel}
      </Button>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="destructive"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function SettingsActionDialogButton({
  children,
  className,
  confirmLabel = "Done",
  description,
  icon,
  onConfirm,
  size = "sm",
  title,
  triggerLabel,
  variant = "outline",
}: {
  children?: React.ReactNode;
  className?: string;
  confirmLabel?: string;
  description: string;
  icon?: IconSvgElement;
  onConfirm?: () => void;
  size?: React.ComponentProps<typeof Button>["size"];
  title: string;
  triggerLabel: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Button
        className={className}
        onClick={() => setOpen(true)}
        size={size}
        variant={variant}
      >
        {icon && <Icon icon={icon} />}
        {triggerLabel}
      </Button>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children && (
          <DialogPanel className="grid gap-3" scrollFade={false}>
            {children}
          </DialogPanel>
        )}
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            onClick={() => {
              onConfirm?.();
              setOpen(false);
            }}
            type="button"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function SettingsBillingTab({
  subscription,
}: {
  subscription: DatabaseRecord | null;
}) {
  const plan = getRecordByKey(subscription ?? {}, "billing_plans");
  const planName = asString(plan.name, asString(subscription?.plan_key, "No plan"));
  const price = asNumber(plan.price_monthly_cents);
  const billingEmail = asString(subscription?.billing_email);
  const renewsAt = formatDateLabel(subscription?.current_period_end) || "Not scheduled";

  return (
    <SettingsTabGrid>
      <SettingsSection
        action={<Badge variant="success">{planName}</Badge>}
        description="The plan currently assigned to this user."
        icon={CreditCardIcon}
        title="Current plan"
      >
        <SettingsRow
          description="Includes workflow agents, skills, connectors, and advanced workspace controls."
          title={planName}
        >
          <div className="flex items-center gap-2">
            <SettingsActionDialogButton
              confirmLabel="Close"
              description="Billing management is available here in the dashboard preview."
              title="Manage billing"
              triggerLabel="Manage"
            >
              <div className="grid gap-2">
                <Label>Billing email</Label>
                <Input defaultValue={billingEmail} size="sm" />
              </div>
            </SettingsActionDialogButton>
          </div>
        </SettingsRow>
        <SettingsStatGrid
          stats={[
            ["Price", price > 0 ? `$${(price / 100).toLocaleString()}/mo` : "Not set"],
            ["Renews", renewsAt],
            ["Billing email", billingEmail || "Not set"],
          ]}
        />
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function SettingsTabGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 pb-6">{children}</div>;
}

function SettingsSection({
  action,
  children,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  description: string;
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <Frame className="bg-muted/60">
      <FramePanel className="overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Icon icon={icon} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          {action}
        </div>
        <div className="min-w-0 divide-y divide-border/70">{children}</div>
      </FramePanel>
    </Frame>
  );
}

function SettingsRow({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:justify-end">
        {children}
      </div>
    </div>
  );
}

function SettingsSwitchRow({
  checked,
  defaultChecked = false,
  description,
  disabled = false,
  onCheckedChange,
  title,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  description: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  title: string;
}) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const currentChecked = checked ?? internalChecked;

  function updateChecked(nextChecked: boolean) {
    if (checked === undefined) {
      setInternalChecked(nextChecked);
    }
    onCheckedChange?.(nextChecked);
  }

  return (
    <SettingsRow description={description} title={title}>
      <Switch
        checked={currentChecked}
        disabled={disabled}
        onCheckedChange={updateChecked}
      />
    </SettingsRow>
  );
}

function SettingsStatGrid({ stats }: { stats: readonly [string, string][] }) {
  return (
    <div className="grid gap-2 p-4 sm:grid-cols-3">
      {stats.map(([label, value]) => (
        <div
          className="rounded-lg border border-border/70 bg-muted/35 px-3 py-2"
          key={label}
        >
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}

function AdminPage() {
  const [profileView, setProfileView] = useState<AdminProfileView | null>(
    null,
  );
  const [activeAdminTab, setActiveAdminTab] =
    useState<AdminTabKey>("overview");
  const [adminData, setAdminData] = useState<AdminData>(emptyAdminData);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    function syncAdminRouteFromHistory() {
      const nextProfileView = getInitialAdminProfileView();
      setActiveAdminTab(nextProfileView ? "workspaces" : getInitialAdminTab());
      setProfileView(nextProfileView);
    }

    syncAdminRouteFromHistory();
    window.addEventListener("popstate", syncAdminRouteFromHistory);

    return () => {
      window.removeEventListener("popstate", syncAdminRouteFromHistory);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAdminData() {
      setIsAdminLoading(true);
      try {
        const [
          overviewResponse,
          directoryResponse,
          requestsResponse,
          usageControlsResponse,
        ] =
          await Promise.all([
            fetch("/api/admin/overview", { cache: "no-store" }),
            fetch("/api/admin/workspaces-users", { cache: "no-store" }),
            fetch("/api/admin/requests", { cache: "no-store" }),
            fetch("/api/admin/usage-controls", { cache: "no-store" }),
          ]);

        const overview = overviewResponse.ok
          ? asRecord(await overviewResponse.json())
          : {};
        const directory = directoryResponse.ok
          ? asRecord(await directoryResponse.json())
          : {};
        const requests = requestsResponse.ok
          ? asRecord(await requestsResponse.json())
          : {};
        const usageControls = usageControlsResponse.ok
          ? asRecord(await usageControlsResponse.json())
          : {};
        const workspaces = asRecordArray(directory.workspaces)
          .map(mapAdminWorkspace)
          .filter((item): item is AdminWorkspaceRow => Boolean(item));
        const users = asRecordArray(directory.users)
          .map(mapAdminUser)
          .filter((item): item is AdminUserRow => Boolean(item));
        let roles: AdminRoleRow[] = [];

        if (workspaces[0]) {
          const workspaceRecord = asRecordArray(directory.workspaces)[0];
          const workspaceId = asString(workspaceRecord?.id);
          if (workspaceId) {
            const rolesResponse = await fetch(
              `/api/admin/roles?workspaceId=${workspaceId}`,
              { cache: "no-store" },
            );
            if (rolesResponse.ok) {
              const rolesPayload = asRecord(await rolesResponse.json());
              roles = asRecordArray(rolesPayload.roles)
                .map(mapAdminRole)
                .filter((item): item is AdminRoleRow => Boolean(item));
            }
          }
        }

        if (!cancelled) {
          const aiFeedbackRecord = asRecord(overview.aiFeedback);
          const aiPerformanceRecord = asRecord(overview.aiPerformance);

          setAdminData({
            aiFeedback: {
              assistantDislikes: asNumber(aiFeedbackRecord.assistantDislikes),
              assistantLikes: asNumber(aiFeedbackRecord.assistantLikes),
              assistantPositiveRate: asNumber(aiFeedbackRecord.assistantPositiveRate),
              assistantTotal: asNumber(aiFeedbackRecord.assistantTotal),
              dislikes: asNumber(aiFeedbackRecord.dislikes),
              likes: asNumber(aiFeedbackRecord.likes),
              total: asNumber(aiFeedbackRecord.total),
            },
            aiPerformance: {
              avgLatencyMs: asNumber(aiPerformanceRecord.avgLatencyMs),
              completed: asNumber(aiPerformanceRecord.completed),
              failed: asNumber(aiPerformanceRecord.failed),
              runs: asNumber(aiPerformanceRecord.runs),
              successRate: asNumber(aiPerformanceRecord.successRate),
            },
            activityLogs: asRecordArray(overview.auditLogs)
              .map((log) => mapAdminLog(log, "Activity"))
              .filter((item): item is AdminLogRow => Boolean(item))
              .concat(
                asRecordArray(overview.usageLogs)
                  .map((log) => mapAdminLog(log, "Usage"))
                  .filter((item): item is AdminLogRow => Boolean(item)),
                asRecordArray(overview.modelRunLogs)
                  .map((log) => mapAdminLog(log, "AI"))
                  .filter((item): item is AdminLogRow => Boolean(item)),
                asRecordArray(overview.workflowEventLogs)
                  .map((log) => mapAdminLog(log, "Workflow"))
                  .filter((item): item is AdminLogRow => Boolean(item)),
              ),
            requests: asRecordArray(requests.requests)
              .map(mapAdminRequest)
              .filter((item): item is AdminRequestRow => Boolean(item)),
            roles,
            sessionLogs: asRecordArray(overview.sessionLogs)
              .map((log) => mapAdminLog(log, "Session"))
              .filter((item): item is AdminLogRow => Boolean(item)),
            usageControls: asRecordArray(usageControls.controls),
            users,
            workspaces,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setIsAdminLoading(false);
        }
      }
    }

    void loadAdminData();

    return () => {
      cancelled = true;
    };
  }, []);

  function selectAdminTab(value: string) {
    const tab = isAdminTabKey(value) ? value : "overview";
    setActiveAdminTab(tab);
    setProfileView(null);
    updateAppRouteState({ adminProfile: null, adminTab: tab, page: "admin" });
  }

  function openAdminProfile(profile: AdminProfileView | null) {
    setProfileView(profile);
    setActiveAdminTab("workspaces");
    updateAppRouteState({
      adminProfile: profile,
      adminTab: "workspaces",
      page: "admin",
    });
  }

  return (
    <>
      <PageHeader description={pageDescriptions.admin} title="Admin Console" />
      <Tabs value={activeAdminTab} onValueChange={selectAdminTab}>
        <TabsList
          className="w-full max-w-full flex-nowrap justify-start gap-x-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          variant="underline"
        >
          {adminTabs.map((tab) => (
            <TabsTrigger className="h-8 px-1.5 text-sm" key={tab.value} value={tab.value}>
              <Icon icon={tab.icon} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {isAdminLoading && <LoadingPill label="Loading admin data" />}
        <TabsContent value="overview">
          <AdminOverviewTab adminData={adminData} />
        </TabsContent>
        <TabsContent value="workspaces">
          <AdminWorkspacesUsersTab
            adminData={adminData}
            onOpenProfile={openAdminProfile}
            profileView={profileView}
          />
        </TabsContent>
        <TabsContent value="requests">
          <AdminRequestsTab rows={adminData.requests} />
        </TabsContent>
        <TabsContent value="roles">
          <AdminRolesTab rows={adminData.roles} />
        </TabsContent>
        <TabsContent value="usage">
          <AdminUsageControlsTab
            controls={adminData.usageControls}
            workspaces={adminData.workspaces}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

function AdminOverviewTab({ adminData }: { adminData: AdminData }) {
  const logs = [...adminData.activityLogs, ...adminData.sessionLogs].sort(
    (a, b) => new Date(b.sortTime).getTime() - new Date(a.sortTime).getTime(),
  );
  const workspacesCount = adminData.workspaces.length;
  const usersCount = adminData.users.length;
  const requestsCount = adminData.requests.length;
  const activeWorkspaces = adminData.workspaces.filter(
    ([, , , , status]) => status.toLowerCase() === "active",
  ).length;
  const aiFeedback = adminData.aiFeedback;
  const aiPerformance = adminData.aiPerformance;
  const workspaceTrend = Array.from({ length: 7 }, (_, index) =>
    Math.max(0, workspacesCount - 6 + index),
  );
  const activityTrend = Array.from({ length: 7 }, (_, index) =>
    Math.max(0, adminData.activityLogs.length - 6 + index),
  );
  const requestTrend = Array.from({ length: 7 }, (_, index) =>
    Math.max(0, requestsCount - 6 + index),
  );
  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const runBars = weekdayLabels.map((label, index) => [
    label,
    adminData.activityLogs.filter((log) => {
      const date = new Date(log.sortTime);

      return !Number.isNaN(date.getTime()) && date.getDay() === (index + 1) % 7;
    }).length,
  ] satisfies [string, number]);

  return (
    <SettingsTabGrid>
      <SettingsSection
        description="Live operating view for growth, usage, and access health."
        icon={ChartIcon}
        title="Admin overview"
      >
        <SettingsStatGrid
          stats={[
            ["Workspaces", String(workspacesCount)],
            ["Active users", String(usersCount)],
            ["Waitlist requests", String(requestsCount)],
            ["Active workspaces", String(activeWorkspaces)],
            ["Activity logs", String(adminData.activityLogs.length)],
            ["Session logs", String(adminData.sessionLogs.length)],
            ["AI likes", String(aiFeedback.assistantLikes)],
            ["AI dislikes", String(aiFeedback.assistantDislikes)],
            ["AI positive", `${aiFeedback.assistantPositiveRate}%`],
            ["AI success", `${aiPerformance.successRate}%`],
          ]}
        />
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <AdminSparklineCard
            data={workspaceTrend}
            label="Workspace growth"
            value={String(workspacesCount)}
          />
          <AdminSparklineCard
            data={activityTrend}
            label="Agent runs"
            value={String(adminData.activityLogs.length)}
          />
          <AdminSparklineCard
            data={requestTrend}
            label="Waitlist demand"
            value={String(requestsCount)}
          />
        </div>
        <div className="grid gap-3 border-t border-border/70 p-4 lg:grid-cols-[1.2fr_0.8fr]">
          <AdminBarChart bars={runBars} title="Run volume" />
          <AdminPlanMix workspaces={adminData.workspaces} />
        </div>
        <div className="border-t border-border/70 p-4">
          <AdminAIFeedbackCard
            feedback={aiFeedback}
            performance={aiPerformance}
          />
        </div>
      </SettingsSection>
      <AdminLogsTable
        description="Recent admin activity and user sessions across Atmet."
        rows={logs}
        title="System logs"
      />
    </SettingsTabGrid>
  );
}

function AdminSparklineCard({
  data,
  label,
  value,
}: {
  data: number[];
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
        </div>
        <Badge variant="success">Live</Badge>
      </div>
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {data.map((height, index) => (
          <span
            className={cn(
              "flex-1 rounded-t-md",
              usageChartBarClasses[index % usageChartBarClasses.length],
            )}
            key={`${label}-${index}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function AdminBarChart({
  bars,
  title,
}: {
  bars: readonly [string, number][];
  title: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Completed workflow runs over the last 7 days.
          </p>
        </div>
        <Badge variant="outline">7 days</Badge>
      </div>
      <div className="mt-5 flex h-44 items-end gap-2">
        {bars.map(([label, value], index) => (
          <div className="flex flex-1 flex-col items-center gap-2" key={label}>
            <div className="flex h-36 w-full items-end rounded-lg bg-background/50 p-1">
              <div
                className={cn(
                  "w-full rounded-md",
                  usageChartBarClasses[index % usageChartBarClasses.length],
                )}
                style={{ height: `${value}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAIFeedbackCard({
  feedback,
  performance,
}: {
  feedback: AdminAIFeedback;
  performance: AdminAIPerformance;
}) {
  const totalFeedback = Math.max(1, feedback.assistantTotal);
  const likesWidth = Math.round((feedback.assistantLikes / totalFeedback) * 100);
  const dislikesWidth = Math.round((feedback.assistantDislikes / totalFeedback) * 100);

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">AI feedback and performance</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Assistant ratings and model-run health across all users.
          </p>
        </div>
        <Badge variant="outline">{performance.runs} runs</Badge>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-3">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span>Likes</span>
              <span className="tabular-nums text-muted-foreground">
                {feedback.assistantLikes}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-background/70">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${likesWidth}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs">
              <span>Dislikes</span>
              <span className="tabular-nums text-muted-foreground">
                {feedback.assistantDislikes}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-background/70">
              <div
                className="h-full rounded-full bg-destructive"
                style={{ width: `${dislikesWidth}%` }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Positive", `${feedback.assistantPositiveRate}%`],
            ["Success", `${performance.successRate}%`],
            ["Latency", performance.avgLatencyMs ? `${performance.avgLatencyMs}ms` : "0ms"],
          ].map(([label, value]) => (
            <div
              className="rounded-lg border border-border/70 bg-background/60 p-3"
              key={label}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPlanMix({ workspaces }: { workspaces: AdminWorkspaceRow[] }) {
  const planCounts = workspaces.reduce<Record<string, number>>((acc, [, , plan]) => {
    const label = plan === "No plan" ? "No plan" : plan[0]?.toUpperCase() + plan.slice(1);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  const total = Math.max(1, workspaces.length);
  const colors = usageChartBarClasses;
  const plans = Object.entries(planCounts).map(([label, count], index) => [
    label,
    Math.round((count / total) * 100),
    colors[index % colors.length],
  ] satisfies [string, number, string]);

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <p className="text-sm font-semibold">Plan mix</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Active workspace distribution by plan.
      </p>
      <div className="mt-5 grid gap-3">
        {(plans.length > 0 ? plans : [["No plan", 0, colors[0]]]).map(([label, value, color]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-xs">
              <span>{label}</span>
              <span className="tabular-nums text-muted-foreground">{value}%</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-background/70">
              <div
                className={cn("h-full rounded-full", color)}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminLogsTable({
  description,
  rows,
  title,
}: {
  description: string;
  rows: readonly AdminLogRow[];
  title: string;
}) {
  const defaultVisibleLogRows = 50;
  const [logFilter, setLogFilter] = useState("all");
  const [logSourceFilter, setLogSourceFilter] = useState("all");
  const [logWorkspaceFilter, setLogWorkspaceFilter] = useState("all");
  const [logUserFilter, setLogUserFilter] = useState("all");
  const [logEventFilter, setLogEventFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [logUserSearch, setLogUserSearch] = useState("");
  const [visibleLogLimit, setVisibleLogLimit] = useState(defaultVisibleLogRows);
  const logFilterOptions = getTableFilterOptions(
    rows.map((row) => row.status),
    "All statuses",
  );
  const logSourceFilterOptions = getTableFilterOptions(
    rows.map((row) => row.source),
    "All types",
  );
  const logWorkspaceFilterOptions = getTableTextFilterOptions(
    rows.map((row) => row.workspace),
    "All workspaces",
  );
  const logEventFilterOptions = getTableTextFilterOptions(
    rows.map((row) => row.event),
    "All events",
  );
  const logUserFilterOptions = getTableTextFilterOptions(
    rows.map((row) => row.user),
    "All users",
  );
  const searchedLogUserFilterOptions = logUserFilterOptions.filter((option) => {
    if (option.value === "all") {
      return true;
    }

    return matchesTableSearch([option.label], logUserSearch);
  });
  const selectedLogUserOption = logUserFilterOptions.find(
    (option) => option.value === logUserFilter,
  );
  const visibleLogUserFilterOptions =
    selectedLogUserOption &&
    !searchedLogUserFilterOptions.some(
      (option) => option.value === selectedLogUserOption.value,
    )
      ? [...searchedLogUserFilterOptions, selectedLogUserOption]
      : searchedLogUserFilterOptions;
  const visibleRows = rows.filter((row) => {
    const matchesSearch = matchesTableSearch(
      [row.time, row.source, row.workspace, row.user, row.event, row.detail, row.status],
      logSearch,
    );
    const matchesFilter =
      logFilter === "all" || normalizeFilterValue(row.status) === logFilter;
    const matchesSource =
      logSourceFilter === "all" ||
      normalizeFilterValue(row.source) === logSourceFilter;
    const matchesWorkspace =
      logWorkspaceFilter === "all" ||
      normalizeFilterValue(row.workspace) === logWorkspaceFilter;
    const matchesUser =
      logUserFilter === "all" ||
      normalizeFilterValue(row.user) === logUserFilter;
    const matchesEvent =
      logEventFilter === "all" ||
      normalizeFilterValue(row.event) === logEventFilter;

    return (
      matchesSearch &&
      matchesFilter &&
      matchesSource &&
      matchesWorkspace &&
      matchesUser &&
      matchesEvent
    );
  });
  const displayedRows = visibleRows.slice(0, visibleLogLimit);
  const canShowMoreLogs = visibleRows.length > displayedRows.length;
  const activeFilterCount = [
    logFilter,
    logSourceFilter,
    logWorkspaceFilter,
    logUserFilter,
    logEventFilter,
  ].filter((value) => value !== "all").length + (logSearch.trim() ? 1 : 0);

  useEffect(() => {
    setVisibleLogLimit(defaultVisibleLogRows);
  }, [
    logEventFilter,
    logFilter,
    logSearch,
    logSourceFilter,
    logUserFilter,
    logWorkspaceFilter,
  ]);

  const exportVisibleLogs = () => {
    downloadCsv(
      `atmet-system-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Time", "Type", "Workspace", "User", "Event", "Details", "Status"],
      visibleRows.map((row) => [
        row.time,
        row.source,
        row.workspace,
        row.user,
        row.event,
        row.detail,
        row.status,
      ]),
    );
  };

  return (
    <SettingsSection
      action={
        <Button
          disabled={visibleRows.length === 0}
          onClick={exportVisibleLogs}
          size="sm"
          variant="outline"
        >
          <Icon icon={File01Icon} />
          Export CSV
        </Button>
      }
      description={description}
      icon={File01Icon}
      title={title}
    >
      <div className="grid gap-3 border-b border-border/70 px-4 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <Input
            aria-label="Search logs"
            className="lg:max-w-sm"
            onChange={(event) => setLogSearch(event.target.value)}
            placeholder="Search logs, details, users..."
            size="sm"
            value={logSearch}
          />
          <div className="flex flex-wrap gap-2">
            <AdminLogsSelectFilter
              label="Filter status"
              onChange={setLogFilter}
              options={logFilterOptions}
              value={logFilter}
            />
            <AdminLogsSelectFilter
              label="Filter type"
              onChange={setLogSourceFilter}
              options={logSourceFilterOptions}
              value={logSourceFilter}
            />
            <AdminLogsSelectFilter
              label="Filter workspace"
              onChange={setLogWorkspaceFilter}
              options={logWorkspaceFilterOptions}
              value={logWorkspaceFilter}
            />
            <AdminLogsSelectFilter
              label="Filter event"
              onChange={setLogEventFilter}
              options={logEventFilterOptions}
              value={logEventFilter}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              aria-label="Search users"
              className="sm:w-56"
              onChange={(event) => setLogUserSearch(event.target.value)}
              placeholder="Search user..."
              size="sm"
              value={logUserSearch}
            />
            <AdminLogsSelectFilter
              label="Filter user"
              onChange={setLogUserFilter}
              options={visibleLogUserFilterOptions}
              value={logUserFilter}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing {displayedRows.length} of {visibleRows.length} logs
            </span>
            {activeFilterCount > 0 ? (
              <Button
                onClick={() => {
                  setLogFilter("all");
                  setLogSourceFilter("all");
                  setLogWorkspaceFilter("all");
                  setLogUserFilter("all");
                  setLogEventFilter("all");
                  setLogSearch("");
                  setLogUserSearch("");
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <div className={tableViewportClassName}>
        <Table className="min-w-[1080px]">
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedRows.length > 0 ? (
              displayedRows.map((row) => (
                <TableRow key={`${row.source}-${row.sortTime}-${row.user}-${row.event}`}>
                  <TableCell className="text-muted-foreground">{row.time}</TableCell>
                  <TableCell>
                    <Badge variant={row.source === "Session" ? "info" : row.source === "AI" ? "warning" : "outline"}>
                      {row.source}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.workspace}</TableCell>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.event}</TableCell>
                  <TableCell className="text-muted-foreground">{row.detail}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="py-6 text-center text-muted-foreground"
                  colSpan={7}
                >
                  No logs match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {canShowMoreLogs ? (
        <div className="flex items-center justify-center border-t border-border/70 px-4 py-3">
          <Button
            onClick={() =>
              setVisibleLogLimit((current) =>
                Math.min(current + defaultVisibleLogRows, visibleRows.length),
              )
            }
            size="sm"
            type="button"
            variant="outline"
          >
            Show 50 more
          </Button>
        </div>
      ) : null}
    </SettingsSection>
  );
}

function AdminLogsSelectFilter({
  label,
  onChange,
  options,
  value,
}: TableSelectFilter) {
  return (
    <Select onValueChange={(nextValue) => onChange(nextValue ?? "all")} value={value}>
      <SelectTrigger aria-label={label} className="sm:w-40" size="sm">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectPopup>
        {options.length > 0 ? (
          options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled value="none">
            No matches
          </SelectItem>
        )}
      </SelectPopup>
    </Select>
  );
}

function AdminWorkspacesUsersTab({
  adminData,
  onOpenProfile,
  profileView,
}: {
  adminData: AdminData;
  onOpenProfile: (profile: AdminProfileView | null) => void;
  profileView: AdminProfileView | null;
}) {
  if (profileView?.type === "workspace") {
    return (
      <AdminWorkspaceProfile
        adminData={adminData}
        name={profileView.name}
        onBack={() => onOpenProfile(null)}
      />
    );
  }

  if (profileView?.type === "user") {
    return (
      <AdminUserProfile
        adminData={adminData}
        name={profileView.name}
        onBack={() => onOpenProfile(null)}
      />
    );
  }

  return (
    <SettingsTabGrid>
      <SettingsSection
        description="Review workspace ownership, plan state, and membership."
        icon={BuildingIcon}
        title="Workspaces"
      >
        <AdminWorkspacesTable
          onOpenProfile={onOpenProfile}
          rows={adminData.workspaces}
        />
      </SettingsSection>
      <SettingsSection
        action={<AdminInviteUserDialog workspaces={adminData.workspaces} />}
        description="Review people, roles, workspace membership, and access state."
        icon={Users}
        title="Users"
      >
        <AdminUsersTable
          onOpenProfile={onOpenProfile}
          rows={adminData.users}
        />
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function AdminInviteUserDialog({
  workspaces,
}: {
  workspaces: AdminWorkspaceRow[];
}) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("member");
  const [sentSuccessfully, setSentSuccessfully] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    workspaces[0]?.[7] ?? "",
  );
  const trimmedEmailInput = emailInput.trim();
  const canSendInvite = emails.length > 0 || trimmedEmailInput.length > 0;

  useEffect(() => {
    if (!selectedWorkspaceId && workspaces[0]?.[7]) {
      setSelectedWorkspaceId(workspaces[0][7]);
    }
  }, [selectedWorkspaceId, workspaces]);

  useEffect(() => {
    if (errorMessage) {
      void playAtmetSound("error");
    }
  }, [errorMessage]);

  function normalizeInviteEmail(value: string) {
    return value.trim().replace(/[,\s;]+$/g, "").toLowerCase();
  }

  function addInviteEmail(value: string) {
    const nextEmail = normalizeInviteEmail(value);

    if (!nextEmail) {
      return false;
    }

    if (!nextEmail.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      return false;
    }

    setEmails((currentEmails) =>
      currentEmails.includes(nextEmail)
        ? currentEmails
        : [...currentEmails, nextEmail],
    );
    setEmailInput("");
    setErrorMessage("");
    setSentSuccessfully(false);
    return true;
  }

  function removeInviteEmail(emailToRemove: string) {
    setEmails((currentEmails) =>
      currentEmails.filter((currentEmail) => currentEmail !== emailToRemove),
    );
    setSentSuccessfully(false);
  }

  function resetForm() {
    setEmailInput("");
    setEmails([]);
    setErrorMessage("");
    setIsSending(false);
    setSentSuccessfully(false);
    setRole("member");
    setSelectedWorkspaceId(workspaces[0]?.[7] ?? "");
  }

  async function submitInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSendInvite || !selectedWorkspaceId || isSending) {
      return;
    }

    const pendingEmails = emails.length
      ? emails
      : [normalizeInviteEmail(emailInput)];

    if (pendingEmails.some((pendingEmail) => !pendingEmail.includes("@"))) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setIsSending(true);
    setSentSuccessfully(false);

    try {
      for (const inviteEmail of pendingEmails) {
        const response = await fetch(`/api/workspaces/${selectedWorkspaceId}/members`, {
          body: JSON.stringify({ email: inviteEmail, role }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!response.ok) {
          const payload = asRecord(await response.json().catch(() => ({})));
          throw new Error(asString(payload.error, "Could not send invite"));
        }
      }

      setEmailInput("");
      setEmails([]);
      setErrorMessage("");
      setSentSuccessfully(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not send invite",
      );
      setSentSuccessfully(false);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
      open={open}
    >
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        <Icon icon={PlusSignIcon} />
        Invite user
      </Button>
      <DialogPopup className="max-w-md rounded-xl">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitInvite}>
          <DialogHeader className="gap-1 border-b border-border/70 px-4 py-3">
            <DialogTitle className="text-base leading-6">Invite user</DialogTitle>
            <DialogDescription className="text-xs leading-5">
              Add a user to a workspace and assign their access role.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="grid gap-3 p-4" scrollFade={false}>
            <div className="grid gap-1.5">
              <Label htmlFor="admin-invite-email">Email</Label>
              <div
                className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-1 text-sm shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20"
                onClick={(event) => {
                  const input = event.currentTarget.querySelector("input");
                  input?.focus();
                }}
              >
                {emails.map((inviteEmail) => (
                  <span
                    className="inline-flex h-6 max-w-full items-center gap-1 rounded-md border border-border/70 bg-muted px-2 text-xs text-foreground"
                    key={inviteEmail}
                  >
                    <span className="max-w-48 truncate">{inviteEmail}</span>
                    <button
                      aria-label={`Remove ${inviteEmail}`}
                      className="-mr-1 grid size-4 place-items-center rounded text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      disabled={isSending}
                      onClick={(event) => {
                        event.preventDefault();
                        removeInviteEmail(inviteEmail);
                      }}
                      type="button"
                    >
                      x
                    </button>
                  </span>
                ))}
                <input
                  autoFocus
                  className="h-7 min-w-36 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSending}
                  id="admin-invite-email"
                  onBlur={() => {
                    if (trimmedEmailInput.includes("@")) {
                      addInviteEmail(trimmedEmailInput);
                    }
                  }}
                  onChange={(event) => {
                    setEmailInput(event.target.value);
                    setSentSuccessfully(false);
                  }}
                  onKeyDown={(event) => {
                    if (
                      [" ", "Enter", ","].includes(event.key) &&
                      trimmedEmailInput
                    ) {
                      event.preventDefault();
                      addInviteEmail(trimmedEmailInput);
                    }

                    if (
                      event.key === "Backspace" &&
                      !emailInput &&
                      emails.length > 0
                    ) {
                      event.preventDefault();
                      removeInviteEmail(emails[emails.length - 1]);
                    }
                  }}
                  placeholder={emails.length ? "Add another email" : "user@company.com"}
                  type="text"
                  value={emailInput}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Workspace</Label>
              <Select
                disabled={isSending || workspaces.length === 0}
                onValueChange={(value) => setSelectedWorkspaceId(value ?? "")}
                value={selectedWorkspaceId}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Choose workspace" />
                </SelectTrigger>
                <SelectPopup>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace[7]} value={workspace[7]}>
                      {workspace[0]}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select
                disabled={isSending}
                onValueChange={(value) => setRole(value ?? "member")}
                value={role}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectPopup>
                  {["member", "admin", "viewer"].map((roleOption) => (
                    <SelectItem key={roleOption} value={roleOption}>
                      {roleOption[0]?.toUpperCase() + roleOption.slice(1)}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </div>
            {errorMessage && (
              <p className="text-xs leading-5 text-destructive">
                {errorMessage}
              </p>
            )}
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              loading={isSending}
              disabled={!canSendInvite || !selectedWorkspaceId}
              type="submit"
            >
              {sentSuccessfully ? (
                <>
                  <Icon className="size-3.5" icon={CheckIcon} />
                  Sent successfully
                </>
              ) : (
                "Send invite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

function AdminRequestsTab({ rows }: { rows: AdminRequestRow[] }) {
  const [requests, setRequests] = useState(rows);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    setRequests(rows);
  }, [rows]);

  async function updateRequestStatus(requestId: string, status: "approved" | "rejected") {
    setError("");
    setUpdatingRequestId(requestId);

    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const payload = asRecord(await response.json().catch(() => ({})));

      if (!response.ok) {
        throw new Error(asString(payload.error, "Could not update this request."));
      }

      const updatedRequest = mapAdminRequest(payload.request);
      if (updatedRequest) {
        setRequests((currentRequests) =>
          currentRequests.map((request) =>
            request.id === requestId ? updatedRequest : request,
          ),
        );
      }

      if (status === "approved") {
        setSentRequestIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.add(requestId);
          return nextIds;
        });
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update this request.",
      );
    } finally {
      setUpdatingRequestId(null);
    }
  }

  return (
    <SettingsTabGrid>
      {error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2 text-red-600 text-sm dark:text-red-500">
          {error}
        </div>
      ) : null}
      <AdminRequestsTable
        description="Confirm waitlist users when they are ready to join Atmet."
        onUpdateStatus={updateRequestStatus}
        rows={requests}
        sentRequestIds={sentRequestIds}
        title="Waitlist requests"
        updatingRequestId={updatingRequestId}
      />
    </SettingsTabGrid>
  );
}

function AdminRolesTab({ rows }: { rows: AdminRoleRow[] }) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleSearch, setRoleSearch] = useState("");
  const roleFilterOptions = getTableFilterOptions(
    rows.map(([, , access]) => access),
    "All access",
  );
  const visibleRows = rows.filter(([role, description, access]) => {
    const matchesSearch = matchesTableSearch(
      [role, description, access],
      roleSearch,
    );
    const matchesFilter =
      roleFilter === "all" || normalizeFilterValue(access) === roleFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <SettingsTabGrid>
      <SettingsSection
        action={
          <SettingsActionDialogButton
            confirmLabel="Create role"
            description="Create a custom admin role and choose its permission profile."
            icon={PlusSignIcon}
            title="Create role"
            triggerLabel="Create role"
          >
            <div className="grid gap-2">
              <Label>Role name</Label>
              <Input placeholder="Workflow reviewer" size="sm" />
            </div>
            <div className="grid gap-2">
              <Label>Permission level</Label>
              <Button className="justify-between" size="sm" variant="outline">
                Limited
                <Icon icon={ChevronDownIcon} />
              </Button>
            </div>
          </SettingsActionDialogButton>
        }
        description="Set what each workspace role can access."
        icon={ShieldCheck}
        title="Roles and permissions"
      >
        <div className="border-b border-border/70 px-4 py-3">
          <TableFilterControls
            filterLabel="Filter roles"
            filterOptions={roleFilterOptions}
            filterValue={roleFilter}
            onFilterChange={setRoleFilter}
            onSearchChange={setRoleSearch}
            searchPlaceholder="Search roles..."
            searchValue={roleSearch}
          />
        </div>
        <div className={tableViewportClassName}>
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map(([role, description, access]) => (
                <TableRow key={role}>
                  <TableCell>{role}</TableCell>
                  <TableCell className="max-w-xl text-muted-foreground">
                    {description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={access === "All" ? "success" : "outline"}>
                      {access}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <SettingsActionDialogButton
                      confirmLabel="Save permissions"
                      description={`Update the permissions available to the ${role} role.`}
                      size="xs"
                      title={`Edit ${role} permissions`}
                      triggerLabel="Edit permissions"
                    >
                      <SettingsSwitchRow
                        defaultChecked={access !== "Read only"}
                        description="Allow this role to create and edit workflow agents."
                        title="Manage workflow agents"
                      />
                      <SettingsSwitchRow
                        defaultChecked={access === "All" || access === "Most"}
                        description="Allow this role to approve connector and waitlist requests."
                        title="Approve requests"
                      />
                    </SettingsActionDialogButton>
                  </TableCell>
                </TableRow>
              ))}
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    No roles match these filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function AdminUsageControlsTab({
  controls,
  workspaces,
}: {
  controls: DatabaseRecord[];
  workspaces: AdminWorkspaceRow[];
}) {
  const [localControls, setLocalControls] = useState<DatabaseRecord[]>(controls);
  const firstWorkspace = workspaces[0]?.[0] ?? "No workspace";
  const [selectedWorkspace, setSelectedWorkspace] = useState(
    firstWorkspace,
  );

  useEffect(() => {
    setLocalControls(controls);
  }, [controls]);

  const selectedWorkspaceName = workspaces.some(
    ([workspace]) => workspace === selectedWorkspace,
  )
    ? selectedWorkspace
    : firstWorkspace;
  const globalControls =
    localControls.find((control) => !asString(control.workspace_id)) ?? {};
  const selectedWorkspaceRow = workspaces.find(
    ([name]) => name === selectedWorkspaceName,
  );
  const selectedWorkspaceId = selectedWorkspaceRow?.[7] ?? "";
  const workspaceControls =
    localControls.find(
      (control) => asString(control.workspace_id) === selectedWorkspaceId,
    ) ?? {};

  function updateSavedControl(nextControl: DatabaseRecord) {
    setLocalControls((current) => {
      const nextWorkspaceId = asString(nextControl.workspace_id);
      const nextId = asString(nextControl.id);
      const controlExists = current.some((control) => {
        const controlId = asString(control.id);
        if (nextId && controlId === nextId) {
          return true;
        }

        return asString(control.workspace_id) === nextWorkspaceId;
      });

      if (!controlExists) {
        return [nextControl, ...current];
      }

      return current.map((control) => {
        const controlId = asString(control.id);
        if (nextId && controlId === nextId) {
          return nextControl;
        }

        return asString(control.workspace_id) === nextWorkspaceId
          ? nextControl
          : control;
      });
    });
  }

  return (
    <SettingsTabGrid>
      <AdminUsageControlPanel
        control={globalControls}
        description="Set the default limits every workspace inherits unless it has a custom override."
        onSaved={updateSavedControl}
        title="Workspace default usage limits"
        workspaceId={null}
      />

      <SettingsSection
        action={
          <Menu>
            <MenuTrigger
              render={
                <Button className="min-w-48 justify-between" size="sm" variant="outline">
                  {selectedWorkspaceName}
                  <Icon className="opacity-70" icon={ChevronDownIcon} />
                </Button>
              }
            />
            <MenuPopup align="end" className="min-w-56" sideOffset={8}>
              {workspaces.map(([workspace]) => (
                <MenuItem
                  key={workspace}
                  onClick={() => setSelectedWorkspace(workspace)}
                >
                  <Icon
                    className={cn(
                      selectedWorkspaceName === workspace
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                    icon={CheckIcon}
                  />
                  {workspace}
                </MenuItem>
              ))}
            </MenuPopup>
          </Menu>
        }
        description="Choose a workspace and apply custom controls without changing the global defaults."
        icon={BuildingIcon}
        title="Workspace custom controls"
      >
        <div className="p-4">
          <AdminUsageControlForm
            control={workspaceControls}
            fallback={globalControls}
            onSaved={updateSavedControl}
            submitLabel={`Save ${selectedWorkspaceName}`}
            workspaceId={selectedWorkspaceId}
          />
        </div>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function getUsageControlValue(
  control: DatabaseRecord,
  key: string,
  fallback: number,
) {
  return String(asNumber(control[key], fallback));
}

function getUsageControlBoolean(
  control: DatabaseRecord,
  key: string,
  fallback: boolean,
) {
  const value = control[key];
  return typeof value === "boolean" ? value : fallback;
}

function AdminUsageControlPanel({
  control,
  description,
  onSaved,
  title,
  workspaceId,
}: {
  control: DatabaseRecord;
  description: string;
  onSaved: (control: DatabaseRecord) => void;
  title: string;
  workspaceId: string | null;
}) {
  return (
    <SettingsSection
      description={description}
      icon={DatabaseIcon}
      title={title}
    >
      <div className="p-4">
        <AdminUsageControlForm
          control={control}
          onSaved={onSaved}
          submitLabel="Save defaults"
          workspaceId={workspaceId}
        />
      </div>
    </SettingsSection>
  );
}

function AdminUsageControlForm({
  control,
  fallback,
  onSaved,
  submitLabel,
  workspaceId,
}: {
  control: DatabaseRecord;
  fallback?: DatabaseRecord;
  onSaved: (control: DatabaseRecord) => void;
  submitLabel: string;
  workspaceId: string | null;
}) {
  const fallbackControl = fallback ?? {};
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    agentLimit: getUsageControlValue(control, "agent_limit", asNumber(fallbackControl.agent_limit, 25)),
    connectorLimit: getUsageControlValue(control, "connector_limit", asNumber(fallbackControl.connector_limit, 10)),
    enforceWorkspaceLimits: getUsageControlBoolean(
      control,
      "enforce_workspace_limits",
      getUsageControlBoolean(fallbackControl, "enforce_workspace_limits", true),
    ),
    monthlyRunLimit: getUsageControlValue(control, "monthly_run_limit", asNumber(fallbackControl.monthly_run_limit, 12000)),
    monthlyTokenLimit: getUsageControlValue(control, "monthly_token_limit", asNumber(fallbackControl.monthly_token_limit, 50000)),
    requireWriteApprovals: getUsageControlBoolean(
      control,
      "require_write_approvals",
      getUsageControlBoolean(fallbackControl, "require_write_approvals", true),
    ),
    storageLimitGb: getUsageControlValue(control, "storage_limit_gb", asNumber(fallbackControl.storage_limit_gb, 25)),
    usageAlertThreshold: getUsageControlValue(control, "usage_alert_threshold", asNumber(fallbackControl.usage_alert_threshold, 80)),
  }));

  useEffect(() => {
    setForm({
      agentLimit: getUsageControlValue(control, "agent_limit", asNumber(fallbackControl.agent_limit, 25)),
      connectorLimit: getUsageControlValue(control, "connector_limit", asNumber(fallbackControl.connector_limit, 10)),
      enforceWorkspaceLimits: getUsageControlBoolean(
        control,
        "enforce_workspace_limits",
        getUsageControlBoolean(fallbackControl, "enforce_workspace_limits", true),
      ),
      monthlyRunLimit: getUsageControlValue(control, "monthly_run_limit", asNumber(fallbackControl.monthly_run_limit, 12000)),
      monthlyTokenLimit: getUsageControlValue(control, "monthly_token_limit", asNumber(fallbackControl.monthly_token_limit, 50000)),
      requireWriteApprovals: getUsageControlBoolean(
        control,
        "require_write_approvals",
        getUsageControlBoolean(fallbackControl, "require_write_approvals", true),
      ),
      storageLimitGb: getUsageControlValue(control, "storage_limit_gb", asNumber(fallbackControl.storage_limit_gb, 25)),
      usageAlertThreshold: getUsageControlValue(control, "usage_alert_threshold", asNumber(fallbackControl.usage_alert_threshold, 80)),
    });
  }, [control, fallback]);

  function updateForm(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveControls() {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/usage-controls", {
        body: JSON.stringify({
          ...form,
          workspaceId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(await getResponseError(response, "Could not save usage controls"));
      }

      const payload = asRecord(await response.json());
      onSaved(asRecord(payload.controls));
    } catch (error) {
      void playAtmetSound("error");
      window.alert(error instanceof Error ? error.message : "Could not save usage controls.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <AdminUsageLimitField
          description="Monthly AI tokens available to the workspace by default."
          label="Default token limit"
          onChange={(value) => updateForm("monthlyTokenLimit", value)}
          suffix="tokens"
          value={form.monthlyTokenLimit}
        />
        <AdminUsageLimitField
          description="Total stored attachment data allowed for the workspace."
          label="Storage limit"
          onChange={(value) => updateForm("storageLimitGb", value)}
          suffix="GB"
          value={form.storageLimitGb}
        />
        <AdminUsageLimitField
          description="Maximum workflow agents this workspace can create."
          label="Agent limit"
          onChange={(value) => updateForm("agentLimit", value)}
          suffix="agents"
          value={form.agentLimit}
        />
        <AdminUsageLimitField
          description="Maximum scheduled or manual workflow runs per month."
          label="Run limit"
          onChange={(value) => updateForm("monthlyRunLimit", value)}
          suffix="runs"
          value={form.monthlyRunLimit}
        />
        <AdminUsageLimitField
          description="Maximum connected apps allowed before admin review."
          label="Connector limit"
          onChange={(value) => updateForm("connectorLimit", value)}
          suffix="apps"
          value={form.connectorLimit}
        />
        <AdminUsageLimitField
          description="When admins should receive usage warnings."
          label="Alert threshold"
          max={100}
          onChange={(value) => updateForm("usageAlertThreshold", value)}
          suffix="%"
          value={form.usageAlertThreshold}
        />
      </div>
      <div className="grid gap-2 rounded-xl border border-border/70 bg-muted/25 p-3 sm:grid-cols-2">
        <AdminUsageSwitch
          checked={form.enforceWorkspaceLimits}
          description="Pause runs and creation when configured limits are reached."
          onCheckedChange={(value) => updateForm("enforceWorkspaceLimits", value)}
          title="Enforce limits"
        />
        <AdminUsageSwitch
          checked={form.requireWriteApprovals}
          description="Require approval before agents write to connected apps."
          onCheckedChange={(value) => updateForm("requireWriteApprovals", value)}
          title="Require write approvals"
        />
      </div>
      <div className="flex justify-end">
        <Button loading={saving} onClick={() => void saveControls()} size="sm">
          <Icon icon={SaveIcon} />
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

function AdminUsageLimitField({
  description,
  label,
  max,
  onChange,
  suffix,
  value,
}: {
  description: string;
  label: string;
  max?: number;
  onChange: (value: string) => void;
  suffix: string;
  value: string;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-border/70 bg-background/55 p-3">
      <div>
        <Label>{label}</Label>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <Group className="h-8">
        <Input
          className="h-full text-sm tabular-nums [&_[data-slot=input]]:h-full [&_[data-slot=input]]:leading-none"
          max={max}
          min="0"
          onChange={(event) => onChange(event.target.value)}
          size="sm"
          type="number"
          value={value}
        />
        <GroupSeparator />
        <span className="px-2 text-xs text-muted-foreground">{suffix}</span>
      </Group>
    </div>
  );
}

function AdminUsageSwitch({
  checked,
  description,
  onCheckedChange,
  title,
}: {
  checked: boolean;
  description: string;
  onCheckedChange: (checked: boolean) => void;
  title: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-background/50 p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        className="shrink-0"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

type TableFilterOption = {
  label: string;
  value: string;
};

type TableSelectFilter = {
  label: string;
  onChange: (value: string) => void;
  options: TableFilterOption[];
  value: string;
};

const tableViewportClassName =
  "min-w-0 max-w-full overflow-x-auto overflow-y-visible overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function normalizeFilterValue(value: string) {
  return value.trim().toLowerCase() || "unknown";
}

function getTableFilterOptions(values: string[], allLabel = "All") {
  const uniqueValues = Array.from(
    new Set(values.map(normalizeFilterValue).filter(Boolean)),
  );

  return [
    { label: allLabel, value: "all" },
    ...uniqueValues.map((value) => ({
      label: formatStatusLabel(value),
      value,
    })),
  ];
}

function getTableTextFilterOptions(values: string[], allLabel = "All") {
  const optionsByValue = new Map<string, string>();

  for (const value of values) {
    const label = value.trim() || "Unknown";
    const normalized = normalizeFilterValue(label);

    if (!optionsByValue.has(normalized)) {
      optionsByValue.set(normalized, label);
    }
  }

  return [
    { label: allLabel, value: "all" },
    ...Array.from(optionsByValue.entries())
      .sort(([, a], [, b]) => a.localeCompare(b))
      .map(([value, label]) => ({ label, value })),
  ];
}

function matchesTableSearch(values: unknown[], search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return values.some((value) =>
    String(value ?? "").toLowerCase().includes(query),
  );
}

function csvCell(value: unknown) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function downloadCsv(
  filename: string,
  headers: string[],
  rows: unknown[][],
) {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getTextFileMimeType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "csv":
      return "text/csv;charset=utf-8";
    case "html":
      return "text/html;charset=utf-8";
    case "json":
      return "application/json;charset=utf-8";
    case "doc":
    case "docx":
      return "application/msword;charset=utf-8";
    case "xls":
    case "xlsx":
      return "application/vnd.ms-excel;charset=utf-8";
    case "md":
    case "markdown":
      return "text/markdown;charset=utf-8";
    case "xml":
      return "application/xml;charset=utf-8";
    case "yaml":
    case "yml":
      return "application/yaml;charset=utf-8";
    default:
      return "text/plain;charset=utf-8";
  }
}

function downloadTextFile(filename: string, content: string) {
  const safeFilename = filename.trim() || "download.txt";
  const blob = new Blob([content], { type: getTextFileMimeType(safeFilename) });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadTableCsv(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  const content = tableToCsv(headers, rows);
  downloadTextFile(filename, content);
}

function downloadTableMarkdown(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  const content = tableToMarkdown(headers, rows);
  downloadTextFile(filename, content);
}

function downloadTableExcel(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  downloadTextFile(filename, tableToHtmlDocument(headers, rows, "Excel table"));
}

function downloadTableWord(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  downloadTextFile(filename, tableToHtmlDocument(headers, rows, "Word table"));
}

function getTableExportAction(
  kind: TableExportKind,
  headers: string[],
  rows: string[][],
) {
  switch (kind) {
    case "csv":
      return {
        filename: "generated-table.csv",
        label: "CSV",
        onClick: () => downloadTableCsv("generated-table.csv", headers, rows),
      };
    case "excel":
      return {
        filename: "generated-table.xls",
        label: "Excel",
        onClick: () => downloadTableExcel("generated-table.xls", headers, rows),
      };
    case "word":
      return {
        filename: "generated-table.doc",
        label: "Word",
        onClick: () => downloadTableWord("generated-table.doc", headers, rows),
      };
    case "markdown":
      return {
        filename: "generated-table.md",
        label: "MD",
        onClick: () => downloadTableMarkdown("generated-table.md", headers, rows),
      };
    case "pdf":
    default:
      return {
        filename: "generated-table.pdf",
        label: "PDF",
        onClick: () => downloadTablePdf("generated-table.pdf", headers, rows),
      };
  }
}

function downloadTablePdf(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  const safeFilename = filename.trim() || "generated-table.pdf";
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const columnCount = Math.max(1, headers.length);
  const columnWidth = contentWidth / columnCount;
  const maxCellChars = Math.max(8, Math.floor(columnWidth / 5));
  const rowHeight = 22;
  let y = pageHeight - margin;
  const operations: string[] = [];

  const drawText = (text: string, x: number, textY: number, size = 9) => {
    operations.push(
      `BT /F1 ${size} Tf ${x.toFixed(2)} ${textY.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`,
    );
  };

  drawText("Generated table", margin, y, 16);
  y -= 30;

  const tableRows = [headers, ...rows].slice(0, 30);
  tableRows.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    const fontSize = isHeader ? 9.5 : 8.5;

    row.slice(0, columnCount).forEach((cell, columnIndex) => {
      const x = margin + columnIndex * columnWidth;
      const text = truncatePdfText(plainPdfText(cell), maxCellChars);
      drawText(text, x, y, fontSize);
    });

    operations.push(
      `${margin.toFixed(2)} ${(y - 7).toFixed(2)} m ${(pageWidth - margin).toFixed(2)} ${(y - 7).toFixed(2)} l S`,
    );
    y -= rowHeight;
  });

  if (rows.length > tableRows.length - 1) {
    y -= 8;
    drawText(
      `Showing first ${tableRows.length - 1} rows of ${rows.length}.`,
      margin,
      y,
      8,
    );
  }

  downloadPdfBlob(safeFilename, createSimplePdf(operations.join("\n")));
}

function tableToCsv(headers: string[], rows: string[][]) {
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function tableToMarkdown(headers: string[], rows: string[][]) {
  const safeHeaders = headers.map(markdownTableCell);
  const separator = safeHeaders.map(() => "---");
  const safeRows = rows.map((row) => headers.map((_, index) => markdownTableCell(row[index] ?? "")));

  return [safeHeaders, separator, ...safeRows]
    .map((row) => `| ${row.join(" | ")} |`)
    .join("\n");
}

function markdownTableCell(value: unknown) {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function tableToHtmlDocument(
  headers: string[],
  rows: string[][],
  title: string,
) {
  const headerCells = headers
    .map((header) => `<th>${escapeHtml(String(header ?? ""))}</th>`)
    .join("");
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((_, index) => `<td>${escapeHtml(String(row[index] ?? ""))}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:Arial,sans-serif;color:#111827}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #d1d5db;padding:8px;text-align:left}
th{background:#f3f4f6;font-weight:700}
</style>
</head>
<body>
<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainPdfText(value: unknown) {
  return String(value ?? "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function truncatePdfText(value: string, maxLength: number) {
  return value.length > maxLength
    ? `${value.slice(0, Math.max(0, maxLength - 3))}...`
    : value;
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSimplePdf(contentStream: string) {
  const pageWidth = 595;
  const pageHeight = 842;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

function downloadPdfBlob(filename: string, pdf: string) {
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function TableFilterControls({
  filters = [],
  filterLabel,
  filterOptions,
  filterValue,
  onFilterChange,
  onSearchChange,
  searchPlaceholder,
  searchValue,
}: {
  filters?: TableSelectFilter[];
  filterLabel: string;
  filterOptions: TableFilterOption[];
  filterValue: string;
  onFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchValue: string;
}) {
  const selectFilters = [
    {
      label: filterLabel,
      onChange: onFilterChange,
      options: filterOptions,
      value: filterValue,
    },
    ...filters,
  ];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        aria-label={searchPlaceholder}
        className="sm:max-w-xs"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        size="sm"
        value={searchValue}
      />
      <div className="flex flex-wrap gap-2">
        {selectFilters.map((selectFilter) => (
          <Select
            key={selectFilter.label}
            onValueChange={(value) => selectFilter.onChange(value ?? "all")}
            value={selectFilter.value}
          >
            <SelectTrigger
              aria-label={selectFilter.label}
              className="sm:w-40"
              size="sm"
            >
              <SelectValue placeholder={selectFilter.label} />
            </SelectTrigger>
            <SelectPopup>
              {selectFilter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        ))}
      </div>
    </div>
  );
}

function AdminWorkspacesTable({
  onOpenProfile,
  rows,
}: {
  onOpenProfile: (profile: AdminProfileView) => void;
  rows: AdminWorkspaceRow[];
}) {
  const [workspaceFilter, setWorkspaceFilter] = useState("all");
  const [workspacePlanFilter, setWorkspacePlanFilter] = useState("all");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const workspaceFilterOptions = getTableFilterOptions(
    rows.map(([, , , , status]) => status),
    "All statuses",
  );
  const workspacePlanFilterOptions = getTableFilterOptions(
    rows.map(([, , plan]) => plan),
    "All plans",
  );
  const visibleRows = rows.filter(
    ([workspace, owner, plan, members, status, usage, created]) => {
      const matchesSearch = matchesTableSearch(
        [workspace, owner, plan, members, status, usage, created],
        workspaceSearch,
      );
      const matchesFilter =
        workspaceFilter === "all" ||
        normalizeFilterValue(status) === workspaceFilter;
      const matchesPlan =
        workspacePlanFilter === "all" ||
        normalizeFilterValue(plan) === workspacePlanFilter;

      return matchesSearch && matchesFilter && matchesPlan;
    },
  );

  return (
    <>
      <div className="border-b border-border/70 px-4 py-3">
        <TableFilterControls
          filterLabel="Filter workspaces"
          filterOptions={workspaceFilterOptions}
          filterValue={workspaceFilter}
          filters={[
            {
              label: "Filter plans",
              onChange: setWorkspacePlanFilter,
              options: workspacePlanFilterOptions,
              value: workspacePlanFilter,
            },
          ]}
          onFilterChange={setWorkspaceFilter}
          onSearchChange={setWorkspaceSearch}
          searchPlaceholder="Search workspaces..."
          searchValue={workspaceSearch}
        />
      </div>
      <div className={tableViewportClassName}>
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map(([workspace, owner, plan, members, status, , , , avatarUrl]) => (
              <TableRow
                className="cursor-pointer"
                key={workspace}
                onClick={() => onOpenProfile({ name: workspace, type: "workspace" })}
              >
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2">
                    <AvatarTile
                      className="size-8 rounded-lg border-0 bg-muted text-xs shadow-none"
                      initials={getOptionInitials(workspace)}
                      src={avatarUrl}
                    />
                    <span className="truncate">{workspace}</span>
                  </div>
                </TableCell>
                <TableCell>{owner}</TableCell>
                <TableCell>{plan}</TableCell>
                <TableCell className="tabular-nums">{members}</TableCell>
                <TableCell>
                  <AdminStatusBadge status={status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenProfile({ name: workspace, type: "workspace" });
                    }}
                    size="xs"
                    variant="outline"
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={6}
                >
                  No workspaces match these filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function AdminUsersTable({
  onOpenProfile,
  rows,
}: {
  onOpenProfile: (profile: AdminProfileView) => void;
  rows: AdminUserRow[];
}) {
  const [userFilter, setUserFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const userFilterOptions = getTableFilterOptions(
    rows.map(([, , , role]) => role),
    "All roles",
  );
  const userStatusFilterOptions = getTableFilterOptions(
    rows.map(([, , , , status]) => status),
    "All statuses",
  );
  const visibleRows = rows.filter(
    ([user, email, workspace, role, status, lastActive]) => {
      const matchesSearch = matchesTableSearch(
        [user, email, workspace, role, status, lastActive],
        userSearch,
      );
      const matchesFilter =
        userFilter === "all" || normalizeFilterValue(role) === userFilter;
      const matchesStatus =
        userStatusFilter === "all" ||
        normalizeFilterValue(status) === userStatusFilter;

      return matchesSearch && matchesFilter && matchesStatus;
    },
  );

  return (
    <>
      <div className="border-b border-border/70 px-4 py-3">
        <TableFilterControls
          filterLabel="Filter users"
          filterOptions={userFilterOptions}
          filterValue={userFilter}
          filters={[
            {
              label: "Filter statuses",
              onChange: setUserStatusFilter,
              options: userStatusFilterOptions,
              value: userStatusFilter,
            },
          ]}
          onFilterChange={setUserFilter}
          onSearchChange={setUserSearch}
          searchPlaceholder="Search users..."
          searchValue={userSearch}
        />
      </div>
      <div className={tableViewportClassName}>
        <Table className="min-w-[1040px]">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Workspace</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map(([user, email, workspace, role, status, lastActive, avatarUrl]) => (
              <TableRow
                className="cursor-pointer"
                key={`${user}-${workspace}`}
                onClick={() => onOpenProfile({ name: user, type: "user" })}
              >
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2">
                    <AvatarTile
                      className="size-8 rounded-lg border-0 bg-muted text-xs shadow-none"
                      initials={getInitialsFromText(user || email)}
                      src={avatarUrl}
                    />
                    <span className="truncate">{user}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{email}</TableCell>
                <TableCell>{workspace}</TableCell>
                <TableCell>{role}</TableCell>
                <TableCell>
                  <AdminStatusBadge status={status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{lastActive}</TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenProfile({ name: user, type: "user" });
                    }}
                    size="xs"
                    variant="outline"
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={7}
                >
                  No users match these filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function AdminWorkspaceProfile({
  adminData,
  name,
  onBack,
}: {
  adminData: AdminData;
  name: string;
  onBack: () => void;
}) {
  const [workspaceUserFilter, setWorkspaceUserFilter] = useState("all");
  const [workspaceUserStatusFilter, setWorkspaceUserStatusFilter] =
    useState("all");
  const [workspaceUserSearch, setWorkspaceUserSearch] = useState("");
  const workspace =
    adminData.workspaces.find(([workspaceName]) => workspaceName === name) ??
    adminData.workspaces[0];
  if (!workspace) {
    return (
      <SettingsTabGrid>
        <Button className="w-fit" onClick={onBack} size="sm" variant="ghost">
          <Icon icon={ArrowRight01Icon} className="rotate-180" />
          Back
        </Button>
        <EmptyStatePanel />
      </SettingsTabGrid>
    );
  }
  const [workspaceName, owner, plan, members, status, usage, created, workspaceId] =
    workspace;
  const workspaceSlug = workspaceName.toLowerCase().replace(/\s+/g, "-");
  const workspaceUrl = `https://app.atmetai.com/workspace/${workspaceSlug}`;
  const workspaceUsers = adminData.users.filter(
    ([, , userWorkspace]) => userWorkspace === workspaceName,
  );
  const workspaceUserFilterOptions = getTableFilterOptions(
    workspaceUsers.map(([, , , role]) => role),
    "All roles",
  );
  const workspaceUserStatusFilterOptions = getTableFilterOptions(
    workspaceUsers.map(([, , , , userStatus]) => userStatus),
    "All statuses",
  );
  const visibleWorkspaceUsers = workspaceUsers.filter(
    ([user, email, , role, userStatus]) => {
      const matchesSearch = matchesTableSearch(
        [user, email, role, userStatus],
        workspaceUserSearch,
      );
      const matchesFilter =
        workspaceUserFilter === "all" ||
        normalizeFilterValue(role) === workspaceUserFilter;
      const matchesStatus =
        workspaceUserStatusFilter === "all" ||
        normalizeFilterValue(userStatus) === workspaceUserStatusFilter;

      return matchesSearch && matchesFilter && matchesStatus;
    },
  );

  return (
    <SettingsTabGrid>
      <Button className="w-fit" onClick={onBack} size="sm" variant="ghost">
        <Icon icon={ArrowRight01Icon} className="rotate-180" />
        Back
      </Button>
      <SettingsSection
        action={<AdminStatusBadge status={status} />}
        description="Workspace profile, ownership, plan state, and linked members."
        icon={BuildingIcon}
        title={workspaceName}
      >
        <SettingsStatGrid
          stats={[
            ["Owner", owner],
            ["Plan", plan],
            ["Members", members],
            ["Usage", usage],
            ["Created", created],
            ["Connectors", "6"],
          ]}
        />
        <SettingsRow
          description="Public workspace URL used by users and invitations."
          title="Workspace URL"
        >
          <Button
            onClick={() => navigator.clipboard?.writeText(workspaceUrl)}
            size="sm"
            variant="outline"
          >
            <Icon icon={ClipboardCopyIcon} />
            Copy URL
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        description="Super admin controls for this workspace."
        icon={ShieldCheck}
        title="Workspace actions"
      >
        <SettingsRow
          description="Copy the workspace ID for audits, support, or backend checks."
          title="Workspace ID"
        >
          <Button
            disabled={!workspaceId}
            onClick={() => navigator.clipboard?.writeText(workspaceId)}
            size="sm"
            variant="outline"
          >
            <Icon icon={ClipboardCopyIcon} />
            Copy ID
          </Button>
        </SettingsRow>
        <SettingsRow
          description="Move billing and limits to a different plan."
          title="Plan override"
        >
          <SettingsActionDialogButton
            confirmLabel="Save plan"
            description={`Change ${workspaceName} from ${plan} to another plan.`}
            icon={WalletCardsIcon}
            title="Change workspace plan"
            triggerLabel="Change plan"
          >
            <Input defaultValue={plan} placeholder="Starter, Pro, or Business" />
          </SettingsActionDialogButton>
        </SettingsRow>
        <SettingsRow
          description="Transfer the workspace owner when a team changes ownership."
          title="Owner"
        >
          <SettingsActionDialogButton
            confirmLabel="Transfer owner"
            description={`Choose the new owner for ${workspaceName}.`}
            icon={Users}
            title="Transfer workspace ownership"
            triggerLabel="Transfer owner"
          >
            <Input defaultValue={owner} placeholder="Owner email or name" />
          </SettingsActionDialogButton>
        </SettingsRow>
        <SettingsRow
          description="Pause access for every member without deleting workspace data."
          title="Access"
        >
          <SettingsActionDialogButton
            confirmLabel="Suspend workspace"
            description={`${workspaceName} members will lose access until a super admin restores it.`}
            icon={PauseCircleIcon}
            title="Suspend workspace"
            triggerLabel="Suspend"
          />
        </SettingsRow>
        <SettingsRow
          description="Permanently remove this workspace and all related records."
          title="Danger zone"
        >
          <SettingsActionDialogButton
            className="text-red-600 hover:text-red-600 dark:text-red-500"
            confirmLabel="Delete workspace"
            description={`This will permanently delete ${workspaceName}. This action cannot be undone.`}
            icon={Delete02Icon}
            title="Delete workspace"
            triggerLabel="Delete"
            variant="outline"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        description="Users currently assigned to this workspace."
        icon={Users}
        title="Workspace users"
      >
        <div className="border-b border-border/70 px-4 py-3">
          <TableFilterControls
            filterLabel="Filter workspace users"
            filterOptions={workspaceUserFilterOptions}
            filterValue={workspaceUserFilter}
            filters={[
              {
                label: "Filter statuses",
                onChange: setWorkspaceUserStatusFilter,
                options: workspaceUserStatusFilterOptions,
                value: workspaceUserStatusFilter,
              },
            ]}
            onFilterChange={setWorkspaceUserFilter}
            onSearchChange={setWorkspaceUserSearch}
            searchPlaceholder="Search workspace users..."
            searchValue={workspaceUserSearch}
          />
        </div>
        <div className={tableViewportClassName}>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleWorkspaceUsers.map(([user, email, , role, userStatus]) => (
                <TableRow key={user}>
                  <TableCell>{user}</TableCell>
                  <TableCell className="text-muted-foreground">{email}</TableCell>
                  <TableCell>{role}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={userStatus} />
                  </TableCell>
                </TableRow>
              ))}
              {visibleWorkspaceUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    No workspace users match these filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function AdminUserProfile({
  adminData,
  name,
  onBack,
}: {
  adminData: AdminData;
  name: string;
  onBack: () => void;
}) {
  const user =
    adminData.users.find(([userName]) => userName === name) ??
    adminData.users[0];
  if (!user) {
    return (
      <SettingsTabGrid>
        <Button className="w-fit" onClick={onBack} size="sm" variant="ghost">
          <Icon icon={ArrowRight01Icon} className="rotate-180" />
          Back
        </Button>
        <EmptyStatePanel />
      </SettingsTabGrid>
    );
  }
  const [userName, email, workspace, role, status, lastActive] = user;

  return (
    <SettingsTabGrid>
      <Button className="w-fit" onClick={onBack} size="sm" variant="ghost">
        <Icon icon={ArrowRight01Icon} className="rotate-180" />
        Back
      </Button>
      <SettingsSection
        action={<AdminStatusBadge status={status} />}
        description="User profile, access state, and workspace membership."
        icon={UserRound}
        title={userName}
      >
        <SettingsStatGrid
          stats={[
            ["Email", email],
            ["Workspace", workspace],
            ["Role", role],
            ["Last active", lastActive],
            ["MFA", "Enabled"],
            ["Session", "Protected"],
          ]}
        />
        <SettingsRow
          description="Temporarily pause access without deleting the user."
          title="Access control"
        >
          <SettingsActionDialogButton
            confirmLabel="Suspend user"
            description={`${userName} will lose access until an admin restores the account.`}
            title="Suspend user"
            triggerLabel="Suspend user"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        description="Super admin controls for this user."
        icon={ShieldCheck}
        title="User actions"
      >
        <SettingsRow
          description="Copy the user email for support, invites, or audit trails."
          title="Email"
        >
          <Button
            disabled={!email}
            onClick={() => navigator.clipboard?.writeText(email)}
            size="sm"
            variant="outline"
          >
            <Icon icon={ClipboardCopyIcon} />
            Copy email
          </Button>
        </SettingsRow>
        <SettingsRow
          description="Update this user role inside their assigned workspace."
          title="Role override"
        >
          <SettingsActionDialogButton
            confirmLabel="Save role"
            description={`Change ${userName}'s role for ${workspace || "this workspace"}.`}
            icon={ProfileIcon}
            title="Change user role"
            triggerLabel="Change role"
          >
            <Input defaultValue={role} placeholder="Owner, Admin, Member, Viewer" />
          </SettingsActionDialogButton>
        </SettingsRow>
        <SettingsRow
          description="Send a secure reset link to the user's email address."
          title="Password"
        >
          <SettingsActionDialogButton
            confirmLabel="Send reset"
            description={`Send a password reset link to ${email || userName}.`}
            icon={SendHorizontal}
            title="Send password reset"
            triggerLabel="Send reset"
          />
        </SettingsRow>
        <SettingsRow
          description="Invalidate active sessions so the user has to sign in again."
          title="Sessions"
        >
          <SettingsActionDialogButton
            confirmLabel="Force sign out"
            description={`${userName} will be signed out from active sessions.`}
            icon={Logout03Icon}
            title="Force sign out"
            triggerLabel="Force sign out"
          />
        </SettingsRow>
        <SettingsRow
          description="Remove this user from their current workspace membership."
          title="Membership"
        >
          <SettingsActionDialogButton
            confirmLabel="Remove member"
            description={`Remove ${userName} from ${workspace || "their workspace"}.`}
            icon={Delete02Icon}
            title="Remove from workspace"
            triggerLabel="Remove member"
          />
        </SettingsRow>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function AdminRequestsTable({
  description,
  onUpdateStatus,
  rows,
  sentRequestIds,
  title,
  updatingRequestId,
}: {
  description: string;
  onUpdateStatus: (requestId: string, status: "approved" | "rejected") => void;
  rows: readonly AdminRequestRow[];
  sentRequestIds: Set<string>;
  title: string;
  updatingRequestId: string | null;
}) {
  const [requestFilter, setRequestFilter] = useState("all");
  const [requestWorkTypeFilter, setRequestWorkTypeFilter] = useState("all");
  const [requestCountryFilter, setRequestCountryFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");
  const requestFilterOptions = getTableFilterOptions(
    rows.map((row) => row.status),
    "All statuses",
  );
  const requestWorkTypeOptions = getTableFilterOptions(
    rows.map((row) => row.workType || row.useCase),
    "All industries",
  );
  const requestCountryOptions = getTableFilterOptions(
    rows.map((row) => row.country),
    "All countries",
  );
  const visibleRows = rows.filter((row) => {
    const matchesSearch = matchesTableSearch(
      [
        row.name,
        row.email,
        row.company,
        row.companySize,
        row.workType,
        row.roleTitle,
        row.country,
        row.source,
        row.notes,
        row.status,
        row.submitted,
      ],
      requestSearch,
    );
    const matchesFilter =
      requestFilter === "all" ||
      normalizeFilterValue(row.status) === requestFilter;
    const matchesWorkType =
      requestWorkTypeFilter === "all" ||
      normalizeFilterValue(row.workType || row.useCase) ===
        requestWorkTypeFilter;
    const matchesCountry =
      requestCountryFilter === "all" ||
      normalizeFilterValue(row.country) === requestCountryFilter;

    return matchesSearch && matchesFilter && matchesWorkType && matchesCountry;
  });

  return (
    <SettingsSection description={description} icon={File01Icon} title={title}>
      <div className="border-b border-border/70 px-4 py-3">
        <TableFilterControls
          filterLabel="Filter requests"
          filterOptions={requestFilterOptions}
          filterValue={requestFilter}
          filters={[
            {
              label: "Filter industry",
              onChange: setRequestWorkTypeFilter,
              options: requestWorkTypeOptions,
              value: requestWorkTypeFilter,
            },
            {
              label: "Filter countries",
              onChange: setRequestCountryFilter,
              options: requestCountryOptions,
              value: requestCountryFilter,
            },
          ]}
          onFilterChange={setRequestFilter}
          onSearchChange={setRequestSearch}
          searchPlaceholder="Search requests..."
          searchValue={requestSearch}
        />
      </div>
      <div className={tableViewportClassName}>
        <Table className="min-w-[1360px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Company size</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => {
              const normalizedStatus = row.status.toLowerCase();
              const isPending = normalizedStatus === "pending";
              const canResendInvite =
                normalizedStatus === "invited" ||
                normalizedStatus === "pending setup";
              const isUpdating = updatingRequestId === row.id;

              return (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.email}</TableCell>
                  <TableCell>{row.company || "-"}</TableCell>
                  <TableCell>{row.companySize || "-"}</TableCell>
                  <TableCell>{row.workType || row.useCase || "-"}</TableCell>
                  <TableCell>{row.roleTitle || "-"}</TableCell>
                  <TableCell>{row.source || "-"}</TableCell>
                  <TableCell>{row.country || "-"}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                    {row.notes || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.submitted}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {isPending ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          loading={isUpdating}
                          onClick={() => onUpdateStatus(row.id, "approved")}
                          size="xs"
                          variant="outline"
                        >
                          Approve
                        </Button>
                        <Button
                          loading={isUpdating}
                          onClick={() => onUpdateStatus(row.id, "rejected")}
                          size="xs"
                          variant="ghost"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : canResendInvite ? (
                      <Button
                        loading={isUpdating}
                        onClick={() => onUpdateStatus(row.id, "approved")}
                        size="xs"
                        variant="outline"
                      >
                        {sentRequestIds.has(row.id) ? (
                          <Icon className="text-success" icon={CheckIcon} />
                        ) : null}
                        Resend email
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">No actions</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={12}
                >
                  No requests match these filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </SettingsSection>
  );
}

function AdminStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();
  const variant =
    normalizedStatus === "active" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "joined"
      ? "success"
      : normalizedStatus === "pending" ||
          normalizedStatus === "review" ||
          normalizedStatus === "invited" ||
          normalizedStatus === "pending setup"
        ? "warning"
        : normalizedStatus === "rejected" || normalizedStatus === "suspended"
          ? "error"
          : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}

function BootstrapErrorBanner({ error }: { error: string }) {
  return (
    <div
      className="mb-3 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-sm text-red-600 dark:text-red-500"
      role="alert"
    >
      <div className="flex items-center justify-between gap-3">
        <span>{`Backend data did not load: ${error}`}</span>
        <Button
          onClick={() => window.location.reload()}
          size="xs"
          variant="outline"
        >
          Reload
        </Button>
      </div>
    </div>
  );
}

function LoadingPill({ label }: { label: string }) {
  return (
    <div className="mb-3 flex w-fit items-center gap-2 rounded-lg border border-border/50 bg-muted/45 px-2.5 py-1.5 text-xs text-muted-foreground">
      <Spinner className="size-3.5" />
      <span>{label}</span>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0 animate-pulse rounded bg-sidebar-accent/80",
        className,
      )}
    />
  );
}

function PageHydrationSpinner() {
  return (
    <div className="mb-2 flex h-5 items-center justify-end">
      <Spinner className="size-4 text-muted-foreground" />
    </div>
  );
}

function LoadingFrame({ label }: { label: string }) {
  return (
    <Frame>
      <FramePanel className="grid min-h-[24rem] place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          <span>{label}</span>
        </div>
      </FramePanel>
    </Frame>
  );
}

function EmptyPage({
  description = "This area is intentionally empty for now.",
  title,
}: {
  description?: string;
  title: string;
}) {
  return (
    <>
      <PageHeader description={description} title={title} />
      <EmptyStatePanel />
    </>
  );
}

function EmptyStatePanel() {
  return (
    <Frame>
      <FramePanel className="grid min-h-[22rem] place-items-center">
        <div className="text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Icon className="size-5" icon={AppWindowIcon} />
          </div>
          <p className="mt-3 text-sm font-medium">No content yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Atmet can fill this in when the product flow is ready.
          </p>
        </div>
      </FramePanel>
    </Frame>
  );
}

function Icon({
  className,
  icon,
}: {
  className?: string;
  icon: IconSvgElement;
}) {
  return (
    <HugeiconsIcon
      className={cn("size-4 shrink-0", className)}
      icon={icon}
      strokeWidth={1.7}
    />
  );
}
