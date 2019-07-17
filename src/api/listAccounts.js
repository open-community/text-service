import _ from 'lodash';
import {
    getAccountIdFromApiId,
    checkLogin,
    dbAccountToApi,
} from './helpers';
import { Account } from '../models';

// ============================================================
// Module's constants and variables
async function listAccounts(req, res) {
    const {
        'creation-date.min': creationDateMinStr,
        'creation-date.max': creationDateMaxStr,
        'deletion-date.min': deletionDateMinStr,
        'deletion-date.max': deletionDateMaxStr,
    } = req.query;

    const allLogins = typeof req.query.login === 'string'
        ? [req.query.login]
        : req.query.login || [];

    const allApiId = typeof req.query.id === 'string'
        ? [req.query.id]
        : req.query.id || [];

    const [listId, invalidApiIds] = checkApiId(allApiId);
    const [listLogins, invalidLogins] = checkLogins(allLogins);

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

    if (invalidApiIds.length || invalidLogins.length || invalidDates.length) {
        const errors = {
            id: invalidApiIds,
            login: invalidLogins,
            dates: invalidDates,
        };

        res.status(400).json(errors);
        return;
    }

    const query = createQuery(
        listId,
        listLogins,

        // Creation date
        {
            min: creationDateMin,
            max: creationDateMax,
        },

        // Deletion date
        {
            min: deletionDateMin,
            max: deletionDateMax,
        },
    );

    const dbAccounts = await Account.find(query);
    const accounts = dbAccounts.map(dbAccountToApi);
    res.status(200).json(accounts);
}

function createQuery(
    listId,
    listLogins,
    creationDate = {},
    deletionDate = {},
) {
    const query = {};

    if (listId.length) {
        query.id = listId.length === 1
            ? listId[0]
            : { $in: listId };
    }

    if (listLogins.length) {
        query.login = listLogins.length === 1
            ? listLogins[0]
            : { $in: listLogins };
    }

    // Creation date
    if (creationDate.min || creationDate.max) {
        query.creationDate = {};

        if (creationDate.min) {
            query.creationDate.$gte = creationDate.min;
        }

        if (creationDate.max) {
            query.creationDate.$lte = creationDate.max;
        }
    }

    // Deletion date
    if (deletionDate.min || deletionDate.max) {
        query.deletionDate = {};

        if (deletionDate.min) {
            query.deletionDate.$gte = deletionDate.min;
        }

        if (deletionDate.max) {
            query.deletionDate.$lte = deletionDate.max;
        }
    }

    return query;
}

/**
 * Check and return the list of account ID
 * @param {string[]} list
 * @returns {Array.<id: string[], invalidApiId: string[]>}
 * @private
 */
function checkApiId(list) {
    // Checking ID
    const invalidIdList = [];

    const listId = list.map((apiID) => {
        const id = getAccountIdFromApiId(apiID);

        if (!id) {
            invalidIdList.push([apiID, ['INVALID_ID']]);
        }

        return id;
    });

    return [
        listId,
        invalidIdList,
    ];
}

function checkDates(datesString) {
    const invalidDates = [];

    const dates = datesString.map((dateString) => {
        if (!dateString) {
            return null;
        }

        const date = new Date(dateString);


        if (Number.isNaN(date.getTime())) {
            invalidDates.push(dateString);
            return null;
        }

        return date;
    });

    return [
        dates,
        _.uniq(invalidDates),
    ];
}

/**
 * Check and return the list all logins.
 * @param {string[]} list
 * @returns {Array.<logins: string[], invalidLogins: string[]>}
 * @private
 */
function checkLogins(list) {
    // Checking login
    const listLogins = _.uniq(list);

    /**
     * List all errors for each logins
     * @type {Array.<login, error[]>}
     */
    const invalidLogins = listLogins
        .map(checkLogin)
        .map((errors, index) => [listLogins[index], errors])
        .filter(([, errors]) => errors.length);

    return [
        listLogins,
        invalidLogins,
    ];
}

// ============================================================
// Exports
export default listAccounts;
