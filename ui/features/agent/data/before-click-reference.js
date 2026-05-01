/**
 * Curated App Store screenshot inspiration index from https://before.click
 * (names, categories, and explore slugs as shown on the site).
 */
export const BEFORE_CLICK_CURATED_APPS = [
  { name: '5 Minute Journal・Daily Diary', slug: '5minute', category: 'Health & Fitness' },
  { name: '(Not Boring) Camera', slug: 'notboringcamera', category: 'Photo & Video' },
  { name: 'AI Calorie Tracker by Yazio', slug: 'yazio', category: 'Health & Fitness' },
  { name: 'Any Distance', slug: 'anydistance', category: 'Health & Fitness' },
  { name: 'Ben Journal Digital Diary', slug: 'ben', category: 'Lifestyle' },
  { name: 'Caffeine Tracker', slug: 'alyx', category: 'Health & Fitness' },
  { name: 'Comet', slug: 'comet', category: 'Browser & AI' },
  { name: 'Days • Countdown & Widgets', slug: 'days', category: 'Lifestyle' },
  { name: 'Dudel Draw', slug: 'dudeldraw', category: 'Graphics & Design' },
  { name: 'Eight Sleep', slug: 'eightsleep', category: 'Health & Fitness' },
  { name: 'FocusPomo · Pomodoro Timer', slug: 'focuspomo', category: 'Productivity' },
  { name: 'Franki | Eat. Drink. Earn.', slug: 'franki', category: 'Food & Drink' },
  { name: 'Gentler Streak', slug: 'gentler', category: 'Health & Fitness' },
  { name: 'GO Club', slug: 'goclub', category: 'Health & Fitness' },
  { name: "How We Feel", slug: 'howwefeel', category: 'Health & Fitness' },
  { name: 'JOE & THE JUICE', slug: 'joethejuice', category: 'Food & Drink' },
  { name: 'LADDER Strength Training Plans', slug: 'ladder', category: 'Health & Fitness' },
  { name: 'Linearity Curve Graphic Design', slug: 'linearity', category: 'Graphics & Design' },
  { name: 'MD Vinyl for Music App', slug: 'mdvinyl', category: 'Music' },
  { name: 'Moment Pro Camera II', slug: 'moment', category: 'Photo & Video' },
  { name: 'Moods Faster', slug: 'moodsfaster', category: 'Health & Fitness' },
  { name: 'one year', slug: 'oneyear', category: 'Health & Fitness' },
  { name: 'Orb Social on Lens Protocol', slug: 'orb', category: 'Social Networking' },
  { name: 'Oscar Stories for Children', slug: 'oscarstories', category: 'Education' },
  { name: 'Pieter Pot Supermarkt', slug: 'pieter', category: 'Food & Drink' },
  { name: 'PUSH Workout & Gym Tracker', slug: 'push', category: 'Health & Fitness' },
  { name: 'Qewie | QR Code Generator', slug: 'qewie', category: 'Utilities' },
  { name: 'Roam: Global eSIM & WiFi', slug: 'roam', category: 'Travel' },
  { name: 'Run Receipt', slug: 'runrecepit', category: 'Health & Fitness' },
  { name: 'Rumbo Fitness', slug: 'rumbofitness', category: 'Health & Fitness' },
  { name: 'Savee — Inspiration for you', slug: 'savee', category: 'Lifestyle' },
  { name: 'Soul AI — Therapy & Self', slug: 'soulai', category: 'Lifestyle' },
  { name: 'Stamps Camera', slug: 'stamps', category: 'Photo & Video' },
  { name: 'Sticky Notes & Color Widget', slug: 'stickynotes', category: 'Utilities' },
  { name: "stoic. journal & mental health", slug: 'stoic', category: 'Health & Fitness' },
  { name: 'Stuff | ToDos and Lists', slug: 'stuff', category: 'Productivity' },
  { name: 'Sunlitt Sun Position and Path', slug: 'sunlitt', category: 'Weather' },
  { name: 'sway ~ blur & vhs trending cam', slug: 'sway', category: 'Photo & Video' },
  { name: 'The Outsiders', slug: 'outsiders', category: 'Health & Fitness' },
  { name: 'Tolan: Alien Best Friend', slug: 'tolan', category: 'Health & Fitness' },
  { name: 'Trendy Profile Tracker & Boost', slug: 'trendy', category: 'Social Networking' },
  { name: 'Try Your Best', slug: 'tyb', category: 'Social Networking' },
  { name: 'Video Effects Editor', slug: 'riveo', category: 'Photo & Video' },
  { name: 'Voice Recorder & Audio Editor', slug: 'voicetape', category: 'Utilities' },
  { name: 'Voiced AI: Talk, Reflect, Grow', slug: 'voicedai', category: 'Health & Fitness' },
  { name: "What's going on? Friend Diary", slug: 'whatsgoinon', category: 'Lifestyle' },
  { name: 'Water tracker Waterllama', slug: 'watertracker', category: 'Health & Fitness' },
  { name: 'Yukee simple todo list tracker', slug: 'yukee', category: 'Productivity' },
];

const BEFORE_CLICK_BASE = 'https://before.click';

export function beforeClickExploreUrl(slug) {
  return `${BEFORE_CLICK_BASE}/explore?app=${encodeURIComponent(slug)}`;
}

/** @returns {string} */
function categoryProviderId(category) {
  return String(category)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Options for prompt select: None + category headers + apps (value = iTunes-friendly app name).
 */
export function buildBeforeClickReferenceOptions() {
  const byCat = new Map();
  for (const app of BEFORE_CLICK_CURATED_APPS) {
    const cat = app.category || 'Other';
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(app);
  }
  const categories = [...byCat.keys()].sort((a, b) => a.localeCompare(b));
  const out = [
    {
      value: '',
      label: 'None',
    },
  ];

  for (const cat of categories) {
    out.push({
      isProviderHeader: true,
      provider: categoryProviderId(cat),
      label: cat,
    });
    const apps = byCat.get(cat).slice().sort((a, b) => a.name.localeCompare(b.name));
    for (const app of apps) {
      out.push({
        value: app.name,
        label: app.name,
      });
    }
  }
  return out;
}
