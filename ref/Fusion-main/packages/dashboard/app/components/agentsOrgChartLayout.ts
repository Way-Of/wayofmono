import type { OrgTreeNode } from "../api";

export type OrgChartLayoutMode = "horizontal" | "vertical";

export interface OrgChartLayoutInput {
  tree: OrgTreeNode[];
  availableWidth: number;
}

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_SIBLING_GAP = 24;
const DEFAULT_ROOT_GAP = 24;
const DEFAULT_CHART_PADDING = 16;

function getLeafCount(node: OrgTreeNode): number {
  if (node.children.length === 0) {
    return 1;
  }
  return node.children.reduce((sum, child) => sum + getLeafCount(child), 0);
}

function estimateSubtreeWidth(node: OrgTreeNode): number {
  const leaves = getLeafCount(node);
  return leaves * DEFAULT_NODE_WIDTH + Math.max(0, leaves - 1) * DEFAULT_SIBLING_GAP;
}

export function estimateOrgChartWidth(tree: OrgTreeNode[]): number {
  if (tree.length === 0) {
    return DEFAULT_NODE_WIDTH;
  }
  const rootWidths = tree.map(estimateSubtreeWidth);
  const totalRootsWidth = rootWidths.reduce((sum, width) => sum + width, 0);
  const rootGapWidth = Math.max(0, tree.length - 1) * DEFAULT_ROOT_GAP;
  return totalRootsWidth + rootGapWidth + DEFAULT_CHART_PADDING * 2;
}

export function resolveOrgChartLayoutMode(input: OrgChartLayoutInput): OrgChartLayoutMode {
  const safeAvailableWidth = Number.isFinite(input.availableWidth) && input.availableWidth > 0
    ? input.availableWidth
    : 0;

  if (safeAvailableWidth === 0 || input.tree.length <= 1) {
    return "horizontal";
  }

  const estimatedWidth = estimateOrgChartWidth(input.tree);
  return estimatedWidth > safeAvailableWidth ? "vertical" : "horizontal";
}
