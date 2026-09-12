function errorHandler(err, req, res, next) {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).send({
        error: true,
        message: err.message || "Internal Server Error"
    });
}

module.exports = errorHandler;
