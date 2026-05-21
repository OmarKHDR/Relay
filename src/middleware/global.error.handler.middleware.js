import timestamper from "#utils/timestamp.js";

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        reason: err.message || 'internal server error',
        meta: { timestamp: timestamper() },
    });
};
