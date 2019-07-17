// ============================================================
// Import modules
import checkPassword from './checkPassword';
import createAccount from './createAccount';
import deleteAccount from './deleteAccount';
import getAccount from './getAccount';
import listAccount from './listAccounts';
import updateAccount from './updateAccount';
import updatePassword from './updatePassword';

// ============================================================
// Functions
function routes(app) {
    let route;

    // /accounts
    route = '/accounts';
    app.get(route, listAccount);

    // /account
    route = '/account';
    app.put('/account', createAccount);

    // account/:id
    route = '/account/:id';
    app.get(route, getAccount);
    app.delete(route, deleteAccount);
    app.post(route, updateAccount);

    // account/:id/password
    route = '/account/:id/password';
    app.post(route, updatePassword);

    // account/:id/password/check
    route = '/account/:id/password/check';
    app.post(route, checkPassword);
}

// ============================================================
// Exports
export default routes;
