export function createCommentsActionHandlers({
  getState,
  showToast,
  closePromptDrawer,
  setMode,
  chatInput,
  sendMessage,
  ensureCommentsLoaded,
  getCommentsForNodes,
  formatCommentDate,
  addMessage,
  sendToAI,
  cachedNodeNames,
}) {
  async function summarizeCommentsFromDrawer(getFilteredCommentsForSummarize) {
    const { filteredComments, threads } = getFilteredCommentsForSummarize();

    if (filteredComments.length === 0) {
      showToast('No comments to summarize', 'info');
      return;
    }

    closePromptDrawer();
    setMode('ask');

    const commentsList = filteredComments.map((c, i) => {
      const replies = threads.get(c.id) || [];
      const baseIndex = i + 1;
      let text = `${baseIndex}. ${c.user.handle}: "${c.message}"${c.resolved_at ? ' [RESOLVED]' : ''}`;
      if (c.client_meta?.node_id) {
        text += ` (Node ID: ${c.client_meta.node_id})`;
      }
      if (replies.length > 0) {
        replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const repliesText = replies.map(r => `   - ${r.user.handle}: "${r.message}"`).join('\n');
        text += '\n' + repliesText;
      }
      return text;
    }).join('\n\n');

    const prompt = `Please summarize these ${filteredComments.length} design feedback comments (with their replies). Group them by theme, identify key action items, and prioritize by importance.

IMPORTANT: Respond in the same language as the majority of the comments.

When referring to a specific comment that is attached to a node, use this EXACT format to create a clickable navigation link: [Author Name: Index]{nodeId}
Example: "As mentioned in [Jane Doe: 3]{123:456}, we should..."

Comments:
${commentsList}`;

    chatInput.value = prompt;
    await sendMessage();
  }

  async function solveCommentWithAI(commentId, text, btn) {
    if (btn) {
      btn.classList.add('loading');
    }
    window.solvingCommentId = commentId;
    setMode('agent');

    const { figmaComments } = getState();
    const comment = figmaComments.find(c => c.id === commentId);
    const commentText = text || (comment ? comment.message : 'this comment');
    const nodeName = (comment && comment.client_meta?.node_id && cachedNodeNames[comment.client_meta.node_id]) || 'this design area';
    const prompt = `Solve this design feedback comment on "${nodeName}": "${commentText}"`;

    chatInput.value = prompt;
    chatInput.style.height = 'auto';
    chatInput.style.height = `${chatInput.scrollHeight}px`;
    chatInput.focus();
    chatInput.dispatchEvent(new Event('input'));

    if (comment && comment.client_meta && comment.client_meta.node_id) {
      const nodeId = comment.client_meta.node_id;
      const nodeOffset = comment.client_meta.node_offset || null;
      parent.postMessage({ pluginMessage: { type: 'navigate-to-node', nodeId, nodeOffset } }, '*');

      let resolved = false;
      const onMessage = (event) => {
        if (resolved) return;
        const msg = event.data?.pluginMessage;
        if (!msg) return;
        if (msg.type === 'navigate-success' || msg.type === 'selection-changed') {
          resolved = true;
          window.removeEventListener('message', onMessage);
          clearTimeout(fallbackTimer);
          setTimeout(() => sendMessage(), 150);
        }
      };
      window.addEventListener('message', onMessage);
      const fallbackTimer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          window.removeEventListener('message', onMessage);
          console.warn('[Solve] Node selection timed out, sending anyway');
          sendMessage();
        }
      }, 1500);
    } else {
      sendMessage();
    }
  }

  async function handleListAllComments() {
    // Intentionally empty: handled by opening the prompt drawer comments field.
  }

  async function handleSummarizeComments(actionName, actionIcon, values = {}) {
    try {
      showToast('Loading comments for summary...', 'info');

      const commentsLoaded = await ensureCommentsLoaded();

      if (!commentsLoaded) {
        showToast('Please configure your Figma API token in Settings → Figma API', 'error');
        return;
      }

      const { figmaComments, lastKnownSelectionItems } = getState();
      if (!figmaComments || figmaComments.length === 0) {
        showToast('No comments found in this file', 'info');
        return;
      }

      const commentScope = values.commentScope || 'all';

      let commentsToSummarize;
      let scopeDescription;

      if (commentScope === 'selection') {
        if (!lastKnownSelectionItems || lastKnownSelectionItems.length === 0) {
          showToast('No nodes selected. Please select nodes first or choose "All File Comments".', 'error');
          return;
        }

        const allNodeIds = [];
        lastKnownSelectionItems.forEach(item => {
          allNodeIds.push(item.id);
          if (item.descendantIds && Array.isArray(item.descendantIds)) {
            allNodeIds.push(...item.descendantIds);
          }
        });

        const selectionComments = getCommentsForNodes(allNodeIds);

        if (selectionComments.length === 0) {
          showToast('No comments found on selected nodes', 'info');
          return;
        }

        commentsToSummarize = selectionComments;
        scopeDescription = `on ${lastKnownSelectionItems.length} selected node(s)`;
      } else {
        const unresolvedComments = figmaComments.filter(c => !c.resolved_at && !c.parent_id);

        if (unresolvedComments.length === 0) {
          showToast('No unresolved comments to summarize', 'info');
          return;
        }

        commentsToSummarize = unresolvedComments.map(comment => {
          const replies = figmaComments.filter(c => c.parent_id === comment.id);
          return {
            id: comment.id,
            author: comment.user.handle,
            message: comment.message,
            nodeId: comment.client_meta?.node_id || null,
            createdAt: comment.created_at,
            resolved: false,
            replies: replies.map(r => ({
              author: r.user.handle,
              message: r.message,
              createdAt: r.created_at
            }))
          };
        });
        scopeDescription = 'in this file';
      }

      const commentData = commentsToSummarize.map((comment, index) => ({
        index: index + 1,
        author: comment.author,
        message: comment.message,
        hasNode: !!comment.nodeId,
        nodeId: comment.nodeId,
        replyCount: comment.replies ? comment.replies.length : 0,
        createdAt: comment.createdAt
      }));

      const prompt = `Please analyze and summarize the following ${commentData.length} comments from a Figma design file (${scopeDescription}):

${commentData.map(c => `
${c.index}. **${c.author}**: "${c.message}"
   - ${c.hasNode ? `Attached to node: [Focus Node]{${c.nodeId}}` : 'General comment'}
   - ${c.replyCount} replies
   - Posted: ${formatCommentDate(c.createdAt)}
`).join('\n')}

Please provide:
1. **Summary Overview**: Brief summary of all comments (2-3 sentences)
2. **Key Themes**: Group comments by theme (e.g., UI issues, content requests, bugs)
3. **Priority Items**: Highlight any urgent or critical feedback
4. **Suggested Actions**: Recommend next steps to address the feedback
5. **Quick Wins**: Identify easy-to-fix items that could be addressed quickly

Please provide the final summary and all accompanying descriptions in the same language as the majority of the comments above (e.g., if the comments are in Japanese, provide the summary in Japanese).

IMPORTANT: When referring to a specific comment that is attached to a node in your summary, use this EXACT format to create a clickable navigation link: [Author Name: Index]{nodeId}
Example: \"As mentioned in [Jane Doe: 3]{123:456}, we should...\"`;

      const userMessage = commentScope === 'selection'
        ? `Summarize comments on selected nodes (${commentsToSummarize.length} comments)`
        : `Summarize all comments in this file (${commentsToSummarize.length} comments)`;
      addMessage('user', userMessage, null, { name: actionName, icon: actionIcon });

      await sendToAI(prompt, null, []);
    } catch (error) {
      showToast('Failed to summarize comments: ' + error.message, 'error');
    }
  }

  return {
    summarizeCommentsFromDrawer,
    solveCommentWithAI,
    handleListAllComments,
    handleSummarizeComments,
  };
}
