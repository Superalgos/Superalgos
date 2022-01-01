import "./PostPlaceholder.css"
import React, {useState} from 'react';
import {Alert, Avatar, Button, Card, Snackbar, Stack, TextField, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import {STATUS_OK} from "../../api/httpConfig";
import {createPost} from "../../api/post.httpService"

const PostPlaceholder = ({reloadPostCallback}) => {
    const [postText, setPostText] = useState(undefined);
    const [open, setOpen] = useState(false);

    const onButtonClick = async () => {
        let {result} = await createPost({postText: postText}).then(response => response.json());
        if (result === STATUS_OK) {
            console.log(reloadPostCallback)
            reloadPostCallback && reloadPostCallback();
            return;
        }
        setOpen(true);

    }

    const handleChange = (event) => {
        setPostText(event.target.value);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };


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
                                    value={postText}
                                    onChange={handleChange}
                                />
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack className="postPlaceholderButtonStyle" direction="row">
                        <Button
                            disabled={!postText}
                            onClick={onButtonClick}
                            className="postPlaceholderButton" variant="outlined">
                            Post
                        </Button>
                    </Stack>
                </Card>
            </div>
            <Snackbar open={ open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{width: '100%'}}>
                    Failed to post message!
                </Alert>
            </Snackbar>
        </div>
    );
};

export default PostPlaceholder;
