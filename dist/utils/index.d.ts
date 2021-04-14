declare const capitalizeFirstLetter: (string: string) => string;
declare const logging: (message: string, payload?: any) => void;
declare function sleep(ms: number): Promise<unknown>;
export { logging, capitalizeFirstLetter, sleep };
