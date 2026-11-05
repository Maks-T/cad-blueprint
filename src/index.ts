// Публичный API cad-blueprint (генплан, стадии 1–6).
// Стадия 1: настройки чертежа, слои и штриховки, шрифты и текстовые стили, размерные стили.
// Стадия 2: геометрия, примитивы, построитель контуров CadPath.
// Стадия 3: размеры и выноски, блоки и вставки, видовые экраны, документ.
// Стадия 4: компактный JSON и контейнер .vcad.
// Стадия 5: габариты, SVG, DXF (экспорт и импорт). Вьюпорт — `cad-blueprint/viewer`, Three.js — `cad-blueprint/three`.
export { CadError } from './errors';
export * from './settings';
export * from './layers';
export * from './typography';
export * from './dim-styles';
export * from './geometry';
export * from './path-builder';
export * from './primitives';
export * from './dimensions';
export * from './blocks';
export * from './entities';
export * from './document';
export * from './render';
export * from './bounds';
export * from './svg';
export * from './dxf';
export * from './format';
