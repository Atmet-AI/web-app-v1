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
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
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
import {
  PromptInput,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/nexus-ui/prompt-input";
import { TextShimmer } from "@/components/nexus-ui/text-shimmer";
import {
  Thread,
  ThreadContent,
  ThreadScrollToBottom,
} from "@/components/nexus-ui/thread";
import { cn } from "@/lib/utils";

type PageKey =
  | "chat"
  | "chat2"
  | "brain"
  | "agents"
  | "skills"
  | "connectors"
  | "usage"
  | "changelogs"
  | "settings"
  | "admin";

type NavigationItem = {
  icon: IconSvgElement;
  key: PageKey;
  label: string;
};

const primaryNavigation = [
  { key: "chat", label: "New chat", icon: PlusSignIcon },
  { key: "chat2", label: "New chat 2", icon: PlusSignIcon },
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
  appLogos: string[];
  gradient: string;
  name: string;
  runtime: "paused" | "running";
  status: string;
  tone: "info" | "outline" | "success" | "warning";
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

const agents = [
  {
    name: "Research Agent",
    appLogos: ["GD", "NO", "GH"],
    gradient:
      "from-rose-100 via-stone-50 to-sky-100 dark:from-rose-950/40 dark:via-stone-950 dark:to-sky-950/40",
    runtime: "running",
    status: "Active",
    tone: "success",
  },
  {
    name: "Support Agent",
    appLogos: ["SL", "NO", "CA"],
    gradient:
      "from-emerald-100 via-stone-50 to-violet-100 dark:from-emerald-950/40 dark:via-stone-950 dark:to-violet-950/40",
    runtime: "running",
    status: "Active",
    tone: "success",
  },
  {
    name: "Ops Analyst",
    appLogos: ["CA", "GD", "SL"],
    gradient:
      "from-amber-100 via-stone-50 to-cyan-100 dark:from-amber-950/40 dark:via-stone-950 dark:to-cyan-950/40",
    runtime: "paused",
    status: "Draft",
    tone: "warning",
  },
  {
    name: "Knowledge Curator",
    appLogos: ["NO", "GD", "FI"],
    gradient:
      "from-fuchsia-100 via-stone-50 to-lime-100 dark:from-fuchsia-950/40 dark:via-stone-950 dark:to-lime-950/40",
    runtime: "paused",
    status: "Paused",
    tone: "outline",
  },
  {
    name: "Billing Helper",
    appLogos: ["CA", "SL", "GD"],
    gradient:
      "from-orange-100 via-stone-50 to-blue-100 dark:from-orange-950/40 dark:via-stone-950 dark:to-blue-950/40",
    runtime: "running",
    status: "Beta",
    tone: "info",
  },
  {
    name: "Admin Guard",
    appLogos: ["GH", "SL", "NO"],
    gradient:
      "from-teal-100 via-stone-50 to-pink-100 dark:from-teal-950/40 dark:via-stone-950 dark:to-pink-950/40",
    runtime: "running",
    status: "Active",
    tone: "success",
  },
] satisfies Agent[];

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

const playgroundCards = [
  {
    apps: ["SL", "GD"],
    id: "intake",
    runtime: "running",
    title: "Intake chat",
    x: 40,
    y: 64,
  },
  {
    apps: ["NO", "GH"],
    id: "research",
    runtime: "running",
    title: "Research chat",
    x: 360,
    y: 48,
  },
  {
    apps: ["CA", "SL"],
    id: "approval",
    runtime: "paused",
    title: "Approval chat",
    x: 220,
    y: 250,
  },
  {
    apps: ["GD", "NO", "FI"],
    id: "summary",
    runtime: "running",
    title: "Summary chat",
    x: 700,
    y: 238,
  },
] satisfies PlaygroundCard[];

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

const skills = [
  {
    id: "skill-browser-research",
    name: "Browser research",
    description: "Research current information and summarize sources.",
    icon: Search01Icon,
    gradient: skillGradientOptions[0],
    source: "default",
    content:
      "# Browser research\n\nUse this skill when a task needs current information, source comparison, or concise research notes.\n\n## Steps\n\n- Identify the user question and expected output.\n- Search authoritative sources first.\n- Compare at least two relevant references when the answer depends on freshness.\n- Return a short summary with links and caveats.",
  },
  {
    id: "skill-document-drafting",
    name: "Document drafting",
    description: "Draft structured notes, memos, and documents.",
    icon: BookOpenIcon,
    gradient: skillGradientOptions[1],
    source: "default",
    content:
      "# Document drafting\n\nUse this skill to create structured drafts, outlines, memos, or reusable document sections.\n\n## Style\n\n- Start with a clear title.\n- Keep paragraphs short.\n- Use bullets for scannable decisions.\n- End with next steps when useful.",
  },
  {
    id: "skill-workspace-analysis",
    name: "Workspace analysis",
    description: "Turn workspace context into clear operational insight.",
    icon: BuildingIcon,
    gradient: skillGradientOptions[2],
    source: "default",
    content:
      "# Workspace analysis\n\nUse this skill to inspect workspace context and turn scattered information into operational clarity.\n\n## Output\n\n- Key signals\n- Risks or gaps\n- Suggested actions\n- Owners or follow-up questions",
  },
  {
    id: "skill-data-controls",
    name: "Data controls",
    description: "Guide privacy, retention, and data access decisions.",
    icon: DatabaseIcon,
    gradient: skillGradientOptions[3],
    source: "default",
    content:
      "# Data controls\n\nUse this skill for privacy, retention, and data-handling tasks.\n\n## Checklist\n\n- Confirm the data source.\n- Identify sensitive fields.\n- Recommend the least-permissive access path.\n- Note any retention or deletion implications.",
  },
  {
    id: "skill-workflow-builder",
    name: "Workflow builder",
    description: "Design repeatable multi-step automations.",
    icon: WorkflowCircleIcon,
    gradient: skillGradientOptions[4],
    source: "default",
    content:
      "# Workflow builder\n\nUse this skill to design repeatable multi-step automations across chats, agents, and connected apps.\n\n## Pattern\n\n1. Trigger\n2. Required context\n3. App or skill actions\n4. Review or approval step\n5. Final output",
  },
  {
    id: "skill-team-support",
    name: "Team support",
    description: "Handle support triage, handoffs, and updates.",
    icon: LifebuoyIcon,
    gradient: skillGradientOptions[5],
    source: "default",
    content:
      "# Team support\n\nUse this skill for support triage, customer notes, internal handoffs, and status updates.\n\n## Tone\n\nHelpful, direct, calm, and specific.",
  },
] satisfies SkillItem[];

const connectors = [
  {
    name: "Google Drive",
    description: "Search, read, and organize shared workspace files.",
    logo: "GD",
  },
  {
    name: "Slack",
    description: "Summarize channels and turn decisions into tasks.",
    logo: "SL",
  },
  {
    name: "GitHub",
    description: "Track pull requests, issues, reviews, and releases.",
    logo: "GH",
  },
  {
    name: "Notion",
    description: "Keep docs, projects, and knowledge bases connected.",
    logo: "NO",
  },
  {
    name: "Figma",
    description: "Reference design files and product specs in context.",
    logo: "FI",
  },
  {
    name: "Calendar",
    description: "Use meetings, availability, and follow-ups in Atmet.",
    logo: "CA",
  },
];

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

const adminWorkspaces = [
  ["Atmet Workspace", "Anas Hamad", "Pro", "8", "Active", "74%", "Jul 2026"],
  ["Product Ops", "Maya Zaid", "Business", "18", "Active", "63%", "Jun 2026"],
  ["Research Lab", "Omar Nasser", "Starter", "4", "Review", "28%", "Jul 2026"],
  ["Client Portal", "Lina Saleh", "Pro", "11", "Active", "52%", "May 2026"],
] satisfies readonly [string, string, string, string, string, string, string][];

const adminWaitlistRequests = [
  ["Sarah Ali", "sarah@northstar.io", "Northstar", "Team workspace automation", "Today", "Pending"],
  ["Khaled Mansour", "khaled@relay.dev", "Relay", "Customer support agents", "Yesterday", "Pending"],
  ["Nora Haddad", "nora@studio.pm", "Studio PM", "Project knowledge base", "Jul 18", "Review"],
  ["Fares Naim", "fares@orbital.ai", "Orbital", "Internal ops workflows", "Jul 17", "Pending"],
] satisfies readonly [string, string, string, string, string, string][];

const adminActivityLogs = [
  ["10:42", "Anas Hamad", "Approved waitlist user", "Sarah Ali"],
  ["10:18", "System", "Synced connector scopes", "Google Drive"],
  ["09:56", "Maya Zaid", "Updated role permissions", "Admin"],
  ["09:21", "Atmet Agent", "Completed workflow run", "Support Agent"],
] satisfies readonly [string, string, string, string][];

const adminSessionLogs = [
  ["Anas Hamad", "macOS", "Amman, JO", "Active now"],
  ["Maya Zaid", "Chrome", "Dubai, AE", "12 min ago"],
  ["Lina Saleh", "Safari", "Riyadh, SA", "Yesterday"],
  ["Rami Haddad", "Chrome", "Amman, JO", "Suspended"],
] satisfies readonly [string, string, string, string][];

const adminUsers = [
  ["Anas Hamad", "anas@atmet.local", "Atmet Workspace", "Owner", "Active", "Today, 10:42"],
  ["Maya Zaid", "maya@productops.local", "Product Ops", "Admin", "Active", "Today, 09:18"],
  ["Omar Nasser", "omar@research.local", "Research Lab", "Member", "Invited", "Never"],
  ["Lina Saleh", "lina@clientportal.local", "Client Portal", "Admin", "Active", "Yesterday"],
  ["Rami Haddad", "rami@atmet.local", "Atmet Workspace", "Member", "Suspended", "Jul 15"],
] satisfies readonly [string, string, string, string, string, string][];

const adminRoles = [
  ["Owner", "Full workspace, billing, and admin console access.", "All"],
  ["Admin", "Manage members, workflows, connectors, and requests.", "Most"],
  ["Member", "Use chats, skills, and approved connectors.", "Limited"],
  ["Viewer", "Read shared workspace context and outputs.", "Read only"],
] satisfies readonly [string, string, string][];

type AdminProfileView =
  | { name: string; type: "user" }
  | { name: string; type: "workspace" };

const pageDescriptions = {
  admin:
    "Govern workspace access, requests, roles, and usage controls from one console.",
  agents:
    "Build and monitor agent workflows that can run across connected apps.",
  brain:
    "Store reusable workspace knowledge and context for future agent memory.",
  changelogs:
    "Track product updates, release notes, and workspace-facing changes.",
  connectors:
    "Connect apps so Atmet can work with files, messages, tasks, and calendars.",
  settings:
    "Manage profile, workspace preferences, billing, data, and support options.",
  skills:
    "Add reusable capabilities that agents and chats can call when work gets specific.",
  usage:
    "Review workspace activity, limits, and consumption once reporting is ready.",
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

const initialSidebarChats = [
  { id: "chat-product-research", pinned: true, title: "Product research" },
  { id: "chat-support-flow", pinned: false, title: "Support workflow" },
  { id: "chat-weekly-summary", pinned: false, title: "Weekly summary" },
] satisfies SidebarChat[];

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

const composerOptions: ComposerOption[] = [
  ...connectors.map((connector) => ({
    id: `app-${connector.name}`,
    kind: "apps" as const,
    logo: connector.logo,
    name: connector.name,
  })),
  ...skills.map((skill) => ({
    id: `skill-${skill.name}`,
    icon: skill.icon,
    kind: "skills" as const,
    name: skill.name,
  })),
];

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

export default function Home() {
  const [activePage, setActivePage] = useState<PageKey>("chat");
  const [agentsPlaygroundOpen, setAgentsPlaygroundOpen] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(
    null,
  );
  const [agentList, setAgentList] = useState<Agent[]>(() =>
    agents.map((agent) => ({ ...agent, appLogos: [...agent.appLogos] })),
  );
  const [activeSidebarChatId, setActiveSidebarChatId] = useState<string | null>(
    initialSidebarChats[0]?.id ?? null,
  );
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  const [sidebarChats, setSidebarChats] =
    useState<SidebarChat[]>(initialSidebarChats);
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  function selectPage(page: PageKey) {
    setActivePage(page);
    if (page !== "agents") {
      setAgentsPlaygroundOpen(false);
      setSelectedAgentName(null);
    }
  }

  function createAgent(name: string) {
    setAgentList((current) => [
      ...current,
      {
        appLogos: ["AT", "GD", "SL"],
        gradient:
          "from-stone-100 via-stone-50 to-emerald-100 dark:from-stone-900 dark:via-stone-950 dark:to-emerald-950/40",
        name,
        runtime: "paused",
        status: "Draft",
        tone: "warning",
      },
    ]);
  }

  function createSidebarChat() {
    const nextIndex = sidebarChatCounterRef.current;
    sidebarChatCounterRef.current += 1;
    const id = `chat-${nextIndex}`;
    const nextTitle = `New chat ${nextIndex}`;

    setSidebarChats((current) => [
      { id, pinned: false, title: nextTitle },
      ...current,
    ]);
    setActiveSidebarChatId(id);
    setChatHistoryOpen(true);
    selectPage("chat");

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
  }

  function toggleSidebarChatPin(chatId: string) {
    setSidebarChats((current) =>
      current.map((chat) =>
        chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
  }

  function deleteSidebarChat(chatId: string) {
    setSidebarChats((current) => current.filter((chat) => chat.id !== chatId));
    if (activeSidebarChatId === chatId) {
      setActiveSidebarChatId(null);
    }
  }

  function copyChatValue(value: string) {
    navigator.clipboard?.writeText(value).catch(() => undefined);
  }

  function openSidebarChat(chatId: string) {
    setActiveSidebarChatId(chatId);
    selectPage("chat");
  }

  function useSkillInChat(skill: SkillItem, chatId: string) {
    const prompt = `Use /"${skill.name}" to `;

    setActiveSidebarChatId(chatId);
    setChatDraftRequest({
      chatId,
      prompt,
      requestId: chatDraftCounterRef.current,
    });
    chatDraftCounterRef.current += 1;
    selectPage("chat");
  }

  function useSkillInNewChat(skill: SkillItem) {
    const chatId = createSidebarChat();
    useSkillInChat(skill, chatId);
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
    setActivePage("agents");
  }

  return (
    <main className="min-h-svh bg-sidebar text-foreground">
      <div className="flex min-h-svh flex-col">
        <div className="flex h-10 shrink-0 items-center justify-between gap-3 px-3 pt-1.5 md:px-4">
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
              onAddChatToAgentWorkflow={addChatToAgentWorkflow}
              onCopyChatValue={copyChatValue}
              onDeleteChat={deleteSidebarChat}
              onRenameChat={renameSidebarChat}
              onTogglePin={toggleSidebarChatPin}
            />
          </div>
          <UserIdentity />
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

        <section className="flex min-w-0 flex-1 bg-sidebar px-1.5 pb-1.5 md:px-2 md:pb-2">
          <div className="flex min-h-full flex-1 overflow-hidden rounded-xl border border-black/5 bg-background dark:border-white/6">
            <div
              className={cn(
                "mx-auto flex min-h-[calc(100svh-4.5rem)] w-full flex-1 flex-col px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5",
                activePage === "agents" && agentsPlaygroundOpen
                  ? "max-w-none"
                  : "max-w-5xl",
              )}
            >
              {activePage === "chat" && (
                <ChatPage
                  activeChatId={activeSidebarChatId}
                  draftRequest={chatDraftRequest}
                />
              )}
              {activePage === "chat2" && <NexusChatPage />}
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
                <EmptyPage
                  description={pageDescriptions.brain}
                  title="Brain"
                />
              )}
              {activePage === "skills" && (
                <SkillsPage
                  chats={sidebarChats}
                  onUseSkillInChat={useSkillInChat}
                  onUseSkillInNewChat={useSkillInNewChat}
                />
              )}
              {activePage === "connectors" && <ConnectorsPage />}
              {activePage === "usage" && (
                <EmptyPage
                  description={pageDescriptions.usage}
                  title="Usage"
                />
              )}
              {activePage === "changelogs" && (
                <EmptyPage
                  description={pageDescriptions.changelogs}
                  title="Changelogs"
                />
              )}
              {activePage === "settings" && <SettingsPage />}
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
  onDeleteChat,
  onRenameChat,
  onTogglePin,
}: {
  activeChat: SidebarChat | null;
  agents: Agent[];
  onAddChatToAgentWorkflow: (agentName: string, chat: SidebarChat) => void;
  onCopyChatValue: (value: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <AtmetLogo className="size-5" plain />
      <div className="h-4 w-px shrink-0 bg-sidebar-border" />
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="grid size-6 shrink-0 place-items-center rounded-md bg-background text-[0.625rem] font-semibold leading-none text-foreground">
          AW
        </div>
        <p className="truncate text-xs font-medium leading-none text-sidebar-foreground">
          Atmet Workspace
        </p>
      </div>
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
            onClick={() => onDeleteChat(chat.id)}
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

function UserIdentity() {
  return (
    <Menu>
      <MenuTrigger className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md outline-none transition-[background-color] hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <div className="grid size-6 shrink-0 place-items-center rounded-md bg-background text-[0.625rem] font-semibold leading-none text-foreground">
          AH
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-xs font-medium leading-none text-sidebar-foreground">
            Anas Hamad
          </p>
        </div>
        <Icon
          className="size-3.5 text-sidebar-foreground opacity-70"
          icon={ChevronDownIcon}
        />
      </MenuTrigger>
      <MenuPopup align="end" className="min-w-40" sideOffset={8}>
        <MenuItem>
          <Icon icon={ProfileIcon} />
          My profile
        </MenuItem>
        <MenuItem>
          <Icon icon={Settings01Icon} />
          Settings
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive">
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
  onClick,
}: {
  active: boolean;
  item: NavigationItem;
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
      <Icon className="size-4" icon={item.icon} />
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
  draftRequest,
}: {
  activeChatId: string | null;
  draftRequest: ChatDraftRequest | null;
}) {
  return (
    <ChatExperience
      draftRequest={
        draftRequest?.chatId === activeChatId ? draftRequest : null
      }
      key={activeChatId ?? "new-chat"}
    />
  );
}

type NexusChatMessage = {
  demo?: NexusDemoKey;
  from: "assistant" | "user";
  id: string;
  pending?: boolean;
  text: string;
};

type NexusDemoKey =
  | "attachments"
  | "citation"
  | "message"
  | "model"
  | "prompt"
  | "suggestions"
  | "thread";

type NexusContextToken = {
  kind: "app" | "skill";
  logo: string;
  name: string;
};

const nexusDemoButtons = [
  ["Prompt input", "prompt"],
  ["Suggestions", "suggestions"],
  ["Model selector", "model"],
  ["Attachments", "attachments"],
  ["Message", "message"],
  ["Thread", "thread"],
  ["Citation", "citation"],
] satisfies readonly [string, NexusDemoKey][];

const nexusAppOptions = [
  { kind: "app", logo: "GD", name: "Google Drive" },
  { kind: "app", logo: "SL", name: "Slack" },
  { kind: "app", logo: "GH", name: "GitHub" },
  { kind: "app", logo: "NO", name: "Notion" },
  { kind: "app", logo: "FI", name: "Figma" },
] satisfies NexusContextToken[];

const nexusSkillOptions = skills.slice(0, 6).map((skill) => ({
  kind: "skill" as const,
  logo: getOptionInitials(skill.name),
  name: skill.name,
}));

function NexusChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<NexusChatMessage[]>([
    {
      from: "assistant",
      id: "welcome",
      text: "This is the temporary Nexus UI chat surface. Ask anything and I will fake a response so you can test the interaction safely.",
    },
  ]);
  const [contextTokens, setContextTokens] = useState<NexusContextToken[]>([]);
  const [picker, setPicker] = useState<{
    kind: "app" | "skill";
    query: string;
  } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const fakeResponseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isLoading = messages.some((message) => message.pending);
  const pickerOptions = picker
    ? (picker.kind === "app" ? nexusAppOptions : nexusSkillOptions).filter(
        (option) =>
          option.name.toLowerCase().includes(picker.query.toLowerCase()),
      )
    : [];

  useEffect(() => {
    return () => {
      if (fakeResponseTimeoutRef.current) {
        clearTimeout(fakeResponseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!picker) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && pickerRef.current?.contains(target)) {
        return;
      }

      setPicker(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [picker]);

  function submitMessage(value: string) {
    const trimmed = value.trim();

    if ((!trimmed && contextTokens.length === 0) || isLoading) {
      return;
    }

    const pendingId = `pending-${Date.now()}`;
    const contextText = contextTokens
      .map((token) => `${token.kind === "app" ? "@" : "/"}${token.name}`)
      .join(" ");

    setInput("");
    setContextTokens([]);
    setPicker(null);
    setMessages((current) => [
      ...current,
      {
        from: "user",
        id: `user-${Date.now()}`,
        text: [contextText, trimmed].filter(Boolean).join(" "),
      },
      {
        from: "assistant",
        id: pendingId,
        pending: true,
        text: "Thinking through the Atmet workspace context",
      },
    ]);

    fakeResponseTimeoutRef.current = setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingId
            ? {
                ...message,
                pending: false,
                text:
                  "I would handle this with Nexus UI primitives: a sticky prompt input, a scroll-safe thread, and Atmet-styled message states. This page is isolated, so the original chat composer stays untouched.",
              }
            : message,
        ),
      );
    }, 900);
  }

  function updateInput(value: string) {
    setInput(value);

    const match = value.match(/(?:^|\s)([@/])([^\s@/]*)$/);
    if (!match) {
      setPicker(null);
      return;
    }

    setPicker({
      kind: match[1] === "@" ? "app" : "skill",
      query: match[2] ?? "",
    });
  }

  function selectContextToken(token: NexusContextToken) {
    setContextTokens((current) => {
      if (current.some((item) => item.kind === token.kind && item.name === token.name)) {
        return current;
      }

      return [...current, token];
    });
    setInput((current) => current.replace(/(?:^|\s)([@/])([^\s@/]*)$/, " "));
    setPicker(null);
  }

  function addDemoMessage(demo: NexusDemoKey) {
    const label =
      nexusDemoButtons.find(([, key]) => key === demo)?.[0] ?? "Component";

    setMessages((current) => [
      ...current,
      {
        demo,
        from: "assistant",
        id: `demo-${demo}-${Date.now()}`,
        text: `${label} demo`,
      },
    ]);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Thread className="min-h-0 flex-1">
        <ThreadContent className="mx-auto w-full max-w-3xl gap-4 px-0 pb-32 pt-10">
          <NexusDemoToolbar onSelect={addDemoMessage} />
          {messages.map((message) => (
            <NexusChatBubble key={message.id} message={message} />
          ))}
        </ThreadContent>
        <ThreadScrollToBottom />
      </Thread>

      <div className="sticky bottom-0 mx-auto w-full max-w-3xl bg-background/92 pb-4 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/78">
        {picker && (
          <div
            className="absolute bottom-[calc(100%-0.5rem)] left-0 z-20 w-72 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg/10"
            ref={pickerRef}
          >
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {picker.kind === "app" ? "Connect an app" : "Use a skill"}
            </div>
            <div className="grid gap-1">
              {pickerOptions.map((option) => (
                <button
                  className="flex items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-[background-color] hover:bg-accent"
                  key={`${option.kind}-${option.name}`}
                  onClick={() => selectContextToken(option)}
                  type="button"
                >
                  <span className="grid size-6 place-items-center rounded-lg bg-foreground text-[0.625rem] font-semibold text-background">
                    {option.logo}
                  </span>
                  <span className="min-w-0 truncate">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <PromptInput
          className="rounded-2xl border-border/80 bg-background dark:bg-input/24"
          onSubmit={submitMessage}
        >
          {contextTokens.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 pt-4">
              {contextTokens.map((token) => (
                <button
                  className="inline-flex h-6 items-center gap-1 rounded-lg bg-secondary px-1.5 text-xs font-medium text-secondary-foreground transition-[background-color] hover:bg-secondary/80"
                  key={`${token.kind}-${token.name}`}
                  onClick={() =>
                    setContextTokens((current) =>
                      current.filter(
                        (item) =>
                          item.kind !== token.kind || item.name !== token.name,
                      ),
                    )
                  }
                  type="button"
                >
                  <span className="grid size-4 place-items-center rounded-md bg-foreground text-[0.5rem] font-semibold text-background">
                    {token.logo}
                  </span>
                  {token.name}
                </button>
              ))}
            </div>
          )}
          <PromptInputTextarea
            disabled={isLoading}
            onChange={(event) => updateInput(event.target.value)}
            placeholder="Use / to add a skill or @ to connect an app."
            value={input}
          />
          <PromptInputActions>
            <PromptInputActionGroup>
              <PromptInputAction asChild tooltip="Add context">
                <Button
                  aria-label="Add context"
                  className="rounded-full active:scale-[0.96]"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setPicker({ kind: "app", query: "" })}
                >
                  <Icon icon={PlusSignIcon} />
                </Button>
              </PromptInputAction>
              <Button
                className="h-7 rounded-full px-2 text-xs"
                onClick={() => setPicker({ kind: "app", query: "" })}
                size="sm"
                variant="ghost"
              >
                Apps
                <Icon icon={PlusSignIcon} />
              </Button>
              <Button
                className="h-7 rounded-full px-2 text-xs"
                onClick={() => setPicker({ kind: "skill", query: "" })}
                size="sm"
                variant="ghost"
              >
                Skills
                <Icon icon={PlusSignIcon} />
              </Button>
              <Button
                className="h-7 rounded-full px-2 text-xs"
                size="sm"
                variant="ghost"
              >
                <AtmetLogo className="size-4" plain />
                Atmet
                <Icon icon={ChevronDownIcon} />
              </Button>
            </PromptInputActionGroup>
            <PromptInputActionGroup>
              <PromptInputAction
                asChild
                tooltip={{ content: "Send message", shortcut: "Enter" }}
              >
                <Button
                  className="h-8 rounded-full px-3 active:scale-[0.96]"
                  disabled={isLoading || (!input.trim() && contextTokens.length === 0)}
                  onClick={() => submitMessage(input)}
                  size="sm"
                >
                  Send
                  <Icon icon={SendHorizontal} />
                </Button>
              </PromptInputAction>
            </PromptInputActionGroup>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}

function NexusChatBubble({ message }: { message: NexusChatMessage }) {
  const fromUser = message.from === "user";

  return (
    <article
      className={cn(
        "flex w-full items-start gap-2",
        fromUser ? "justify-end" : "justify-start",
      )}
    >
      {!fromUser && (
        <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-foreground text-[0.625rem] font-semibold text-background">
          A
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-6",
          fromUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/55 text-foreground dark:bg-input/30",
        )}
      >
        {message.pending ? (
          <TextShimmer className="text-muted-foreground" duration={1.1}>
            {message.text}
          </TextShimmer>
        ) : message.demo ? (
          <NexusDemoOutput demo={message.demo} />
        ) : (
          message.text
        )}
      </div>
    </article>
  );
}

function NexusDemoToolbar({
  onSelect,
}: {
  onSelect: (demo: NexusDemoKey) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/25 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Output test buttons</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Temporary demos for the Nexus UI chat component set.
          </p>
        </div>
        <Badge variant="outline">Temp</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {nexusDemoButtons.map(([label, key]) => (
          <Button
            className="h-7 rounded-full px-2.5 text-xs"
            key={key}
            onClick={() => onSelect(key)}
            size="sm"
            variant="outline"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function NexusDemoOutput({ demo }: { demo: NexusDemoKey }) {
  if (demo === "prompt") {
    return <NexusPromptOutputDemo />;
  }

  if (demo === "suggestions") {
    return <NexusSuggestionsOutputDemo />;
  }

  if (demo === "model") {
    return <NexusModelSelectorOutputDemo />;
  }

  if (demo === "attachments") {
    return <NexusAttachmentsOutputDemo />;
  }

  if (demo === "thread") {
    return <NexusThreadOutputDemo />;
  }

  if (demo === "citation") {
    return <NexusCitationOutputDemo />;
  }

  return (
    <div className="grid gap-3">
      <p>
        Message demo: assistant and user bubbles align naturally inside the
        thread and keep Atmet&apos;s compact rounded surface.
      </p>
      <div className="flex justify-end">
        <div className="rounded-2xl bg-primary px-3 py-2 text-primary-foreground">
          User message
        </div>
      </div>
      <div className="flex justify-start">
        <div className="rounded-2xl bg-background px-3 py-2">
          Assistant response with clean readable markdown-style spacing.
        </div>
      </div>
    </div>
  );
}

function NexusPromptOutputDemo() {
  return (
    <div className="grid gap-3">
      <p className="font-medium">Prompt Input</p>
      <div className="rounded-2xl border border-border bg-background p-3">
        <div className="min-h-16 text-muted-foreground">
          Use / to add a skill or @ to connect an app.
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <div className="flex items-center gap-1.5">
            <span className="grid size-7 place-items-center rounded-full bg-muted">
              <Icon className="size-3.5" icon={PlusSignIcon} />
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs">
              <AtmetLogo className="size-4" plain />
              Atmet
              <Icon className="size-3" icon={ChevronDownIcon} />
            </span>
          </div>
          <Button className="h-7 rounded-full px-2.5 text-xs" size="sm">
            Send
            <Icon icon={SendHorizontal} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function NexusSuggestionsOutputDemo() {
  const prompts = [
    "Summarize workspace activity",
    "Draft a launch checklist",
    "Find connector risks",
  ];

  return (
    <div className="grid gap-3">
      <p className="font-medium">Suggestions</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <span
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs"
            key={prompt}
          >
            {prompt}
          </span>
        ))}
      </div>
    </div>
  );
}

function NexusModelSelectorOutputDemo() {
  const models = ["Atmet", "Gemini 3", "GPT-5 mini", "Claude 4.5 Sonnet"];

  return (
    <div className="w-72 overflow-hidden rounded-2xl border border-border bg-background p-1.5">
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Model selector
      </div>
      {models.map((model, index) => (
        <div
          className="flex items-center justify-between rounded-xl px-2 py-2 text-sm"
          key={model}
        >
          <span className="flex items-center gap-2">
            {index === 0 ? (
              <AtmetLogo className="size-5" plain />
            ) : (
              <span className="grid size-5 place-items-center rounded-md bg-muted text-[0.55rem] font-semibold">
                {getOptionInitials(model)}
              </span>
            )}
            {model}
          </span>
          {index === 0 && <Icon className="size-4 text-success" icon={CheckIcon} />}
        </div>
      ))}
    </div>
  );
}

function NexusAttachmentsOutputDemo() {
  const files = [
    ["workspace-summary.md", "12 KB"],
    ["connector-audit.csv", "84 KB"],
  ];

  return (
    <div className="grid gap-2">
      <p className="font-medium">Attachments</p>
      {files.map(([name, size]) => (
        <div
          className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
          key={name}
        >
          <span className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-muted">
              <Icon className="size-4" icon={File01Icon} />
            </span>
            <span>
              <span className="block text-sm">{name}</span>
              <span className="block text-xs text-muted-foreground">{size}</span>
            </span>
          </span>
          <Badge variant="outline">Ready</Badge>
        </div>
      ))}
    </div>
  );
}

function NexusThreadOutputDemo() {
  return (
    <div className="grid gap-2">
      <p className="font-medium">Thread</p>
      <div className="rounded-2xl border border-border bg-background p-3">
        <div className="flex h-32 flex-col justify-end gap-2 overflow-hidden rounded-xl bg-muted/35 p-3">
          <div className="h-3 w-36 rounded-full bg-foreground/15" />
          <div className="h-3 w-52 rounded-full bg-foreground/15" />
          <div className="ml-auto h-8 w-48 rounded-2xl bg-primary/85" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Stick-to-bottom thread behavior for long chats.
        </p>
      </div>
    </div>
  );
}

function NexusCitationOutputDemo() {
  return (
    <div className="grid gap-3">
      <p>
        Atmet can cite connected workspace context
        <sup className="mx-1 rounded bg-background px-1 text-[0.65rem]">1</sup>
        and connector events
        <sup className="mx-1 rounded bg-background px-1 text-[0.65rem]">2</sup>
        inline.
      </p>
      <div className="grid gap-1 border-t border-border pt-2 text-xs text-muted-foreground">
        <div>1 Workspace memory summary - Atmet</div>
        <div>2 Google Drive connector log - Atmet</div>
      </div>
    </div>
  );
}

function ChatExperience({
  compact = false,
  draftRequest = null,
}: {
  compact?: boolean;
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
  const fakeResponseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
    return () => {
      if (fakeResponseTimeoutRef.current) {
        clearTimeout(fakeResponseTimeoutRef.current);
      }
    };
  }, []);

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

  function sendComposerMessage() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const content = getComposerPlainText(editor);
    if (!content) {
      editor.focus();
      return;
    }

    const assistantId = `assistant-${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        content,
        id: `user-${Date.now()}`,
        role: "user",
      },
      {
        content: "",
        id: assistantId,
        role: "assistant",
        state: "thinking",
      },
    ]);

    editor.innerHTML = "";
    setComposerIsEmpty(true);
    setMention(null);
    mentionRangeRef.current = null;

    if (fakeResponseTimeoutRef.current) {
      clearTimeout(fakeResponseTimeoutRef.current);
    }

    fakeResponseTimeoutRef.current = setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  "Here is a temporary Atmet response. I checked the selected apps and skills, prepared a concise answer, and this area is now ready for a real model stream later.",
                state: "complete",
              }
            : message,
        ),
      );
    }, 900);
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
        "grid shrink-0 place-items-center rounded-md bg-primary font-semibold text-primary-foreground",
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
        This is fake for now, but it is shaped like the AI output components:
        status first, action context next, and the final response as clean text.
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
    ...playgroundCards.map((card) => ({ ...card })),
    ...workflowChatNodes.map((node, index) => ({
      apps: ["AT"],
      id: getWorkflowChatCardId(node.chatId),
      runtime: "paused" as const,
      title: node.title,
      x: 72 + index * 44,
      y: 400 + index * 36,
    })),
  ]);
  const [connections, setConnections] = useState<PlaygroundConnection[]>([
    { from: "intake", to: "research" },
    { from: "research", to: "summary" },
  ]);
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
  const agentUrl = `https://atmet.local/agents/${agent.name
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
  onUseSkillInChat,
  onUseSkillInNewChat,
}: {
  chats: SidebarChat[];
  onUseSkillInChat: (skill: SkillItem, chatId: string) => void;
  onUseSkillInNewChat: (skill: SkillItem) => void;
}) {
  const [skillList, setSkillList] = useState<SkillItem[]>(() =>
    skills.map((skill) => ({ ...skill })),
  );
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(
    null,
  );
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("all");
  const [skillSearch, setSkillSearch] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const selectedSkill = selectedSkillId
    ? skillList.find((skill) => skill.id === selectedSkillId) ?? null
    : null;
  const visibleSkills = skillList.filter((skill) => {
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
    setSkillList((current) =>
      current.map((skill) =>
        skill.id === skillId ? { ...skill, ...updates } : skill,
      ),
    );
  }

  function createSkill(mode: "ai" | "instructions") {
    const nextIndex = skillList.length + 1;
    const visual = getRandomSkillVisual();
    const skill =
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

    setSkillList((current) => [...current, skill]);
    setSelectedSkillId(skill.id);
  }

  function createUploadedSkill({
    content,
    description,
    name,
  }: {
    content: string;
    description: string;
    name: string;
  }) {
    const visual = getRandomSkillVisual();
    const skill = {
      content,
      description,
      gradient: visual.gradient,
      icon: visual.icon,
      id: createSkillId(name),
      name,
      source: "custom" as const,
    };

    setSkillList((current) => [...current, skill]);
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
          {visibleSkills.length} of {skillList.length} skills
        </span>
      </div>
      <UploadMarkdownSkillDialog
        onCreate={createUploadedSkill}
        onOpenChange={setUploadDialogOpen}
        open={uploadDialogOpen}
      />
      <div className="grid gap-2">
        {visibleSkills.map((skill) => (
          <Card className="overflow-hidden" key={skill.id}>
            <CardPanel className="flex items-center gap-3 p-2.5">
              <button
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 text-left outline-none transition-[background-color] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
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

function ConnectorsPage() {
  return (
    <>
      <PageHeader
        description={pageDescriptions.connectors}
        title="Connectors"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {connectors.map((connector) => (
          <Card key={connector.name}>
            <CardHeader>
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-foreground">
                {connector.logo}
              </div>
              <CardTitle>{connector.name}</CardTitle>
              <CardDescription>{connector.description}</CardDescription>
            </CardHeader>
            <CardPanel className="pt-0">
              <Button className="w-full" variant="outline">
                <Icon icon={PlugIcon} />
                Connect
              </Button>
            </CardPanel>
          </Card>
        ))}
      </div>
    </>
  );
}

function SettingsPage() {
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
          <SettingsProfileTab />
        </TabsContent>
        <TabsContent value="workspace">
          <SettingsWorkspaceTab />
        </TabsContent>
        <TabsContent value="general">
          <SettingsGeneralTab />
        </TabsContent>
        <TabsContent value="data">
          <SettingsDataControlsTab />
        </TabsContent>
        <TabsContent value="billing">
          <SettingsBillingTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

function SettingsProfileTab() {
  const [profileDirty, setProfileDirty] = useState(false);

  return (
    <div className="grid gap-4 pb-6">
      <Frame className="bg-muted/60">
        <FramePanel className="overflow-hidden p-0">
          <div className="grid divide-y divide-border/70 lg:grid-cols-[minmax(0,1fr)_18rem] lg:divide-x lg:divide-y-0">
            <div className="grid gap-x-3 gap-y-2.5 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Avatar</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <div className="grid size-20 place-items-center rounded-2xl border border-border bg-background text-2xl font-semibold shadow-xs/5">
                    AH
                  </div>
                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => setProfileDirty(true)}
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
                defaultValue="Anas Hamad"
                label="Display name"
                onChange={() => setProfileDirty(true)}
              />
              <SettingsProfileField
                defaultValue="anas@atmet.local"
                label="Email"
                onChange={() => setProfileDirty(true)}
                readOnly
              />
              <SettingsProfileField
                defaultValue="Product builder"
                label="Role"
                onChange={() => setProfileDirty(true)}
              />
              <SettingsProfileField
                defaultValue="Asia/Amman"
                label="Timezone"
                onChange={() => setProfileDirty(true)}
              />
              <div className="sm:col-span-2">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea
                  className="mt-1.5"
                  defaultValue="Building Atmet workflows for workspace intelligence."
                  id="profile-bio"
                  onChange={() => setProfileDirty(true)}
                  size="sm"
                />
              </div>
              <div className="flex justify-end sm:col-span-2">
                <Button
                  disabled={!profileDirty}
                  onClick={() => setProfileDirty(false)}
                  size="sm"
                >
                  Save changes
                </Button>
              </div>
            </div>

            <div className="grid content-start gap-3 p-4">
              <SettingsProfileInsight
                label="Last active"
                value="Today, 10:42"
              />
              <SettingsProfileInsight
                label="Default workspace"
                value="Atmet Workspace"
              />
              <SettingsProfileInsight label="Member since" value="Jul 2026" />
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
          description="We will send reset instructions to anas@atmet.local."
          title="Password reset"
        >
          <SettingsActionDialogButton
            confirmLabel="Send link"
            description="A password reset link will be sent to anas@atmet.local."
            title="Send password reset"
            triggerLabel="Send reset link"
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function SettingsProfileField({
  defaultValue,
  label,
  onChange,
  readOnly = false,
}: {
  defaultValue: string;
  label: string;
  onChange?: () => void;
  readOnly?: boolean;
}) {
  const id = `profile-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        defaultValue={defaultValue}
        id={id}
        onChange={onChange}
        readOnly={readOnly}
        size="sm"
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

function SettingsWorkspaceTab() {
  const [workspaceDirty, setWorkspaceDirty] = useState(false);

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
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-black/10 bg-background shadow-xs/5 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <AtmetLogo className="size-8" plain />
                    <div className="h-8 w-px bg-border" />
                    <div className="grid size-9 place-items-center rounded-xl bg-muted text-sm font-semibold">
                      AW
                    </div>
                  </div>
                </div>
                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-semibold leading-7">
                      Atmet Workspace
                    </h2>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    Workspace intelligence dashboard preview.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline">8 members</Badge>
                    <Badge variant="outline">6 workflow agents</Badge>
                    <Badge variant="outline">4 connectors</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setWorkspaceDirty(true)}
                  size="sm"
                  variant="outline"
                >
                  Upload avatar
                </Button>
                <Button
                  disabled={!workspaceDirty}
                  onClick={() => setWorkspaceDirty(false)}
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
                defaultValue="Atmet Workspace"
                label="Workspace name"
                onChange={() => setWorkspaceDirty(true)}
              />
              <SettingsWorkspaceField
                defaultValue="atmet"
                label="Slug"
                onChange={() => setWorkspaceDirty(true)}
              />
              <SettingsWorkspaceField
                defaultValue="Workspace intelligence"
                label="Category"
                onChange={() => setWorkspaceDirty(true)}
              />
              <SettingsWorkspaceField
                defaultValue="Asia/Amman"
                label="Default timezone"
                onChange={() => setWorkspaceDirty(true)}
              />
              <div className="sm:col-span-2">
                <Label htmlFor="workspace-url">Workspace URL</Label>
                <Group className="mt-1 h-7 sm:h-6.5">
                  <Input
                    className="h-full w-full text-sm [&_[data-slot=input]]:h-full [&_[data-slot=input]]:leading-none"
                    id="workspace-url"
                    readOnly
                    size="sm"
                    value="https://atmetai.com/workspace/atmet"
                  />
                  <GroupSeparator />
                  <Button className="h-full sm:h-full" size="sm" variant="outline">
                    Copy
                  </Button>
                </Group>
              </div>
            </div>

            <div className="grid content-start gap-3 p-4">
              <SettingsProfileInsight label="Members" value="8 active" />
              <SettingsProfileInsight label="Default role" value="Member" />
              <SettingsProfileInsight label="Approval queue" value="3 requests" />
              <SettingsProfileInsight label="Created" value="Jul 2026" />
            </div>
          </div>
        </FramePanel>
      </Frame>

      <SettingsWorkspaceUsersTable />
    </div>
  );
}

const workspaceUsers = [
  {
    email: "anas@atmet.local",
    initials: "AH",
    lastActive: "Today, 10:42",
    name: "Anas Hamad",
    role: "Owner",
    status: "Active",
  },
  {
    email: "maya@atmet.local",
    initials: "MA",
    lastActive: "Today, 09:18",
    name: "Maya Alami",
    role: "Admin",
    status: "Active",
  },
  {
    email: "omar@atmet.local",
    initials: "OK",
    lastActive: "Yesterday",
    name: "Omar Khaled",
    role: "Member",
    status: "Active",
  },
  {
    email: "sara@atmet.local",
    initials: "SN",
    lastActive: "Jul 18",
    name: "Sara Nassar",
    role: "Member",
    status: "Invited",
  },
  {
    email: "team-ops@atmet.local",
    initials: "TO",
    lastActive: "Jul 15",
    name: "Team Ops",
    role: "Viewer",
    status: "Limited",
  },
] satisfies {
  email: string;
  initials: string;
  lastActive: string;
  name: string;
  role: string;
  status: "Active" | "Invited" | "Limited";
}[];

function SettingsWorkspaceUsersTable() {
  return (
    <Frame className="bg-muted/60">
      <FramePanel className="overflow-hidden p-0">
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
          <SettingsActionDialogButton
            confirmLabel="Send invite"
            description="Invite a teammate to Atmet Workspace and choose their starting role."
            icon={PlusSignIcon}
            title="Invite user"
            triggerLabel="Invite user"
          >
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input placeholder="teammate@company.com" size="sm" />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Button className="justify-between" size="sm" variant="outline">
                Member
                <Icon icon={ChevronDownIcon} />
              </Button>
            </div>
          </SettingsActionDialogButton>
        </div>

        <Table>
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
            {workspaceUsers.map((user) => (
              <TableRow key={user.email}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold">
                      {user.initials}
                    </div>
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
          </TableBody>
        </Table>
      </FramePanel>
    </Frame>
  );
}

function SettingsWorkspaceField({
  defaultValue,
  label,
  onChange,
}: {
  defaultValue: string;
  label: string;
  onChange?: () => void;
}) {
  const id = `workspace-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        className="text-sm [&_[data-slot=input]]:h-7 [&_[data-slot=input]]:leading-7 sm:[&_[data-slot=input]]:h-6.5 sm:[&_[data-slot=input]]:leading-6.5"
        defaultValue={defaultValue}
        id={id}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
}

function SettingsGeneralTab() {
  return (
    <SettingsTabGrid>
      <SettingsThemeSelector />
      <SettingsSection
        description="Manage startup, sound, timezone, and formatting."
        icon={Settings01Icon}
        title="General preferences"
      >
        <SettingsSwitchRow
          defaultChecked
          description="Enable sound effects for notifications and completed actions."
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
          <Button size="sm" variant="outline">Asia/Amman</Button>
        </SettingsRow>
        <SettingsRow description="Applied to billing, usage, and changelog dates." title="Date format">
          <Button size="sm" variant="outline">20 Jul 2026</Button>
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

function SettingsDataControlsTab() {
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
            description="This will delete Atmet Workspace, including workspace settings, users, agents, skills, and connected app configuration. This action cannot be undone."
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

function SettingsBillingTab() {
  return (
    <SettingsTabGrid>
      <SettingsSection
        action={<Badge variant="success">Pro</Badge>}
        description="The plan currently assigned to this user."
        icon={CreditCardIcon}
        title="Current plan"
      >
        <SettingsRow
          description="Includes workflow agents, skills, connectors, and advanced workspace controls."
          title="Atmet Pro"
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
                <Input defaultValue="anas@atmet.local" size="sm" />
              </div>
            </SettingsActionDialogButton>
          </div>
        </SettingsRow>
        <SettingsStatGrid
          stats={[
            ["Price", "$49/mo"],
            ["Renews", "Aug 20"],
            ["Billing email", "anas@atmet.local"],
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
        <div className="divide-y divide-border/70">{children}</div>
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
  defaultChecked = false,
  description,
  title,
}: {
  defaultChecked?: boolean;
  description: string;
  title: string;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <SettingsRow description={description} title={title}>
      <Switch checked={checked} onCheckedChange={setChecked} />
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

  return (
    <>
      <PageHeader description={pageDescriptions.admin} title="Admin Console" />
      <Tabs
        defaultValue="overview"
        onValueChange={() => setProfileView(null)}
      >
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
        <TabsContent value="overview">
          <AdminOverviewTab />
        </TabsContent>
        <TabsContent value="workspaces">
          <AdminWorkspacesUsersTab
            onOpenProfile={setProfileView}
            profileView={profileView}
          />
        </TabsContent>
        <TabsContent value="requests">
          <AdminRequestsTab />
        </TabsContent>
        <TabsContent value="roles">
          <AdminRolesTab />
        </TabsContent>
        <TabsContent value="usage">
          <AdminUsageControlsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

function AdminOverviewTab() {
  return (
    <SettingsTabGrid>
      <SettingsSection
        description="Live operating view for growth, usage, and access health."
        icon={ChartIcon}
        title="Admin overview"
      >
        <SettingsStatGrid
          stats={[
            ["Workspaces", "4"],
            ["Active users", "41"],
            ["Waitlist requests", "4"],
            ["Monthly runs", "18.4k"],
            ["Connector health", "98%"],
            ["MRR", "$4.8k"],
          ]}
        />
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <AdminSparklineCard
            data={[24, 31, 28, 42, 56, 61, 74]}
            label="Workspace growth"
            value="+18%"
          />
          <AdminSparklineCard
            data={[42, 38, 49, 64, 58, 72, 81]}
            label="Agent runs"
            value="18.4k"
          />
          <AdminSparklineCard
            data={[8, 11, 13, 10, 16, 19, 22]}
            label="Waitlist demand"
            value="+22"
          />
        </div>
        <div className="grid gap-3 border-t border-border/70 p-4 lg:grid-cols-[1.2fr_0.8fr]">
          <AdminBarChart
            bars={[
              ["Mon", 48],
              ["Tue", 62],
              ["Wed", 54],
              ["Thu", 78],
              ["Fri", 86],
              ["Sat", 41],
              ["Sun", 36],
            ]}
            title="Run volume"
          />
          <AdminPlanMix />
        </div>
      </SettingsSection>
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminLogsTable
          description="Recent admin and system activity across Atmet."
          rows={adminActivityLogs}
          title="Activity logs"
          type="activity"
        />
        <AdminLogsTable
          description="Recent user sessions and access state."
          rows={adminSessionLogs}
          title="Session logs"
          type="sessions"
        />
      </div>
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

function AdminPlanMix() {
  const plans = [
    ["Pro", 52, "bg-emerald-500/60 dark:bg-emerald-400/45"],
    ["Business", 31, "bg-sky-500/60 dark:bg-sky-400/45"],
    ["Starter", 17, "bg-violet-500/60 dark:bg-violet-400/45"],
  ] satisfies readonly [string, number, string][];

  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <p className="text-sm font-semibold">Plan mix</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Active workspace distribution by plan.
      </p>
      <div className="mt-5 grid gap-3">
        {plans.map(([label, value, color]) => (
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
  type,
}: {
  description: string;
  rows: readonly [string, string, string, string][];
  title: string;
  type: "activity" | "sessions";
}) {
  return (
    <SettingsSection
      description={description}
      icon={type === "activity" ? File01Icon : ShieldCheck}
      title={title}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {type === "activity" ? (
                <>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Target</TableHead>
                </>
              ) : (
                <>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([first, second, third, fourth]) => (
              <TableRow key={`${first}-${second}-${third}`}>
                <TableCell>{first}</TableCell>
                <TableCell>{second}</TableCell>
                <TableCell className="text-muted-foreground">{third}</TableCell>
                <TableCell>
                  {type === "sessions" ? (
                    <AdminStatusBadge status={fourth} />
                  ) : (
                    fourth
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SettingsSection>
  );
}

function AdminWorkspacesUsersTab({
  onOpenProfile,
  profileView,
}: {
  onOpenProfile: (profile: AdminProfileView | null) => void;
  profileView: AdminProfileView | null;
}) {
  if (profileView?.type === "workspace") {
    return (
      <AdminWorkspaceProfile
        name={profileView.name}
        onBack={() => onOpenProfile(null)}
      />
    );
  }

  if (profileView?.type === "user") {
    return (
      <AdminUserProfile
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
        <AdminWorkspacesTable onOpenProfile={onOpenProfile} />
      </SettingsSection>
      <SettingsSection
        action={
          <SettingsActionDialogButton
            confirmLabel="Send invite"
            description="Add a user to an existing workspace and assign a role."
            icon={PlusSignIcon}
            title="Invite user"
            triggerLabel="Invite user"
          >
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input placeholder="user@company.com" size="sm" />
            </div>
            <div className="grid gap-2">
              <Label>Workspace</Label>
              <Button className="justify-between" size="sm" variant="outline">
                Atmet Workspace
                <Icon icon={ChevronDownIcon} />
              </Button>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Button className="justify-between" size="sm" variant="outline">
                Member
                <Icon icon={ChevronDownIcon} />
              </Button>
            </div>
          </SettingsActionDialogButton>
        }
        description="Review people, roles, workspace membership, and access state."
        icon={Users}
        title="Users"
      >
        <AdminUsersTable onOpenProfile={onOpenProfile} />
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function AdminRequestsTab() {
  return (
    <SettingsTabGrid>
      <AdminRequestsTable
        description="Confirm waitlist users when they are ready to join Atmet."
        rows={adminWaitlistRequests}
        title="Waitlist requests"
      />
    </SettingsTabGrid>
  );
}

function AdminRolesTab() {
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminRoles.map(([role, description, access]) => (
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
            </TableBody>
          </Table>
        </div>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function AdminUsageControlsTab() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(
    adminWorkspaces[0][0],
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
            triggerLabel="12,000 runs"
          >
            <div className="grid gap-2">
              <Label>Run limit</Label>
              <Input defaultValue="12000" size="sm" />
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
            triggerLabel="10 apps"
          >
            <div className="grid gap-2">
              <Label>Connector limit</Label>
              <Input defaultValue="10" size="sm" />
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
            triggerLabel="80%"
          >
            <div className="grid gap-2">
              <Label>Threshold percentage</Label>
              <Input defaultValue="80" size="sm" />
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
                  {selectedWorkspace}
                  <Icon className="opacity-70" icon={ChevronDownIcon} />
                </Button>
              }
            />
            <MenuPopup align="end" className="min-w-56" sideOffset={8}>
              {adminWorkspaces.map(([workspace]) => (
                <MenuItem
                  key={workspace}
                  onClick={() => setSelectedWorkspace(workspace)}
                >
                  <Icon
                    className={cn(
                      selectedWorkspace === workspace ? "opacity-100" : "opacity-0",
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
            description={`Set a custom run limit for ${selectedWorkspace}.`}
            title="Custom run limit"
            triggerLabel="8,500 runs"
          >
            <div className="grid gap-2">
              <Label>Workspace run limit</Label>
              <Input defaultValue="8500" size="sm" />
            </div>
          </SettingsActionDialogButton>
        </SettingsRow>
        <SettingsRow
          description="Set how many apps this workspace can connect before review."
          title="Custom connector limit"
        >
          <SettingsActionDialogButton
            confirmLabel="Save override"
            description={`Set a custom connector cap for ${selectedWorkspace}.`}
            title="Custom connector limit"
            triggerLabel="6 apps"
          >
            <div className="grid gap-2">
              <Label>Workspace connector limit</Label>
              <Input defaultValue="6" size="sm" />
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
          description={`Save these overrides for ${selectedWorkspace}.`}
          title="Apply custom controls"
        >
          <SettingsActionDialogButton
            confirmLabel="Apply controls"
            description={`Apply the custom run, connector, and approval controls to ${selectedWorkspace}.`}
            title="Apply workspace controls"
            triggerLabel="Apply controls"
            variant="default"
          />
        </SettingsRow>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function AdminWorkspacesTable({
  onOpenProfile,
}: {
  onOpenProfile: (profile: AdminProfileView) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
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
          {adminWorkspaces.map(([workspace, owner, plan, members, status]) => (
            <TableRow
              className="cursor-pointer"
              key={workspace}
              onClick={() => onOpenProfile({ name: workspace, type: "workspace" })}
            >
              <TableCell>{workspace}</TableCell>
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
        </TableBody>
      </Table>
    </div>
  );
}

function AdminUsersTable({
  onOpenProfile,
}: {
  onOpenProfile: (profile: AdminProfileView) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
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
          {adminUsers.map(([user, email, workspace, role, status, lastActive]) => (
            <TableRow
              className="cursor-pointer"
              key={`${user}-${workspace}`}
              onClick={() => onOpenProfile({ name: user, type: "user" })}
            >
              <TableCell>{user}</TableCell>
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
        </TableBody>
      </Table>
    </div>
  );
}

function AdminWorkspaceProfile({
  name,
  onBack,
}: {
  name: string;
  onBack: () => void;
}) {
  const workspace =
    adminWorkspaces.find(([workspaceName]) => workspaceName === name) ??
    adminWorkspaces[0];
  const [workspaceName, owner, plan, members, status, usage, created] =
    workspace;
  const workspaceUsers = adminUsers.filter(
    ([, , userWorkspace]) => userWorkspace === workspaceName,
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaceUsers.map(([user, email, , role, userStatus]) => (
                <TableRow key={user}>
                  <TableCell>{user}</TableCell>
                  <TableCell className="text-muted-foreground">{email}</TableCell>
                  <TableCell>{role}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={userStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SettingsSection>
    </SettingsTabGrid>
  );
}

function AdminUserProfile({
  name,
  onBack,
}: {
  name: string;
  onBack: () => void;
}) {
  const user = adminUsers.find(([userName]) => userName === name) ?? adminUsers[0];
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
  rows,
  title,
}: {
  description: string;
  rows: readonly [string, string, string, string, string, string][];
  title: string;
}) {
  return (
    <SettingsSection description={description} icon={File01Icon} title={title}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Use case</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([name, email, company, useCase, submitted, status]) => (
              <TableRow key={`${name}-${email}`}>
                <TableCell>{name}</TableCell>
                <TableCell className="text-muted-foreground">{email}</TableCell>
                <TableCell>{company}</TableCell>
                <TableCell>{useCase}</TableCell>
                <TableCell className="text-muted-foreground">{submitted}</TableCell>
                <TableCell>
                  <AdminStatusBadge status={status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <SettingsActionDialogButton
                      confirmLabel="Confirm user"
                      description={`${name} will receive an invitation to join Atmet.`}
                      size="xs"
                      title="Confirm waitlist user"
                      triggerLabel="Confirm"
                    />
                    <SettingsActionDialogButton
                      confirmLabel="Reject request"
                      description={`${name} will stay out of the active workspace invite queue.`}
                      size="xs"
                      title="Reject waitlist request"
                      triggerLabel="Reject"
                      variant="ghost"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SettingsSection>
  );
}

function AdminStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Active" || status === "Approved"
      ? "success"
      : status === "Pending" || status === "Review" || status === "Invited"
        ? "warning"
        : "outline";

  return <Badge variant={variant}>{status}</Badge>;
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
