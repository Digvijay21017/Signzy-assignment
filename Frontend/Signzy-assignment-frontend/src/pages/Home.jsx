import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]); // ✅ Added Suggested Friends State
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // 🔹 Fetch User's Friends, Friend Requests, and Suggested Friends
  useEffect(() => {
    const fetchData = async () => {
      try {
        const friendsRes = await axios.get(
          `http://localhost:5000/api/friends/getFriends`,
          {
            headers: { Authorization: token },
          }
        );

        const requestsRes = await axios.get(
          `http://localhost:5000/api/friends/requests/`,
          {
            headers: { Authorization: token },
          }
        );

        const suggestionsRes = await axios.get(
          `http://localhost:5000/api/friends/suggestions`,
          {
            headers: { Authorization: token },
          }
        );

        setFriends(friendsRes.data);
        setFriendRequests(requestsRes.data);
        setSuggestedFriends(suggestionsRes.data); // ✅ Store Suggested Friends
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const acceptFriendRequest = async (friendId) => {
    try {
      // console.log(friendId);

      await axios.put(
        "http://localhost:5000/api/friends/accept",
        { friendId },
        { headers: { Authorization: token } }
      );

      setFriends([
        ...friends,
        friendRequests.find((req) => req.userId === friendId),
      ]);
      setFriendRequests(
        friendRequests.filter((req) => req.userId !== friendId)
      );
      alert("Friend request accepted!");
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const rejectFriendRequest = async (friendId) => {
    try {
      await axios.put(
        "http://localhost:5000/api/friends/reject",
        { friendId },
        { headers: { Authorization: token } }
      );
    } catch (error) {
      console.error("Error rejecting friend request", error);
    }
  };

  // 🔍 Search Users (Only when Button is Clicked)
  const handleSearch = async () => {
    if (!search) return;
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/users/search?query=${search}`,
        {
          headers: { Authorization: token },
        }
      );
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // ✉️ Send Friend Request
  const sendFriendRequest = async (friendId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/friends/request",
        { friendId },
        { headers: { Authorization: token } }
      );
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert(error.response?.data?.message || "Failed to send friend request.");
    }
  };

  // 🚀 Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🏠 Navbar */}
      <nav className="bg-blue-500 p-4 flex justify-between items-center text-white">
        <h1 className="text-2xl font-bold">Friend Finder</h1>
        <div>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* 🔍 Search Bar with Button */}
      <div className="flex justify-center mt-6">
        <input
          type="text"
          placeholder="Search friends..."
          className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="ml-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* 🔎 Search Results with Friend Request Button */}
      {searchResults.length > 0 && (
        <div className="mt-4 w-full max-w-md mx-auto bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Search Results</h2>
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="p-3 border-b last:border-b-0 flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => sendFriendRequest(user._id)}
                className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600"
              >
                Send Request
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🏠 Friends & Friend Requests Section */}
      <div className="flex justify-center mt-6 space-x-6">
        {/* 👥 Friends List */}
        <div className="w-full max-w-lg bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Your Friends
          </h2>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="p-3 border-b last:border-b-0 bg-blue-200 rounded-xl"
              >
                <p className="font-medium text-gray-800">{friend.username}</p>
                <p className="text-sm text-gray-500">{friend.email}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No friends found</p>
          )}
        </div>

        {/* ✉️ Friend Requests */}
        <div className="w-full max-w-lg bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Friend Requests
          </h2>
          {friendRequests.length > 0 ? (
            friendRequests.map((request) => (
              <div
                key={request._id}
                className="p-3 border-b last:border-b-0 flex justify-between items-center bg-emerald-200"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {request.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.email || "No email available"}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => acceptFriendRequest(request._id)}
                    className="bg-green-500 px-3 py-2 text-white rounded-lg mr-2 hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request._id)}
                    className="bg-red-500 px-3 py-2 text-white rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No friend requests</p>
          )}
        </div>
      </div>

      {/* 🤝 Suggested Friends */}
      <div className="mt-6 w-full max-w-lg mx-auto bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Suggested Friends
        </h2>
        {suggestedFriends.length > 0 ? (
          suggestedFriends.map((user) => (
            <div
              key={user._id}
              className="p-3 border-b last:border-b-0 flex justify-between items-center bg-yellow-200 rounded-xl"
            >
              <div>
                <p className="font-medium text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => sendFriendRequest(user._id)}
                className="bg-blue-500 px-3 py-2 text-white rounded-lg hover:bg-blue-600"
              >
                Add Friend
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No suggestions available</p>
        )}
      </div>
    </div>
  );
};

export default Home;
