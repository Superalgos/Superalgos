import React, {useState} from 'react';
import "./FooterReply.css"
import {Avatar, Button, Stack, TextField, Typography} from "@mui/material";
import pic from "../../images/superalgos.png";

const FooterReply = () => {
    const [postText, setPostText] = useState(undefined);
    const handleChange = (event) => {
        setPostText(event.target.value);
    }

    const handleClick = (e) => {
        e.stopPropagation()
        handleOpen()
    }

    return (
        <div className="footerReply">
            <Stack className="footerReplyStack" direction="row">
                <Stack className="replyAvatarContainer">
                    <Avatar src={pic}/>
                </Stack>
                <Stack className="replyBody">
                    <Typography gutterBottom variant="subtitle1" component="div">
                        <TextField value={postText}
                                   id="outlined-multiline-flexible"
                                   label="Post your reply"
                                   fullWidth
                                   multiline
                                   maxRows={6}
                                   onChange={handleChange}
                        />
                    </Typography>
                </Stack>
            </Stack>
            <Stack className="replyButton" direction="row">
                <Button onClick={handleClick}
                        onChange={handleChange}
                        value={postText}
                        disabled={!postText}
                        className="replyButtonStyle" variant="outlined"
                >
                    Reply
                </Button>
            </Stack>
        </div>
    );
};

export default FooterReply;