import React, {useState} from 'react';
import {Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import "./UserProfileHeader.css"
import UserProfileModal from "./UserProfileModal";
import {DateRangeOutlined, LocationOnOutlined} from "@mui/icons-material";
import pfp from "../../images/superalgos.png";
import {useSelector} from "react-redux";

const UserProfileHeader = ({ updateProfileCallback}) => {

    const user = useSelector(state => state.profile);
    console.log(user)

    const profileIcons = { // todo need proper style, and handle from css file
        width: "15px", height: "15px", verticalAlign: "text-top"
    }

    const [modal, setModal] = useState(false);

    const handleClickCallback = () => setModal(!modal);



    return (
        <Card className="profileSection">
            {user.bannerPic ? (<CardMedia className="banner"
                                          component="img"
                                          src={`${user.bannerPic}`}
                                          alt="PP"
            />) : (<CardMedia className="banner"
                              component="img"
                              image={pfp}
                              alt="PP"
            />)}
            <div className="profileCard">
                <div className="profilePicBG">
                    {user.profilePic ? (<CardMedia className="profileAvatar"
                                                   component="img"
                                                   src={`${user.profilePic}`}
                                                   alt="ProfilePic"
                    />) : (<CardMedia className="profileAvatar"
                                      component="img"
                                      image={pfp}
                                      alt="ProfilePic"
                    />)}
                </div>
                <Button className="editProfileButton"
                        variant="outlined"
                        onClick={handleClickCallback}>
                    Edit profile
                </Button>
                {modal ? (<UserProfileModal user={user} show={modal} close={handleClickCallback}
                                            updateProfileCallback={updateProfileCallback}/>) : null}
            </div>
            <div>
                <CardContent className="userSection">
                    {user.name ? (<Typography className="username" variant="h5">{user.name}</Typography>) : null}
                    {user.username ? (<Typography className="userHandle" variant="subtitle2">
                        @{user.username}
                    </Typography>) : null}
                    {user.web ? (<Typography className="stats" variant="subtitle2">
                        {user.web}
                    </Typography>) : null}
                    {user.bio ? (<Typography className="bio">
                        {user.bio}
                    </Typography>) : null}
                    {user.joined ? (<Typography className="joinDate" variant="subtitle2">
                        <DateRangeOutlined sx={{...profileIcons}}/>
                        {user.joined}
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
        </Card>);
};

export default UserProfileHeader;
