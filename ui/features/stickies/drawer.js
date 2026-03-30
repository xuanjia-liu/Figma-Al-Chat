function getStickyPreviewText(sticky) {
  const text = typeof sticky.text === 'string' ? sticky.text.trim() : '';
  return text || '';
}

function getInitial(name, tu) {
  const safe = (name || tu('actions.stickies.unknownAuthor')).trim();
  return safe.substring(0, 1).toUpperCase();
}

function hexToRgba(hex, alpha) {
  const raw = String(hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return `rgba(127, 127, 127, ${alpha})`;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getStampPreview(stamp, tu) {
  const preview = typeof stamp?.preview === 'string' ? stamp.preview.trim() : '';
  const name = typeof stamp?.name === 'string' ? stamp.name.trim() : '';
  const source = preview || name;

  if (source) {
    const normalized = source.toLowerCase();
    const mappings = [
      { match: /thumb|like|approve|upvote|yes|plus[\s_-]?1/, emoji: '👍' },
      { match: /love|heart|favorite|favourite/, emoji: '❤️' },
      { match: /celebrat|party|hooray|tada|congrats/, emoji: '🎉' },
      { match: /fire|lit|hot/, emoji: '🔥' },
      { match: /clap|applause/, emoji: '👏' },
      { match: /laugh|lol|funny|haha/, emoji: '😂' },
      { match: /idea|light[\s_-]?bulb|brainstorm/, emoji: '💡' },
      { match: /question|ask|confus|unclear/, emoji: '❓' },
      { match: /warning|alert|caution|concern/, emoji: '⚠️' },
      { match: /check|done|complete|ok|okay|success/, emoji: '✅' },
      { match: /star|favorite|favourite/, emoji: '⭐' },
      { match: /eyes|look|watch|review/, emoji: '👀' },
      { match: /rocket|launch|ship/, emoji: '🚀' },
      { match: /plus|add/, emoji: '➕' },
      { match: /minus|remove|subtract/, emoji: '➖' },
    ];

    const mapped = mappings.find(({ match }) => match.test(normalized));
    if (mapped) return mapped.emoji;

    if (/\p{Extended_Pictographic}/u.test(source)) {
      return source;
    }

    return source;
  }

  return tu('actions.stickies.stampFallback');
}

export function createStickiesDrawerHelpers({
  getState,
  escapeHtml,
  highlightSearchMatches,
  tu,
  setFilteredCounts,
  updateStickyBatchActionsState,
}) {
  function renderStickyItemHTML(sticky) {
    const {
      selectedStickyIds,
      stickyMultiSelectEnabled,
      stickiesSearchQuery,
    } = getState();

    const isSelected = selectedStickyIds.has(sticky.id);
    const previewText = getStickyPreviewText(sticky);
    const stampCount = Array.isArray(sticky.stamps) ? sticky.stamps.length : 0;
    const itemClasses = ['prompt-comment-item', 'prompt-sticky-item'];
    if (stickyMultiSelectEnabled) itemClasses.push('selectable');
    const stickyColor = sticky.color || '#F5D565';
    const rowStyle = `--sticky-row-bg:${hexToRgba(stickyColor, 0.14)};--sticky-row-border:${hexToRgba(stickyColor, 0.35)};`;

    return `
      <div class="${itemClasses.join(' ')}" data-sticky-id="${sticky.id}" style="${rowStyle}" onclick="handleStickyItemClick(event, '${sticky.id}')">
        ${stickyMultiSelectEnabled ? `
          <input type="checkbox" class="comment-select-checkbox"
            ${isSelected ? 'checked' : ''}
            onchange="toggleStickySelection('${sticky.id}', this)" />
        ` : ''}
        <div class="comment-header">
          <div class="comment-avatar sticky-author-avatar">
            ${sticky.authorPhotoUrl
              ? `<img src="${sticky.authorPhotoUrl}" alt="${escapeHtml(sticky.authorName || tu('actions.stickies.unknownAuthor'))}" onerror="this.style.display='none';this.parentNode.textContent='${escapeHtml(getInitial(sticky.authorName, tu))}'" />`
              : escapeHtml(getInitial(sticky.authorName, tu))}
          </div>
          <div class="comment-header-text">
            <span class="comment-author">${highlightSearchMatches(sticky.authorName || tu('actions.stickies.unknownAuthor'), stickiesSearchQuery)}</span>
            <span class="comment-attached-layer">${escapeHtml(sticky.pageName || '')}${stampCount > 0 ? ` · ${escapeHtml(tu('actions.stickies.stampsCount', { count: stampCount }))}` : ''}</span>
          </div>
        </div>
        <div class="comment-body">${previewText ? highlightSearchMatches(previewText, stickiesSearchQuery) : `<span class="prompt-sticky-empty">${escapeHtml(tu('actions.stickies.emptySticky'))}</span>`}</div>
        ${stampCount > 0 ? `
          <div class="comment-replies prompt-stamp-replies">
            ${sticky.stamps.map((stamp) => `
              <div class="comment-reply-item prompt-stamp-item" data-stamp-id="${stamp.id}">
                <div class="comment-header prompt-stamp-header">
                  <div class="comment-avatar">
                    ${stamp.author?.photoUrl
                      ? `<img src="${stamp.author.photoUrl}" alt="${escapeHtml(stamp.author.name || tu('actions.stickies.unknownAuthor'))}" onerror="this.style.display='none';this.parentNode.textContent='${escapeHtml((stamp.author?.name || tu('actions.stickies.unknownAuthor')).substring(0, 1).toUpperCase())}'" />`
                      : escapeHtml((stamp.author?.name || tu('actions.stickies.unknownAuthor')).substring(0, 1).toUpperCase())}
                  </div>
                  <span class="comment-author">${escapeHtml(stamp.author?.name || tu('actions.stickies.unknownAuthor'))}</span>
                  <span class="prompt-stamp-preview">${escapeHtml(getStampPreview(stamp, tu))}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div class="comment-actions">
          <button class="comment-action-btn icon-only" onclick="navigateToStickyNode('${sticky.id}')" title="${escapeHtml(tu('actions.stickies.goTo'))}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <div class="comment-more-container">
            <button class="comment-action-btn icon-only" onclick="toggleStickyMoreMenu(event, '${sticky.id}')" title="${escapeHtml(tu('actions.stickies.moreOptions'))}">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
            <div class="comment-more-menu hidden" id="sticky-more-menu-${sticky.id}">
              <button class="dropdown-item" style="color: var(--text-secondary); white-space: nowrap;" onclick="copyStickyToChat('${sticky.id}'); closePromptDrawer();">${escapeHtml(tu('actions.stickies.addToChat'))}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderStickiesListHTML(filteredStickies) {
    if (!filteredStickies.length) {
      return `<div class="prompt-comments-empty">${escapeHtml(tu('actions.stickies.emptyFiltered'))}</div>`;
    }

    return `<div class="prompt-comments-list">${filteredStickies.map((sticky) => renderStickyItemHTML(sticky)).join('')}</div>`;
  }

  function renderStickiesInDrawer(container) {
    const {
      figmaStickies,
      currentStickiesScope,
      figmaCurrentPageId,
      lastKnownSelectionItems,
      selectedStickyAuthorFilter,
      stickiesSearchQuery,
      stickiesSortBy,
      selectedStickyIds,
      stickyMultiSelectEnabled,
      stickyPeopleFilterExpanded,
    } = getState();

    let filteredStickies = [...figmaStickies];

    if (currentStickiesScope === 'page') {
      filteredStickies = filteredStickies.filter((sticky) => sticky.pageId === figmaCurrentPageId);
    } else if (currentStickiesScope === 'selection') {
      const selectedIds = new Set();
      (lastKnownSelectionItems || []).forEach((node) => {
        selectedIds.add(node.id);
        if (Array.isArray(node.descendantIds)) {
          node.descendantIds.forEach((id) => selectedIds.add(id));
        }
      });
      filteredStickies = filteredStickies.filter((sticky) => selectedIds.has(sticky.id));
    }

    if (selectedStickyAuthorFilter.size > 0) {
      filteredStickies = filteredStickies.filter((sticky) => selectedStickyAuthorFilter.has(sticky.authorName || tu('actions.stickies.unknownAuthor')));
    }

    const query = stickiesSearchQuery.trim();
    if (query) {
      filteredStickies = filteredStickies.filter((sticky) => {
        const haystack = [
          sticky.text || '',
          sticky.name || '',
          sticky.authorName || '',
          sticky.pageName || '',
        ].join('\n').toLowerCase();
        return haystack.includes(query);
      });
    }

    const sortFns = {
      viewport: (a, b) => ((a.position?.x || 0) + (a.position?.y || 0)) - ((b.position?.x || 0) + (b.position?.y || 0)),
      page: (a, b) => (a.pageName || '').localeCompare(b.pageName || '') || (a.position?.y || 0) - (b.position?.y || 0),
      author: (a, b) => (a.authorName || '').localeCompare(b.authorName || '') || (a.pageName || '').localeCompare(b.pageName || ''),
      color: (a, b) => (a.color || '').localeCompare(b.color || '') || (a.authorName || '').localeCompare(b.authorName || ''),
      length: (a, b) => (b.text || '').length - (a.text || '').length,
      canvas: (a, b) => (a.position?.y || 0) - (b.position?.y || 0) || (a.position?.x || 0) - (b.position?.x || 0),
    };
    filteredStickies.sort(sortFns[stickiesSortBy] || sortFns.canvas);

    const total = figmaStickies.length;
    setFilteredCounts(filteredStickies.length, total);

    const authorCounts = new Map();
    figmaStickies.forEach((sticky) => {
      const author = sticky.authorName || tu('actions.stickies.unknownAuthor');
      authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
    });
    const authors = Array.from(authorCounts.keys()).sort((a, b) => a.localeCompare(b));

    container.innerHTML = `
      <div class="prompt-comments-toolbar">
        <input type="text" class="prompt-comments-search" placeholder="${escapeHtml(tu('actions.stickies.search'))}"
          value="${escapeHtml(stickiesSearchQuery)}"
          oninput="handleStickiesSearchInput(this.value)"
          oncompositionstart="handleStickiesSearchCompositionStart()"
          oncompositionend="handleStickiesSearchCompositionEnd(event)" />
        <div class="comments-dropdown-container">
          <button class="comments-dropdown-btn" onclick="toggleStickiesDropdown(event)" title="${escapeHtml(tu('actions.stickies.sortFilterTitle'))}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            <span>${escapeHtml(tu('actions.stickies.options'))}</span>
          </button>
          <div class="comments-dropdown-menu hidden" id="stickiesDropdownMenu">
            <div class="dropdown-section">${escapeHtml(tu('actions.stickies.sort'))}</div>
            <button class="dropdown-item ${stickiesSortBy === 'canvas' ? 'active' : ''}" onclick="handleStickiesSort('canvas')">${escapeHtml(tu('actions.stickies.sortCanvas'))}</button>
            <button class="dropdown-item ${stickiesSortBy === 'viewport' ? 'active' : ''}" onclick="handleStickiesSort('viewport')">${escapeHtml(tu('actions.stickies.sortViewport'))}</button>
            <button class="dropdown-item ${stickiesSortBy === 'page' ? 'active' : ''}" onclick="handleStickiesSort('page')">${escapeHtml(tu('actions.stickies.sortPage'))}</button>
            <button class="dropdown-item ${stickiesSortBy === 'author' ? 'active' : ''}" onclick="handleStickiesSort('author')">${escapeHtml(tu('actions.stickies.sortAuthor'))}</button>
            <button class="dropdown-item ${stickiesSortBy === 'color' ? 'active' : ''}" onclick="handleStickiesSort('color')">${escapeHtml(tu('actions.stickies.sortColor'))}</button>
            <button class="dropdown-item ${stickiesSortBy === 'length' ? 'active' : ''}" onclick="handleStickiesSort('length')">${escapeHtml(tu('actions.stickies.sortLength'))}</button>
          </div>
        </div>
        <button class="people-filter-toggle${stickyPeopleFilterExpanded ? ' expanded' : ''}" id="stickyPeopleFilterToggle" onclick="toggleStickyPeopleFilter()" title="${escapeHtml(tu('actions.stickies.authorFilter'))}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <span id="stickyPeopleFilterCount" class="people-filter-count">${selectedStickyAuthorFilter.size > 0 ? selectedStickyAuthorFilter.size : ''}</span>
        </button>
        <span id="stickiesCountDisplay" class="comments-count-display">
          ${stickyMultiSelectEnabled ? `${escapeHtml(tu('actions.stickies.selectedCount', { count: selectedStickyIds.size }))} · ` : ''}${filteredStickies.length}/${total}
        </span>
        ${stickyMultiSelectEnabled ? `
          <div class="prompt-comments-batch-actions">
            <button class="prompt-comments-batch-btn" id="selectAllStickiesBtn" onclick="selectAllVisibleStickies()" title="${escapeHtml(tu('actions.stickies.selectAllTitle'))}">
              ${escapeHtml(selectedStickyIds.size > 0 ? tu('actions.stickies.deselectAll') : tu('actions.stickies.selectAll'))}
            </button>
            <button class="prompt-comments-batch-btn" id="batchSummarizeStickiesBtn" onclick="batchSummarizeSelectedStickies()" disabled title="${escapeHtml(tu('actions.stickies.summarizeSelectedTitle'))}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m18.364 9.273 1.136-2.5L22 5.636 19.5 4.5 18.364 2l-1.137 2.5-2.5 1.136 2.5 1.137 1.137 2.5Zm-6.819.454-2.272-5-2.273 5L2 12l5 2.273 2.273 5 2.273-5 5-2.273-5-2.273Z"/></svg>
              ${escapeHtml(tu('actions.stickies.summarize'))}
            </button>
            <button class="prompt-comments-batch-btn" id="batchStickiesCsvBtn" onclick="downloadStickiesAsCSV()" title="${escapeHtml(tu('actions.stickies.downloadCsvTitle'))}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              ${escapeHtml(tu('actions.stickies.csv'))}
            </button>
          </div>
        ` : ''}
      </div>
      <div class="people-filter-section${stickyPeopleFilterExpanded ? ' expanded' : ''}" id="stickyPeopleFilterSection">
        <div class="people-filter-header">
          <div class="dropdown-section">${escapeHtml(tu('actions.stickies.authorFilter'))}</div>
          ${selectedStickyAuthorFilter.size > 0 ? `<button class="people-filter-clear" onclick="clearStickyAuthorFilter()">${escapeHtml(tu('actions.stickies.clearAll'))}</button>` : ''}
        </div>
        <div class="people-chips-container" style="display: flex;">
          ${authors.map((author) => `
            <button class="people-chip${selectedStickyAuthorFilter.has(author) ? ' selected' : ''}" data-name="${escapeHtml(author)}" onclick="toggleStickyAuthorChip('${escapeHtml(author).replace(/'/g, "\\'")}')">
              ${escapeHtml(author)}
              <span class="tab-badge" style="display:inline-flex;">${authorCounts.get(author)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div id="promptStickiesListContainer">
        ${renderStickiesListHTML(filteredStickies)}
      </div>
    `;

    updateStickyBatchActionsState();
  }

  return {
    renderStickiesInDrawer,
  };
}
