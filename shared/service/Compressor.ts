// tslint:disable: no-bitwise
/**
 * Data compressor / decompressor for transport
 */
export class Compressor {

    /**
     * Float precision
     */
    static precision = 100;

    constructor() { }

    /**
     * Compress a float into an integer
     */
    compress(value: number): number {
        return (0.5 + value * Compressor.precision) | 0;
    }

    /**
     * Decompress an integer into an float
     */
    decompress(value: number): number {
        return value / Compressor.precision;
    }
}



