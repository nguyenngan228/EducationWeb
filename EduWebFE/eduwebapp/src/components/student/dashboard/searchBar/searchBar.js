import React from "react";
import "./searchBar.css";
import { Form, Button } from "react-bootstrap";
import { Search } from "lucide-react";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex items-center flex-1">
      <Form className="w-full max-w-[400px] mx-auto">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Form>
    </div>
  );
};

export default SearchBar;
