import React from "react";
import {Avatar, Card, CardContent, Typography} from "@mui/material";
import {useSelector} from "react-redux";
import pfp from "../../images/superalgos.png";
import "./SidebarUserProfile.css"

const SidebarUserProfile = () => {
    const user = useSelector(state => state.profile.actualUser);

    function getUserPic() {
        return <Avatar
            className="sidebarProfileAvatar" // todo used avatar instead of card media for responsiveness, need testing
            /*component="img"
            src={user.profilePic || pfp}*/
            srcSet={user.profilePic || pfp}
            alt="ProfilePic"/>
    }

    return <Card className="sidebarProfileCard" variant="outlined">
        {getUserPic()}

        <CardContent sx={{
            display: {xs: 'none', sm: 'none', md: 'none', lg: 'block'}
        }}
                     className="sidebarProfileCardContent">
            {/*TODO name should not exceed certain length */}
            <Typography className="sideBarUsername" variant="body1">{user.name}</Typography>
            <Typography className="userHandle" variant="subtitle2">
                @{user.userProfileHandle}
            </Typography>
        </CardContent>
    </Card>;
}
export default SidebarUserProfile;
