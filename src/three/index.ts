// Точка входа `cad-blueprint/three` — мост к Three.js (`three` — peer-зависимость).
export { blockToExtrudeGeometry, blockToShapes, entitiesToShapes } from './shapes';
export type { ShapeOptions } from './shapes';
export { chainSegments, sectionBasis, sectionGeometry, sectionObject, sectionToBlock, simplifyCollinear } from './section';
export type { SectionBasis, SectionLoop, SectionOptions, SectionResult, SectionToBlockOptions } from './section';
