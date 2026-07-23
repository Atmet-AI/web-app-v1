"use client";

import Image from "next/image";
import {
  Ai as AiLogoIcon,
  AiBrainIcon,
  AiChatIcon,
  AiMagicIcon,
  AppWindowIcon,
  AppWindowMacIcon,
  ArrowRight01Icon,
  BookOpenIcon,
  BoxesIcon,
  Brain03Icon,
  BuildingIcon,
  CalendarClockIcon,
  ChartIcon,
  Chat01Icon,
  ChevronDownIcon,
  CheckIcon,
  ClipboardCopyIcon,
  CodeIcon,
  CopyLinkIcon,
  CreditCardIcon,
  DatabaseIcon,
  Delete02Icon,
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
  SaveIcon,
  Search01Icon,
  SendHorizontal,
  Settings01Icon,
  ShieldCheck,
  SparklesIcon,
  SourceCodeIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextNumberSignIcon,
  UserRound,
  Users,
  WalletCardsIcon,
  WorkflowCircleIcon,
  WorkflowSquare01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PageKey =
  | "chat"
  | "brain"
  | "agents"
  | "skills"
  | "connectors"
  | "usage"
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
  { key: "agents", label: "Workflow Agents", icon: WorkflowSquare01Icon },
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

type Agent = {
  id?: string;
  appLogos: string[];
  gradient: string;
  name: string;
  runtime: "paused" | "running";
  status: string;
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
  id: string;
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

function updateAppRouteState({
  adminTab,
  chatId,
  page,
}: {
  adminTab?: AdminTabKey;
  chatId?: string | null;
  page?: PageKey;
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

  if (chatId !== undefined) {
    if (chatId) {
      url.searchParams.set("chat", chatId);
    } else {
      url.searchParams.delete("chat");
    }
  } else if (nextPage !== "chat") {
    url.searchParams.delete("chat");
  }

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
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
  source: "Activity" | "Session";
  status: string;
  time: string;
  user: string;
};
type AdminUserRow = [string, string, string, string, string, string, string];
type AdminRoleRow = [string, string, string];

type AdminProfileView =
  | { name: string; type: "user" }
  | { name: string; type: "workspace" };

type AdminData = {
  activityLogs: AdminLogRow[];
  requests: AdminRequestRow[];
  roles: AdminRoleRow[];
  sessionLogs: AdminLogRow[];
  usageControls: DatabaseRecord[];
  users: AdminUserRow[];
  workspaces: AdminWorkspaceRow[];
};

const emptyAdminData: AdminData = {
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

function mapAdminLog(row: unknown, source: "Activity" | "Session"): AdminLogRow | null {
  const record = asRecord(row);
  const profile = getRecordByKey(record, "profiles");
  const createdAt = asString(record.created_at);

  if (source === "Session") {
    return {
      detail: asString(record.ip_address, "Unknown location"),
      event: asString(record.event, "Session"),
      sortTime: createdAt,
      source,
      status: formatStatusLabel(asString(record.event, "Active")),
      time: formatDateTimeLabel(createdAt) || "",
      user: asString(profile.full_name, asString(profile.email, "Unknown user")),
    };
  }

  return {
    detail: asString(record.target_type, asString(record.target_id)),
    event: asString(record.action, "Activity"),
    sortTime: createdAt,
    source,
    status: "Recorded",
    time: formatDateTimeLabel(createdAt) || "",
    user: asString(profile.full_name, asString(profile.email, "System")),
  };
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
  settings:
    "Manage profile, workspace preferences, billing, data, and support options.",
  skills:
    "Add reusable capabilities that agents and chats can call when work gets specific.",
  usage:
    "Usage summary for workspace activity, personal usage, and member limits.",
} satisfies Partial<Record<PageKey, string>>;

type SidebarChat = {
  id: string;
  pinned: boolean;
  title: string;
};

type WorkflowChatNode = {
  chatId: string;
  title: string;
};

type ChatDraftRequest = {
  chatId: string;
  prompt: string;
  requestId: number;
};

const initialSidebarChats: SidebarChat[] = [];

const modelOptions = [
  { name: "Atmet", icon: AiChatIcon },
  { name: "Gemini 3", icon: SparklesIcon },
  { name: "GPT-5-mini", icon: AiBrainIcon },
  { name: "Claude 4.5 Sonnet", icon: AiLogoIcon },
  { name: "GPT-5-1 Mini", icon: AiBrainIcon },
  { name: "GPT-5-1", icon: AiBrainIcon },
] satisfies { name: string; icon: IconSvgElement }[];

type ComposerOption = {
  id: string;
  kind: "apps" | "skills";
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
  content: string;
  id: string;
  role: "assistant" | "user";
  state?: "complete" | "thinking";
  variant?: AiOutputVariant;
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
  initials: string;
  lastActive: string;
  name: string;
  role: string;
  status: "Active" | "Invited" | "Limited";
};

type UsageData = {
  automations: number;
  chats: number;
  files: number;
  storage: number;
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
  if (!id) {
    return null;
  }

  return {
    id,
    pinned: asBoolean(record.pinned),
    title: asString(record.title, "Untitled chat"),
  };
}

function mapChatMessage(row: unknown): ChatMessage | null {
  const record = asRecord(row);
  const id = asString(record.id);
  const role = asString(record.role);

  if (!id || (role !== "assistant" && role !== "user")) {
    return null;
  }

  return {
    content: asString(record.content),
    id,
    role,
    state: "complete",
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

function mapConnector(app: unknown, connectionsByKey: Set<string>, index: number): ConnectorItem | null {
  const record = asRecord(app);
  const key = asString(record.key);
  const name = asString(record.name);
  if (!key || !name) {
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
  const nodeRows = asRecordArray(record.workflow_nodes);
  const edgeRows = asRecordArray(record.workflow_edges);
  const appLogos = nodeRows
    .flatMap((node) => asRecordArray(node.connected_apps))
    .map((app) => asString(app.logo))
    .filter(Boolean);
  const workflowCards = nodeRows
    .map((node, nodeIndex) => {
      const nodeId = asString(node.id);
      if (!nodeId) {
        return null;
      }

      const appKeys = Array.isArray(node.app_keys)
        ? node.app_keys.map((item) => String(item))
        : [];

      return {
        apps:
          appKeys.length > 0
            ? appKeys.map((key) => getInitialsFromText(key))
            : ["AT"],
        id: nodeId,
        runtime: mapRuntime(node.runtime_state),
        title: asString(node.title, "Empty chat"),
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
    name,
    runtime: mapRuntime(record.runtime_state ?? record.runtime),
    status,
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
    initials: getInitialsFromText(name || email),
    lastActive: formatDateTimeLabel(profile.last_seen_at) || "Never",
    name,
    role: asString(record.role, "Member"),
    status: status === "invited" ? "Invited" : status === "limited" ? "Limited" : "Active",
  };
}

function mapUsage(value: unknown, chatsCount: number, agentsCount: number): UsageData {
  const record = asRecord(value);
  const totals = asRecord(record.totals);
  return {
    automations: asNumber(totals.automation_runs, agentsCount),
    chats: asNumber(totals.chats, chatsCount),
    files: asNumber(totals.files),
    storage: asNumber(totals.storage_gb),
    tokenLimit: asNumber(totals.token_limit, 50000),
    tokens: asNumber(totals.tokens),
    userLimits: asRecordArray(record.userLimits),
  };
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return false;
  }

  const stored = window.localStorage.getItem("atmet-theme");
  if (stored) {
    return stored === "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

async function getResponseError(response: Response, fallback: string) {
  const payload = asRecord(await response.json().catch(() => ({})));
  return asString(payload.error, fallback);
}

const dashboardCacheKey = "atmet.dashboard.shell.v2";
const dashboardCacheMaxAgeMs = 1000 * 60 * 10;

function getCacheableDashboardPayload(payload: DashboardData): DashboardData {
  return {
    apps: asRecordArray(payload.apps).map((app) => {
      const record = asRecord(app);
      return {
        app_key: record.app_key,
        description: record.description,
        enabled: record.enabled,
        icon: record.icon,
        name: record.name,
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
        status: record.status,
      };
    }),
    agents: asRecordArray(payload.agents),
    brain: asRecord(payload.brain),
    members: asRecordArray(payload.members),
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
  const [activePage, setActivePage] = useState<PageKey>("chat");
  const [agentsPlaygroundOpen, setAgentsPlaygroundOpen] = useState(false);
  const [bootstrapError, setBootstrapError] = useState("");
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);
  const [isBootstrapRefreshing, setIsBootstrapRefreshing] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [profile, setProfile] = useState<DatabaseRecord | null>(null);
  const [members, setMembers] = useState<WorkspaceUser[]>([]);
  const [skillList, setSkillList] = useState<SkillItem[]>([]);
  const [connectorList, setConnectorList] = useState<ConnectorItem[]>([]);
  const [connectedConnectorKeys, setConnectedConnectorKeys] = useState<string[]>(
    [],
  );
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [brainData, setBrainData] = useState<DatabaseRecord | null>(null);
  const [subscriptionData, setSubscriptionData] =
    useState<DatabaseRecord | null>(null);
  const [workspaceSettings, setWorkspaceSettings] =
    useState<DatabaseRecord | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(
    null,
  );
  const [agentList, setAgentList] = useState<Agent[]>([]);
  const [activeSidebarChatId, setActiveSidebarChatId] = useState<string | null>(
    null,
  );
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  const [sidebarChats, setSidebarChats] =
    useState<SidebarChat[]>(initialSidebarChats);
  const [creatingChat, setCreatingChat] = useState(false);
  const [workflowChatNodesByAgent, setWorkflowChatNodesByAgent] = useState<
    Record<string, WorkflowChatNode[]>
  >({});
  const [chatDraftRequest, setChatDraftRequest] =
    useState<ChatDraftRequest | null>(null);
  const [isDark] = useState(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarChatCounterRef = useRef(initialSidebarChats.length + 1);
  const chatDraftCounterRef = useRef(1);
  const activeSidebarChat =
    activePage === "chat"
      ? sidebarChats.find((chat) => chat.id === activeSidebarChatId) ?? null
      : null;
  const activeWorkspaceId = workspace?.id ?? null;
  const dynamicComposerOptions: ComposerOption[] = [
    ...connectorList.map((connector) => ({
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
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    setActivePage(getInitialPage());
    setActiveSidebarChatId(getInitialChatId());
  }, []);

  function applyDashboardPayload(payload: DashboardData) {
    const mappedWorkspaces = asRecordArray(payload.workspaces)
      .map(mapWorkspace)
      .filter((item): item is WorkspaceSummary => Boolean(item));
    const mappedWorkspace = mapWorkspace(payload.workspace);
    const connectionRows = asRecordArray(payload.connections);
    const connectedKeys = connectionRows
      .filter((connection) => asString(connection.status) === "connected")
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
    const mappedConnectors = asRecordArray(payload.apps)
      .map((app, index) => mapConnector(app, connectionKeySet, index))
      .filter((item): item is ConnectorItem => Boolean(item));
    const mappedMembers = asRecordArray(payload.members)
      .map(mapMember)
      .filter((item): item is WorkspaceUser => Boolean(item));

    setWorkspace(mappedWorkspace);
    setWorkspaces(mappedWorkspaces);
    setProfile(asRecord(payload.profile));
    setMembers(mappedMembers);
    setSidebarChats(mappedChats);
    setActiveSidebarChatId((current) =>
      current && mappedChats.some((chat) => chat.id === current)
        ? current
        : mappedChats[0]?.id ?? null,
    );
    setAgentList(mappedAgents);
    setSkillList(mappedSkills);
    setConnectorList(mappedConnectors);
    setConnectedConnectorKeys(connectedKeys);
    setUsageData(mapUsage(payload.usage, mappedChats.length, mappedAgents.length));
    setBrainData(asRecord(payload.brain));
    setSubscriptionData(asRecord(payload.subscription));
    setWorkspaceSettings(asRecord(payload.workspaceSettings));
  }

  useEffect(() => {
    let cancelled = false;
    let appliedCachedPayload = false;

    async function loadDashboard() {
      setBootstrapError("");
      setIsBootstrapLoading(true);

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
        const response = await fetch("/api/bootstrap", {
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
        setIsBootstrapRefreshing(false);
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

  function selectPage(page: PageKey, options: { chatId?: string | null } = {}) {
    setActivePage(page);
    updateAppRouteState({ chatId: options.chatId, page });
    if (page !== "agents") {
      setAgentsPlaygroundOpen(false);
      setSelectedAgentName(null);
    }
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
        name,
        runtime: "paused",
        status: "Draft",
        tone: "warning",
      },
    ]);
  }

  async function createSidebarChat() {
    if (creatingChat) {
      return activeSidebarChatId ?? "";
    }

    setCreatingChat(true);
    const nextIndex = sidebarChatCounterRef.current;
    sidebarChatCounterRef.current += 1;
    const nextTitle = `New chat ${nextIndex}`;
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
    setActiveSidebarChatId(id);
    setChatHistoryOpen(true);
    selectPage("chat", { chatId: id });
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

  function copyChatValue(value: string) {
    navigator.clipboard?.writeText(value).catch(() => undefined);
  }

  function openSidebarChat(chatId: string) {
    setActiveSidebarChatId(chatId);
    selectPage("chat", { chatId });
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
    const chatId = await createSidebarChat();
    insertSkillIntoChat(skill, chatId);
  }

  function addChatToAgentWorkflow(agentName: string, chat: SidebarChat) {
    setWorkflowChatNodesByAgent((current) => {
      const existingNodes = current[agentName] ?? [];
      const alreadyAdded = existingNodes.some(
        (node) => node.chatId === chat.id,
      );

      return {
        ...current,
        [agentName]: alreadyAdded
          ? existingNodes
          : [...existingNodes, { chatId: chat.id, title: chat.title }],
      };
    });
    setSelectedAgentName(agentName);
    setAgentsPlaygroundOpen(true);
    selectPage("agents");
  }

  const commandPaletteGroups: CommandPaletteGroup[] = [
    {
      items: [
        ...primaryNavigation,
        ...secondaryNavigation,
        settingsNavigation,
      ].map((item, index) => ({
        action: () => selectPage(item.key),
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
  ];

  return (
  <main className="h-svh overflow-hidden bg-sidebar text-foreground">
    <div className="flex h-svh min-h-0 flex-col">
        <div className="grid h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-3 py-2 md:px-4">
          <div className="flex min-w-0 items-center gap-2">
            {!sidebarOpen && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      aria-label="Open sidebar"
                      onClick={() => setSidebarOpen(true)}
                      size="icon-sm"
                      variant="ghost"
                    />
                  }
                >
                  <Icon icon={PanelLeftOpenIcon} />
                </TooltipTrigger>
                <TooltipPopup>Open sidebar</TooltipPopup>
              </Tooltip>
            )}
            {!sidebarOpen && <div className="h-4 w-px shrink-0 bg-sidebar-border" />}
            <WorkspaceIdentity
              activeChat={activeSidebarChat}
              agents={agentList}
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
              }}
              onSelectWorkspace={(nextWorkspace) => setWorkspace(nextWorkspace)}
              onAddChatToAgentWorkflow={addChatToAgentWorkflow}
              onCopyChatValue={copyChatValue}
              onDeleteChat={deleteSidebarChat}
              onRenameChat={renameSidebarChat}
              onTogglePin={toggleSidebarChatPin}
              selectedWorkspace={workspace}
              workspaces={workspaces}
            />
          </div>
          <CommandPalette
            groups={commandPaletteGroups}
            triggerIcon={<Icon className="size-3.5" icon={Search01Icon} />}
            triggerLabel="Search or command"
          />
          <div className="flex min-w-0 justify-end">
            <UserIdentity onSelectPage={selectPage} profile={profile} />
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
                  loading={item.key === "chat" && creatingChat}
                  onClick={() =>
                    item.key === "chat" ? createSidebarChat() : selectPage(item.key)
                  }
                />
              ))}
            </nav>

            <SidebarChatHistory
              activeChatId={activePage === "chat" ? activeSidebarChatId : null}
              chats={sidebarChats}
              onDeleteChat={deleteSidebarChat}
              onOpenChange={setChatHistoryOpen}
              onOpenChat={openSidebarChat}
              onRenameChat={renameSidebarChat}
              onTogglePin={toggleSidebarChatPin}
              open={chatHistoryOpen}
            />

            <nav className="mt-auto grid gap-0.5 pr-1">
              {secondaryNavigation.map((item) => (
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
                    <Icon icon={PanelLeftCloseIcon} />
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
                "mx-auto flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5",
                activePage === "agents" && agentsPlaygroundOpen
                  ? "max-w-none"
                  : "max-w-5xl",
              )}
            >
              {bootstrapError && <BootstrapErrorBanner error={bootstrapError} />}
              {(isBootstrapLoading || isBootstrapRefreshing) && (
                <LoadingPill
                  label={
                    isBootstrapLoading
                      ? "Loading workspace data"
                      : "Refreshing workspace data"
                  }
                />
              )}
              {activePage === "chat" && (
                <ChatPage
                  activeChatId={activeSidebarChatId}
                  composerOptions={dynamicComposerOptions}
                  draftRequest={chatDraftRequest}
                />
              )}
              {activePage === "agents" && (
                <AgentsPage
                  agents={agentList}
                  onCreateAgent={createAgent}
                  onPlaygroundChange={setAgentsPlaygroundOpen}
                  onSelectAgentName={setSelectedAgentName}
                  selectedAgentName={selectedAgentName}
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
                  connectedConnectorKeys={connectedConnectorKeys}
                  connectors={connectorList}
                  onConnectedConnectorKeysChange={setConnectedConnectorKeys}
                  workspaceId={activeWorkspaceId}
                />
              )}
              {activePage === "usage" && <UsagePage usage={usageData} />}
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
                  onWorkspaceChange={setWorkspace}
                  onWorkspaceSettingsChange={setWorkspaceSettings}
                  profile={profile}
                  connectedConnectors={connectorList.filter((connector) =>
                    connectedConnectorKeys.includes(connector.key ?? connector.name),
                  )}
                  subscription={subscriptionData}
                  workspace={workspace}
                  workspaceSettings={workspaceSettings}
                />
              )}
              {activePage === "admin" && <AdminPage />}
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
  onAddChatToAgentWorkflow,
  onCopyChatValue,
  onCreateWorkspace,
  onDeleteChat,
  onInvitePeople,
  onRenameChat,
  onSelectWorkspace,
  onTogglePin,
  selectedWorkspace,
  workspaces,
}: {
  activeChat: SidebarChat | null;
  agents: Agent[];
  onAddChatToAgentWorkflow: (agentName: string, chat: SidebarChat) => void;
  onCopyChatValue: (value: string) => void;
  onCreateWorkspace: (workspaceName: string) => void | Promise<void>;
  onDeleteChat: (chatId: string) => void;
  onInvitePeople: (email: string) => void | Promise<void>;
  onRenameChat: (chatId: string) => void;
  onSelectWorkspace: (workspace: WorkspaceSummary) => void;
  onTogglePin: (chatId: string) => void;
  selectedWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
}) {
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [invitePeopleOpen, setInvitePeopleOpen] = useState(false);
  const workspaceName = selectedWorkspace?.name ?? "Workspace";
  const workspaceAvatarUrl = selectedWorkspace?.avatarUrl;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <AtmetLogo className="size-5" plain />
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
              onAddChatToAgentWorkflow={onAddChatToAgentWorkflow}
              onCopyChatValue={onCopyChatValue}
              onDeleteChat={onDeleteChat}
              onRenameChat={onRenameChat}
              onTogglePin={onTogglePin}
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
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const trimmedEmail = email.trim();

  function resetForm() {
    setEmail("");
    setErrorMessage("");
    setIsSending(false);
  }

  async function submitInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedEmail || isSending) {
      return;
    }

    setErrorMessage("");
    setIsSending(true);

    try {
      await onInvite(trimmedEmail);
      resetForm();
      onOpenChange(false);
      window.alert(`Invite sent to ${trimmedEmail}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not send invite",
      );
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
            <Input
              autoFocus
              disabled={isSending}
              id="workspace-invite-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@company.com"
              type="email"
              value={email}
            />
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
            <Button loading={isSending} disabled={!trimmedEmail} type="submit">
              Send invite
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
  onAddChatToAgentWorkflow,
  onCopyChatValue,
  onDeleteChat,
  onRenameChat,
  onTogglePin,
}: {
  agents: Agent[];
  chat: SidebarChat;
  onAddChatToAgentWorkflow: (agentName: string, chat: SidebarChat) => void;
  onCopyChatValue: (value: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
}) {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
          <ChatActionItem
            icon={WorkflowSquare01Icon}
            label="Add in an agent workflow"
            onClick={() => setWorkflowDialogOpen(true)}
          />
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
  onOpenChange,
  onSelectAgent,
  open,
}: {
  agents: Agent[];
  chat: SidebarChat;
  onOpenChange: (open: boolean) => void;
  onSelectAgent: (agentName: string) => void;
  open: boolean;
}) {
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
          <div className="grid gap-1 rounded-lg border border-border/70 bg-muted/35 p-1">
            {agents.map((agent) => (
              <AgentWorkflowChoice
                agent={agent}
                key={agent.name}
                onSelect={() => onSelectAgent(agent.name)}
              />
            ))}
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
          <span className="text-muted-foreground/45">/</span>
          {agent.status}
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
        className="absolute left-0 top-2 size-6 rounded-md text-[0.5rem] opacity-75"
        logo={logos[1]}
      />
      <AgentAppLogo
        className="absolute right-0 top-2 size-6 rounded-md text-[0.5rem] opacity-75"
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

function UserIdentity({
  onSelectPage,
  profile,
}: {
  onSelectPage: (page: PageKey) => void;
  profile: DatabaseRecord | null;
}) {
  const displayName = asString(profile?.full_name, asString(profile?.email, "User"));
  const initials = getInitialsFromText(displayName);
  const avatarUrl = asString(profile?.avatar_url);

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
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {active && <Icon className="size-4 opacity-60" icon={ArrowRight01Icon} />}
    </button>
  );
}

function SidebarChatHistory({
  activeChatId,
  chats,
  onDeleteChat,
  onOpenChange,
  onOpenChat,
  onRenameChat,
  onTogglePin,
  open,
}: {
  activeChatId: string | null;
  chats: SidebarChat[];
  onDeleteChat: (chatId: string) => void;
  onOpenChange: (open: boolean) => void;
  onOpenChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  open: boolean;
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
            {orderedChats.map((chat) => (
              <div
                className={cn(
                  "group flex h-7 items-center gap-1 rounded-md px-2 text-xs transition-[background-color,color]",
                  activeChatId === chat.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                key={chat.id}
              >
                <button
                  className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none"
                  onClick={() => onOpenChat(chat.id)}
                  type="button"
                >
                  <Icon className="size-3.5 opacity-70" icon={Chat01Icon} />
                  <span className="min-w-0 flex-1 truncate">{chat.title}</span>
                  {chat.pinned && (
                    <Icon className="size-3 opacity-60" icon={PinIcon} />
                  )}
                </button>
                <Menu>
                  <MenuTrigger
                    className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 outline-none transition-[background-color,color,opacity] hover:bg-background/70 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring group-hover:opacity-100"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Icon className="size-3.5" icon={MoreHorizontalIcon} />
                  </MenuTrigger>
                  <MenuPopup align="end" className="min-w-36" sideOffset={6}>
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
            ))}
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
  activeChatId,
  composerOptions,
  draftRequest,
}: {
  activeChatId: string | null;
  composerOptions: ComposerOption[];
  draftRequest: ChatDraftRequest | null;
}) {
  return (
    <ChatExperience
      activeChatId={activeChatId}
      composerOptions={composerOptions}
      draftRequest={
        draftRequest?.chatId === activeChatId ? draftRequest : null
      }
      key={activeChatId ?? "new-chat"}
    />
  );
}

function ChatExperience({
  activeChatId = null,
  compact = false,
  composerOptions = [],
  draftRequest = null,
}: {
  activeChatId?: string | null;
  compact?: boolean;
  composerOptions?: ComposerOption[];
  draftRequest?: ChatDraftRequest | null;
}) {
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composerIsEmpty, setComposerIsEmpty] = useState(true);
  const [mention, setMention] = useState<{
    kind: ComposerOption["kind"];
    query: string;
  } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const mentionPopupRef = useRef<HTMLDivElement>(null);
  const mentionRangeRef = useRef<Range | null>(null);
  const hasMessages = messages.length > 0;
  const mentionOptions = mention
    ? composerOptions.filter(
        (option) =>
          option.kind === mention.kind &&
          option.name.toLowerCase().includes(mention.query.toLowerCase()),
      )
    : [];

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

  async function sendComposerMessage() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const content = getComposerPlainText(editor);
    if (!content) {
      editor.focus();
      return;
    }

    const optimisticMessage = {
      content,
      id: `pending-${Date.now()}`,
      role: "user" as const,
    };
    setMessages((current) => [...current, optimisticMessage]);

    editor.innerHTML = "";
    setComposerIsEmpty(true);
    setMention(null);
    mentionRangeRef.current = null;

    if (!activeChatId) {
      return;
    }

    try {
      const response = await fetch(`/api/chats/${activeChatId}/messages`, {
        body: JSON.stringify({ content, role: "user" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        return;
      }

      const payload = asRecord(await response.json());
      const savedMessage = mapChatMessage(payload.message);

      if (savedMessage) {
        setMessages((current) =>
          current.map((message) =>
            message.id === optimisticMessage.id ? savedMessage : message,
          ),
        );
      }
    } catch (error) {
      console.error(error);
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
      document.execCommand("insertLineBreak");
      requestAnimationFrame(() => {
        updateComposerState();
        updateMentionFromEditor();
      });
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
    return true;
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        compact
          ? "min-h-full justify-end"
          : "min-h-[calc(100svh-8rem)]",
        !compact &&
          (hasMessages ? "justify-end overflow-hidden py-4" : "justify-center py-8"),
      )}
    >
      {hasMessages && (
        <div
          className={cn(
            "mx-auto flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto pb-5 pr-1",
            compact ? "max-w-none" : "max-w-3xl",
          )}
        >
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
        </div>
      )}

      <div
        className={cn(
          "mx-auto w-full",
          compact ? "max-w-none" : "max-w-3xl",
          hasMessages &&
            "sticky bottom-0 z-10 shrink-0 bg-background pb-1 pt-3",
        )}
      >
        <div className="relative rounded-2xl border border-black/8 bg-background shadow-xs/5 dark:border-white/8">
          <div
            aria-label="Message Atmet"
            className="relative min-h-[10.5rem] cursor-text px-4 py-4 text-base leading-7 outline-none sm:text-sm"
            onClick={() => editorRef.current?.focus()}
            role="textbox"
          >
            {composerIsEmpty && (
              <span className="pointer-events-none absolute left-4 top-4 text-muted-foreground">
                Use / to add a skill or @ to connect an app.
              </span>
            )}
            <div
              className="relative z-10 min-h-[8rem] whitespace-pre-wrap break-words leading-7 outline-none"
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
          <div className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-2">
            <Menu>
              <MenuTrigger className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-sm font-medium text-muted-foreground outline-none transition-[background-color,color] hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                <AtmetLogo className="size-5" />
                {selectedModel.name}
                <Icon className="size-3.5 opacity-70" icon={ChevronDownIcon} />
              </MenuTrigger>
              <MenuPopup align="start" className="min-w-56" sideOffset={8}>
                {modelOptions.map((model) => (
                  <MenuItem
                    key={model.name}
                    onClick={() => setSelectedModel(model)}
                  >
                    <Icon icon={model.icon} />
                    <span className="flex-1">{model.name}</span>
                    {selectedModel.name === model.name && (
                      <Icon className="text-info" icon={CheckIcon} />
                    )}
                  </MenuItem>
                ))}
              </MenuPopup>
            </Menu>

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

            <Button size="sm" variant="ghost">
              Add
              <Icon icon={PlusSignIcon} />
            </Button>
            <Button onClick={sendComposerMessage} size="sm">
              Send
              <Icon icon={SendHorizontal} />
            </Button>
          </div>
        </div>
      </div>
    </div>
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
      {option.logo}
    </span>
  );
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-xl bg-secondary px-3 py-2 text-sm leading-6 text-secondary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="grid max-w-[92%] gap-3">
        {message.variant ? (
          <AiOutputDemo variant={message.variant} />
        ) : message.state === "thinking" ? (
          <>
            <AiThinkingState />
            <AiToolState />
          </>
        ) : (
          <AiTextResponse text={message.content} />
        )}
      </div>
    </div>
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
    <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-sm text-muted-foreground">
      <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
      Thinking...
    </div>
  );
}

function AiReasoningState() {
  return (
    <div className="w-fit rounded-lg border border-black/8 bg-background p-3 text-sm dark:border-white/8">
      <button
        className="inline-flex items-center gap-1 text-muted-foreground"
        type="button"
      >
        Thought for 5s
        <Icon className="size-3" icon={ChevronDownIcon} />
      </button>
      <div className="mt-3 grid gap-2 text-muted-foreground">
        <p>Identified the requested output format.</p>
        <p>Checked available workspace context.</p>
        <p>Prepared a concise final response.</p>
      </div>
    </div>
  );
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
    <div className="w-fit rounded-lg border border-black/8 bg-background p-3 text-sm dark:border-white/8">
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
    <div className="w-fit overflow-hidden rounded-lg border border-black/8 bg-background text-sm dark:border-white/8">
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
    <div className="w-fit rounded-lg border border-black/8 bg-background p-3 text-sm dark:border-white/8">
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
  return (
    <div className="max-w-prose text-sm leading-6 text-foreground">
      <p className="whitespace-pre-wrap">{text}</p>
      <p className="mt-3 text-muted-foreground">
        AI output will appear here once a model response is available for this
        chat.
      </p>
    </div>
  );
}

function AiStreamingText() {
  return (
    <div className="max-w-prose text-sm leading-6 text-foreground">
      Generating your release notes for v2.4 - summarizing the 28 merged pull
      requests
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

function AiCodeBlock() {
  return (
    <div className="w-fit overflow-hidden rounded-lg border border-black/8 bg-background text-sm dark:border-white/8">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Icon className="size-3.5 text-muted-foreground" icon={File01Icon} />
          utils.ts
        </div>
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          type="button"
        >
          Copy
        </button>
      </div>
      <pre className="p-3 text-xs leading-5 text-foreground">
        <code>
          <span className="text-muted-foreground">1 </span>export const sum = (a: number, b: number) =&gt;{"\n"}
          <span className="text-muted-foreground">2 </span>  a + b;{"\n"}
          <span className="text-muted-foreground">3 </span>{"\n"}
          <span className="text-muted-foreground">4 </span>export const clamp = (n: number, min: number, max: number) =&gt;{"\n"}
          <span className="text-muted-foreground">5 </span>  Math.min(Math.max(n, min), max);
        </code>
      </pre>
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
    <div className="w-80 rounded-lg border border-black/8 bg-background p-3 text-sm dark:border-white/8">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <Icon className="size-3.5 text-success" icon={CheckIcon} />
          To-dos
        </div>
        <span className="text-muted-foreground">5/5</span>
      </div>
      <div className="grid gap-1.5">
        {todos.map((todo) => (
          <div className="flex items-center gap-2 text-muted-foreground" key={todo}>
            <Icon className="size-3.5" icon={CheckIcon} />
            <span className="line-through">{todo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiDataTable() {
  const rows = [
    ["gpt-4o", "128k", "$5.00"],
    ["claude-3.5", "200k", "$3.00"],
    ["llama-3.1", "128k", "$0.90"],
  ];

  return (
    <div className="w-fit overflow-hidden rounded-lg border border-black/8 bg-background text-sm dark:border-white/8">
      <table>
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2 text-left font-medium">Model</th>
            <th className="border-l border-border px-3 py-2 text-left font-medium">
              Context
            </th>
            <th className="border-l border-border px-3 py-2 text-left font-medium">
              $/1M in
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-border last:border-b-0" key={row[0]}>
              {row.map((cell, index) => (
                <td
                  className={cn(
                    "px-3 py-2",
                    index > 0 && "border-l border-border",
                  )}
                  key={cell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AiComparisonTable() {
  const rows = [
    ["Unlimited projects", "check", "check"],
    ["All components", "check", "check"],
    ["Team-wide usage", "-", "check"],
    ["Priority support", "-", "check"],
  ];

  return (
    <div className="w-fit overflow-hidden rounded-lg border border-black/8 bg-background text-sm dark:border-white/8">
      <table>
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2 text-left font-medium">Feature</th>
            <th className="border-l border-border px-3 py-2 text-left font-medium">
              Personal
            </th>
            <th className="border-l border-border px-3 py-2 text-left font-medium">
              Enterprise
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-border last:border-b-0" key={row[0]}>
              <td className="max-w-36 truncate px-3 py-2">{row[0]}</td>
              {row.slice(1).map((cell, index) => (
                <td
                  className="border-l border-border px-3 py-2 text-success"
                  key={`${row[0]}-${index}`}
                >
                  {cell === "check" ? (
                    <Icon className="size-3.5" icon={CheckIcon} />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

function createComposerBadge(option: ComposerOption) {
  const badge = document.createElement("span");
  badge.className =
    "mx-0.5 inline-flex h-5 translate-y-[2px] items-center gap-1 rounded-md bg-secondary px-1.5 align-baseline text-[0.75em] font-medium leading-none text-secondary-foreground";
  badge.contentEditable = "false";
  badge.dataset.composerToken = "true";
  badge.dataset.composerLabel = option.name;

  const icon = document.createElement("span");
  icon.className =
    "grid size-4 shrink-0 place-items-center rounded-md bg-primary text-[0.55rem] font-semibold text-primary-foreground";
  icon.textContent = option.logo ?? getOptionInitials(option.name);

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

type AgentFilter = "active" | "all" | "beta" | "draft" | "paused" | "running";

function AgentsPage({
  agents,
  onCreateAgent,
  onPlaygroundChange,
  onSelectAgentName,
  selectedAgentName,
  workflowChatNodesByAgent,
}: {
  agents: Agent[];
  onCreateAgent: (name: string) => void;
  onPlaygroundChange: (open: boolean) => void;
  onSelectAgentName: (name: string | null) => void;
  selectedAgentName: string | null;
  workflowChatNodesByAgent: Record<string, WorkflowChatNode[]>;
}) {
  const [agentFilter, setAgentFilter] = useState<AgentFilter>("all");
  const [agentSearch, setAgentSearch] = useState("");
  const selectedAgent = selectedAgentName
    ? agents.find((agent) => agent.name === selectedAgentName) ?? null
    : null;
  const visibleAgents = agents.filter((agent) => {
    const normalizedStatus = agent.status.toLowerCase();
    const matchesFilter =
      agentFilter === "all" ||
      agent.runtime === agentFilter ||
      normalizedStatus === agentFilter;
    const search = agentSearch.trim().toLowerCase();
    const matchesSearch =
      !search ||
      agent.name.toLowerCase().includes(search) ||
      agent.status.toLowerCase().includes(search) ||
      agent.appLogos.some((logo) => logo.toLowerCase().includes(search));

    return matchesFilter && matchesSearch;
  });

  if (selectedAgent) {
    return (
      <AgentPlayground
        agent={selectedAgent}
        key={`${selectedAgent.name}-${
          workflowChatNodesByAgent[selectedAgent.name]?.length ?? 0
        }`}
        onBack={() => {
          onSelectAgentName(null);
          onPlaygroundChange(false);
        }}
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
                  "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] before:bg-[length:10px_10px] before:text-black/[0.045] dark:before:text-white/[0.055]",
                  agent.gradient,
                )}
              >
                <AgentLogoStack logos={agent.appLogos} />
              </CardPanel>
              <CardPanel className="border-t border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{agent.name}</CardTitle>
                  <Badge variant={agent.tone}>{agent.status}</Badge>
                </div>
                <AgentRuntimeStatus runtime={agent.runtime} />
              </CardPanel>
            </button>
          </Card>
        ))}
      </div>
    </>
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
    active: "Active",
    all: "All agents",
    beta: "Beta",
    draft: "Draft",
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
        {(
          ["all", "running", "paused", "active", "draft", "beta"] satisfies AgentFilter[]
        ).map((value) => (
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

function NewAgentDialog({ onCreate }: { onCreate: (name: string) => void }) {
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
      <Button onClick={() => setOpen(true)} size="sm">
        <Icon icon={PlusSignIcon} />
        New agent
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
    <div className="relative z-10 my-2 grid h-16 w-28 place-items-center">
      <AgentAppLogo
        className="absolute left-3 top-4 size-10 rotate-[-8deg] opacity-80"
        logo={logos[1]}
      />
      <AgentAppLogo
        className="absolute right-3 top-4 size-10 rotate-[8deg] opacity-80"
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
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl border border-black/8 bg-white text-xs font-semibold text-stone-900 dark:border-white/10",
        className,
      )}
    >
      {logo}
    </div>
  );
}

function AgentRuntimeStatus({
  runtime,
}: {
  runtime: "paused" | "running";
}) {
  const running = runtime === "running";

  return (
    <div
      className={cn(
        "mt-3 inline-flex items-center gap-1.5 text-xs font-medium",
        running ? "text-success-foreground" : "text-muted-foreground",
      )}
    >
      <Icon
        className="size-3.5"
        icon={running ? PlayIcon : PauseCircleIcon}
      />
      {running ? "Running" : "Paused"}
    </div>
  );
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
  onBack,
  workflowChatNodes,
}: {
  agent: Agent;
  onBack: () => void;
  workflowChatNodes: WorkflowChatNode[];
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const runTimeoutsRef = useRef<number[]>([]);
  const [agentRunning, setAgentRunning] = useState(agent.runtime === "running");
  const [cards, setCards] = useState<PlaygroundCard[]>(() => [
    ...(agent.workflowCards ?? []).map((card) => ({ ...card, apps: [...card.apps] })),
    ...workflowChatNodes.map((node, index) => ({
      apps: ["AT"],
      id: getWorkflowChatCardId(node.chatId),
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
  const [completedRunCardIds, setCompletedRunCardIds] = useState<string[]>([]);
  const [highlightedCardIds, setHighlightedCardIds] = useState<string[]>(() =>
    workflowChatNodes.map((node) => getWorkflowChatCardId(node.chatId)),
  );
  const [openNodeChatId, setOpenNodeChatId] = useState<string | null>(null);
  const [runningCardId, setRunningCardId] = useState<string | null>(null);
  const openNodeChat = cards.find((card) => card.id === openNodeChatId);

  useEffect(() => {
    return () => {
      clearRunTimeouts(runTimeoutsRef);
    };
  }, []);

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

    setConnections((current) => {
      const exists = current.some(
        (connection) =>
          (connection.from === drag.from && connection.to === targetId) ||
          (connection.from === targetId && connection.to === drag.from),
      );

      return exists ? current : [...current, { from: drag.from, to: targetId }];
    });
    setDrag(null);
  }

  function openContextMenu(event: React.MouseEvent, targetId: string | null) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ targetId, ...getContextMenuPoint(event) });
  }

  function createEmptyNode() {
    const point = contextMenu ?? { x: 160, y: 120 };
    const id = `node-${Date.now()}`;

    setCards((current) => [
      ...current,
      {
        apps: [],
        id,
        runtime: "paused",
        title: "Empty chat",
        ...clampCardPosition(point.x - 120, point.y - 64),
      },
    ]);
    setOpenNodeChatId(id);
    setContextMenu(null);
  }

  function deleteNode(cardId: string | null) {
    if (!cardId) {
      return;
    }

    setCards((current) => current.filter((card) => card.id !== cardId));
    setConnections((current) =>
      current.filter(
        (connection) => connection.from !== cardId && connection.to !== cardId,
      ),
    );
    if (openNodeChatId === cardId) {
      setOpenNodeChatId(null);
    }
    setContextMenu(null);
  }

  function runNode(cardId: string | null) {
    if (!cardId) {
      return;
    }

    setCards((current) =>
      current.map((card) =>
        card.id === cardId ? { ...card, runtime: "running" } : card,
      ),
    );
    setContextMenu(null);
  }

  function runAgentWorkflow() {
    const orderedCardIds = getWorkflowRunOrder(cards, connections);
    if (orderedCardIds.length === 0) {
      return;
    }

    clearRunTimeouts(runTimeoutsRef);
    setAgentRunning(true);
    setCompletedRunCardIds([]);

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
  }

  function pauseAgentWorkflow() {
    clearRunTimeouts(runTimeoutsRef);
    setAgentRunning(false);
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
          <Badge variant={agent.tone}>{agent.status}</Badge>
          <AgentRuntimeStatus runtime={agentRunning ? "running" : "paused"} />
          <Button
            onClick={() => {
              if (agentRunning || runningCardId) {
                pauseAgentWorkflow();
                return;
              }

              runAgentWorkflow();
            }}
            size="sm"
            variant={agentRunning ? "outline" : "default"}
          >
            <Icon icon={agentRunning ? PauseCircleIcon : PlayIcon} />
            {agentRunning ? "Pause" : "Run"}
          </Button>
          <AgentSettingsSheet
            agent={agent}
            agentRunning={agentRunning}
            onAgentRunningChange={setAgentRunning}
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
              onDeleteNode={() => deleteNode(contextMenu.targetId)}
              onRunNode={() => runNode(contextMenu.targetId)}
              onUpdateNode={() => openNodeChatSheet(contextMenu.targetId)}
            />
          )}
        </div>
      </div>
      <AgentNodeChatSheet
        card={openNodeChat}
        onOpenChange={(open) => {
          if (!open) {
            setOpenNodeChatId(null);
          }
        }}
        open={Boolean(openNodeChat)}
      />
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
            className="stroke-border"
            d={getWirePath(start.x, start.y, end.x, end.y)}
            fill="none"
            key={`${connection.from}-${connection.to}`}
            strokeWidth="2"
          />
        );
      })}
      {activeCard && drag && (
        <path
          className="stroke-foreground/45"
          d={getWirePath(activeCard.x + 240, activeCard.y + 64, drag.x, drag.y)}
          fill="none"
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
  onOpenChange,
  open,
}: {
  card?: PlaygroundCard;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup className="sm:max-w-2xl" side="right" variant="inset">
        <div className="flex min-h-0 flex-1 flex-col p-4 pt-12">
          <ChatExperience compact key={card?.id ?? "node-chat"} />
        </div>
      </SheetPopup>
    </Sheet>
  );
}

function AgentSettingsSheet({
  agent,
  agentRunning,
  onAgentRunningChange,
}: {
  agent: Agent;
  agentRunning: boolean;
  onAgentRunningChange: (running: boolean) => void;
}) {
  const agentUrl = `https://app.atmetai.com/agents/${agent.name
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <Sheet>
      <SheetTrigger render={<Button size="sm" variant="outline" />}>
        <Icon icon={Settings01Icon} />
        Settings
      </SheetTrigger>
      <SheetPopup side="right" variant="inset">
        <SheetHeader>
          <SheetTitle>{agent.name}</SheetTitle>
          <SheetDescription>
            Configure how this agent runs, shares context, and exposes its
            playground.
          </SheetDescription>
        </SheetHeader>
        <SheetPanel className="grid gap-5">
          <AgentSheetSection
            icon={PlayIcon}
            title="Run state"
          >
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">
                  {agentRunning ? "Agent is running" : "Agent is paused"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Toggle temporary execution for the playground.
                </p>
              </div>
              <Switch
                checked={agentRunning}
                onCheckedChange={onAgentRunningChange}
              />
            </div>
          </AgentSheetSection>

          <AgentSheetSection icon={CalendarClockIcon} title="Run scheduling">
            <div className="grid gap-2">
              <AgentSettingRow label="Mode" value="Every weekday" />
              <AgentSettingRow label="Window" value="09:00 - 17:00" />
              <AgentSettingRow label="Timezone" value="Asia/Amman" />
            </div>
          </AgentSheetSection>

          <AgentSheetSection icon={CopyLinkIcon} title="Share link">
            <div className="flex items-center gap-2 rounded-lg border border-border p-2">
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {agentUrl}
              </p>
              <Button size="sm" variant="outline">
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
        </SheetPanel>
      </SheetPopup>
    </Sheet>
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
    <section className="grid gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="text-muted-foreground" icon={icon} />
        {title}
      </div>
      {children}
    </section>
  );
}

function AgentSettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
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
      <div className="mt-4 flex -space-x-2">
        {card.apps.map((logo) => (
          <AgentAppLogo
            className="size-8 rounded-lg text-[0.625rem]"
            key={logo}
            logo={logo}
          />
        ))}
      </div>
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
              <button
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 text-left outline-none transition-[background-color] hover:bg-muted/55 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setSelectedSkillId(skill.id)}
                type="button"
              >
                <div
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg bg-linear-to-br text-foreground ring-1 ring-black/5 dark:ring-white/8",
                    skill.gradient,
                  )}
                >
                  <span className="grid size-7 place-items-center rounded-md bg-white/80 text-stone-800 shadow-xs/5 dark:bg-stone-950/70 dark:text-stone-100">
                    <Icon className="size-4" icon={skill.icon} />
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">
                    {skill.name}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {skill.description}
                  </p>
                </div>
                <Badge
                  className="ml-auto hidden sm:inline-flex"
                  variant={skill.source === "default" ? "outline" : "info"}
                >
                  {skill.source === "default" ? "Default" : "Created"}
                </Badge>
              </button>
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
            <div
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br text-foreground ring-1 ring-black/5 dark:ring-white/8",
                skill.gradient,
              )}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-white/80 text-stone-800 shadow-xs/5 dark:bg-stone-950/70 dark:text-stone-100">
                <Icon className="size-4" icon={skill.icon} />
              </span>
            </div>
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
          <li key={`${item}-${index}`}>{renderInlineMarkdown(item)}</li>
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
    return <h1 className="text-xl font-semibold">{renderInlineMarkdown(block.text)}</h1>;
  }

  if (block.type === "h2") {
    return <h2 className="text-base font-semibold">{renderInlineMarkdown(block.text)}</h2>;
  }

  if (block.type === "h3") {
    return <h3 className="text-sm font-semibold">{renderInlineMarkdown(block.text)}</h3>;
  }

  if (block.type === "blockquote") {
    return (
      <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
        {renderInlineMarkdown(block.text)}
      </blockquote>
    );
  }

  return <p className="text-foreground">{renderInlineMarkdown(block.text)}</p>;
}

function renderInlineMarkdown(text: string) {
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
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false);

  return (
    <>
      <PageHeader
        description={pageDescriptions.brain}
        title="Brain"
      />

      <BuildKnowledgeBaseDialog
        onOpenChange={setKnowledgeDialogOpen}
        open={knowledgeDialogOpen}
      />

      <div className="flex min-h-[45svh] items-center justify-center">
        <Button
          className="active:scale-[0.96]"
          onClick={() => setKnowledgeDialogOpen(true)}
        >
          <Icon icon={Brain03Icon} />
          Build knowledge base/graph
        </Button>
      </div>
    </>
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

function UsagePage({ usage }: { usage: UsageData | null }) {
  const [period, setPeriod] = useState<UsagePeriod>("month");
  const [scope, setScope] = useState<UsageScope>("my");
  const tokenLimit = usage?.tokenLimit ?? 0;
  const [tokenCap, setTokenCap] = useState(String(tokenLimit || ""));
  const [savedTokenCap, setSavedTokenCap] = useState(String(tokenLimit || ""));
  const [refreshedAt, setRefreshedAt] = useState("10:42");
  const limitsChanged = tokenCap !== savedTokenCap;
  const tokenPercent = tokenLimit > 0 ? Math.min(100, ((usage?.tokens ?? 0) / tokenLimit) * 100) : 0;
  const metricRows = [
    { label: "Tokens", value: `${(usage?.tokens ?? 0).toLocaleString()} / ${tokenLimit.toLocaleString()}` },
    { label: "Files", value: `${(usage?.files ?? 0).toLocaleString()}` },
    { label: "Storage", value: `${usage?.storage ?? 0}GB` },
    { label: "Automations", value: `${usage?.automations ?? 0}` },
    { label: "Chats", value: `${usage?.chats ?? 0}` },
  ];
  const resourceRows = [
    {
      limit: tokenLimit.toLocaleString(),
      percent: tokenPercent,
      resource: "Tokens",
      usage: (usage?.tokens ?? 0).toLocaleString(),
    },
    {
      limit: "No file upload limit set",
      percent: 0,
      resource: "Files",
      usage: (usage?.files ?? 0).toLocaleString(),
    },
    {
      limit: "No storage limit set",
      percent: 0,
      resource: "Storage",
      usage: `${usage?.storage ?? 0} GB`,
    },
  ];
  const chartGroups = [
    {
      bars: [
        { className: "border-emerald-400/60 bg-emerald-400/20", striped: true, value: Math.max(1, tokenPercent) },
        { className: "bg-sky-500", value: Math.max(1, tokenPercent) },
      ],
      label: "Tokens",
    },
    {
      bars: [{ className: "bg-violet-500", value: Math.max(1, usage?.files ?? 0) }],
      label: "Files",
    },
    {
      bars: [{ className: "bg-amber-500", value: Math.max(1, usage?.automations ?? 0) }],
      label: "Automations",
    },
    {
      bars: [{ className: "bg-rose-500", value: Math.max(1, usage?.chats ?? 0) }],
      label: "Chats",
    },
  ];

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
            onClick={() => setRefreshedAt("now")}
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

      <UsageSnapshotCard chartGroups={chartGroups} refreshedAt={refreshedAt} />
      <UsageResourcesTable resources={resourceRows} />
      <PerUserLimitsCard
        limitsChanged={limitsChanged}
        onSave={() => setSavedTokenCap(tokenCap)}
        onTokenCapChange={setTokenCap}
        tokenCap={tokenCap}
        userLimits={usage?.userLimits ?? []}
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
}: {
  chartGroups: {
    bars: { className: string; striped?: boolean; value: number }[];
    label: string;
  }[];
  refreshedAt: string;
}) {
  return (
    <CardFrame className="mt-4 overflow-hidden">
      <CardFrameHeader>
        <CardFrameTitle>
          <span className="inline-flex items-center gap-2">
            Usage snapshot
            <Badge variant="info">My usage</Badge>
          </span>
        </CardFrameTitle>
        <CardFrameDescription>
          Live counts for this month. Last refreshed {refreshedAt}.
        </CardFrameDescription>
      </CardFrameHeader>
      <Card className="rounded-xl shadow-none before:hidden">
        <CardPanel className="p-4">
          <div className="flex h-80 items-end justify-around gap-6">
            {chartGroups.map((group) => (
              <div
                className="flex h-full min-w-24 flex-1 flex-col justify-end gap-3"
                key={group.label}
              >
                <div className="flex h-64 items-end justify-center gap-1.5">
                  {group.bars.map((bar, index) => (
                    <div
                      className={cn(
                        "w-16 min-w-1 rounded-t-md transition-[height,opacity]",
                        bar.className,
                      )}
                      key={`${group.label}-${index}`}
                      style={{
                        backgroundImage: bar.striped
                          ? "repeating-linear-gradient(135deg, rgba(14, 165, 233, 0.34) 0, rgba(14, 165, 233, 0.34) 2px, transparent 2px, transparent 6px)"
                          : undefined,
                        height: `${Math.max(bar.value, 1)}%`,
                      }}
                    />
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

function UsageResourcesTable({
  resources,
}: {
  resources: {
    limit: string;
    percent: number;
    resource: string;
    usage: string;
  }[];
}) {
  return (
    <CardFrame className="mt-3 overflow-hidden">
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
          {resources.map((resource) => (
            <TableRow key={resource.resource}>
              <TableCell className="font-medium">{resource.resource}</TableCell>
              <TableCell>
                <div className="max-w-80">
                  <span className="tabular-nums text-muted-foreground">
                    {resource.usage}
                  </span>
                  <UsageProgressBar percent={resource.percent} />
                </div>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {resource.limit}
              </TableCell>
              <TableCell>
                <Badge variant="success">Within limit</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardFrame>
  );
}

function UsageProgressBar({ percent }: { percent: number }) {
  return (
    <Progress className="mt-2" max={100} value={percent}>
      <ProgressTrack>
        <ProgressIndicator
          className="h-full rounded-full bg-sky-500"
          style={{ width: `${Math.max(percent, 1)}%` }}
        />
      </ProgressTrack>
    </Progress>
  );
}

function PerUserLimitsCard({
  limitsChanged,
  onSave,
  onTokenCapChange,
  tokenCap,
  userLimits,
}: {
  limitsChanged: boolean;
  onSave: () => void;
  onTokenCapChange: (value: string) => void;
  tokenCap: string;
  userLimits: DatabaseRecord[];
}) {
  return (
    <CardFrame className="mt-3 overflow-hidden">
      <CardFrameHeader>
        <CardFrameTitle>Per-user limits</CardFrameTitle>
        <CardFrameDescription>
          Empty values inherit the workspace token cap.
        </CardFrameDescription>
        <CardFrameAction>
          <Button
            className="active:scale-[0.96]"
            disabled={!limitsChanged}
            onClick={onSave}
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
                  {tokensUsed.toLocaleString()} / {monthlyCap.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    aria-label="Monthly token cap"
                    className="ml-auto w-40"
                    min="0"
                    onChange={(event) => onTokenCapChange(event.target.value)}
                    size="sm"
                    type="number"
                    value={tokenCap}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </CardFrame>
  );
}

function ConnectorsPage({
  connectedConnectorKeys,
  connectors,
  onConnectedConnectorKeysChange,
  workspaceId,
}: {
  connectedConnectorKeys: string[];
  connectors: ConnectorItem[];
  onConnectedConnectorKeysChange: React.Dispatch<React.SetStateAction<string[]>>;
  workspaceId: string | null;
}) {
  const [connectorFilter, setConnectorFilter] =
    useState<ConnectorFilter>("all");
  const [connectorSearch, setConnectorSearch] = useState("");
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
    onConnectedConnectorKeysChange((current) =>
      currentlyConnected
        ? current.filter((key) => key !== connectorKey)
        : [...current, connectorKey],
    );

    if (!workspaceId) {
      return;
    }

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
        throw new Error("Connector update failed");
      }
    } catch (error) {
      console.error(error);
      onConnectedConnectorKeysChange((current) =>
        currentlyConnected
          ? [...current, connectorKey]
          : current.filter((key) => key !== connectorKey),
      );
    }
  }

  if (selectedConnector) {
    return (
      <ConnectorProfilePage
        connected={connectedConnectorKeys.includes(
          selectedConnector.key ?? selectedConnector.name,
        )}
        connector={selectedConnector}
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
                <div className="flex size-11 items-center justify-center rounded-xl border border-black/8 bg-white text-sm font-semibold text-stone-900 shadow-xs/5 dark:border-white/10">
                  {connector.logo}
                </div>
                <CardTitle>{connector.name}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {connector.description}
                </CardDescription>
              </CardHeader>
              <CardPanel className="mt-auto flex-none p-4 pt-0">
                <Button
                  className="w-full active:scale-[0.96]"
                  onClick={() => setSelectedConnectorName(connector.name)}
                  variant={connected ? "secondary" : "outline"}
                >
                  <Icon icon={PlugIcon} />
                  {connected ? "Manage" : "Connect"}
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
  connected,
  connector,
  onBack,
  onToggleConnect,
}: {
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
              <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white text-xl font-semibold text-stone-900 shadow-xs/5 ring-1 ring-black/10 dark:ring-white/10">
                {connector.logo}
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
              onClick={onToggleConnect}
              size="sm"
              variant={connected ? "secondary" : "default"}
            >
              <Icon icon={PlugIcon} />
              {connected ? "Disconnect" : "Connect"}
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
  src,
}: {
  className?: string;
  initials: string;
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
        initials
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
  members,
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
  members: WorkspaceUser[];
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
          className="w-full max-w-full flex-nowrap justify-start gap-x-1 overflow-x-auto"
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

        <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
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
  onWorkspaceSettingsChange,
  workspaceId,
  workspaceSettings,
}: {
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
      window.alert(error instanceof Error ? error.message : "Could not save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  function updateSoundEnabled(checked: boolean) {
    setSoundEnabled(checked);
    void saveGeneralSetting({ sound_enabled: checked });
  }

  function updateTimezone(value: string) {
    setTimezone(value);
    void saveGeneralSetting({ default_timezone: value });
  }

  return (
    <SettingsTabGrid>
      <SettingsThemeSelector />
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
  const [profileView, setProfileView] = useState<AdminProfileView | null>(null);
  const [activeAdminTab, setActiveAdminTab] =
    useState<AdminTabKey>("overview");
  const [adminData, setAdminData] = useState<AdminData>(emptyAdminData);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    setActiveAdminTab(getInitialAdminTab());
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
          setAdminData({
            activityLogs: asRecordArray(overview.auditLogs)
              .map((log) => mapAdminLog(log, "Activity"))
              .filter((item): item is AdminLogRow => Boolean(item)),
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
    updateAppRouteState({ adminTab: tab, page: "admin" });
  }

  return (
    <>
      <PageHeader description={pageDescriptions.admin} title="Admin Console" />
      <Tabs value={activeAdminTab} onValueChange={selectAdminTab}>
        <TabsList
          className="w-full max-w-full flex-nowrap justify-start gap-x-1 overflow-x-auto"
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
            onOpenProfile={setProfileView}
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
              [
                "bg-emerald-500/50 dark:bg-emerald-400/45",
                "bg-sky-500/50 dark:bg-sky-400/45",
                "bg-violet-500/50 dark:bg-violet-400/45",
                "bg-amber-500/55 dark:bg-amber-400/45",
                "bg-rose-500/50 dark:bg-rose-400/45",
                "bg-cyan-500/50 dark:bg-cyan-400/45",
                "bg-lime-500/50 dark:bg-lime-400/45",
              ][index],
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
                  [
                    "bg-emerald-500/55 dark:bg-emerald-400/45",
                    "bg-sky-500/55 dark:bg-sky-400/45",
                    "bg-violet-500/55 dark:bg-violet-400/45",
                    "bg-amber-500/60 dark:bg-amber-400/45",
                    "bg-rose-500/55 dark:bg-rose-400/45",
                    "bg-cyan-500/55 dark:bg-cyan-400/45",
                    "bg-lime-500/55 dark:bg-lime-400/45",
                  ][index],
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

function AdminPlanMix({ workspaces }: { workspaces: AdminWorkspaceRow[] }) {
  const planCounts = workspaces.reduce<Record<string, number>>((acc, [, , plan]) => {
    const label = plan === "No plan" ? "No plan" : plan[0]?.toUpperCase() + plan.slice(1);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  const total = Math.max(1, workspaces.length);
  const colors = [
    "bg-emerald-500/60 dark:bg-emerald-400/45",
    "bg-sky-500/60 dark:bg-sky-400/45",
    "bg-violet-500/60 dark:bg-violet-400/45",
    "bg-amber-500/60 dark:bg-amber-400/45",
  ];
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
  const [logFilter, setLogFilter] = useState("all");
  const [logSourceFilter, setLogSourceFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const logFilterOptions = getTableFilterOptions(
    rows.map((row) => row.status),
    "All statuses",
  );
  const logSourceFilterOptions = getTableFilterOptions(
    rows.map((row) => row.source),
    "All types",
  );
  const visibleRows = rows.filter((row) => {
    const matchesSearch = matchesTableSearch(
      [row.time, row.source, row.user, row.event, row.detail, row.status],
      logSearch,
    );
    const matchesFilter =
      logFilter === "all" || normalizeFilterValue(row.status) === logFilter;
    const matchesSource =
      logSourceFilter === "all" ||
      normalizeFilterValue(row.source) === logSourceFilter;

    return matchesSearch && matchesFilter && matchesSource;
  });

  return (
    <SettingsSection
      description={description}
      icon={File01Icon}
      title={title}
    >
      <div className="border-b border-border/70 px-4 py-3">
        <TableFilterControls
          filterLabel="Filter logs"
          filterOptions={logFilterOptions}
          filterValue={logFilter}
          filters={[
            {
              label: "Filter log type",
              onChange: setLogSourceFilter,
              options: logSourceFilterOptions,
              value: logSourceFilter,
            },
          ]}
          onFilterChange={setLogFilter}
          onSearchChange={setLogSearch}
          searchPlaceholder="Search logs..."
          searchValue={logSearch}
        />
      </div>
      <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => (
                <TableRow key={`${row.source}-${row.sortTime}-${row.user}-${row.event}`}>
                  <TableCell className="text-muted-foreground">{row.time}</TableCell>
                  <TableCell>
                    <Badge variant={row.source === "Session" ? "info" : "outline"}>
                      {row.source}
                    </Badge>
                  </TableCell>
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
                  colSpan={6}
                >
                  No logs match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </SettingsSection>
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
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("member");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    workspaces[0]?.[7] ?? "",
  );
  const trimmedEmail = email.trim();

  useEffect(() => {
    if (!selectedWorkspaceId && workspaces[0]?.[7]) {
      setSelectedWorkspaceId(workspaces[0][7]);
    }
  }, [selectedWorkspaceId, workspaces]);

  function resetForm() {
    setEmail("");
    setErrorMessage("");
    setIsSending(false);
    setRole("member");
    setSelectedWorkspaceId(workspaces[0]?.[7] ?? "");
  }

  async function submitInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedEmail || !selectedWorkspaceId || isSending) {
      return;
    }

    setErrorMessage("");
    setIsSending(true);

    try {
      const response = await fetch(`/api/workspaces/${selectedWorkspaceId}/members`, {
        body: JSON.stringify({ email: trimmedEmail, role }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        const payload = asRecord(await response.json().catch(() => ({})));
        throw new Error(asString(payload.error, "Could not send invite"));
      }

      setOpen(false);
      resetForm();
      window.alert(`Invite sent to ${trimmedEmail}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not send invite",
      );
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
              <Input
                autoFocus
                disabled={isSending}
                id="admin-invite-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@company.com"
                type="email"
                value={email}
              />
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
              disabled={!trimmedEmail || !selectedWorkspaceId}
              type="submit"
            >
              Send invite
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
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setRequests(rows);
  }, [rows]);

  async function updateRequestStatus(requestId: string, status: "approved" | "rejected") {
    setError("");
    setNotice("");
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
        const delivery = asRecord(payload.delivery);
        const provider = asString(delivery.provider);
        const email = updatedRequest?.email ?? "this user";
        setNotice(
          provider === "resend"
            ? `Approval email sent to ${email} with Resend.`
            : provider === "custom_smtp"
              ? `Approval email sent to ${email} with custom SMTP.`
              : `Approval email sent to ${email} with Supabase Auth.`,
        );
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
        <div className="rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2 text-red-600 text-sm dark:text-red-300">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 text-emerald-700 text-sm dark:text-emerald-300">
          {notice}
        </div>
      ) : null}
      <AdminRequestsTable
        description="Confirm waitlist users when they are ready to join Atmet."
        onUpdateStatus={updateRequestStatus}
        rows={requests}
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
        <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
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
  const firstWorkspace = workspaces[0]?.[0] ?? "No workspace";
  const [selectedWorkspace, setSelectedWorkspace] = useState(
    firstWorkspace,
  );
  const selectedWorkspaceName = workspaces.some(
    ([workspace]) => workspace === selectedWorkspace,
  )
    ? selectedWorkspace
    : firstWorkspace;
  const globalControls =
    controls.find((control) => !asString(control.workspace_id)) ?? {};
  const selectedWorkspaceRow = workspaces.find(
    ([name]) => name === selectedWorkspaceName,
  );
  const selectedWorkspaceId = selectedWorkspaceRow?.[7] ?? "";
  const workspaceControls =
    controls.find(
      (control) => asString(control.workspace_id) === selectedWorkspaceId,
    ) ?? {};
  const globalRunLimit = asString(globalControls.monthly_run_limit, "Not set");
  const globalConnectorLimit = asString(
    globalControls.connector_limit,
    "Not set",
  );
  const globalAlertThreshold = asString(
    globalControls.usage_alert_threshold,
    "Not set",
  );
  const workspaceRunLimit = asString(
    workspaceControls.monthly_run_limit,
    "Not set",
  );
  const workspaceConnectorLimit = asString(
    workspaceControls.connector_limit,
    "Not set",
  );

  return (
    <SettingsTabGrid>
      <SettingsSection
        description="Control workspace spending, agent execution, and connector usage."
        icon={DatabaseIcon}
        title="Usage controls"
      >
        <SettingsSwitchRow
          defaultChecked
          description="Pause workflow runs when a workspace reaches its monthly limit."
          title="Enforce workspace limits"
        />
        <SettingsRow
          description="Maximum workflow runs allowed across this workspace each month."
          title="Monthly run limit"
        >
          <SettingsActionDialogButton
            confirmLabel="Save limit"
            description="Set the global monthly workflow run limit."
            title="Monthly run limit"
            triggerLabel={
              globalRunLimit === "Not set" ? globalRunLimit : `${globalRunLimit} runs`
            }
          >
            <div className="grid gap-2">
              <Label>Run limit</Label>
              <Input
                defaultValue={globalRunLimit === "Not set" ? "" : globalRunLimit}
                size="sm"
              />
            </div>
          </SettingsActionDialogButton>
        </SettingsRow>
        <SettingsRow
          description="Maximum connected apps a workspace can enable without admin approval."
          title="Connector limit"
        >
          <SettingsActionDialogButton
            confirmLabel="Save limit"
            description="Set the global connector cap for workspaces."
            title="Connector limit"
            triggerLabel={
              globalConnectorLimit === "Not set"
                ? globalConnectorLimit
                : `${globalConnectorLimit} apps`
            }
          >
            <div className="grid gap-2">
              <Label>Connector limit</Label>
              <Input
                defaultValue={
                  globalConnectorLimit === "Not set" ? "" : globalConnectorLimit
                }
                size="sm"
              />
            </div>
          </SettingsActionDialogButton>
        </SettingsRow>
        <SettingsSwitchRow
          defaultChecked
          description="Require admin approval before agents write to connected apps."
          title="Require write approvals"
        />
        <SettingsRow
          description="Send a summary when usage crosses a configured threshold."
          title="Usage alert threshold"
        >
          <SettingsActionDialogButton
            confirmLabel="Save threshold"
            description="Set when admins receive a workspace usage alert."
            title="Usage alert threshold"
            triggerLabel={
              globalAlertThreshold === "Not set"
                ? globalAlertThreshold
                : `${globalAlertThreshold}%`
            }
          >
            <div className="grid gap-2">
              <Label>Threshold percentage</Label>
              <Input
                defaultValue={
                  globalAlertThreshold === "Not set" ? "" : globalAlertThreshold
                }
                size="sm"
              />
            </div>
          </SettingsActionDialogButton>
        </SettingsRow>
      </SettingsSection>

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
        <SettingsRow
          description="Override the monthly workflow run limit for the selected workspace."
          title="Custom run limit"
        >
          <SettingsActionDialogButton
            confirmLabel="Save override"
            description={`Set a custom run limit for ${selectedWorkspaceName}.`}
            title="Custom run limit"
            triggerLabel={
              workspaceRunLimit === "Not set"
                ? workspaceRunLimit
                : `${workspaceRunLimit} runs`
            }
          >
            <div className="grid gap-2">
              <Label>Workspace run limit</Label>
              <Input
                defaultValue={
                  workspaceRunLimit === "Not set" ? "" : workspaceRunLimit
                }
                size="sm"
              />
            </div>
          </SettingsActionDialogButton>
        </SettingsRow>
        <SettingsRow
          description="Set how many apps this workspace can connect before review."
          title="Custom connector limit"
        >
          <SettingsActionDialogButton
            confirmLabel="Save override"
            description={`Set a custom connector cap for ${selectedWorkspaceName}.`}
            title="Custom connector limit"
            triggerLabel={
              workspaceConnectorLimit === "Not set"
                ? workspaceConnectorLimit
                : `${workspaceConnectorLimit} apps`
            }
          >
            <div className="grid gap-2">
              <Label>Workspace connector limit</Label>
              <Input
                defaultValue={
                  workspaceConnectorLimit === "Not set"
                    ? ""
                    : workspaceConnectorLimit
                }
                size="sm"
              />
            </div>
          </SettingsActionDialogButton>
        </SettingsRow>
        <SettingsSwitchRow
          defaultChecked
          description="Require admin confirmation before this workspace can add a new connector."
          title="Connector approval"
        />
        <SettingsSwitchRow
          description="Temporarily pause all workflow agent runs for this workspace."
          title="Pause workspace runs"
        />
        <SettingsRow
          description={`Save these overrides for ${selectedWorkspaceName}.`}
          title="Apply custom controls"
        >
          <SettingsActionDialogButton
            confirmLabel="Apply controls"
            description={`Apply the custom run, connector, and approval controls to ${selectedWorkspaceName}.`}
            title="Apply workspace controls"
            triggerLabel="Apply controls"
            variant="default"
          />
        </SettingsRow>
      </SettingsSection>
    </SettingsTabGrid>
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

function matchesTableSearch(values: unknown[], search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return values.some((value) =>
    String(value ?? "").toLowerCase().includes(query),
  );
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
      <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
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
                  <Button size="xs" variant="outline">Open</Button>
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
      <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
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
                  <Button size="xs" variant="outline">Open</Button>
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
  const [workspaceName, owner, plan, members, status, usage, created] =
    workspace;
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
          <Button size="sm" variant="outline">
            atmetai.com/{workspaceName.toLowerCase().replace(/\s+/g, "-")}
          </Button>
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
        <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
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
    </SettingsTabGrid>
  );
}

function AdminRequestsTable({
  description,
  onUpdateStatus,
  rows,
  title,
  updatingRequestId,
}: {
  description: string;
  onUpdateStatus: (requestId: string, status: "approved" | "rejected") => void;
  rows: readonly AdminRequestRow[];
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
    "All work types",
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
              label: "Filter work type",
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
      <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
        <Table className="min-w-[1360px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Company size</TableHead>
              <TableHead>Work type</TableHead>
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
      className="mb-3 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-sm text-red-600 dark:text-red-300"
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
