const Boom = require('@hapi/boom')
const R = require('ramda')
const messages = require('../messages/messages')
const { getRecords } = require('../models/db-common')
const getRoleBasedUrl = async (req, h) => {
    let connection
    try {
        connection = await req.server.mysqlPool.getConnection()
        const { permissions, is_admin } = req.auth.credentials
        const type = req.query.type || ''
        const whereConditions = [
            { id: 'is_active', value: 1 },
            { id: 'menu_category', value: type },
        ]
        let rows = await getRecords({
            table: 'menu',
            columns: [],
            order_by: 'asc',
            order_by_column: 'display_order',
            limit: 0,
            offset: 0,
            connection,
            joins: [],
            pagination: false,
            whereConditionsFilter: [],
            globalFilter: '',
            whereConditions,
        })

        if (rows.length !== 0 && !is_admin) {
            rows = rows.map((data) => {
                let status =
                    permissions.length !== 0 &&
                    permissions.find((prData) => {
                        if (
                            prData.page_id == data.id ||
                            prData.page_id == data.parent_menu_id
                        )
                            return prData
                    })

                return status !== undefined
                    ? { ...data, actions: status.actions }
                    : null
            })
            rows = R.filter(R.identity, rows)
        }

        return h
            .response(
                messages.successResponse(
                    {
                        listing: rows,
                        isAdmin: is_admin ? 1 : 0,
                    },
                    'Url generated successfully!'
                )
            )
            .code(200)
    } catch (error) {
        if (Boom.isBoom(error)) {
            error.output.payload.isError = true
            throw error
        } else {
            throw messages.createBadRequestError(error.message)
        }
    } finally {
        if (connection) await connection.release()
    }
}

const getSignedUrl = async (req, h) => {
    try {
        const objectKey = req.query.key || ''
        const signedUrl =
            await req.server.plugins.s3Plugin.getSignedUrl(objectKey)
        return h
            .response(
                messages.successResponse(
                    { url: signedUrl },
                    'Url generated successfully!'
                )
            )
            .code(200)
    } catch (error) {
        if (Boom.isBoom(error)) {
            error.output.payload.isError = true
            throw error
        } else {
            throw messages.createBadRequestError(error.message)
        }
    }
}

module.exports = {
    getSignedUrl,
    getRoleBasedUrl,
}
