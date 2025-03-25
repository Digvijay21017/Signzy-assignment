import User from "../models/User.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    // console.log(query);
    

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find(
      { username: { $regex: query, $options: "i" } }, // Case-insensitive search
      "username email _id" // Return only these fields
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
