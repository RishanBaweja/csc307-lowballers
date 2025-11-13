import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import ProfileHeader from "./ProfileHeader";
import ItemCard from "./ItemCard";
import "./profile.css";

export default function ProfilePage() {
  return (
    <div className="profile-page">
      <ProfileHeader
        username="lowballer1"
        info="Member since 6767 * 12 items posted"
      />
      <main className="items-list">
        <ItemCard name="Couch" info="old ahh couch" />
      </main>
    </div>
  );
}
