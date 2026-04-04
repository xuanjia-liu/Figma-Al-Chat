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
  extractPeopleFromComments,
  setFilteredCounts,
  updateBatchActionsState,
  tu,
}) {
  function getReplyCountLabel(count) {
    return count === 1
      ? tu('actions.comments.drawer.replySingle', { count })
      : tu('actions.comments.drawer.replyPlural', { count });
  }

  function getSelectedCountLabel(count) {
    return tu('actions.comments.drawer.selectedCount', { count });
  }

  function getAttachedLayerLabel(layerName) {
    return tu('actions.comments.drawer.onLayer', { layer: layerName });
  }

  function renderCommentItemHTML(comment, threads) {
    const {
      selectedCommentIds,
      multiSelectEnabled,
      commentsSearchQuery,
      cachedNodeNames,
      figmaCurrentUser,
      commentsWithReplyMatches,
      commentsWithPeopleReplyMatches,
      isPromptCommentHidden,
    } = getState();

    const replies = threads.get(comment.id) || [];
    replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const isResolved = !!comment.resolved_at;
    const isHidden = typeof isPromptCommentHidden === 'function' ? isPromptCommentHidden(comment.id) : false;
    const replyCount = replies.length;
    const isSelected = selectedCommentIds.has(comment.id);
    const replyCountLabel = escapeHtml(getReplyCountLabel(replyCount));
    const replyMatchLabel = escapeHtml(tu('actions.comments.drawer.replyMatch'));
    const hasReplyMatch = commentsWithReplyMatches.has(comment.id) || commentsWithPeopleReplyMatches.has(comment.id);

    const itemClasses = ['prompt-comment-item'];
    if (multiSelectEnabled) itemClasses.push('selectable');
    if (isResolved) itemClasses.push('resolved');
    else itemClasses.push('unresolved');
    if (isHidden) itemClasses.push('is-hidden');

    const visibilityButton = `
      <button
        class="comment-action-btn icon-only comment-visibility-toggle"
        onclick="event.stopPropagation(); togglePromptCommentHidden('${comment.id}')"
        title="${escapeHtml(isHidden ? 'Show comment' : 'Hide comment')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          ${isHidden
        ? '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>'
        : '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>'
      }
        </svg>
      </button>
    `;

    const hiddenNavigateButton = comment.client_meta?.node_id ? `
      <button
        class="comment-action-btn icon-only"
        onclick="event.stopPropagation(); navigateToCommentNode('${comment.client_meta.node_id}', ${comment.client_meta.node_offset ? `{x: ${comment.client_meta.node_offset.x}, y: ${comment.client_meta.node_offset.y}}` : 'null'})"
        title="${escapeHtml(tu('actions.comments.drawer.goTo'))}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    ` : '';

    const repliesSectionHTML = replyCount > 0 ? `
      <button class="comment-replies-toggle${hasReplyMatch ? ' has-match' : ''}" id="replies-toggle-${comment.id}" onclick="event.stopPropagation(); toggleReplies('${comment.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        ${replyCountLabel}${hasReplyMatch ? ` <span class="reply-match-indicator">${replyMatchLabel}</span>` : ''}
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
                  ${escapeHtml(tu('actions.comments.drawer.reply'))}
                </button>
                <button class="comment-reply-chevron-btn" onclick="toggleReplyItemTemplatesDropdown(event, 'drawer', '${comment.id}', '${reply.id}')" title="${escapeHtml(tu('actions.comments.drawer.replyTemplates'))}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="comment-more-menu hidden" id="reply-dropdown-drawer-${comment.id}-${reply.id}" style="bottom:auto;top:100%;margin-top:4px;margin-bottom:0;min-width:120px;max-width:220px;"></div>
              </div>
              ${(figmaCurrentUser && (reply.user.id === figmaCurrentUser.id || reply.user.handle === figmaCurrentUser.handle)) ? `
                <button class="comment-rewrite-btn" onclick="rewriteCommentWithAI('${reply.id}', 'drawer')" title="${escapeHtml(tu('actions.comments.drawer.rewriteWithAi'))}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Zm6.819 5-1.137 2.5-2.5 1.137 2.5 1.136 1.137 2.5 1.136-2.5 2.5-1.136-2.5-1.137-1.136-2.5Z"/>
                  </svg>
                </button>
              ` : ''}
              <div class="comment-more-container">
                <button class="comment-action-btn icon-only" onclick="toggleCommentMoreMenu(event, '${reply.id}')" title="${escapeHtml(tu('actions.comments.drawer.moreOptions'))}">
                  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
                <div class="comment-more-menu hidden" id="comment-more-menu-${reply.id}">
                  <button class="dropdown-item" style="color: var(--text-secondary); white-space: nowrap;" onclick="copyCommentToChat('${reply.id}'); closePromptDrawer();">${escapeHtml(tu('actions.comments.drawer.addToChat'))}</button>
                  ${(figmaCurrentUser && (reply.user.id === figmaCurrentUser.id || reply.user.handle === figmaCurrentUser.handle)) ? `
                    <button class="dropdown-item dropdown-item-danger" onclick="deleteComment('${reply.id}', 'drawer')">${escapeHtml(tu('actions.comments.drawer.delete'))}</button>
                  ` : ''}
                </div>
              </div>
            </div>
            <div class="comment-reply-input" id="drawer-reply-item-input-${comment.id}-${reply.id}" style="display: none;">
              <div class="comment-reply-input-wrapper">
                <textarea placeholder="${escapeHtml(tu('actions.comments.drawer.replyPlaceholder'))}" onkeydown="handleReplyItemKeydown(event, 'drawer', '${comment.id}', '${reply.id}')" oninput="autoExpandTextarea(this)" id="drawer-reply-item-text-${comment.id}-${reply.id}" rows="1"></textarea>
              </div>
              <button class="comment-action-btn" onclick="postDrawerReplyItem('${comment.id}', '${reply.id}')">${escapeHtml(tu('actions.comments.drawer.send'))}</button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '';

    if (isHidden) {
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
            </div>
            ${isResolved ? '<span style="font-size: 10px; color: var(--success); margin-left: 4px;">✓</span>' : ''}
            ${replyCount > 0 ? `
              <button class="comment-replies-toggle comment-replies-toggle--hidden${hasReplyMatch ? ' has-match' : ''}" id="replies-toggle-${comment.id}" onclick="event.stopPropagation(); toggleReplies('${comment.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
                <span class="comment-thread-count comment-thread-count--hidden">${replyCountLabel}</span>
                ${hasReplyMatch ? `<span class="reply-match-indicator">${replyMatchLabel}</span>` : ''}
              </button>
            ` : ''}
            <span class="comment-header-trailing comment-header-trailing--toggle">${hiddenNavigateButton}${visibilityButton}</span>
          </div>
          ${repliesSectionHTML}
        </div>
      `;
    }

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
            ${comment.client_meta?.node_id ? `<span class="comment-attached-layer">${escapeHtml(getAttachedLayerLabel(cachedNodeNames[comment.client_meta.node_id] || '…'))}</span>` : ''}
            </div>
            ${isResolved ? '<span style="font-size: 10px; color: var(--success); margin-left: 4px;">✓</span>' : ''}
            <span class="comment-date">${formatCommentDate(comment.created_at)}</span>
          </div>
          <div class="comment-body">${highlightAndLinkify(comment.message, commentsSearchQuery)}</div>
          ${(figmaCurrentUser && (comment.user.id === figmaCurrentUser.id || comment.user.handle === figmaCurrentUser.handle) && replyCount === 0) ? `
            <button class="comment-rewrite-btn" onclick="rewriteCommentWithAI('${comment.id}', 'drawer')" title="${escapeHtml(tu('actions.comments.drawer.rewriteWithAi'))}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Zm6.819 5-1.137 2.5-2.5 1.137 2.5 1.136 1.137 2.5 1.136-2.5 2.5-1.136-2.5-1.137-1.136-2.5Z"/>
              </svg>
            </button>
          ` : ''}
          <div class="comment-actions">
            ${comment.client_meta?.node_id ? `
              <button class="comment-action-btn icon-only" onclick="navigateToCommentNode('${comment.client_meta.node_id}', ${comment.client_meta.node_offset ? `{x: ${comment.client_meta.node_offset.x}, y: ${comment.client_meta.node_offset.y}}` : 'null'})" title="${escapeHtml(tu('actions.comments.drawer.goTo'))}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              <button class="comment-action-btn" onclick="solveCommentWithAI('${comment.id}', null, this)" title="${escapeHtml(tu('actions.comments.drawer.solveWithAi'))}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Zm6.819 5-1.137 2.5-2.5 1.137 2.5 1.136 1.137 2.5 1.136-2.5 2.5-1.136-2.5-1.137-1.136-2.5Z"/>
                </svg>
                ${escapeHtml(tu('actions.comments.drawer.solve'))}
              </button>
            ` : ''}
            <div class="comment-action-btn-group">
              <button class="comment-action-btn" onclick="toggleDrawerReplyInput('${comment.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 10h10a8 8 0 0 1 8 8v4M3 10l6 6M3 10l6-6"/>
                </svg>
                ${escapeHtml(tu('actions.comments.drawer.reply'))}
              </button>
              <button class="comment-reply-chevron-btn" onclick="toggleReplyTemplatesDropdown(event, '${comment.id}')" title="${escapeHtml(tu('actions.comments.drawer.replyTemplates'))}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div class="comment-more-menu hidden" id="reply-dropdown-${comment.id}" style="bottom:auto;top:100%;margin-top:4px;margin-bottom:0;min-width:120px;max-width:220px;"></div>
            </div>
            <div class="comment-more-container">
              <button class="comment-action-btn icon-only" onclick="toggleCommentMoreMenu(event, '${comment.id}')" title="${escapeHtml(tu('actions.comments.drawer.moreOptions'))}">
                <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              <div class="comment-more-menu hidden" id="comment-more-menu-${comment.id}">
                <button class="dropdown-item" style="color: var(--text-secondary); white-space: nowrap;" onclick="copyCommentToChat('${comment.id}'); closePromptDrawer();">${escapeHtml(tu('actions.comments.drawer.addToChat'))}</button>
                ${(figmaCurrentUser && (comment.user.id === figmaCurrentUser.id || comment.user.handle === figmaCurrentUser.handle)) ? `
                  <button class="dropdown-item dropdown-item-danger" onclick="deleteComment('${comment.id}', 'drawer')">${escapeHtml(tu('actions.comments.drawer.delete'))}</button>
                ` : ''}
              </div>
            </div>
            ${visibilityButton}
          </div>
      <div class="comment-reply-input" id="drawer-reply-input-${comment.id}" style="display: none;">
        <div class="comment-reply-input-wrapper">
          <textarea placeholder="${escapeHtml(tu('actions.comments.drawer.replyPlaceholder'))}" onkeydown="handleDrawerReplyKeydown(event, '${comment.id}')" oninput="autoExpandTextarea(this); handleCommentAiBtnVisibility(this, '${comment.id}'); handleMentionInput(this, 'drawer', '${comment.id}')" onfocus="startCommentAiTimer('${comment.id}'); cancelMentionBlur()" onblur="hideCommentAiBtn('${comment.id}'); handleMentionBlur()" id="drawer-reply-text-${comment.id}" rows="1"></textarea>
          <button class="comment-ai-gen-btn" onclick="generateAIReplyInline('${comment.id}')" title="${escapeHtml(tu('actions.comments.drawer.generateReplyWithAi'))}" id="drawer-ai-btn-${comment.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Zm6.819 5-1.137 2.5-2.5 1.137 2.5 1.136 1.137 2.5 1.136-2.5 2.5-1.136-2.5-1.137-1.136-2.5Z" />
            </svg>
          </button>
        </div>
        <button class="comment-action-btn" onclick="postDrawerReply('${comment.id}')">${escapeHtml(tu('actions.comments.drawer.send'))}</button>
      </div>
          ${repliesSectionHTML}
        </div>
      `;
  }

  function renderCommentsListHTML(filteredComments, threads) {
    const { commentsSortBy } = getState();

    if (filteredComments.length === 0) {
      return `<div class="prompt-comments-empty">${escapeHtml(tu('actions.comments.drawer.emptyFiltered'))}</div>`;
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
      figmaCurrentUser,
      showResolvedComments,
      currentCommentsScope,
      commentNodePageMap,
      figmaCurrentPageId,
      lastKnownSelectionItems,
      selectedAuthorsFilter,
      selectedMentionsFilter,
      commentsSearchQuery,
      commentsFilterBy,
      commentsSortBy,
      selectedCommentIds,
      multiSelectEnabled,
      cachedViewportCenter,
      cachedNodePositions,
      commentsWithPeopleReplyMatches,
      peopleFilterExpanded,
      peopleFilterActiveTab,
      peopleFilterIncludeRepliesFrom,
      peopleFilterIncludeRepliesMentions,
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
          return lastReply.user.id !== figmaCurrentUser?.id;
        }
        return c.user.id !== figmaCurrentUser?.id;
      });
    }

    const sortFn = {
      activity: (a, b) => {
        const getLatest = (c) => {
          const replies = threads.get(c.id) || [];
          return replies.reduce((latest, r) => {
            const d = new Date(r.created_at);
            return d > latest ? d : latest;
          }, new Date(c.created_at));
        };
        return getLatest(b) - getLatest(a);
      },
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      replies: (a, b) => (threads.get(b.id)?.length || 0) - (threads.get(a.id)?.length || 0),
      people: (a, b) => a.user.handle.localeCompare(b.user.handle),
      burst: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      viewport: (a, b) => {
        if (!cachedViewportCenter) return 0;
        const vc = cachedViewportCenter;
        const posA = cachedNodePositions[a.client_meta?.node_id];
        const posB = cachedNodePositions[b.client_meta?.node_id];
        const distA = posA ? Math.sqrt((posA.x - vc.x) ** 2 + (posA.y - vc.y) ** 2) : Infinity;
        const distB = posB ? Math.sqrt((posB.x - vc.x) ** 2 + (posB.y - vc.y) ** 2) : Infinity;
        return distA - distB;
      },
    };
    filteredComments.sort(sortFn[commentsSortBy] || sortFn.newest);

    const total = topLevelComments.length;
    setFilteredCounts(filteredComments.length, total);

    const commentsForPeopleExtraction = showResolvedComments
      ? topLevelComments
      : topLevelComments.filter(c => !c.resolved_at);

    const allCommentsForPeople = [];
    commentsForPeopleExtraction.forEach(c => {
      allCommentsForPeople.push(c);
      const replies = threads.get(c.id) || [];
      allCommentsForPeople.push(...replies);
    });

    const allPeople = extractPeopleFromComments(allCommentsForPeople);
    const peopleList = Array.from(allPeople.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, info]) => ({ name, ...info }));

    const visibleAuthors = new Set(peopleList.filter(p => p.isAuthor).map(p => p.name));
    const visibleMentions = new Set(peopleList.filter(p => p.isMentioned).map(p => p.name));
    selectedAuthorsFilter.forEach(name => {
      if (!visibleAuthors.has(name)) selectedAuthorsFilter.delete(name);
    });
    selectedMentionsFilter.forEach(name => {
      if (!visibleMentions.has(name)) selectedMentionsFilter.delete(name);
    });

    const html = `
      <div class="prompt-comments-toolbar">
        <input type="text" class="prompt-comments-search" placeholder="${escapeHtml(tu('actions.comments.drawer.search'))}" 
          value="${escapeHtml(commentsSearchQuery)}" 
          oninput="handleCommentsSearchInput(this.value)"
          oncompositionstart="handleCommentsSearchCompositionStart()"
          oncompositionend="handleCommentsSearchCompositionEnd(event)" />
        <div class="comments-dropdown-container">
          <button class="comments-dropdown-btn" onclick="toggleCommentsDropdown(event)" title="${escapeHtml(tu('actions.comments.drawer.sortFilterTitle'))}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            <span>${escapeHtml(tu('actions.comments.drawer.options'))}</span>
          </button>
          <div class="comments-dropdown-menu hidden" id="commentsDropdownMenu">
            <div class="dropdown-section">${escapeHtml(tu('actions.comments.drawer.sort'))}</div>
            <button class="dropdown-item ${commentsSortBy === 'activity' ? 'active' : ''}" onclick="handleCommentsSort('activity')">${escapeHtml(tu('actions.comments.drawer.sortActivity'))}</button>
            <button class="dropdown-item ${commentsSortBy === 'newest' ? 'active' : ''}" onclick="handleCommentsSort('newest')">${escapeHtml(tu('actions.comments.drawer.sortNewest'))}</button>
            <button class="dropdown-item ${commentsSortBy === 'oldest' ? 'active' : ''}" onclick="handleCommentsSort('oldest')">${escapeHtml(tu('actions.comments.drawer.sortOldest'))}</button>
            <button class="dropdown-item ${commentsSortBy === 'replies' ? 'active' : ''}" onclick="handleCommentsSort('replies')">${escapeHtml(tu('actions.comments.drawer.sortReplies'))}</button>
            <button class="dropdown-item ${commentsSortBy === 'viewport' ? 'active' : ''}" onclick="handleCommentsSort('viewport')">${escapeHtml(tu('actions.comments.drawer.sortViewport'))}</button>
            <button class="dropdown-item ${commentsSortBy === 'burst' ? 'active' : ''}" onclick="handleCommentsSort('burst')">${escapeHtml(tu('actions.comments.drawer.sortBurst'))}</button>
            <div class="dropdown-divider"></div>
            <div class="dropdown-section">${escapeHtml(tu('actions.comments.drawer.filter'))}</div>
            <button class="dropdown-item ${commentsFilterBy === 'all' ? 'active' : ''}" onclick="handleCommentsFilter('all')">${escapeHtml(tu('actions.comments.drawer.filterAll'))}</button>
            <button class="dropdown-item ${commentsFilterBy === 'pending' ? 'active' : ''}" onclick="handleCommentsFilter('pending')">${escapeHtml(tu('actions.comments.drawer.filterPending'))}</button>
          </div>
        </div>
        <button class="people-filter-toggle${peopleFilterExpanded ? ' expanded' : ''}" id="peopleFilterToggle" onclick="togglePeopleFilter()" title="${escapeHtml(tu('actions.comments.drawer.peopleFilter'))}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span id="peopleFilterCount" class="people-filter-count">${(selectedAuthorsFilter.size + selectedMentionsFilter.size) > 0 ? (selectedAuthorsFilter.size + selectedMentionsFilter.size) : ''}</span>
        </button>
        <span id="commentsCountDisplay" class="comments-count-display">
          ${multiSelectEnabled ? `${escapeHtml(getSelectedCountLabel(selectedCommentIds.size))} · ` : ''}${filteredComments.length}/${total}
        </span>
        ${multiSelectEnabled ? `
          <div class="prompt-comments-batch-actions">
            <button class="prompt-comments-batch-btn" id="selectAllBtn" onclick="selectAllVisibleComments()" title="${escapeHtml(tu('actions.comments.drawer.selectAllTitle'))}">
              ${escapeHtml(selectedCommentIds.size > 0 ? tu('actions.comments.drawer.deselectAll') : tu('actions.comments.drawer.selectAll'))}
            </button>
            <div class="comment-action-btn-group">
              <button class="prompt-comments-batch-btn" id="batchReplyBtn" onclick="toggleBatchReplyInput('manual')" disabled title="${escapeHtml(tu('actions.comments.drawer.replySelectedTitle'))}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${escapeHtml(tu('actions.comments.drawer.reply'))}
              </button>
              <button class="comment-reply-chevron-btn batch-reply-chevron-btn" onclick="toggleBatchReplyTemplatesDropdown(event, 'batchReplyTextarea')" title="${escapeHtml(tu('actions.comments.drawer.replyTemplates'))}" disabled id="batchReplyChevronBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div class="comment-more-menu hidden" id="reply-dropdown-batchReplyTextarea" style="bottom:auto;top:100%;margin-top:4px;margin-bottom:0;min-width:120px;max-width:220px;"></div>
            </div>
            <button class="prompt-comments-batch-btn" id="batchSummarizeBtn" onclick="batchSummarizeSelected()" disabled title="${escapeHtml(tu('actions.comments.drawer.summarizeSelectedTitle'))}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Z"/></svg>
              ${escapeHtml(tu('actions.comments.drawer.summarize'))}
            </button>
            <button class="prompt-comments-batch-btn" id="batchVisibilityBtn" onclick="batchTogglePromptCommentHidden()" disabled title="Hide selected comments">
              <svg id="batchVisibilityBtnIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span id="batchVisibilityBtnLabel">Hide</span>
            </button>
            <button class="prompt-comments-batch-btn" id="batchCsvBtn" onclick="downloadCommentsAsCSV()" title="${escapeHtml(tu('actions.comments.drawer.downloadCsvTitle'))}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              ${escapeHtml(tu('actions.comments.drawer.csv'))}
            </button>
          </div>
        ` : ''}
      </div>
      <div id="batchActionInputContainer" class="batch-action-container" style="display: none;">
        <div class="people-filter-header">
          <div class="tab-container">
            <button class="tab-item active" id="batchTabManual" onclick="switchBatchActionTab('manual')">${escapeHtml(tu('actions.comments.drawer.manual'))}</button>
            <button class="tab-item" id="batchTabAi" onclick="switchBatchActionTab('ai')">${escapeHtml(tu('actions.comments.drawer.aiAssisted'))}</button>
          </div>
        </div>
        <div id="batchReplyInputArea" style="display: none;">
          <textarea id="batchReplyTextarea" class="batch-reply-textarea" placeholder="${escapeHtml(tu('actions.comments.drawer.batchReplyPlaceholder'))}" onkeydown="handleBatchReplyKeydown(event, 'manual')" oninput="autoExpandTextarea(this)"></textarea>
          <div class="batch-action-footer">
            <button class="comment-action-btn" onclick="closeBatchInput()">${escapeHtml(tu('actions.comments.drawer.cancel'))}</button>
            <button class="comment-action-btn primary" onclick="executeBatchReply()">${tu('actions.comments.drawer.sendToCount', { count: '<span id="batchReplyCountLabel">0</span>' })}</button>
          </div>
        </div>
        <div id="batchAiReplyInputArea" style="display: none;">
          <textarea id="batchAiReplyInstruction" class="batch-reply-textarea" placeholder="${escapeHtml(tu('actions.comments.drawer.batchAiPlaceholder'))}" onkeydown="handleBatchReplyKeydown(event, 'ai')" oninput="autoExpandTextarea(this)"></textarea>
          <div class="batch-action-footer">
            <button class="comment-action-btn" onclick="closeBatchInput()">${escapeHtml(tu('actions.comments.drawer.cancel'))}</button>
            <button class="comment-action-btn primary" id="executeBatchAiReplyBtn" onclick="executeBatchAiReply()">${tu('actions.comments.drawer.runAiForCount', { count: '<span id="batchAiReplyCountLabel">0</span>' })}</button>
          </div>
        </div>
      </div>
      <div class="people-filter-section${peopleFilterExpanded ? ' expanded' : ''}" id="peopleFilterSection">
        <div class="people-filter-header">
          <div class="tab-container">
            <button class="tab-item${peopleFilterActiveTab === 'from' ? ' active' : ''}" data-tab="from" onclick="switchPeopleFilterTab('from')">
              ${escapeHtml(tu('actions.comments.drawer.from'))}
              <span class="tab-badge" id="fromTabBadge" style="${selectedAuthorsFilter.size > 0 ? 'display: inline-flex;' : ''}">${selectedAuthorsFilter.size || ''}</span>
            </button>
            <button class="tab-item${peopleFilterActiveTab === 'mentions' ? ' active' : ''}" data-tab="mentions" onclick="switchPeopleFilterTab('mentions')">
              ${escapeHtml(tu('actions.comments.drawer.mentions'))}
              <span class="tab-badge" id="mentionsTabBadge" style="${selectedMentionsFilter.size > 0 ? 'display: inline-flex;' : ''}">${selectedMentionsFilter.size || ''}</span>
            </button>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="people-filter-include-replies-toggle ${peopleFilterActiveTab === 'from' ? (peopleFilterIncludeRepliesFrom ? 'active' : '') : (peopleFilterIncludeRepliesMentions ? 'active' : '')}" onclick="togglePeopleIncludeReplies()" title="${escapeHtml(tu('actions.comments.drawer.includeRepliesTitle'))}">
              <span class="toggle-switch"></span>
              ${escapeHtml(tu('actions.comments.drawer.replies'))}
            </div>
            ${(selectedAuthorsFilter.size > 0 || selectedMentionsFilter.size > 0) ? `<button class="people-filter-clear" onclick="clearPeopleFilter('all')">${escapeHtml(tu('actions.comments.drawer.clearAll'))}</button>` : ''}
          </div>
        </div>
        <div class="people-chips-container" id="peopleChipsFrom" style="${peopleFilterActiveTab === 'from' ? 'display: flex;' : 'display: none;'}">
          ${peopleList.filter(p => p.isAuthor).map(p => `
            <button class="people-chip${selectedAuthorsFilter.has(p.name) ? ' selected' : ''}" data-name="${escapeHtml(p.name)}" data-filter="from" onclick="togglePersonChip('${escapeHtml(p.name).replace(/'/g, "\\'")}', 'from')">
              <div class="people-chip-avatar-mini">
                ${p.img_url
          ? `<img src="${p.img_url}" alt="${p.name}" onerror="this.style.display='none';this.parentNode.textContent='${p.name.substring(0, 1).toUpperCase()}'" />`
          : p.name.substring(0, 1).toUpperCase()
        }
              </div>
              ${escapeHtml(p.name)}
            </button>
          `).join('')}
        </div>
        <div class="people-chips-container" id="peopleChipsMentions" style="${peopleFilterActiveTab === 'mentions' ? 'display: flex;' : 'display: none;'}">
          ${peopleList.filter(p => p.isMentioned).length > 0
        ? peopleList.filter(p => p.isMentioned).map(p => `
              <button class="people-chip${selectedMentionsFilter.has(p.name) ? ' selected' : ''}" data-name="${escapeHtml(p.name)}" data-filter="mentions" onclick="togglePersonChip('${escapeHtml(p.name).replace(/'/g, "\\'")}', 'mentions')">
                <div class="people-chip-avatar-mini">
                  ${p.img_url
            ? `<img src="${p.img_url}" alt="${p.name}" onerror="this.style.display='none';this.parentNode.textContent='${p.name.substring(0, 1).toUpperCase()}'" />`
            : p.name.substring(0, 1).toUpperCase()
          }
                </div>
                ${escapeHtml(p.name)}
              </button>
            `).join('')
        : `<span class="people-filter-empty">${escapeHtml(tu('actions.comments.drawer.noMentions'))}</span>`
      }
        </div>
      </div>
      <div id="promptCommentsListContainer">
        ${renderCommentsListHTML(filteredComments, threads)}
      </div>`;

    container.innerHTML = html;
    updateBatchActionsState();
  }

  return {
    renderCommentItemHTML,
    renderCommentsListHTML,
    renderCommentsInDrawer,
  };
}
