class ErrorUtil {

    constructor() {}

    public static sequelizeError(error: any, defaultMessage? :string) {
        defaultMessage = defaultMessage ? defaultMessage : "Error occurred"
        return (error.parent?.["detail"] || error.message || defaultMessage).replace(/_/g, " ")
    }

}

export { ErrorUtil };
