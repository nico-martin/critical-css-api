export interface ErrorReturn {
  status: number;
  code: string;
  text: string;
  trace?: string;
}

export interface RequestHeaders {
  authorization?: string;
  origin?: string;
}
