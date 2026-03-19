export function createCommentsApi({
  COMMENTS_CACHE_TTL,
  getAuth,
  getState,
  setCommentsState,
  setCurrentUser,
  renderComments,
  commentsContainer,
  btnLoadComments,
  btnRefreshComments,
  showToast,
}) {
  async function loadFigmaComments() {
    const { token, fileKey } = getAuth();

    if (!token) {
      showToast('Please enter your Figma Personal Access Token', 'error');
      return;
    }

    if (!fileKey) {
      showToast('Please enter or detect the file key first', 'error');
      return;
    }

    btnLoadComments.disabled = true;
    btnLoadComments.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right: 4px; animation: spin 1s linear infinite;">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Loading...
      `;

    try {
      const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
        headers: {
          'X-Figma-Token': token
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to load comments: ${response.statusText}`);
      }

      const data = await response.json();
      setCommentsState({
        figmaComments: data.comments || [],
        figmaCommentsLastLoaded: Date.now(),
      });

      if (!getState().figmaCurrentUser) {
        try {
          const userResponse = await fetch('https://api.figma.com/v1/me', {
            headers: { 'X-Figma-Token': token }
          });
          if (userResponse.ok) {
            setCurrentUser(await userResponse.json());
          }
        } catch (e) {
          console.warn('Could not fetch current user info:', e);
        }
      }

      renderComments();
      commentsContainer.style.display = 'block';
      btnRefreshComments.disabled = false;

      const { figmaComments } = getState();
      const resolvedCount = figmaComments.filter(c => c.resolved_at).length;
      const unresolvedCount = figmaComments.length - resolvedCount;
      showToast(`Loaded ${figmaComments.length} comments (${unresolvedCount} open, ${resolvedCount} resolved)`, 'success');
    } catch (error) {
      showToast(`Failed to load comments: ${error.message}`, 'error');
      console.error('Failed to load comments:', error);
    } finally {
      btnLoadComments.disabled = false;
      btnLoadComments.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right: 4px;">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Load Comments
        `;
    }
  }

  async function ensureCommentsLoaded(forceRefresh = false) {
    const { token, fileKey } = getAuth();
    const { figmaComments, figmaCommentsLastLoaded, figmaCommentsLoading, figmaCurrentUser } = getState();

    if (!token || !fileKey) {
      return false;
    }

    const now = Date.now();
    const cacheValid = !forceRefresh &&
      figmaComments.length > 0 &&
      (now - figmaCommentsLastLoaded) < COMMENTS_CACHE_TTL;

    if (cacheValid) {
      return true;
    }

    if (figmaCommentsLoading) {
      while (getState().figmaCommentsLoading) {
        await new Promise(r => setTimeout(r, 100));
      }
      return getState().figmaComments.length > 0;
    }

    setCommentsState({ figmaCommentsLoading: true });

    try {
      const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
        headers: { 'X-Figma-Token': token }
      });

      if (response.ok) {
        const data = await response.json();
        setCommentsState({
          figmaComments: data.comments || [],
          figmaCommentsLastLoaded: Date.now(),
        });

        if (!figmaCurrentUser) {
          try {
            const userResponse = await fetch('https://api.figma.com/v1/me', {
              headers: { 'X-Figma-Token': token }
            });
            if (userResponse.ok) {
              setCurrentUser(await userResponse.json());
            }
          } catch (e) {
            console.warn('Could not fetch current user info in background:', e);
          }
        }
        return true;
      }
    } catch (error) {
      console.log('Failed to auto-load comments:', error);
    } finally {
      setCommentsState({ figmaCommentsLoading: false });
    }
    return false;
  }

  function buildCommentsContext(comments) {
    if (!comments || comments.length === 0) {
      return '';
    }

    let context = '\n\n=== FIGMA COMMENTS ON SELECTED ELEMENTS ===\n';
    context += 'The following comments have been left on the selected elements. Please address them:\n\n';

    comments.forEach((comment, index) => {
      context += `COMMENT ${index + 1}:\n`;
      context += `- Author: ${comment.author}\n`;
      context += `- Message: "${comment.message}"\n`;
      context += `- Node ID: ${comment.nodeId || 'N/A'}\n`;
      if (comment.replies && comment.replies.length > 0) {
        context += `- Replies:\n`;
        comment.replies.forEach(reply => {
          context += `  - ${reply.author}: "${reply.message}"\n`;
        });
      }
      context += '\n';
    });

    context += 'Please analyze these comments and make the necessary changes to address the feedback.\n';
    context += '=== END COMMENTS ===\n';

    return context;
  }

  return {
    loadFigmaComments,
    ensureCommentsLoaded,
    buildCommentsContext,
  };
}
