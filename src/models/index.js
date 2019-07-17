// ============================================================
// Import packages
import mongoose from 'mongoose';

// ============================================================
// Import modules
import AccountSchema from './AccountSchema';

// ============================================================
// Module's constants and variables

const Account = mongoose.model('Account', AccountSchema);

// ============================================================
// Exports
export {
    Account,
};
