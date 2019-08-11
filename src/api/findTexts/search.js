// ============================================================
// Import modules
import { getTextIdFromApiId } from '../helpers';

// ============================================================
// Functions
function buildSearch({
    'author.account.id': authorAccountIdList,
    'author.identity.id': authorIdentityIdList,
    content,
    'context.id': contextIdList,
    'creation-date.max': creationDateMax,
    'creation-date.min': creationDateMin,
    'deletion-date.max': deletionDateMax,
    'deletion-date.min': deletionDateMin,
    id: idList,
    'owner.id': ownerIdList,
    'pagination.offset': paginationOffset,
    'pagination.size': paginationSize,
    search,
    sort,
    title,
}) {
    const query = {
        bool: {
            filter: {
                term: {},
            },

            should: [],
        },
    };

    const searchParams = {
        query,
    };

    appendAuthor(query, authorAccountIdList, authorIdentityIdList);
    appendContent(query, content);
    appendContext(query, contextIdList);
    appendCreationDate(query, creationDateMin, creationDateMax);
    appendDeletionDate(query, deletionDateMin, deletionDateMax);
    appendIdList(query, idList);
    appendOwners(query, ownerIdList);
    appendSearch(query, search);
    appendTitle(query, title);

    // ==============================
    // Pagination and sorting
    if (paginationOffset) {
        searchParams.from = paginationOffset;
    }

    if (paginationSize) {
        searchParams.size = paginationSize;
    }

    if (sort) {
        const re = /^([+-])([a-z][a-z-]+)/;
        searchParams.sort = sort.map((fieldSort) => {
            const [, orderSymbol, field] = re.exec(fieldSort);

            const order = orderSymbol === '+'
                ? 'asc'
                : 'desc';

            return { [field]: order };
        });
    }

    cleanQuery(searchParams);

    return searchParams;
}

/**
 *
 * @param {Object} query
 */
function cleanQuery({ query }) {
    if (!query.bool.filter.term.length) {
        // eslint-disable-next-line no-param-reassign
        delete query.bool.filter.term;
    }

    if (!Object.keys(query.bool.filter).length) {
        // eslint-disable-next-line no-param-reassign
        delete query.bool.filter;
    }

    if (!query.bool.should.length) {
        // eslint-disable-next-line no-param-reassign
        delete query.bool.should;
    }

    if (!Object.keys(query.bool).length) {
        // eslint-disable-next-line no-param-reassign
        delete query.bool;
    }

    return { query };
}

function appendAuthor(query, authorAccountIdList, authorIdentityIdList) {
    if (authorAccountIdList.length || authorIdentityIdList.length) {
        // eslint-disable-next-line no-param-reassign
        query.nested = {
            path: 'authors',
            query: {
                bool: {
                    filter: {
                        term: {
                            authors: {},
                        },
                    },
                },
            },
        };

        // Account
        if (authorAccountIdList.length) {
            // eslint-disable-next-line no-param-reassign
            query.nested.query.bool.filter.term.authors = {
                account: {
                    id: authorAccountIdList,
                },
            };
        }

        // Identity
        if (authorIdentityIdList.length) {
            // eslint-disable-next-line no-param-reassign
            query.nested.query.bool.filter.term.authors = {
                identity: {
                    id: authorIdentityIdList,
                },
            };
        }
    }
}

function appendContent(query, content) {
    if (!content.length) {
        return;
    }

    query.bool.should.push({
        term: {
            content,
        },
    });
}

function appendContext(query, contextIdList) {
    if (!contextIdList.length) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    query.bool.filter.term.context = {
        id: contextIdList,
    };
}

function appendCreationDate(query, creationDateMin, creationDateMax) {
    if (!creationDateMin && !creationDateMax) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    query.bool.filter.range = {
        deletionDate: {},
    };

    if (creationDateMin) {
        // eslint-disable-next-line no-param-reassign
        query.bool.filter.range.deletionDate.gte = creationDateMin;
    }

    if (creationDateMax) {
        // eslint-disable-next-line no-param-reassign
        query.bool.filter.range.deletionDate.lte = creationDateMax;
    }
}

function appendDeletionDate(query, deletionDateMin, deletionDateMax) {
    if (!deletionDateMin && !deletionDateMax) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    query.bool.filter.range = {
        deletionDate: {},
    };

    if (deletionDateMin) {
        // eslint-disable-next-line no-param-reassign
        query.bool.filter.range.deletionDate.gte = deletionDateMin;
    }

    if (deletionDateMax) {
        // eslint-disable-next-line no-param-reassign
        query.bool.filter.range.deletionDate.lte = deletionDateMax;
    }
}

/**
 *
 * @param {string} query
 * @param {ApiID[]} idList
 */
function appendIdList(query, idList) {
    if (!idList.length) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    query.ids = {
        values: idList.map(getTextIdFromApiId),
    };
}

/**
 *
 * @param {string} query
 * @param {ApiID[]} ownerIdList
 */
function appendOwners(query, ownerIdList) {
    if (!ownerIdList.length) {
        return;
    }

    // eslint-disable-next-line no-param-reassign
    query.bool.filter.term.owner = {
        id: ownerIdList,
    };
}

/**
 * Append the search if necessary to the search parameters
 * @param {Object} query
 * @param {string} search
 */
function appendSearch(query, search) {
    if (search.length) {
        query.bool.should.push({
            multi_match: {
                query: search,
                fields: ['title', 'content'],
            },
        });
    }
}

/**
 * Append the title if necessary to the search parameters
 * @param {Object} query
 * @param {string} title
 */
function appendTitle(query, title) {
    if (title.length) {
        query.bool.should.push({
            term: {
                title,
            },
        });
    }
}

// ============================================================
// Exports
export {
    buildSearch,
};
