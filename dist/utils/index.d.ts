declare const capitalizeFirstLetter: (string: string) => string;
declare const logging: (message: string, payload?: any) => void;
declare function sleep(ms: number): Promise<unknown>;
declare function fetchWithTimer(url: string, options: any, timeout?: number): Promise<unknown>;
export { logging, capitalizeFirstLetter, sleep, fetchWithTimer };
