import React, {useState} from 'react';
import {Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import banner from "../../images/banner.jpg";
import pfp from "../../images/superalgos.png";
import "./UserProfileHeader.css"
import UserProfileModal from "./UserProfileModal";
import {DateRangeOutlined, LocationOnOutlined} from "@mui/icons-material";

const UserProfileHeader = ({actualUser}) => {

    const profileIcons = { // this need to be moved to style css file
        width: "15px",
        height: "15px",
        verticalAlign: "text-top"
    }

    const buttonStyle = { // this need to be moved to style css file

    }
    const [modal, setModal] = useState(false);
    const handleClick = () => setModal(!modal);
        //console.log("hello from edit profile: ");
        /*if(modal === true){ // assign to a variable, unreachable from state.
            return <UserProfileModal show={modal}/>
             console.log("hello from edit profile: ");
             console.log(modal);
        }*/
        // console.log("hello from edit profile: ");
        // console.log(modal)

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
                <Button className="editProfileButton"
                        variant="outlined"
                        onClick={handleClick}>
                    Edit profile
                </Button>
                <UserProfileModal show={modal} close={handleClick}/>
            </div>
            <div>
                <CardContent className="userSection">
                    <Typography className="username" variant="h5">{actualUser}</Typography>
                    <Typography className="userHandle" variant="subtitle2">
                        @username
                    </Typography>
                    <Typography className="bio">
                        This is my bio
                    </Typography>
                    <Typography className="joinDate" variant="subtitle2">
                        <DateRangeOutlined sx={{...profileIcons}} />
                        Joined MM/YYYY
                    </Typography>
                    <Typography className="location" variant="subtitle2">
                        <LocationOnOutlined sx={{...profileIcons}}/>
                        City, Country
                    </Typography>
                    <Typography className="stats" variant="subtitle2">
                        # Following - # Followers
                    </Typography>

                </CardContent>
            </div>
        </Card>
    );
};

export default UserProfileHeader;
