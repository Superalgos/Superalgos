import React from 'react';
import {Box, TextField} from "@mui/material";
import {Search} from "@mui/icons-material";

const SearchBox = () => {
    return (
        <div>
            <Box sx={{display: 'flex', alignItems: 'flex-end'}}>
                <Search className="searchIcon"/>
                <TextField id="users-search" label="Search" variant="standard" type="search"/>
            </Box>
        </div>
    );
};

export default SearchBox;
