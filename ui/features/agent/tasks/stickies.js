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
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" viewBox="0 0 24 24"><path d="M13.875 19.875h-9.75V4.125h15.75v9.75z"/><path d="M13.125 19.875v-6.75h6.75"/></svg>',
  },
];
