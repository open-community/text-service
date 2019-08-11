// ============================================================
// Import packages
import { http, ResourceType } from '@open-community/service-tools';

// ============================================================
// Functions
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
    const [
        paginationOffsetNumber,
        paginationOffSetError,
    ] = getPaginationOffsetParameter(paginationOffset);

    // Parameter: pagination.size
    const [paginationSizeNumber, paginationSizeError] = getPaginationSizeParameter(paginationSize);

    // Parameter: search
    const searchList = http.request.getListFromReq(req, 'search');

    // Parameter: sort
    const [sortList, sortErrors] = getSortParameters(sort);

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
            'pagination.offset': !paginationOffSetError.length ? paginationOffsetNumber : undefined,
            'pagination.size': !paginationSizeError.length ? paginationSizeNumber : undefined,
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

/**
 * Return the offset of the pagination pages.
 * @param {string} offsetStr - pagination.offset parameter value
 * @private
 */
function getPaginationOffsetParameter(offsetStr) {
    if (!offsetStr) {
        return [undefined, []];
    }

    const offset = Number(offsetStr);
    const errors = [];

    if (!Number.isInteger(offset)) {
        errors.push(
            new http.request.errors.InvalidParameterError({
                parameter: 'pagination.offset',
                value: offset,
                message: 'Not an integer',
            }),
        );
    }
    else if (offset <= 0) {
        errors.push(
            new http.request.errors.InvalidParameterError({
                parameter: 'pagination.offset',
                value: offset,
                message: 'Not a positive or 0 integer',
            }),
        );
    }

    return [
        offset,
        errors,
    ];
}

/**
 * Return the size of the pagination pages.
 * @param {string} sizeStr - pagination.size parameter value
 * @private
 */
function getPaginationSizeParameter(sizeStr) {
    if (!sizeStr) {
        return [undefined, []];
    }

    const size = Number(sizeStr);
    const errors = [];

    if (!Number.isInteger(size)) {
        errors.push(
            new http.request.errors.InvalidParameterError({
                parameter: 'pagination.size',
                value: size,
                message: 'Not an integer',
            }),
        );
    }
    else if (size <= 0) {
        errors.push(
            new http.request.errors.InvalidParameterError({
                parameter: 'pagination.size',
                value: size,
                message: 'Not a positive or 0 integer',
            }),
        );
    }

    return [
        size,
        errors,
    ];
}

/**
 * Return the list of fields to sort the texts by and the list of errors
 * @param {string[]} sort
 * @private
 */
function getSortParameters(sort) {
    if (!sort) {
        return [undefined, []];
    }

    const reSort = /^([+-])([a-z][a-z-]+)/;
    const sortFields = [
        'creation-date',
        'deletion-date',
        'title',
        'content',
    ];
    const { sort: sortList, errors: sortErrors } = (sort || []).reduce((acc, sortField) => {
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

    return [
        sortList,
        sortErrors,
    ];
}

// ============================================================
// Exports
export {
    getParameters,
};
