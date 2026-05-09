import { Activity, Bot, Brain, CheckSquare, Clock, FileText, Folder, GitBranch, Grid3X3, LayoutGrid, Mail, Map, MessageSquare, Monitor, Search, Sparkles, Target, Workflow, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PLUGIN_NAV_ICON_MAP: Record<string, LucideIcon> = {
  activity: Activity,
  bot: Bot,
  brain: Brain,
  checksquare: CheckSquare,
  clock: Clock,
  filetext: FileText,
  folder: Folder,
  gitbranch: GitBranch,
  grid3x3: Grid3X3,
  layoutgrid: LayoutGrid,
  mail: Mail,
  map: Map,
  messagesquare: MessageSquare,
  monitor: Monitor,
  search: Search,
  sparkles: Sparkles,
  target: Target,
  workflow: Workflow,
  zap: Zap,
};

function normalizeIconName(iconName?: string): string {
  return (iconName ?? "").trim().toLowerCase().replace(/[-_\s]/g, "");
}

export function getPluginNavIcon(iconName?: string): LucideIcon {
  return PLUGIN_NAV_ICON_MAP[normalizeIconName(iconName)] ?? Grid3X3;
}
