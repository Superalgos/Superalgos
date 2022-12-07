import React from 'react';
import {Link} from "@mui/material";

const ShowMoreUsers = ({showMoreCallback}) => {
    return (
        <Link
            component="button"
            variant="body2"
            onClick={showMoreCallback}>
            Show more
        </Link>
    );
};


export default ShowMoreUsers;