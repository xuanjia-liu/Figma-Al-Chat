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
  const getTaskByName = (tasks, name) => tasks.find((task) => task.name === name);

  const placeholderSetTask = getTaskByName(quickCreateUiTasks, 'Placeholder set');
  const turnIntoComponentSetTask = getTaskByName(quickCreateUiTasks, 'Turn into Component Set');
  const removeInnerHolesTask = getTaskByName(quickCreateUiTasks, 'Remove inner holes');
  const closeOpenShapeTask = getTaskByName(quickCreateUiTasks, 'Close open shape');
  const mergeDuplicatePointsTask = getTaskByName(quickCreateUiTasks, 'Merge duplicate points');
  const separateTouchingLoopsTask = getTaskByName(quickCreateUiTasks, 'Separate touching loops');
  const removeZeroLengthSegmentsTask = getTaskByName(quickCreateUiTasks, 'Remove zero-length segments');
  const removeTinySpikesTask = getTaskByName(quickCreateUiTasks, 'Remove tiny spikes');
  const simplifyNearCollinearPointsTask = getTaskByName(quickCreateUiTasks, 'Simplify near-collinear points');
  const normalizeWindingDirectionTask = getTaskByName(quickCreateUiTasks, 'Normalize winding direction');
  const aiComponentFactoryTask = getTaskByName(quickCreateUiTasks, 'AI Component Factory');
  const cardComponentTask = getTaskByName(quickCreateUiTasks, 'Card Component');
  const modalDialogTask = getTaskByName(quickCreateUiTasks, 'Modal / Dialog');
  const buttonTask = getTaskByName(quickCreateUiTasks, 'Button');
  const createGridLineTask = getTaskByName(quickCreateUiTasks, 'Create grid line');
  const addPropertyTask = getTaskByName(quickCreateUiTasks, 'Add property');
  const createVariantsTask = getTaskByName(quickCreateUiTasks, 'Create variants');
  const duplicateWithInstructionsTask = getTaskByName(quickCreateUiTasks, 'Duplicate with instructions');
  const randomizeSelectedInstanceTask = getTaskByName(quickCreateUiTasks, 'Randomize selected instance');

  const createIconTask = getTaskByName(quickCreateImageTasks, 'Create icon');
  const importIconSetsTask = getTaskByName(quickCreateImageTasks, 'Import icon sets');
  const imageToAsciiTask = getTaskByName(quickCreateImageTasks, 'Image to ASCII');
  const perspectiveToolTask = getTaskByName(quickCreateImageTasks, 'Perspective tool');
  const reStyleTask = getTaskByName(quickCreateImageTasks, 'Re-style');
  const generateImageTask = getTaskByName(quickCreateImageTasks, 'Generate image');
  const generateVectorTask = getTaskByName(quickCreateImageTasks, 'Generate Vector');

  const svgUiPatternTask = getTaskByName(quickCreateStyleTasks, 'SVG UI Pattern');
  const colorPaletteTask = getTaskByName(quickCreateStyleTasks, 'Create color palette');

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
      aiComponentFactoryTask,
      cardComponentTask,
      modalDialogTask,
      createIconTask,
      importIconSetsTask,
      imageToAsciiTask,
      buttonTask,
      colorPaletteTask,
      createGridLineTask,
      reStyleTask,
      generateImageTask,
      addPropertyTask,
      createVariantsTask,
      duplicateWithInstructionsTask,
      randomizeSelectedInstanceTask,
    ],
    'Vector': [
      removeInnerHolesTask,
      closeOpenShapeTask,
      mergeDuplicatePointsTask,
      separateTouchingLoopsTask,
      removeZeroLengthSegmentsTask,
      removeTinySpikesTask,
      simplifyNearCollinearPointsTask,
      normalizeWindingDirectionTask,
      svgUiPatternTask,
      ...(perspectiveToolTask ? [perspectiveToolTask] : []),
      generateVectorTask,
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
