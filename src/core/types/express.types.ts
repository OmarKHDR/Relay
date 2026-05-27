declare global {
    namespace Express {
        interface Request {
            ros?: Record<string, unknown>;
        }
    }
}

export {};
