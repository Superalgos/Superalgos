import "./UserCard.css"
import React, {useEffect} from 'react';
import {Button, Card, CardContent, CardMedia, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"

const UserCard = ({name, id,followCallback}) => {

    useEffect(() => {
        console.log(`created user with id ${id}`)
    }, [id]);

    return (
        <Card className="userCard" variant="outlined">
            <CardMedia className="avatar"
                       component="img"
                       image={pic}
                       alt="PP"

            />
            <CardContent>
                <Typography variant="body2">{name}</Typography>
            </CardContent>
            <Button className="followButton" size="small" disableElevation variant="outlined" onClick={followCallback}>
                Follow
            </Button>
        </Card>
    );
};

export default UserCard;
