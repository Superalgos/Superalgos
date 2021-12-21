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
                <CardContent className="userSection">
                    <Typography variant="h5">{actualUser}</Typography>
                    <div>
                        @username
                    </div>
                    <div>
                        Bio
                    </div>
                    <div>
                        joined date
                    </div>
                    <div>
                        #Following - #Followers
                    </div>
                </CardContent>
                {/*todo button to handle the modal*/}
                {/*<div className="editProfile">
                    <Button className="editProfileButton"
                            variant="outlined"
                            onClick={handleClick}>
                        Edit profile
                    </Button>
                </div>*/}
            </div>
        </Card>
    );
};

export default UserProfileHeader;
