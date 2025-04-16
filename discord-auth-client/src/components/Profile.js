import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = ({ user }) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    console.log("Profile component mounted");

    // Log the user prop to see its contents
    console.log("User prop:", user);

    // If user prop is available, use it directly
    if (user) {
      console.log("User prop found, using it directly:", user);
      setUserProfile(user); // Use the passed user prop if available
    } else {
      console.log("No user prop found, fetching profile...");

      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem("discord_token");
          console.log("Fetching profile with token:", token);

          // API request to fetch user data using the getMe endpoint
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/getMe`,
            {
              headers: { Authorization: `Bearer ${token}` }, // Use token from localStorage
            }
          );

          console.log("Fetched profile data:", response.data);
          setUserProfile(response.data); // Set the profile data from API response
        } catch (error) {
          console.error("Error fetching profile data", error);
        }
      };

      fetchProfile();
    }
  }, [user]);

  if (!userProfile) {
    console.log("User profile is loading...");
    return <div className="p-3">Loading...</div>;
  }

  console.log("Profile loaded successfully");

  return (
    <div className="flex justify-center min-h-screen mt-8">
      {/* Profile card container */}
      <div className="bg-[#7F66C9] p-8 rounded-lg shadow-lg w-80 h-80 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>

        <div className="mb-4">
          <img
            // Construct avatar URL from the discordId and avatar hash
            src={
              userProfile.avatar
                ? `https://cdn.discordapp.com/avatars/${userProfile.discordId}/${userProfile.avatar}.png`
                : "/default-avatar.png" // Use a default avatar if none exists
            }
            alt="Avatar"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
        </div>

        <div className="mb-4">
          <p>
            <strong className="font-semibold">{userProfile.discordName}</strong>
          </p>
          <p>
            <strong className="font-semibold">
              {userProfile.email || "No email provided"}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
