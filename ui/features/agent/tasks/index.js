import { commentsTasks } from './comments.js';
import {
  accessibilityQualityTasks,
  figJamTasks,
  layerNamingTasks,
  smartTextTasks,
  userResearchTasks,
} from './content.js';
import { quickCreateImageTasks, stylingImageTasks } from './images.js';
import { createQuickCreateUiTasks, uiLayoutTasks } from './ui-layout.js';
import { quickCreateStyleTasks, stylingImageInsertIndex, stylingTasks } from './styles.js';

export function createAgentTasks(deps = {}) {
  const quickCreateUiTasks = createQuickCreateUiTasks(deps);
  const [
    placeholderSetTask,
    turnIntoComponentSetTask,
    aiComponentFactoryTask,
    cardComponentTask,
    modalDialogTask,
    buttonTask,
    createGridLineTask,
    createVariantsTask,
    duplicateWithInstructionsTask,
    randomizeSelectedInstanceTask,
  ] = quickCreateUiTasks;

  const [
    createIconTask,
    importIconSetsTask,
    reStyleTask,
    generateImageTask,
    generateVectorTask,
  ] = quickCreateImageTasks;

  const [svgUiPatternTask, colorPaletteTask] = quickCreateStyleTasks;

  return {
    'UI & Layout': uiLayoutTasks,
    'Styling & Effects': [
      ...stylingTasks.slice(0, stylingImageInsertIndex),
      ...stylingImageTasks,
      ...stylingTasks.slice(stylingImageInsertIndex),
    ],
    'Smart Text': smartTextTasks,
    'Layer Naming': layerNamingTasks,
    'Accessibility & Quality': accessibilityQualityTasks,
    'Quick Create': [
      placeholderSetTask,
      turnIntoComponentSetTask,
      aiComponentFactoryTask,
      cardComponentTask,
      modalDialogTask,
      createIconTask,
      importIconSetsTask,
      svgUiPatternTask,
      buttonTask,
      colorPaletteTask,
      createGridLineTask,
      reStyleTask,
      generateImageTask,
      generateVectorTask,
      createVariantsTask,
      duplicateWithInstructionsTask,
      randomizeSelectedInstanceTask,
    ],
    'FigJam': figJamTasks,
    'User Research': userResearchTasks,
    'Comments': commentsTasks,
  };
}
