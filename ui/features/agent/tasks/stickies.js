export const stickiesTasks = [
  {
    name: 'List All Stickies',
    desc: 'View and manage all FigJam stickies',
    noSelection: true,
    directAction: 'listAllStickies',
    fields: [
      {
        key: 'stickiesList',
        type: 'stickies',
        label: 'FigJam Stickies',
      },
    ],
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5"/></svg>',
  },
];
