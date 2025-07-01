const { ObjectId } = require('mongoose/lib/drivers/node-mongodb-native')
const dbModels = require('../models')

async function find({ collection, query, options, project, limit, skip, populate, sort }) {
    const result = await dbModels[collection]
        .find(query, project, options)
        .limit(limit)
        .sort(sort)
        .skip(skip)
        .populate(populate)
        .lean()
    return result
}

async function findOne({ collection, query, project, populate, sort }) {
    const result = await dbModels[collection]
        .findOne(query, project)
        .sort(sort)
        .populate(populate)
        .lean()
    return result
}

async function insertOne({ collection, document }) {
    const result = new dbModels[collection](document)
    await result.save()
    return result
}

async function insertMany({ collection, documents, options }) {
    const result = await dbModels[collection].insertMany(documents, options)
    return result
}

async function updateOne({ collection, query, update, options }) {
    const result = await dbModels[collection].updateOne(query, update, options)
    return result
}

async function updateMany({ collection, query, update, options }) {
    const result = await dbModels[collection].updateMany(query, update, options)
    return result
}

async function deleteOne({ collection, query, options }) {
    const result = await dbModels[collection].deleteOne(query, options)
    return result
}

async function deleteMany({ collection, query, options }) {
    const result = await dbModels[collection].deleteMany(query, options)
    return result
}

async function distinct({ collection, field, query }) {
    const result = await dbModels[collection].distinct(field, query)
    return result
}

async function aggregate({ collection, pipeline, options }) {
    const result = await dbModels[collection].aggregate(pipeline, options)
    return result
}

function createDocument({ collection, document }) {
    // TODO: This method is under development don;t use this one in Production
    return dbModels[collection](document)
}

async function countDocuments({ collection, query }) {
    const result = await dbModels[collection].countDocuments(query)
    return result
}

async function findByIdAndUpdate({ collection, id, update, options }) {
    const result = await dbModels[collection].findByIdAndUpdate(
        { _id: ObjectId(id) },
        update,
        options
    )
    return result
}

async function save({ document }) {
    const result = await document.save()
    return result
}

async function findByIdAndDelete({ collection, id, options }) {
    const result = await dbModels[collection].deleteOne({ _id: ObjectId(id) }, options)
    return result
}

async function findOneAndUpdate({ collection, query, update, options ,populate}) {
    const result = await dbModels[collection].findOneAndUpdate(query, update, options).populate(populate)
    return result
}

async function exists({ collection, query }) {
    const result = await dbModels[collection].exists(query)
    return result
}

async function paginate({ collection, query, options }) {
    const result = await dbModels[collection].paginate(query, options)
    if (result.docs.length == 0) result.totalPages = 0
    return result
}

module.exports = {
    find,
    findByIdAndDelete,
    createDocument,
    findByIdAndUpdate,
    findOne,
    findOneAndUpdate,
    insertMany,
    insertOne,
    save,
    deleteMany,
    deleteOne,
    countDocuments,
    aggregate,
    distinct,
    updateMany,
    updateOne,
    exists,
    paginate,
    ObjectId
}
