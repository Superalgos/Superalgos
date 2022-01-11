import React from "react";
import {CardContent, Typography} from "@mui/material";
import {useSelector} from "react-redux";

const SidebarUserProfile = () => {
    const user = useSelector(state => state.profile.actualUser);

    return <CardContent className="sidebarProfileCardContent">
        {/*TODO name should not exceed certain length */}
        <Typography className="username" variant="body1">{user.name}</Typography>
        <Typography className="userHandle" variant="subtitle2">
            @{user.username}
        </Typography>
    </CardContent>;
}
export default SidebarUserProfile;
