const R = require('ramda')
const logger = require('../logger')
const {
    buildWhereCondition,
    replaceFilterWithColumnNames,
    generateWhereClauseWithLike,
    buildLikeCondition,
    isNotNilOrEmpty,
} = require('../constants')

const executeQuery = async (query, params, db) => {
    logger.info({ query, params })

    try {
        const [results] = await db.execute(query, params)
        return results
    } catch (err) {
        throw new Error('Database operation failed')
    }
}

const insertRecord = async (table, data, connection) => {
    const columns = Object.keys(data).join(', ')
    const values = Object.values(data)
    const placeholders = values.map(() => '?').join(', ')
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
    return executeQuery(query, values, connection)
}

const updateRecord = async (table, data, whereConditions, connection) => {
    const columns = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(', ')
    const values = [...Object.values(data)]
    const whereClause = Object.keys(whereConditions)
        .map((key) => `${key} = ?`)
        .join(' AND ')
    const whereValues = Object.values(whereConditions)
    const queryValues = [...values, ...whereValues]
    const query = `UPDATE ${table} SET ${columns} WHERE ${whereClause}`
    return executeQuery(query, queryValues, connection)
}

const getRecordById = async (table, whereObj, connection) => {
    const whereClause = buildWhereClause(whereObj)

    const whereValues = Object.values(whereObj).map((value) =>
        typeof value === 'object' ? value.value : value
    )
    const query = `SELECT * FROM ${table}${whereClause}`
    return executeQuery(query, whereValues, connection)
}

const getAllRecords = async (table, connection) => {
    const query = `SELECT * FROM ${table}`
    return executeQuery(query, '', connection)
}

const getRecordsCount = async (options) => {
    const {
        table,
        columns,
        order_by = 'desc',
        order_by_column = table + '.id',
        connection,
        joins = [],
        whereConditions = [],
        whereConditionsFilter,
        globalFilter,
    } = options

    const order_by_columns = getOrderByColumnValue(columns, order_by_column)
    const joinString = joins
        .map((join) => {
            const { type = 'INNER', table: joinTable, on } = join
            return `${type} JOIN ${joinTable} ON ${on}`
        })
        .join(' ')
    let where =
        whereConditions.length !== 0
            ? buildWhereCondition(
                  replaceFilterWithColumnNames(whereConditions, columns)
              )
            : []

    let whereConditionsFilters =
        whereConditionsFilter.length !== 0
            ? buildLikeCondition(
                  replaceFilterWithColumnNames(whereConditionsFilter, columns)
              )
            : []

    const whereKeys = Object.keys(where)
    const gloabLFilteringWhere = globalFilter
        ? generateWhereClauseWithLike(globalFilter, columns)
        : ''

    let whereCondition =
        whereKeys.length > 0
            ? isNotNilOrEmpty(gloabLFilteringWhere)
                ? ` WHERE (${where.whereClause}) AND (${gloabLFilteringWhere} `
                : ` WHERE (${where.whereClause})`
            : isNotNilOrEmpty(gloabLFilteringWhere)
              ? ` WHERE (${gloabLFilteringWhere})`
              : ''

    whereCondition =
        isNotNilOrEmpty(whereCondition) &&
        isNotNilOrEmpty(whereConditionsFilters)
            ? `${whereCondition} AND (${whereConditionsFilters})`
            : isNotNilOrEmpty(whereConditionsFilters)
              ? ` WHERE ${whereConditionsFilters}`
              : isNotNilOrEmpty(whereCondition)
                ? whereCondition
                : ''

    const query = `SELECT count(${table}.id) as total_records FROM ${table} ${joinString}${whereCondition} order by ${order_by_columns} ${order_by}`
    return executeQuery(query, where?.whereValues || '', connection)
}

const getRecords = async (options) => {
    const {
        table,
        columns,
        order_by = 'desc',
        order_by_column = 'id',
        limit,
        offset,
        connection,
        joins = [],
        pagination = false,
        whereConditions = [],
        globalFilter,
        whereConditionsFilter = [],
    } = options

    const order_by_columns = getOrderByColumnValue(columns, order_by_column)

    let where =
        whereConditions.length !== 0
            ? buildWhereCondition(
                  replaceFilterWithColumnNames(whereConditions, columns)
              )
            : []

    let whereConditionsFilters =
        whereConditionsFilter.length !== 0
            ? buildLikeCondition(
                  replaceFilterWithColumnNames(whereConditionsFilter, columns)
              )
            : []

    const columnsString =
        Array.isArray(columns) && columns.length > 0
            ? columns
                  .map((col) => {
                      if (col.concat) {
                          return `CONCAT_WS(' ', ${col.concat.join(', ')}) AS ${col.alias}`
                      } else {
                          return `${col.name} AS ${col.alias}`
                      }
                  })
                  .join(', ')
            : '*'

    const joinString =
        Array.isArray(joins) && joins.length > 0
            ? joins
                  .map((join) => {
                      const { type = 'INNER', table: joinTable, on } = join
                      return `${type} JOIN ${joinTable} ON ${on}`
                  })
                  .join(' ')
            : ''

    const order = ` ORDER BY ${order_by_columns} ${order_by}`
    const _offset = pagination ? ` OFFSET ${offset}` : ''
    const query_limit = limit ? ` LIMIT ${limit}` : ''
    const whereKeys = Object.keys(where)
    const gloabLFilteringWhere = globalFilter
        ? generateWhereClauseWithLike(globalFilter, columns)
        : ''

    let whereCondition =
        whereKeys.length > 0
            ? isNotNilOrEmpty(gloabLFilteringWhere)
                ? ` WHERE (${where.whereClause}) AND (${gloabLFilteringWhere} `
                : ` WHERE (${where.whereClause})`
            : isNotNilOrEmpty(gloabLFilteringWhere)
              ? ` WHERE (${gloabLFilteringWhere})`
              : ''

    whereCondition =
        isNotNilOrEmpty(whereCondition) &&
        isNotNilOrEmpty(whereConditionsFilters)
            ? `${whereCondition} AND (${whereConditionsFilters})`
            : isNotNilOrEmpty(whereConditionsFilters)
              ? ` WHERE ${whereConditionsFilters}`
              : isNotNilOrEmpty(whereCondition)
                ? whereCondition
                : ''

    const query = `SELECT ${columnsString} FROM ${table} ${joinString}${whereCondition} ${order} ${query_limit} ${_offset}`

    return executeQuery(query, where?.whereValues || '', connection)
}

const getOrderByColumnValue = (columns, order_by_column) => {
    for (const column of columns) {
        if (column?.name) {
            const columnParts = column.name.split('.')
            if (columnParts.length > 1) {
                const columnName = columnParts[columnParts.length - 1]
                if (columnName === order_by_column) {
                    return (
                        columnParts[columnParts.length - 2] +
                        '.' +
                        order_by_column
                    )
                }
            } else {
                return order_by_column
            }
        }
    }

    return order_by_column
}

const buildWhereClause = (whereObj) => {
    if (R.isEmpty(whereObj) || R.isNil(whereObj)) {
        return ''
    }

    const whereConditions = Object.keys(whereObj)
        .map((key) => {
            const value = whereObj[key]
            if (value && value.not) {
                return `${key} != ?`
            }
            return `${key} = ?`
        })
        .join(' AND ')

    return ` WHERE ${whereConditions}`
}

module.exports = {
    insertRecord,
    updateRecord,
    getRecordById,
    getAllRecords,
    getRecords,
    getRecordsCount,
    executeQuery,
}
