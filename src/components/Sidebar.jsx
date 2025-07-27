import React, { useState } from "react";
import { FiSearch, FiUpload, FiCalendar, FiMapPin } from "react-icons/fi";

const Sidebar = () => {
  const [filterByYear, setFilterByYear] = useState(false);
  const [year, setYear] = useState(2025); // default slider year

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto p-4">
      
      {/* Timeline Filter */}
      <section>
        <h3 className="flex items-center text-lg font-semibold mb-2 text-gray-700">
          <FiCalendar className="mr-2 text-blue-500" />
          Timeline Filter
        </h3>

        {/* Toggle Filter by Year */}
        <label className="inline-flex items-center mb-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={filterByYear}
            onChange={() => setFilterByYear(!filterByYear)}
          />
          <span className="ml-2 text-gray-700">Filter by specific year</span>
        </label>

        {/* Show slider only if toggled */}
        {filterByYear ? (
          <input
            type="range"
            min="1969"
            max="2025"
            step="1"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full accent-blue-500"
            aria-label="Filter rides by year"
          />
        ) : (
          <p className="text-gray-500 italic">Showing all years</p>
        )}

        {/* Show selected year if filter active */}
        {filterByYear && (
          <p className="mt-1 text-center font-semibold text-blue-600">
            Selected Year: {year}
          </p>
        )}
      </section>

      {/* Location Filter */}
      <section>
        <h3 className="flex items-center text-lg font-semibold mb-2 text-gray-700">
          <FiMapPin className="mr-2 text-green-500" />
          Location
        </h3>
        <select className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400">
          <option value="">All Locations</option>
          <option value="mountains">Mountains</option>
          <option value="city">City</option>
          <option value="coast">Coast</option>
        </select>
      </section>

      {/* Search */}
      <section>
        <h3 className="flex items-center text-lg font-semibold mb-2 text-gray-700">
          <FiSearch className="mr-2 text-purple-500" />
          Search
        </h3>
        <input
          type="search"
          placeholder="Search by bike, rider, ride name..."
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </section>

      {/* Photo Upload */}
      <section>
        <h3 className="flex items-center text-lg font-semibold mb-2 text-gray-700">
          <FiUpload className="mr-2 text-pink-500" />
          Upload Photos
        </h3>
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full border border-gray-300 rounded-md p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </section>
    </div>
  );
};

export default Sidebar;
