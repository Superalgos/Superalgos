import "./Post.css"
import React from 'react';
import {Avatar, Card, IconButton, Stack} from "@mui/material";
import {Autorenew, ThumbDown, ThumbUp} from "@mui/icons-material";
import pic from "./../../images/superalgos.png"

const Post = () => {

    const userName = "User Name",
        postBody = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    function onButtonClick() {
        console.log("Clicked the button");
    }

    return (
        <Card className="post">
            <Stack direction="row">
                <Stack className="postAvatarContainer">
                    <Avatar src={pic}/>
                </Stack>
                <Stack className="postUserName">
                    {/*use props or local variables*/}
                    {userName}
                </Stack>


            </Stack>
            <Stack className="postBody">
                {/*use props or local variables*/}
                {postBody}
            </Stack>
            <Stack className="postFooter" direction="row">
                {/* footer (buttons: like/dislike, repost) */}
                <IconButton
                    onClick={() => { /* TODO remove unnecessary arrow function*/
                        onButtonClick()
                    }}
                >
                    <ThumbUp/>
                </IconButton>
                <IconButton
                    onClick={() => {/* TODO remove unnecessary arrow function*/

                        onButtonClick()
                    }}
                >
                    <ThumbDown/>
                </IconButton>
                <IconButton
                    onClick={() => {/* TODO remove unnecessary arrow function*/
                        onButtonClick()
                    }}
                >
                    <Autorenew/>
                </IconButton>
            </Stack>
        </Card>
    );
};

export default Post;
