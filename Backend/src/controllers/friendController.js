import User from "../models/User.js";

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const senderId = req.user.id;

    if (senderId === friendId) {
      return res.status(400).json({ message: "You cannot send a request to yourself." });
    }

    const sender = await User.findById(senderId);
    const friend = await User.findById(friendId);

    if (!friend || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request already sent
    if (friend.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    // Store request (only userId)
    friend.friendRequests.push(senderId);
    await friend.save();

    res.json({ message: `Friend request sent.` });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
  const { friendId } = req.body;
  const user = await User.findById(req.user.id);
  const friend = await User.findById(friendId);

  if (!friend || !user.friendRequests.includes(friendId)) {
    return res.status(400).json({ message: "No friend request found." });
  }

  user.friends.push(friendId);
  friend.friends.push(user._id);
  user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);

  await user.save();
  await friend.save();

  res.json({ message: "Friend request accepted." });
};

export const rejectFriendRequest = async (req, res) => {
  const { friendId } = req.body;
  const user = await User.findById(req.user.id);
  
  user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);
  await user.save();
  
  res.json({ message: "Friend request rejected." });
};

export const getFriendRequests = async (req, res) => {
  try {
    // console.log(req.user.id);
    
    const user = await User.findById(req.user.id).populate("friendRequests","username email _id");

    if (!user) {
      return res.status(404).json({ message: "No pending friend requests" });
    }

    // console.log(user.friendRequests);
    
    res.json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friends", "username email _id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const suggestFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friends", "_id username email friends");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let mutualFriends = new Set();

    // Get friends of the user
    user.friends.forEach((friend) => {
      friend.friends.forEach((friendOfFriend) => {
        // Ensure the suggested friend is not the user or already in the user's friends list
        if (
          friendOfFriend.toString() !== req.user.id &&
          !user.friends.some((f) => f._id.toString() === friendOfFriend.toString())
        ) {
          mutualFriends.add(friendOfFriend.toString());
        }
      });
    });

    // Fetch user details of suggested friends
    const suggestedFriends = await User.find(
      { _id: { $in: Array.from(mutualFriends) } },
      "username email _id"
    );

    res.json(suggestedFriends);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};