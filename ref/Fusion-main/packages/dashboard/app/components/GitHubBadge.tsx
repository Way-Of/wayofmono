import { GitPullRequest, CircleDot } from "lucide-react";
import type { IssueInfo, PrInfo } from "@fusion/core";
import type { ToastType } from "../hooks/useToast";

interface GitHubBadgeProps {
  prInfo?: PrInfo;
  issueInfo?: IssueInfo;
  onIssueRefresh?: () => void;
  addToast?: (message: string, type?: ToastType) => void;
}

function getIssueModifierClass(state: string, stateReason?: string): string {
  if (state === "open") return "card-github-badge--open";
  if (stateReason === "completed") return "card-github-badge--completed";
  if (stateReason === "not_planned") return "card-github-badge--not-planned";
  return "card-github-badge--closed";
}

export function GitHubBadge({ prInfo, issueInfo, onIssueRefresh: _onIssueRefresh }: GitHubBadgeProps) {
  return (
    <>
      {prInfo && (
        <a
          className={`card-github-badge card-github-badge--${prInfo.status}`}
          title={`PR #${prInfo.number}: ${prInfo.title}`}
          href={prInfo.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitPullRequest size={12} />
          <span>#{prInfo.number}</span>
        </a>
      )}
      {issueInfo && (
        <a
          className={`card-github-badge ${getIssueModifierClass(issueInfo.state, issueInfo.stateReason)}`}
          title={`Issue #${issueInfo.number}: ${issueInfo.title}`}
          href={issueInfo.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CircleDot size={12} />
          <span>#{issueInfo.number}</span>
        </a>
      )}
    </>
  );
}
