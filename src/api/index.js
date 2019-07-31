// ============================================================
// Import modules
import createText from './createText';
import deleteText from './deleteText';
import getText from './getText';
import listTexts from './listTexts';

// ============================================================
// Functions
function routes(app) {
    let route;

    route = '/texts';
    app.get(route, listTexts);

    route = '/text';
    app.put(route, createText);

    route = '/text/:id';
    app.get(route, getText);
    app.delete(route, deleteText);
    app.post(route, updateText);
}

// ============================================================
// Exports
export default routes;
