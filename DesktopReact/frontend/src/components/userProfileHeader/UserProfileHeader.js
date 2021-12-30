import React, {useState} from 'react';
import {Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import "./UserProfileHeader.css"
import UserProfileModal from "./UserProfileModal";
import {DateRangeOutlined, LocationOnOutlined} from "@mui/icons-material";

const UserProfileHeader = ({user, updateProfileCallback}) => {

    const profileIcons = { // todo need proper style, and handle from css file
        width: "15px",
        height: "15px",
        verticalAlign: "text-top"
    }

    const [modal, setModal] = useState(false);
    const handleClickCallback = () => setModal(!modal);

    return (
        <Card className="profileSection">
            <CardMedia className="banner"
                       component="img"
                       src={`${user.bannerPic}`}
                       alt="PP"
            />
            <div className="profileCard">
                <div className="profilePicBG">
                    <CardMedia className="profileAvatar"
                               component="img"
                               src={`${user.profilePic}`}
                               alt="ProfilePic"
                    />
                </div>
                <Button className="editProfileButton"
                        variant="outlined"
                        onClick={handleClickCallback}>
                    Edit profile
                </Button>
                <UserProfileModal user={user} show={modal} close={handleClickCallback}
                                  updateProfileCallback={updateProfileCallback}/>
            </div>
            <div>
                <CardContent className="userSection">
                    <Typography className="username" variant="h5">{user.name}</Typography>
                    <Typography className="userHandle" variant="subtitle2">
                        @{user.username}
                    </Typography>
                    <Typography className="stats" variant="subtitle2">
                        {user.web}
                    </Typography>
                    <Typography className="bio">
                        {user.bio}
                    </Typography>
                    <Typography className="joinDate" variant="subtitle2">
                        <DateRangeOutlined sx={{...profileIcons}}/>
                        {user.joined}
                    </Typography>
                    <Typography className="location" variant="subtitle2">
                        <LocationOnOutlined sx={{...profileIcons}}/>
                        {user.location}
                    </Typography>
                    {user.stats ?
                        (<Typography className="stats" variant="subtitle2">
                            {user.stats}
                        </Typography>) :
                        null}
                </CardContent>
            </div>
        </Card>
    );
};

export default UserProfileHeader;
