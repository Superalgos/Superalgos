import "./PostPlaceholder.css"
import React from 'react';
import {Avatar, Button, Card, Stack, TextField, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"

const PostPlaceholder = () => {

    function onButtonClick() {
        console.log("Clicked Post button");
    }

    return (
        <div className="postPlaceholder">
            <h4>Posts</h4>
            <div className="postPlaceholderContainer">
                <Card>
                    <Stack
                        className="postPlaceholderInputBox"
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        spacing={1}
                        justify="flex-end">
                        <Stack className="postPlaceholderAvatar">
                            <Avatar src={pic}/>
                        </Stack>
                        <Stack className="postPlaceholderTextField">
                            <Typography gutterBottom variant="subtitle1" component="div">
                                <TextField
                                    id="outlined-multiline-flexible"
                                    label="what's happening?"
                                    fullWidth
                                    multiline
                                    maxRows={6}
                                />
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack className="postPlaceholderButtonStyle" direction="row">
                        <Button
                            onClick={() => { /* TODO remove unnecessary arrow function call*/
                                onButtonClick()
                            }}
                            className="postPlaceholderButton" variant="outlined">
                            Post
                        </Button>
                    </Stack>
                </Card>
            </div>
        </div>
    );
};

export default PostPlaceholder;
