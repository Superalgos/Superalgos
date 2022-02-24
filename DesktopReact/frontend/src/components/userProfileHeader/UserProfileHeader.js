import React, {useState} from 'react';
import {Button, CardContent, CardMedia, Typography} from "@mui/material";
import "./UserProfileHeader.css"
import UserProfileModal from "../userProfileModal/UserProfileModal";
import {DateRangeOutlined, LocationOnOutlined} from "@mui/icons-material";
import pfp from "../../images/superalgos.png";
import {followUser} from "../../api/follow.httpService";
import {STATUS_OK} from "../../api/httpConfig";

const UserProfileHeader = ({user, isExternalProfile}) => {
    const profileIcons = { // todo need proper style, and handle from css file
        width: "15px", height: "15px", verticalAlign: "text-top"
    }
    const [modal, setModal] = useState(false);
    const [followed, setFollowed] = useState(false);
    const handleClickCallback = () => setModal(!modal);

    const followCallback = async () => {
        const eventType = followed ? 16 : 15;/* TODO use constant */
        const {result} = await followUser(user.socialPersonaId, eventType).then(response => response.json());
        setFollowed(value => ((result === STATUS_OK) ? (!value) : (value)));
    }

    return (
        <div className="profileSection">
            <CardMedia className="banner"
                       component="img"
                       src={user.bannerPic || pfp}
                       alt="PP"
            />
            <div className="profileCard">
                <div className="profilePicBG">
                    <CardMedia className="profileAvatar"
                               component="img"
                               src={user.profilePic || pfp}
                               alt="ProfilePic"
                    />
                </div>
                {
                    /*!isExternalProfile*/ true
                        ? <Button className="editProfileButton" variant="outlined" onClick={handleClickCallback}>
                            Edit profile
                        </Button>
                        : <Button className="followButtonExternalProfile" disableElevation variant="outlined"
                                  onClick={followCallback}>
                            {followed ? 'Unfollow' : 'Follow'}
                        </Button>
                }

                {/* {modal ? (<UserProfileModal user={user} show={modal} close={handleClickCallback}/>) : null} */}
                {modal ? (<UserProfileModal user={user} show={modal} close={handleClickCallback}/>) : null}
            </div>
            <div>
                <CardContent className="userSection">
                    {user.name ? (<Typography className="username" variant="h5">{user.name}</Typography>) : null}
                    <Typography className="userHandle" variant="subtitle2">
                        @{user.userProfileHandle}
                    </Typography>
                    {user.web ? (<Typography className="stats" variant="subtitle2">
                        {user.web}
                    </Typography>) : null}
                    {user.bio ? (<Typography className="bio">
                        {user.bio}
                    </Typography>) : null}
                    {user.joined ? (<Typography className="joinDate" variant="subtitle2">
                        <DateRangeOutlined sx={{...profileIcons}}/>
                        {new Date(user.joined).toLocaleDateString()}
                    </Typography>) : null}
                    {user.location ? (<Typography className="location" variant="subtitle2">
                        <LocationOnOutlined sx={{...profileIcons}}/>
                        {user.location}
                    </Typography>) : null}
                    {user.stats ? (<Typography className="stats" variant="subtitle2">
                        {user.stats}
                    </Typography>) : null}
                </CardContent>
            </div>
        </div>);
};

export default UserProfileHeader;
