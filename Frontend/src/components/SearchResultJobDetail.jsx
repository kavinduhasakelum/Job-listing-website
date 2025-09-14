import React from "react";
import Button from "./Button";
function SearchResultJobDetail() {
  return (
    <div className="flex justify-between w-full">
      <div className="flex flex-col gap-2 w-full">
        <p className="text-md font-semibold">Product Designer</p>
        <p className="text-sm font-light">Acme Corp. Remote</p>
      </div>
      <Button Name="Apply Now" width="w-[120px]" />
    </div>
  );
}

export default SearchResultJobDetail;
