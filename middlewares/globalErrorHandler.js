const globalErrorHandler = (err, req, res, next) => {
    //status 
    const status = err?.status ? err?.status : "error"
    //message
    const message = err?.message ;
    //stack
    const stack = err?.stack;
    res.status(500).json({
        status,
        message,
        stack
    })
};

const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`)
    next(error)
};

export {globalErrorHandler, notFoundHandler}