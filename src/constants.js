// ============================================================
// Constants

const NB_PASSWORD_CHECK_BEFORE_LOCK = 10;
const PASSWORD_LOCK_DURATION = 10 * 60 * 1000; // 10 minutes

const MIN_LOGIN_SIZE = 2;
const MAX_LOGIN_SIZE = 128;

const MIN_PASSWORD_SIZE = 6;
const MAX_PASSWORD_SIZE = 128;

const LOGIN_VALIDATION_REGEXP = /^[a-zA-Z0-9@+.-_]+$/;

const BASE64_REGEXP = /^[a-zA-Z0-9-_]*$/;

// ============================================================
// Exports
export {
    BASE64_REGEXP,
    LOGIN_VALIDATION_REGEXP,
    MAX_LOGIN_SIZE,
    MAX_PASSWORD_SIZE,
    MIN_LOGIN_SIZE,
    MIN_PASSWORD_SIZE,
    NB_PASSWORD_CHECK_BEFORE_LOCK,
    PASSWORD_LOCK_DURATION,
};
