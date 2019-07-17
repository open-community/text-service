// ============================================================
// Errors
class AccountLockedError extends Error {
    constructor() {
        super('Account locked');
    }
}

// ============================================================
// Exports
export default AccountLockedError;
