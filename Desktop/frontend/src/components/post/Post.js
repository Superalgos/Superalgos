import "./Post.css"
import React, {useState} from 'react';
import {Avatar, Card, IconButton, Stack, Typography} from "@mui/material";
import {Autorenew, ThumbDown, ThumbUp} from "@mui/icons-material";
import pic from "../../images/superalgos.png"

const Post = () => {

    const userName = "User Name",
        postBody = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

    const [count, setCount] = useState(0); /* todo define one more for dislike button */

    function onLikeButtonClick() { {/* todo console log print need a fix */}
        console.log("Liked " + count + " times")
    }

    function onButtonClick(){ /* todo dislike button function necessary? */
        console.log("Liked " + count + " times")
    }

    return (
        <Card className="post">
            <Stack direction="row">
                <Stack className="postAvatarContainer">
                    <Avatar src={pic}/>
                </Stack>
                <Stack className="postUserName">
                    {userName}
                </Stack>
            </Stack>
            <Stack className="postBody">
                    {postBody}
            </Stack>
            <Stack className="postFooterContainer" direction="row">
                <Stack className="postFooterLikeDislike" direction="row">
                <IconButton
                    onClick={() => setCount(count + 1)}
                    >
                    <ThumbUp/>
                </IconButton><Typography>{count}</Typography>
                <IconButton
                    onClick={() => {/* TODO remove unnecessary arrow function*/
                        onButtonClick()
                    }}
                >
                    <ThumbDown/>
                </IconButton>
                </Stack>
                <Stack className="postFooterRepost" direction="row">
                <IconButton
                    onClick={() => {/* TODO remove unnecessary arrow function*/
                        onButtonClick()
                    }}
                >
                    <Autorenew/>
                </IconButton>
                </Stack>
            </Stack>
        </Card>
    );
};

export default Post;
