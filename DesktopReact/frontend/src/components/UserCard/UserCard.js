import "./UserCard.css"
import React, {useState} from 'react';
import {Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import {followUser} from "../../api/follow.httpService";
import {STATUS_OK} from "../../api/httpConfig";

const UserCard = ({name, userId}) => {

    const [followed, setFollowed] = useState(false);

    const followCallback = async () => {
        let eventType = followed ? 16 : 15;/* TODO use constant */
        let {result} = await followUser(userId, eventType).then(response => response.json());
        console.log({userId, followed, result, eventType})
        setFollowed(value => ((result === STATUS_OK) ? (!value) : (value)));
    }

    return (
        <Card className="userCard" variant="outlined">
            <CardMedia className="avatar"
                       component="img"
                       image={pic}
                       alt="PP"

            />
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
