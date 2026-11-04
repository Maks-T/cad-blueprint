import type { LayerStyle } from './types';

export const DEFAULT_LAYERS: Record<string, LayerStyle> = {
  // Основные конструктивные слои
  contour: {
    id: 'contour', stroke: '#0f172a', strokeWidth: 1.4, lineType: 'continuous',
    fill: '#ffffff', dxfColor: 7, visible: true
  },
  beam: {
    id: 'beam', stroke: '#0f172a', strokeWidth: 1.6, lineType: 'continuous',
    fill: '#ffffff', dxfColor: 7, visible: true
  },
  cut_steel: {
    id: 'cut_steel', stroke: '#0f172a', strokeWidth: 1.6, lineType: 'continuous',
    fill: '#ffffff', hatch: 'steel-45', dxfColor: 7, visible: true
  },
  cut_board: {
    id: 'cut_board', stroke: '#0f172a', strokeWidth: 1.6, lineType: 'continuous',
    fill: '#ffffff', hatch: 'board-45', dxfColor: 30, visible: true
  },
  tread: {
    id: 'tread', stroke: '#a8a252', strokeWidth: 1.0, lineType: 'continuous',
    fill: '#fbf3c4', dxfColor: 2, visible: true
  },
  tread_section: {
    id: 'tread_section', stroke: '#0f172a', strokeWidth: 1.4, lineType: 'continuous',
    fill: '#fbf3c4', dxfColor: 2, visible: true
  },
  riser: {
    id: 'riser', stroke: '#0f172a', strokeWidth: 1.4, lineType: 'continuous',
    fill: '#cbd5e1', dxfColor: 8, visible: true
  },
  concrete: {
    id: 'concrete', stroke: '#0f172a', strokeWidth: 1.0, lineType: 'continuous',
    fill: '#e7e5e4', hatch: 'concrete', dxfColor: 9, visible: true
  },
  ground: {
    id: 'ground', stroke: '#64748b', strokeWidth: 1.6, lineType: 'continuous',
    dxfColor: 8, visible: true
  },

  // Скрытые и фоновые элементы
  hidden: {
    id: 'hidden', stroke: '#334155', strokeWidth: 1.0, lineType: 'dashed',
    fill: '#ffffff', dxfColor: 8, visible: true
  },
  faint_beam: {
    id: 'faint_beam', stroke: '#a16207', strokeWidth: 1.0, lineType: 'dashed',
    opacity: 0.55, dxfColor: 30, visible: true
  },

  // Размеры, оси и маркировка
  dimensions: {
    id: 'dimensions', stroke: '#0284c7', strokeWidth: 1.2, lineType: 'continuous',
    dxfColor: 5, visible: true
  },
  axes: {
    id: 'axes', stroke: '#0284c7', strokeWidth: 0.8, lineType: 'dashdot',
    dxfColor: 1, visible: true
  },
  fasteners: {
    id: 'fasteners', stroke: '#b91c1c', strokeWidth: 2.2, lineType: 'continuous',
    dxfColor: 1, visible: true
  },
  annotations: {
    id: 'annotations', stroke: '#0f172a', strokeWidth: 1.0, lineType: 'continuous',
    dxfColor: 7, visible: true
  }
};