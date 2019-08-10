/* eslint-disable arrow-parens */

// ============================================================
// Import packages
import { http, ResourceType } from '@open-community/service-tools';

// ============================================================
// Import modules
import {
    getTextIdFromApiId,
} from './helpers';

import { Text } from '../models';

// ============================================================
// Route
async function findTexts(req, res) {
    const [queryParameters, errors] = getParameters(req);

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    const search = buildSearch(queryParameters);

    const texts = await Text.findText(search);

    req.json(texts);
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
        'pagination.offset': paginationOffset,
        'pagination.size': paginationSize,
        sort,
    } = req.query;

    // Parameter: creation-date.max
    const creationDateMax = http.request.getOneDate(req, 'creation-date.max');
    const creationDateMin = http.request.getOneDate(req, 'creation-date.min');
    const deletionDateMax = http.request.getOneDate(req, 'deletion-date.max');
    const deletionDateMin = http.request.getOneDate(req, 'deletion-date.min');

    // Parameter: author.account.id
    const authorAccountInfo = http.request.getListApiIdFromReq(req, 'author.account.id', ResourceType.ACCOUNT);

    // Parameter: author.identity.id
    const authorIdentityInfo = http.request.getListApiIdFromReq(req, 'author.identity.id', ResourceType.IDENTITY);

    // Parameter: content
    const contentList = http.request.getListFromReq(req, 'content');

    // Parameter: context.id
    const contextInfo = http.request.getListApiIdFromReq(req, 'context.id');

    // Parameter: id
    const idInfo = http.request.getListApiIdFromReq(req, 'id', ResourceType.TEXT);

    // Parameter: owner.id
    const ownerInfo = http.request.getListApiIdFromReq(req, 'owner.id', ResourceType.ACCOUNT);

    // Parameter: pagination.offset
    const paginationOffsetNumber = Number(paginationOffset);
    const paginationOffSetError = [];
    if (!Number.isInteger(paginationOffsetNumber)) {
        paginationOffSetError.push(
            new http.request.errors.InvalidParameterHttpError({
                parameter: 'pagination.offset',
                value: paginationOffset,
                message: 'Not an integer',
            }),
        );
    }
    else if (paginationOffsetNumber < 0) {
        paginationOffSetError.push(
            new http.request.errors.InvalidParameterHttpError({
                parameter: 'pagination.offset',
                value: paginationOffset,
                message: 'Not a positive or 0 integer',
            }),
        );
    }

    // Parameter: pagination.size
    const paginationSizeNumber = Number(paginationSize);
    const paginationSizeError = [];
    if (!Number.isInteger(paginationSizeNumber)) {
        paginationOffSetError.push(
            new http.request.errors.InvalidParameterError({
                parameter: 'pagination.size',
                value: paginationOffset,
                message: 'Not an integer',
            }),
        );
    }
    else if (paginationSizeNumber <= 0) {
        paginationOffSetError.push(
            new http.request.errors.InvalidParameterError({
                parameter: 'pagination.size',
                value: paginationOffset,
                message: 'Not a positive or 0 integer',
            }),
        );
    }

    // Parameter: search
    const searchList = http.request.getListFromReq(req, 'search');

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
            const error = new http.request.errors.InvalidParameterError({
                parameter: 'sort',
                value: sortField,
            });
            acc.errors.push(error);
            return acc;
        }

        const [, field] = exec;

        if (!sortFields.includes(field)) {
            const error = new http.request.errors.InvalidParameterError({
                parameter: 'sort',
                value: field,
                message: 'unknown field',
            });
            acc.errors.push(error);
            return acc;
        }

        acc.sort.push(sortField);
        return acc;
    }, { sort: [], errors: [] });

    // Parameter: title
    const titleList = http.request.getListFromReq(req, 'title');

    return [
        {
            'author.account.id': authorAccountInfo.value,
            'author.identity.id': authorIdentityInfo.value,
            'context.id': contextInfo.value,
            content: contentList,
            'creation-date.min': creationDateMin.value,
            'creation-date.max': creationDateMax.value,
            'deletion-date.min': deletionDateMin.value,
            'deletion-date.max': deletionDateMax.value,
            id: idInfo.value,
            'owner.id': ownerInfo.value,
            'pagination.offset': paginationOffSetError.length ? paginationOffsetNumber : undefined,
            'pagination.size': paginationSizeError.length ? paginationSizeNumber : undefined,
            search: searchList,
            sort: sortList,
            title: titleList,
        },
        [
            ...authorAccountInfo.errors,
            ...authorIdentityInfo.errors,
            ...contextInfo.errors,
            ...idInfo.errors,
            ...ownerInfo.errors,
            ...creationDateMax.errors,
            ...creationDateMin.errors,
            ...deletionDateMax.errors,
            ...deletionDateMin.errors,
            ...sortErrors,
            ...paginationOffSetError,
            ...paginationSizeError,
        ],
    ];
}

// ============================================================
// Exports
export default findTexts;
