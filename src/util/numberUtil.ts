class NumberUtil {
    constructor() {}

    public static randomFixedInteger(length: number) {
        return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
    }
}

export { NumberUtil };
