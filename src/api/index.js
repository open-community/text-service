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

    route = '/texts';
    app.get(route, findTexts);

    route = '/text';
    app.put(route, createText);

    route = '/text/:id';
    app.get(route, getText);
    app.delete(route, deleteText);
}

// ============================================================
// Exports
export default routes;
