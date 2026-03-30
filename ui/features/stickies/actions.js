export function createStickiesActionHandlers({
  closePromptDrawer,
  setMode,
  chatInput,
  sendMessage,
  showToast,
  addMessage,
  sendToAI,
}) {
  async function summarizeStickiesFromDrawer(getFilteredStickiesForSummarize, options = {}) {
    const { filteredStickies } = getFilteredStickiesForSummarize(options);

    if (!filteredStickies.length) {
      showToast('No stickies to summarize', 'info');
      return;
    }

    closePromptDrawer();
    setMode('ask');

    const stickyList = filteredStickies.map((sticky, index) => {
      const text = (sticky.text || '').trim() || '(empty)';
      const author = sticky.authorName || 'Unknown';
      const pageName = sticky.pageName || 'Unknown page';
      const color = sticky.color || '';
      return `${index + 1}. ${author}: "${text}" (Page: ${pageName}${color ? `, Color: ${color}` : ''}, Sticky ID: ${sticky.id})`;
    }).join('\n\n');

    const prompt = `Please summarize these ${filteredStickies.length} FigJam sticky notes. Group them by theme, identify repeated patterns, and suggest a clear next-step action list.

IMPORTANT:
- Respond in the same language as the majority of the sticky notes.
- When referring to a specific sticky, use this exact clickable format: [Sticky ${1}]{stickyId}

Stickies:
${stickyList}`;

    chatInput.value = prompt;
    await sendMessage();
  }

  function handleListAllStickies() {
    // Intentionally empty: opening the drawer handles this action.
  }

  async function handleSummarizeSelectedStickies(getFilteredStickiesForSummarize) {
    return summarizeStickiesFromDrawer(getFilteredStickiesForSummarize, { selectedOnly: true });
  }

  async function handleStickiesAskSummary(actionName, actionIcon, getFilteredStickiesForSummarize) {
    const { filteredStickies } = getFilteredStickiesForSummarize();

    if (!filteredStickies.length) {
      showToast('No stickies to summarize', 'info');
      return;
    }

    const stickyList = filteredStickies.map((sticky, index) => {
      const text = (sticky.text || '').trim() || '(empty)';
      const author = sticky.authorName || 'Unknown';
      const pageName = sticky.pageName || 'Unknown page';
      return `${index + 1}. ${author}: "${text}" (Page: ${pageName}, Sticky ID: ${sticky.id})`;
    }).join('\n\n');

    const prompt = `Please analyze and summarize these FigJam sticky notes:

${stickyList}

Please provide:
1. A short overview
2. Main themes or clusters
3. Key action items
4. Recommended next steps

Respond in the same language as the majority of the sticky notes.`;

    addMessage('user', `Summarize visible stickies (${filteredStickies.length})`, null, { name: actionName, icon: actionIcon });
    await sendToAI(prompt, null, []);
  }

  return {
    summarizeStickiesFromDrawer,
    handleListAllStickies,
    handleSummarizeSelectedStickies,
    handleStickiesAskSummary,
  };
}
