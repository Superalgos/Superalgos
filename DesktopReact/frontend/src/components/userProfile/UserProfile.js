import "./UserProfile.css"
import React from 'react';
import UserProfileHeader from "../userProfileHeader/UserProfileHeader";
import {Stack} from "@mui/material";
import PostsFeed from "../postsFeed/PostsFeed";


const UserProfile = () => {

    /*TODO finish this shit*/

    let actualUser = 'Loui Molina';

    return (
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={1}
               className="middleSection">

            <UserProfileHeader actualUser={actualUser}/>
            <PostsFeed/>
        </Stack>
    );
};


export default UserProfile;
