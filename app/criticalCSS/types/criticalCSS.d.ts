declare module 'criticalCSS';

export interface Dimension {
  width: number;
  height: number;
}

export interface Options {
  src: string;
  dimensions: Array<Dimension>;
}
