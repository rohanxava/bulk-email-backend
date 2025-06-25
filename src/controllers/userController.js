const Annotation = require("../models/Annotation");
const User = require("../models/User");

exports.getUserAnnotations = async (req, res) => {
  try {
    const annotations = await Annotation.find({ userId: req.params.id });
    res.json(annotations);
  } catch (err) {
    console.error("Fetching user annotations failed:", err);
    res.status(500).json({ message: "Failed to fetch annotations" });
  }
};

// exports.getLeaderboard = async (req, res) => {
//   try {
//     const results = await Annotation.aggregate([
//       { $group: { _id: "$userId", count: { $sum: 1 } } },
//       { $sort: { count: -1 } },
//       {
//         $lookup: {
//           from: "users",
//           localField: "_id",
//           foreignField: "_id",
//           as: "user"
//         }
//       },
//       {
//         $project: {
//           name: { $arrayElemAt: ["$user.name", 0] },
//           count: 1
//         }
//       }
//     ]);
//     res.json(results);
//   } catch (err) {
//     console.error("Leaderboard fetch error:", err);
//     res.status(500).json({ message: "Failed to fetch leaderboard" });
//   }
// };


exports.getLeaderboard = async (req, res) => {
 
  try {
 
    const userId = req.user._id; 
 
 
 
    const results = await Annotation.aggregate([
 
      { $match: { userId: userId } }, // filter by logged-in user
 
      { $group: { _id: "$userId", count: { $sum: 1 } } },
 
      { $sort: { count: -1 } },
 
      {
 
        $lookup: {
 
          from: "users",
 
          localField: "_id",
 
          foreignField: "_id",
 
          as: "user"
 
        }
 
      },
 
      {
 
        $project: {
 
          username: { $arrayElemAt: ["$user.username", 0] },
 
          name: { $arrayElemAt: ["$user.name", 0] },
 
          count: 1
 
        }
 
      }
 
    ]);
 
 
 
    res.json(results);
 
  } catch (err) {
 
    console.error("Leaderboard fetch error:", err);
 
    res.status(500).json({ message: "Failed to fetch leaderboard" });
 
  }
 
};