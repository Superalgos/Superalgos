import React from "react";
import {Card, CardContent, CardMedia, Typography} from "@mui/material";
import {useSelector} from "react-redux";
import pfp from "../../images/superalgos.png";
import "./SidebarUserProfile.css"

const SidebarUserProfile = () => {
    const user = useSelector(state => state.profile.actualUser);

    return <Card className="sidebarProfileCard" variant="outlined">
        {user.profilePic ?
            (
                <CardMedia className="sidebarProfileAvatar"
                           component="img"
                           src={`${user.profilePic}`}
                           alt="ProfilePic"/>
            ) :
            (
                <CardMedia className="sidebarProfileAvatar"
                           component="img"
                           image={pfp}
                           alt="ProfilePic"/>
            )}

        <CardContent sx={{
            display: {xs: 'none', sm: 'none', md: 'none', lg: 'block'}}}
                     className="sidebarProfileCardContent">
            {/*TODO name should not exceed certain length */}
            <Typography className="username" variant="body1">{user.name}</Typography>
            <Typography className="userHandle" variant="subtitle2">
                @{user.username}
            </Typography>
        </CardContent>
    </Card>;
}
export default SidebarUserProfile;
