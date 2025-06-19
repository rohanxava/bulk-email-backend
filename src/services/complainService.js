// const models = require("../utils/modelName");
// const db = require("../utils/mongooseMethods");
// const helperUtils = require("../utils/helper");
// const { Error_MSG } = require("../utils/const");


// const getNextComplainIdByCity = async (cityId) => {
//     try {
//         let countSeq = await db.findOneAndUpdate({
//                 collection: models.ComplainCount,
//                 query: { cityId: cityId },
//                 update: { $inc: { seqNumber: 1 } },
//                 options: { new: true, upsert: true, setDefaultsOnInsert: true}
//             });
//         if (countSeq) {
//             const city = await db.findOne({
//                 collection: models.City, 
//                 query: { _id: cityId }
//             });
//             const cityAbbreviation = city.cityname.substring(0, 2).toUpperCase(); 
//             return `${cityAbbreviation}${countSeq.seqNumber}`;
//         }
//     } catch (error) {
//         throw new Error(error.message);
//     }
// };

// module.exports = {
//     getNextComplainIdByCity
// };