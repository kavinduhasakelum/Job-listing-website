import React from "react";

const TeamCard = ({ name, role, img, linkedin }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300">
      <img src={img} alt={name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-purple-500" />
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500 mb-3">{role}</p>
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noreferrer" className="text-sm text-purple-600 hover:underline">
          LinkedIn
        </a>
      )}
    </div>
  );
};

export default TeamCard;
