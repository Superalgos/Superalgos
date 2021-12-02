import React from 'react';
import {Card, CardContent, CardMedia, Typography} from "@mui/material";
import banner from "../../images/banner.jpg";
import pfp from "../../images/superalgos.png";

const UserProfileHeader = ({actualUser}) => {
    return (
        <Card className="profileSection">
            <CardMedia className="banner"
                       component="img"
                       image={banner}
                       alt="PP"
            />
            <div className="profileCard">
                <div className="profilePicBG">
                    <CardMedia className="profileAvatar"
                               component="img"
                               image={pfp}
                               alt="ProfilePic"
                    />
                </div>
                <CardContent className="userSection">
                    <Typography variant="h5">{actualUser}</Typography>
                </CardContent>
            </div>
        </Card>
    );
};

export default UserProfileHeader;
