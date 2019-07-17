// ============================================================
// Import modules
import {
    MIN_LOGIN_SIZE,
    MIN_PASSWORD_SIZE,
    MAX_LOGIN_SIZE,
    MAX_PASSWORD_SIZE,
} from '../constants';

// ============================================================
// Module's constants and variables

const ErrorMessages = {
    INVALID_ID: 'Invalid ID',
    LOGIN_ALREADY_USED: 'Login already used',
    NO_LOGIN_PROVIDED: 'No login provided',
    NO_PASSWORD_PROVIDED: 'No password provided',
    LOGIN_TOO_SHORT: `Login too short (min: ${MIN_LOGIN_SIZE})`,
    PASSWORD_TOO_SHORT: `Password too short (min: ${MIN_PASSWORD_SIZE})`,
    LOGIN_TOO_LONG: `Login too long (min: ${MAX_LOGIN_SIZE})`,
    PASSWORD_TOO_LONG: `Password too long (min: ${MAX_PASSWORD_SIZE})`,
    INVALID_REQUEST: 'Invalid request',
};

const ApiErrors = Object.keys(ErrorMessages).reduce((acc, code) => {
    acc[code] = code;
    return acc;
}, {});

// ============================================================
// Functions
function buildError(code, context, detail) {
    const message = ErrorMessages[code];

    if (!message) {
        throw new Error(`Unknown error code: ${code}`);
    }

    const error = {
        code,
        error: ErrorMessages[code],
    };

    if (context) {
        error.context = context;
    }

    if (detail) {
        error.error += `: ${detail}`;
    }

    return error;
}

// ============================================================
// Exports
export {
    ApiErrors,
    buildError,
};
