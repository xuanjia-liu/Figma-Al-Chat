import { commentsTasks } from './comments.js';
import {
  accessibilityQualityTasks,
  figJamTasks,
  layerNamingTasks,
  smartTextTasks,
  userResearchTasks,
} from './content.js';
import { documentTasks } from './documents.js';
import { quickCreateImageTasks, stylingImageTasks } from './images.js';
import { stickiesTasks } from './stickies.js';
import { createQuickCreateUiTasks, uiLayoutTasks } from './ui-layout.js';
import { designSystemTasks } from './design-system.js';
import { quickCreateStyleTasks, stylingImageInsertIndex, stylingTasks } from './styles.js';

export function createAgentTasks(deps = {}) {
  const quickCreateUiTasks = createQuickCreateUiTasks(deps);
  const [
    placeholderSetTask,
    turnIntoComponentSetTask,
    removeInnerHolesTask,
    fixShapeIssuesTask,
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
    imageToAsciiTask,
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
    'Design System': designSystemTasks,
    'Smart Text': smartTextTasks,
    'Layer Naming': layerNamingTasks,
    'Accessibility & Quality': accessibilityQualityTasks,
    'Quick Create': [
      placeholderSetTask,
      turnIntoComponentSetTask,
      removeInnerHolesTask,
      fixShapeIssuesTask,
      aiComponentFactoryTask,
      cardComponentTask,
      modalDialogTask,
      createIconTask,
      importIconSetsTask,
      imageToAsciiTask,
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
    'FigJam': [
      ...stickiesTasks,
      ...figJamTasks,
    ],
    'User Research': userResearchTasks,
    'Documents': documentTasks,
    'Comments': commentsTasks,
  };
}
