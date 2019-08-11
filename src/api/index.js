// ============================================================
// Import modules
import createText from './createText';
import deleteText from './deleteText';
import getText from './getText';
import findTexts from './findTexts';

// ============================================================
// Functions
function routes(app) {
    let route;

    route = '/text';
    app.get(route, wrapRoute(findTexts));
    app.put(route, wrapRoute(createText));

    route = '/text/:id';
    app.get(route, wrapRoute(getText));
    app.delete(route, wrapRoute(deleteText));
}

function wrapRoute(route) {
    return routeWrapper.bind(undefined, route);
}

async function routeWrapper(route, req, res, ...args) {
    try {
        await route(req, res, ...args);
    }
    catch (err) {
        res.status(500).send(err);
        throw err;
    }

    // If no response sent, it means that an error occurs
    if (!res.headersSent) {
        res.status(500).send();
    }
}

// ============================================================
// Exports
export default routes;
