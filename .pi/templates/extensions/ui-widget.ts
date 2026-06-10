/**
 * UI Widget Extension Template
 * Creates custom TUI components, status indicators, and footers
 */

import type { ExtensionAPI, ExtensionContext } from '@mariozechner/pi-coding-agent';

export default function (pi: ExtensionAPI) {
  pi.on('session_start', async (_event, ctx: ExtensionContext) => {
    // Status indicator in footer
    ctx.ui.setStatus('my-ext', ctx.ui.theme.fg('accent', '● active'));

    // Widget above editor
    ctx.ui.setWidget('my-widget', (_tui, theme) => {
      const lines = [
        theme.fg('accent', theme.bold('My Widget')),
        theme.fg('dim', 'Status: running'),
      ];
      return {
        render: (width: number) => lines.map((l) => l.substring(0, width)),
        invalidate: () => {},
      };
    });

    // Custom footer
    ctx.ui.setFooter((_tui, theme, footerData) => ({
      render(width: number): string[] {
        const branch = footerData.getGitBranch() || 'no git';
        const model = ctx.model?.id || 'no-model';
        return [theme.fg('dim', `${model} • ${branch}`).substring(0, width)];
      },
      dispose: footerData.onBranchChange(() => ctx.ui.requestRender()),
      invalidate: () => {},
    }));
  });
}
