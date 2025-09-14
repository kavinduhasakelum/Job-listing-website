import React from "react";
import DropDown from "../components/DropDown";
import Button from "../components/Button";
import SearchResultJobDetail from "../components/SearchResultJobDetail";

function SearchJob() {
  return (
    <div className="flex justify-center gap-3 mt-4">
      <div className="flex flex-col gap-6 basis-1/3">
        <h1 className="text-2xl font-bold">Filters</h1>
        <DropDown width="w-[300px]"/>
        <DropDown width="w-[300px]"/>
        <DropDown width="w-[300px]"/>
        <DropDown width="w-[300px]"/>
        <Button Name="Filter" width="w-[300px]"/>
      </div>
      <div className="flex flex-col gap-6 basis-2/3">
        <h1 className="text-3xl font-bold">Search results for "Search Name"</h1>
        <SearchResultJobDetail />
        <SearchResultJobDetail />
        <SearchResultJobDetail />
        <SearchResultJobDetail />
        <SearchResultJobDetail />
        <SearchResultJobDetail />
        <SearchResultJobDetail />
        <SearchResultJobDetail />
      </div>
    </div>
  );
}

export default SearchJob;
