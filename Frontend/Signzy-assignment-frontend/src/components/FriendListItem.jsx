import React from "react";

const FriendListItem = ({friend}) => {
  return (
    <div key={friend._id} className="p-3 border-b last:border-b-0">
      <p className="font-medium text-gray-800">{friend.username}</p>
      <p className="text-sm text-gray-500">{friend.email}</p>
    </div>
  );
};

export default FriendListItem;
