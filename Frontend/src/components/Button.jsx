import React from "react";

function Button({Name,width="w-full"}) {
  return (
    <button className={`bg-blue-500 hover:bg-blue-400 text-white text-md rounded-xl p-2 focus:ring-blue-500 ${width}`}>
      {Name}
    </button>
  );
}

export default Button;
