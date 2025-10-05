import React from "react";
import { motion } from "framer-motion";

function Button({Name,width="w-full"}) {
  return (
    <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }} className={`bg-purple-600 hover:bg-purple-700 text-white font-bold text-md rounded-xl p-2 focus:ring-blue-500 ${width}`}>
      {Name}
    </motion.button>
  );
}

export default Button;
