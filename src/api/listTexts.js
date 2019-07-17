import {
    checkDates,
    getInvalidAccountIdList,
    getInvalidIdentityIdList,
    getTextIdFromApiId,
    getInvalidApiIdList,
    getInvalidTextIdList,
} from './helpers';

// ============================================================
// Route
function listTexts(req, res) {
    const [queryParameters, errors] = getParameters(req);

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    const search = buildSearch(queryParameters);
}

function buildSearch({
    'author.account.id': authorAccountIdList,
    'author.idnetity.id': authorIdentityIdList,
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

    // Filter: authors
    if (authorAccountIdList.length || authorIdentityIdList.length) {
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
            query.nested.query.bool.filter.term.authors = {
                account: {
                    id: authorAccountIdList,
                },
            };
        }

        // Identity
        if (authorIdentityIdList.length) {
            query.nested.query.bool.filter.term.authors = {
                identity: {
                    id: authorIdentityIdList,
                },
            };
        }
    }

    // Filter: content
    if (content.length) {
        query.bool.should.push({
            term: {
                content,
            },
        });
    }

    // Filter: context
    if (contextIdList.length) {
        query.bool.filter.term.context = {
            id: contextIdList,
        };
    }

    // Filter: creationDate
    if (creationDateMax || creationDateMin) {
        query.bool.filter.range = {
            creationDate: {},
        };

        if (creationDateMin) {
            query.bool.filter.range.creationDate.gte = creationDateMin;
        }

        if (creationDateMax) {
            query.bool.filter.range.creationDate.lte = creationDateMax;
        }
    }

    // Filter: deletionDate
    if (deletionDateMin || deletionDateMax) {
        query.bool.filter.range = {
            deletionDate: {},
        };

        if (deletionDateMin) {
            query.bool.filter.range.deletionDate.gte = deletionDateMin;
        }

        if (deletionDateMax) {
            query.bool.filter.range.deletionDate.lte = deletionDateMax;
        }
    }

    // Filter: id
    if (idList.length) {
        query.ids = {
            values: idList.map(getTextIdFromApiId),
        };
    }

    // Filter: owners
    if (ownerIdList.length) {
        query.bool.filter.term.owner = {
            id: ownerIdList,
        };
    }

    // Filter: search
    if (search.length) {
        query.bool.should.push({
            multi_match: {
                query: search,
                fields: ['title', 'content'],
            },
        });
    }

    // Filter: title
    if (title.length) {
        query.bool.should.push({
            term: {
                title,
            },
        });
    }

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

    return searchParams;
}

/**
 * Get and check parameters from the equestr
 * @param {*} req
 */
function getParameters(req) {
    const {
        'creation-date.min': creationDateMinStr,
        'creation-date.max': creationDateMaxStr,
        'deletion-date.min': deletionDateMinStr,
        'deletion-date.max': deletionDateMaxStr,
        'pagination.offset': paginationOffset,
        'pagination.size': paginationSize,
        sort,
    } = req.query;

    const [
        [
            creationDateMax,
            creationDateMin,
            deletionDateMax,
            deletionDateMin,
        ],
        invalidDates,
    ] = checkDates([
        creationDateMaxStr,
        creationDateMinStr,
        deletionDateMaxStr,
        deletionDateMinStr,
    ]);

    // Parameter: author.account.id
    const authorAccountIdList = getListFromReq(req, 'author.account.id');
    const invalidAuthorAccountIdList = getInvalidAccountIdList(authorAccountIdList)
        .map(id => ({ parameter: 'author.account.id', error: 'INVALID_ID', value: id }));

    // Parameter: author.identity.id
    const authorIdentityIdList = getListFromReq(req, 'author.identity.id');
    const invalidAuthorIdentityIdList = getInvalidIdentityIdList(authorIdentityIdList)
        .map(id => ({ parameter: 'author.identity.id', error: 'INVALID_ID', value: id }));

    // Parameter: content
    const contentList = getListFromReq(req, 'content');

    // Parameter: context.id
    const contextIdList = getListFromReq(req, 'context.id');
    const invalidContextIdList = getInvalidApiIdList(contextIdList)
        .map(id => ({ parameter: 'context.id', error: 'INVALID_ID', value: id }));

    // Parameter: id
    const idList = getListFromReq(req, 'id');
    const invalidIdList = getInvalidTextIdList(idList)
        .map(id => ({ parameter: 'id', error: 'INVALID_ID', value: id }));

    // Parameter: owner.id
    const ownerIdList = getListFromReq(req, 'owner.id');
    const invalidOwnerId = getInvalidTextIdList(idList)
        .map(id => ({ parameter: 'id', error: 'INVALID_ID', value: id }));

    // Parameter: pagination.offset
    const paginationOffsetNumber = Number(paginationOffset);
    const paginationOffSetError = [];
    if (!Number.isInteger(paginationOffsetNumber)) {
        paginationOffSetError.push({
            parameter: 'pagination.offset', error: 'INVALID_INTEGER', value: paginationOffset,
        });
    }
    else if (paginationOffsetNumber < 0) {
        paginationOffSetError.push({
            parameter: 'pagination.offset', error: 'NEGATIVE_INTEGER', value: paginationOffsetNumber,
        });
    }

    // Parameter: pagination.size
    const paginationSizeNumber = Number(paginationSize);
    const paginationSizeError = [];
    if (!Number.isInteger(paginationSizeNumber)) {
        paginationSizeError.push({
            parameter: 'pagination.size', error: 'INVALID_INTEGER', value: paginationSize,
        });
    }
    else if (paginationSizeNumber <= 0) {
        paginationSizeError.push({
            parameter: 'pagination.size', error: 'NEGATIVE_INTEGER', value: paginationSizeNumber,
        });
    }

    // Parameter: search
    const searchList = getListFromReq(req, 'search');

    // Parameter: sort
    const reSort = /^([+-])([a-z][a-z-]+)/;
    const sortFields = [
        'creation-date',
        'deletion-date',
        'title',
        'content',
    ];
    const { sort: sortList, errors: sortErrors } = sort.reduce((acc, sortField) => {
        if (sortField === 'score') {
            acc.sort.push(sortField);
            return acc;
        }

        const exec = reSort.exec(sortField);

        if (!exec) {
            acc.errors.push({
                parameter: 'sort',
                error: 'INVALID_SORT',
                value: sortField,
            });
            return acc;
        }

        const [, field] = exec;

        if (!sortFields.includes(field)) {
            acc.errors.push({
                parameter: 'sort',
                error: 'UNKNOWN_FIELD',
                value: field,
            });
            return acc;
        }

        acc.sort.push(sortField);
        return acc;
    }, { sort: [], errors: [] });

    // Parameter: title
    const titleList = getListFromReq(req, 'title');

    return [
        {
            'author.account.id': authorAccountIdList,
            'author.identity.id': authorAccountIdList.authorIdentityIdList,
            'context.id': contextIdList,
            content: contentList,
            'creation-date.min': creationDateMin,
            'creation-date.max': creationDateMax,
            'deletion-date.min': deletionDateMin,
            'deletion-date.max': deletionDateMax,
            id: idList,
            'owner.id': ownerIdList,
            'pagination.offset': paginationOffSetError.length ? paginationOffsetNumber : undefined,
            'pagination.size': paginationSizeError.length ? paginationSizeNumber : undefined,
            search: searchList,
            sort: sortList,
            title: titleList,
        },
        [
            ...invalidAuthorAccountIdList,
            ...invalidAuthorIdentityIdList,
            ...invalidContextIdList,
            ...invalidIdList,
            ...invalidOwnerId,
            ...invalidDates,
            ...sortErrors,
            ...paginationOffSetError,
            ...paginationSizeError,
        ],
    ];
}

function getListFromReq(req, parameter) {
    return typeof req.query[parameter] === 'string'
        ? [req.query[parameter]]
        : req.query[parameter] || [];
}

// ============================================================
// Exports
export default listTexts;
