const crypto = require('crypto')
const config = require('../config')
const { getRecords } = require('../models/db-common')
const R = require('ramda')
const { isNotEmpty, removeBlankSpaces } = require('../constants')
const pagination = (totalItems, currentPage = 1, itemsPerPage = 10) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    currentPage = Math.max(1, Math.min(currentPage, totalPages))

    const from = (currentPage - 1) * itemsPerPage + 1
    const to = Math.min(from + itemsPerPage - 1, totalItems)

    const pagination = {
        page: currentPage,
        first_page_url: `/?page=1`,
        from: from,
        last_page: totalPages,
        links: [],
        next_page_url:
            currentPage < totalPages ? `/?page=${currentPage + 1}` : null,
        items_per_page: itemsPerPage.toString(),
        prev_page_url: currentPage > 1 ? `/?page=${currentPage - 1}` : null,
        to: to,
        total: totalItems,
    }

    // Create pagination links
    if (currentPage > 1) {
        pagination.links.push({
            url: pagination.prev_page_url,
            label: '&laquo; Previous',
            active: false,
            page: currentPage - 1,
        })
    } else {
        pagination.links.push({
            url: null,
            label: '&laquo; Previous',
            active: false,
            page: null,
        })
    }

    for (let i = 1; i <= totalPages; i++) {
        pagination.links.push({
            url: `/?page=${i}`,
            label: i.toString(),
            active: i === currentPage,
            page: i,
        })
    }

    if (currentPage < totalPages) {
        pagination.links.push({
            url: pagination.next_page_url,
            label: 'Next &raquo;',
            active: false,
            page: currentPage + 1,
        })
    } else {
        pagination.links.push({
            url: null,
            label: 'Next &raquo;',
            active: false,
            page: null,
        })
    }

    return {
        payload: {
            pagination: pagination,
        },
    }
}

const getDataFromTable = async (table, connection, setting) => {
    let joins = ''
    let columns = [
        { name: `${table}.id`, alias: 'id' },
        { name: `${table}.name`, alias: 'name' },
    ]
    const settingsObject = isNotEmpty(setting) ? JSON.parse(setting) : ''
    if (settingsObject != '' && isNotEmpty(settingsObject.join)) {
        let joinParts = settingsObject.join.split(' ')
        joins = [
            {
                type: joinParts[0],
                table: joinParts[2].split('=')[0].split('.')[0],
                on: joinParts[2],
            },
        ]
    }
    if (settingsObject != '' && isNotEmpty(settingsObject.column)) {
        let columnsArray = settingsObject.column.split(',')
        columns = columnsArray.map((col) => {
            if (col.includes('CONCAT')) {
                const removeConcat = R.compose(
                    R.replace('CONCAT(', ''),
                    R.replace(')', '')
                )
                let concatPart = removeConcat(col).split('as')

                return {
                    concat: removeBlankSpaces(concatPart[0].split(' ')),
                    alias: concatPart[1],
                }
            } else if (col.includes('as')) {
                return {
                    name: col.split('as')[0],
                    alias: col.split('as')[1],
                }
            } else {
                return {
                    name: col,
                    alias: col.includes('.') ? col.split('.')[1] : col,
                }
            }
        })
    }

    const rows = await getRecords({
        table,
        columns,
        order_by: 'asc',
        order_by_column: settingsObject.order_by,
        limit: 0,
        offset: 0,
        connection,
        joins: joins,
        pagination: false,
        where: '',
    })

    return rows
}

function generateRandomKey(size = 32) {
    return crypto.randomBytes(size).toString('hex')
}

// Encrypt function
function encrypt(text, encryptionKey) {
    const iv = crypto.randomBytes(16)
    const key = Buffer.concat(
        [Buffer.from(encryptionKey), Buffer.alloc(16)],
        16
    )
    const cipher = crypto.createCipheriv(config.ALGO_SECRET, key, iv) // Use AES-128-CBC if key is 16 bytes
    let encrypted = cipher.update(text, 'utf8')
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(text, encryptionKey) {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')

    // Pad encryptionKey to be exactly 16 bytes
    const key = Buffer.concat(
        [Buffer.from(encryptionKey), Buffer.alloc(16)],
        16
    )

    const decipher = crypto.createDecipheriv(config.ALGO_SECRET, key, iv) // Use AES-128-CBC if key is 16 bytes
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString('utf8')
}

module.exports = {
    pagination,
    getDataFromTable,
    generateRandomKey,
    encrypt,
    decrypt,
}
