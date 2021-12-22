import React, {useState} from 'react';
import {Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import banner from "../../images/banner.jpg";
import pfp from "../../images/superalgos.png";
import "./UserProfileHeader.css"
import UserProfileModal from "./UserProfileModal";

const UserProfileHeader = ({actualUser}) => {

    const [modal, setModal] = useState(false);
    const handleClick = () => {
        setModal(!modal);
        console.log("hello from edit profile: ");
        if(modal === true){ // assign to a variable, unreachable from state.
            return <UserProfileModal show={modal}/>
             console.log("hello from edit profile: ");
             console.log(modal);
        }
        // console.log("hello from edit profile: ");
        // console.log(modal)
    }
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
                {/*todo button to handle the modal*/}
            </div>
            <div>
                <CardContent className="userSection">
                    <Typography className="username" variant="h5">{actualUser}</Typography>
                    <Typography className="userHandle">
                        @username
                    </Typography>
                    <Typography className="bio">
                        what
                    </Typography>
                    <Typography className="joinDate">
                        when
                    </Typography>
                    <Typography className="location">
                        where
                    </Typography>
                    <Typography className="stats">
                        100 Following - 100 Followers
                    </Typography>

                </CardContent>
            </div>
        </Card>
    );
};

export default UserProfileHeader;
