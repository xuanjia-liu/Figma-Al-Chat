function buildCommentThreads(figmaComments) {
  const threads = new Map();
  const topLevelComments = [];

  figmaComments.forEach(comment => {
    if (comment.parent_id) {
      if (!threads.has(comment.parent_id)) {
        threads.set(comment.parent_id, []);
      }
      threads.get(comment.parent_id).push(comment);
    } else {
      topLevelComments.push(comment);
    }
  });

  return { threads, topLevelComments };
}

export function createCommentsDrawerHelpers({
  getState,
  escapeHtml,
  formatCommentDate,
  highlightAndLinkify,
  highlightSearchMatches,
  filterCommentsBySearch,
  commentMatchesPeopleFilter,
}) {
  function renderCommentItemHTML(comment, threads) {
    const {
      selectedCommentIds,
      multiSelectEnabled,
      commentsSearchQuery,
      cachedNodeNames,
      figmaCurrentUser,
      commentsWithReplyMatches,
      commentsWithPeopleReplyMatches,
    } = getState();

    const replies = threads.get(comment.id) || [];
    replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const isResolved = !!comment.resolved_at;
    const replyCount = replies.length;
    const isSelected = selectedCommentIds.has(comment.id);

    const itemClasses = ['prompt-comment-item'];
    if (multiSelectEnabled) itemClasses.push('selectable');
    if (isResolved) itemClasses.push('resolved');
    else itemClasses.push('unresolved');

    return `
        <div class="${itemClasses.join(' ')}" data-comment-id="${comment.id}" onclick="handleCommentItemClick(event, '${comment.id}')">
          ${multiSelectEnabled ? `
            <input type="checkbox" class="comment-select-checkbox" 
              ${isSelected ? 'checked' : ''} 
              onchange="toggleCommentSelection('${comment.id}', this)" />
          ` : ''}
          <div class="comment-header">
            <div class="comment-avatar">
              ${comment.user.img_url
        ? `<img src="${comment.user.img_url}" alt="${comment.user.handle}" onerror="this.style.display='none';this.parentNode.textContent='${comment.user.handle.substring(0, 1).toUpperCase()}'" />`
        : comment.user.handle.substring(0, 1).toUpperCase()
      }
            </div>
            <div class="comment-header-text">
              <span class="comment-author person-link" onclick="event.stopPropagation(); togglePersonChip('${escapeHtml(comment.user.handle).replace(/'/g, "\\'")}', 'from')">${highlightSearchMatches(comment.user.handle, commentsSearchQuery)}</span>
              ${comment.client_meta?.node_id ? `<span class="comment-attached-layer">on ${escapeHtml(cachedNodeNames[comment.client_meta.node_id] || '…')}</span>` : ''}
            </div>
            ${isResolved ? '<span style="font-size: 10px; color: var(--success); margin-left: 4px;">✓</span>' : ''}
            <span class="comment-date">${formatCommentDate(comment.created_at)}</span>
          </div>
          <div class="comment-body">${highlightAndLinkify(comment.message, commentsSearchQuery)}</div>
          ${(figmaCurrentUser && (comment.user.id === figmaCurrentUser.id || comment.user.handle === figmaCurrentUser.handle) && replyCount === 0) ? `
            <button class="comment-rewrite-btn" onclick="rewriteCommentWithAI('${comment.id}', 'drawer')" title="Rewrite with AI">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Zm6.819 5-1.137 2.5-2.5 1.137 2.5 1.136 1.137 2.5 1.136-2.5 2.5-1.136-2.5-1.137-1.136-2.5Z"/>
              </svg>
            </button>
          ` : ''}
          <div class="comment-actions">
            ${comment.client_meta?.node_id ? `
              <button class="comment-action-btn icon-only" onclick="navigateToCommentNode('${comment.client_meta.node_id}', ${comment.client_meta.node_offset ? `{x: ${comment.client_meta.node_offset.x}, y: ${comment.client_meta.node_offset.y}}` : 'null'})" title="Go to">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              <button class="comment-action-btn" onclick="solveCommentWithAI('${comment.id}', null, this)" title="Solve with AI">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Zm6.819 5-1.137 2.5-2.5 1.137 2.5 1.136 1.137 2.5 1.136-2.5 2.5-1.136-2.5-1.137-1.136-2.5Z"/>
                </svg>
                Solve
              </button>
            ` : ''}
            <div class="comment-action-btn-group">
              <button class="comment-action-btn" onclick="toggleDrawerReplyInput('${comment.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 10h10a8 8 0 0 1 8 8v4M3 10l6 6M3 10l6-6"/>
                </svg>
                Reply
              </button>
              <button class="comment-reply-chevron-btn" onclick="toggleReplyTemplatesDropdown(event, '${comment.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div class="comment-more-menu hidden" id="reply-dropdown-${comment.id}" style="bottom:auto;top:100%;margin-top:4px;margin-bottom:0;min-width:120px;max-width:220px;"></div>
            </div>
            <div class="comment-more-container">
              <button class="comment-action-btn icon-only" onclick="toggleCommentMoreMenu(event, '${comment.id}')" title="More options">
                <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              <div class="comment-more-menu hidden" id="comment-more-menu-${comment.id}">
                <button class="dropdown-item" style="color: var(--text-secondary); white-space: nowrap;" onclick="copyCommentToChat('${comment.id}'); closePromptDrawer();">Add to Chat</button>
                ${(figmaCurrentUser && (comment.user.id === figmaCurrentUser.id || comment.user.handle === figmaCurrentUser.handle)) ? `
                  <button class="dropdown-item dropdown-item-danger" onclick="deleteComment('${comment.id}', 'drawer')">Delete</button>
                ` : ''}
              </div>
            </div>
          </div>
      <div class="comment-reply-input" id="drawer-reply-input-${comment.id}" style="display: none;">
        <div class="comment-reply-input-wrapper">
          <textarea placeholder="Write a reply..." onkeydown="handleDrawerReplyKeydown(event, '${comment.id}')" oninput="autoExpandTextarea(this); handleCommentAiBtnVisibility(this, '${comment.id}'); handleMentionInput(this, 'drawer', '${comment.id}')" onfocus="startCommentAiTimer('${comment.id}'); cancelMentionBlur()" onblur="hideCommentAiBtn('${comment.id}'); handleMentionBlur()" id="drawer-reply-text-${comment.id}" rows="1"></textarea>
          <button class="comment-ai-gen-btn" onclick="generateAIReplyInline('${comment.id}')" title="Generate reply with AI" id="drawer-ai-btn-${comment.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Zm6.819 5-1.137 2.5-2.5 1.137 2.5 1.136 1.137 2.5 1.136-2.5 2.5-1.136-2.5-1.137-1.136-2.5Z" />
            </svg>
          </button>
        </div>
        <button class="comment-action-btn" onclick="postDrawerReply('${comment.id}')">Send</button>
      </div>
          ${replyCount > 0 ? `
            <button class="comment-replies-toggle${(commentsWithReplyMatches.has(comment.id) || commentsWithPeopleReplyMatches.has(comment.id)) ? ' has-match' : ''}" id="replies-toggle-${comment.id}" onclick="toggleReplies('${comment.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
              ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}${(commentsWithReplyMatches.has(comment.id) || commentsWithPeopleReplyMatches.has(comment.id)) ? ' <span class="reply-match-indicator">• match</span>' : ''}
            </button>
            <div class="comment-replies collapsed" id="replies-${comment.id}">
              ${replies.map(reply => `
                <div class="comment-reply-item" data-comment-id="${reply.id}">
                  <div class="comment-header">
                    <div class="comment-avatar">
                      ${reply.user.img_url
            ? `<img src="${reply.user.img_url}" alt="${reply.user.handle}" onerror="this.style.display='none';this.parentNode.textContent='${reply.user.handle.substring(0, 1).toUpperCase()}'" />`
            : reply.user.handle.substring(0, 1).toUpperCase()
          }
                    </div>
                    <span class="comment-author person-link" onclick="event.stopPropagation(); togglePersonChip('${escapeHtml(reply.user.handle).replace(/'/g, "\\'")}', 'from')">${highlightSearchMatches(reply.user.handle, commentsSearchQuery)}</span>
                    <span class="comment-date">${formatCommentDate(reply.created_at)}</span>
                  </div>
                  <div class="comment-body">${highlightAndLinkify(reply.message, commentsSearchQuery)}</div>
                  <div class="comment-reply-actions">
                    <div class="comment-action-btn-group">
                      <button class="comment-action-btn" onclick="toggleDrawerReplyItemInput('${comment.id}', '${reply.id}', '${escapeHtml(reply.user.handle).replace(/'/g, "\\'")}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 10h10a8 8 0 0 1 8 8v4M3 10l6 6M3 10l6-6"/>
                        </svg>
                        Reply
                      </button>
                      <button class="comment-reply-chevron-btn" onclick="toggleReplyItemTemplatesDropdown(event, 'drawer', '${comment.id}', '${reply.id}')" title="Reply templates">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      <div class="comment-more-menu hidden" id="reply-dropdown-drawer-${comment.id}-${reply.id}" style="bottom:auto;top:100%;margin-top:4px;margin-bottom:0;min-width:120px;max-width:220px;"></div>
                    </div>
                    ${(figmaCurrentUser && (reply.user.id === figmaCurrentUser.id || reply.user.handle === figmaCurrentUser.handle)) ? `
                      <button class="comment-rewrite-btn" onclick="rewriteCommentWithAI('${reply.id}', 'drawer')" title="Rewrite with AI">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Zm6.819 5-1.137 2.5-2.5 1.137 2.5 1.136 1.137 2.5 1.136-2.5 2.5-1.136-2.5-1.137-1.136-2.5Z"/>
                        </svg>
                      </button>
                    ` : ''}
                    <div class="comment-more-container">
                      <button class="comment-action-btn icon-only" onclick="toggleCommentMoreMenu(event, '${reply.id}')" title="More options">
                        <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                      </button>
                      <div class="comment-more-menu hidden" id="comment-more-menu-${reply.id}">
                        <button class="dropdown-item" style="color: var(--text-secondary); white-space: nowrap;" onclick="copyCommentToChat('${reply.id}'); closePromptDrawer();">Add to Chat</button>
                        ${(figmaCurrentUser && (reply.user.id === figmaCurrentUser.id || reply.user.handle === figmaCurrentUser.handle)) ? `
                          <button class="dropdown-item dropdown-item-danger" onclick="deleteComment('${reply.id}', 'drawer')">Delete</button>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="comment-reply-input" id="drawer-reply-item-input-${comment.id}-${reply.id}" style="display: none;">
                    <div class="comment-reply-input-wrapper">
                      <textarea placeholder="Write a reply..." onkeydown="handleReplyItemKeydown(event, 'drawer', '${comment.id}', '${reply.id}')" oninput="autoExpandTextarea(this)" id="drawer-reply-item-text-${comment.id}-${reply.id}" rows="1"></textarea>
                    </div>
                    <button class="comment-action-btn" onclick="postDrawerReplyItem('${comment.id}', '${reply.id}')">Send</button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''
      }
        </div>
      `;
  }

  function renderCommentsListHTML(filteredComments, threads) {
    const { commentsSortBy } = getState();

    if (filteredComments.length === 0) {
      return '<div class="prompt-comments-empty">No comments match your filters.</div>';
    }

    if (commentsSortBy === 'burst') {
      const BURST_WINDOW_MS = 30 * 60 * 1000;
      const bursts = [];
      let currentBurst = null;

      filteredComments.forEach(c => {
        const t = new Date(c.created_at).getTime();
        if (!currentBurst || t - currentBurst.start > BURST_WINDOW_MS) {
          currentBurst = { start: t, end: t, comments: [c], authors: new Set([c.user.handle]) };
          bursts.push(currentBurst);
        } else {
          currentBurst.end = t;
          currentBurst.comments.push(c);
          currentBurst.authors.add(c.user.handle);
        }
      });

      bursts.sort((a, b) => b.end - a.end);

      let html = '<div class="prompt-comments-list">';
      bursts.forEach(burst => {
        const startDate = new Date(burst.start);
        const endDate = new Date(burst.end);
        const dateStr = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const startTime = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const endTime = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const timeRange = burst.comments.length === 1 ? `${dateStr} ${startTime}` : `${dateStr} ${startTime} – ${endTime}`;
        const authorsList = [...burst.authors].slice(0, 3).join(', ') + (burst.authors.size > 3 ? ` +${burst.authors.size - 3}` : '');

        html += `<div class="burst-group-header">
            <svg class="burst-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span class="burst-time">${timeRange}</span>
            <span class="burst-count">${burst.comments.length}</span>
            <span class="burst-authors">${escapeHtml(authorsList)}</span>
          </div>`;
        html += burst.comments.map(c => renderCommentItemHTML(c, threads)).join('');
      });
      html += '</div>';
      return html;
    }

    return '<div class="prompt-comments-list">' +
      filteredComments.map(c => renderCommentItemHTML(c, threads)).join('') +
      '</div>';
  }

  function renderCommentsInDrawer(container) {
    const {
      figmaComments,
      showResolvedComments,
      currentCommentsScope,
      commentNodePageMap,
      figmaCurrentPageId,
      lastKnownSelectionItems,
      selectedAuthorsFilter,
      selectedMentionsFilter,
      commentsFilterBy,
      commentsSortBy,
      commentsWithPeopleReplyMatches,
    } = getState();

    const { threads, topLevelComments } = buildCommentThreads(figmaComments);

    let filteredComments = showResolvedComments
      ? topLevelComments
      : topLevelComments.filter(c => !c.resolved_at);

    if (currentCommentsScope === 'page') {
      filteredComments = filteredComments.filter(c => {
        const nodeId = c.client_meta?.node_id;
        if (!nodeId) return false;
        const pageId = commentNodePageMap.get(nodeId);
        return !pageId || pageId === figmaCurrentPageId;
      });
    } else if (currentCommentsScope === 'selection') {
      const selectedIds = new Set();
      const selectedNodes = lastKnownSelectionItems || [];
      selectedNodes.forEach(node => {
        selectedIds.add(node.id);
        if (node.descendantIds) {
          node.descendantIds.forEach(id => selectedIds.add(id));
        }
      });
      filteredComments = filteredComments.filter(c => {
        const nodeId = c.client_meta?.node_id;
        return nodeId && selectedIds.has(nodeId);
      });
    }

    commentsWithPeopleReplyMatches.clear();
    if (selectedAuthorsFilter.size > 0 || selectedMentionsFilter.size > 0) {
      filteredComments = filteredComments.filter(c => commentMatchesPeopleFilter(c, threads, true));
    }

    const searchFilteredComments = filterCommentsBySearch(filteredComments, getState().commentsSearchQuery, threads);
    filteredComments = searchFilteredComments;

    if (commentsFilterBy === 'pending') {
      filteredComments = filteredComments.filter(c => {
        const replies = threads.get(c.id) || [];
        if (replies.length > 0) {
          const sortedReplies = [...replies].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          const lastReply = sortedReplies[sortedReplies.length - 1];
          return lastReply.user.handle !== c.user.handle;
        }
        return true;
      });
    }

    const sortFn = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      burst: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      viewport: () => 0,
    };
    filteredComments.sort(sortFn[commentsSortBy] || sortFn.newest);

    container.innerHTML = renderCommentsListHTML(filteredComments, threads);
  }

  return {
    renderCommentItemHTML,
    renderCommentsListHTML,
    renderCommentsInDrawer,
  };
}
