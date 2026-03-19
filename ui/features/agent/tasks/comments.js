import { ContextMode } from '../../../config/agent-data.js';

export const commentsTasks = [
{
          name: 'List All Comments',
          desc: 'View and manage all file comments',
          noSelection: true,
          directAction: 'listAllComments',
          fields: [
            {
              key: 'commentsList',
              type: 'comments',
              label: 'File Comments'
            }
          ],
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
        },
{
          name: 'Solve Comment',
          desc: 'AI analyzes and addresses comments on selection',
          help: 'The AI will find comments attached to your selected elements and make changes to address the feedback.',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="m9 11 2 2 4-4"/></svg>',
          requiredContext: ContextMode.ALL,
          prompt: '',
          promptTemplate: function (values) {
            return `Please analyze any comments or feedback on the selected elements and make the necessary changes to address them. If there are multiple comments, prioritize and address each one systematically. 

Please provide the final summary of what was modified in the same language as the comments (e.g., if the comments are in Japanese, provide the summary in Japanese).`;
          }
        },
{
          name: 'Summarize Comments',
          desc: 'AI summarizes comments in the file or on selected nodes',
          help: 'Get an AI-powered summary of unresolved comments, grouped by theme or priority.',
          askMode: true,
          directAction: 'summarizeComments',
          fields: [
            {
              key: 'commentScope',
              type: 'select',
              label: 'Comment Scope',
              default: 'all',
              options: [
                { value: 'all', label: 'All File Comments' },
                { value: 'selection', label: 'Comments on Selected Nodes' }
              ]
            }
          ],
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>'
        }
];
