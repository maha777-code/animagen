export {
  type DirectorProject,
  type DirectorTemplate,
  type LtxCompiledPrompt,
  type LtxRenderRequest,
  type ShotSpec,
  type TemplateCategory,
  DirectorProjectSchema,
  ShotSpecSchema,
} from './types.js';

export { DIRECTOR_TEMPLATES, getTemplateById, listTemplatesByCategory } from './templates.js';

export {
  addShot,
  createShot,
  duplicateShot,
  getActiveShot,
  newShotId,
  projectFromSpec,
  projectFromTemplate,
  removeShot,
  reorderShot,
  setActiveShot,
  specForActiveShot,
  specForShot,
  totalDurationSec,
  updateShot,
} from './project.js';

export { buildLtxRenderRequest, compileLtxPrompt } from './ltx-prompt.js';
