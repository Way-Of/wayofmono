/**
 * Basic Tool Extension Template
 * Creates a simple custom tool with parameters and rendering
 */

import type {
  ExtensionAPI,
  AgentToolUpdateCallback,
  ExtensionContext,
} from '@mariozechner/pi-coding-agent';
import { Type } from '@sinclair/typebox';
import { Text } from '@mariozechner/pi-tui';

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: 'my_tool',
    label: 'My Tool',
    description: 'What this tool does',
    promptSnippet: 'Perform action with my_tool',
    promptGuidelines: ['Use my_tool when the user asks to...'],
    parameters: Type.Object({
      action: Type.String({ description: 'Action to perform' }),
      option: Type.Optional(Type.String({ description: 'Optional parameter' })),
    }),
    async execute(
      _toolCallId: string,
      params: {
        action: string;
        option?: string;
      },
      _signal: AbortSignal,
      onUpdate: AgentToolUpdateCallback,
      ctx: ExtensionContext,
    ) {
      const { action, option } = params;

      // Stream progress
      onUpdate?.({
        content: [{ type: 'text', text: `Working on: ${action}...` }],
      });

      // Do work here
      const result = `Processed ${action}${option ? ` with ${option}` : ''}`;

      return {
        content: [{ type: 'text', text: result }],
        details: { action, option },
      };
    },
    renderCall: (args: { action: string }, theme: any): Text =>
      new Text(
        theme.fg('toolTitle', theme.bold('my_tool ')) + theme.fg('accent', args.action),
        0,
        0,
      ),
    renderResult: (result: { content: Array<{ text: string }> }, _options: any, theme: any): Text =>
      new Text(theme.fg('success', '✓ ' + result.content[0].text), 0, 0),
  });
}
