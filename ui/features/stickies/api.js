export function createStickiesApi({
  STICKIES_CACHE_TTL,
  requestStickies,
  getState,
  setStickiesState,
  showToast,
  tu,
}) {
  async function ensureStickiesLoaded(forceRefresh = false) {
    const {
      figmaStickies,
      figmaStickiesLastLoaded,
      figmaStickiesLoading,
    } = getState();

    const now = Date.now();
    const cacheValid = !forceRefresh &&
      figmaStickies.length > 0 &&
      (now - figmaStickiesLastLoaded) < STICKIES_CACHE_TTL;

    if (cacheValid) {
      return true;
    }

    if (figmaStickiesLoading) {
      while (getState().figmaStickiesLoading) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return getState().figmaStickies.length > 0;
    }

    setStickiesState({ figmaStickiesLoading: true });

    try {
      const result = await requestStickies();
      if (result?.error) {
        throw new Error(result.error);
      }
      const stickies = Array.isArray(result?.stickies) ? result.stickies : [];

      setStickiesState({
        figmaStickies: stickies,
        figmaStickiesLastLoaded: Date.now(),
      });

      if (result?.editorType && result.editorType !== 'figjam') {
        showToast(tu('actions.stickies.unsupportedEditor'), 'info');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to load FigJam stickies:', error);
      showToast(
        tu('actions.stickies.errorToast', { message: error?.message || 'Unknown error' }),
        'error',
      );
      return false;
    } finally {
      setStickiesState({ figmaStickiesLoading: false });
    }
  }

  return {
    ensureStickiesLoaded,
  };
}
