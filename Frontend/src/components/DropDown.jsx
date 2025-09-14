import React from "react";

function DropDown({ width = "w-full" }) {
  return (
    <div className={width}>
      <select className="border border-gray-300 rounded-xl p-2 w-full">
        <option value="">Location</option>
        <option value="engineering">Engineering</option>
        <option value="design">Design</option>
        <option value="marketing">Marketing</option>
      </select>
    </div>
  );
}

export default DropDown;
