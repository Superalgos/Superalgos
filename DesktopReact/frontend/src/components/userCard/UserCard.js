import "./UserCard.css"
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom'
import {Avatar, Button, Card, CardContent, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import {followUser} from "../../api/follow.httpService";
import {STATUS_OK} from "../../api/httpConfig";

const UserCard = ({name, userId, profilePic}) => {
    const navigate = useNavigate();
    const [followed, setFollowed] = useState(false);

    const followCallback = async () => {
        const eventType = followed ? 16 : 15;/* TODO use constant */
        const {result} = await followUser(userId, eventType).then(response => response.json());
        setFollowed(value => ((result === STATUS_OK) ? (!value) : (value)));
    }

    const navigateToprofile = () => {
        navigate(`/Profile/?p=${userId}`)
    }


    return (
        <Card className="userCard" variant="outlined">
            <Avatar src={profilePic ? profilePic : pic} className='avatar' onClick={navigateToprofile}/>
            <CardContent className="usernameCard">
                {/*TODO name should not exceed certain length */}
                <Typography className="username" variant="body2">{name}</Typography>
            </CardContent>
            <Button className="followButton" size="small" disableElevation variant="outlined" onClick={followCallback}>
                {followed ? 'Unfollow' : 'Follow'}
            </Button>
        </Card>
    );
};

export default UserCard;
