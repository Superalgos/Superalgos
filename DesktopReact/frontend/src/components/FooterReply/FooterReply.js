import React from 'react';
import "./FooterReply.css"
import {Avatar, Button, Collapse, Divider, Stack, TextField, Typography} from "@mui/material";
import pic from "../../images/superalgos.png";

const FooterReply = ({show}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // TODO add functionality. If the inputbox of the reply is empty, open the modal, otherwise just post the reply
    let inputValue = undefined
    const handleClick = () => {
        console.log("Click comment button: ")
        if (inputValue === "") {
            handleOpen()
            console.log("Hello from reply modal")
        } else {
            console.log("Hello from reply")
        }
    }

    return (
        <Collapse in={show}> {/*TODO needs to listen to HandleCommentContainer function's state in PostFooter.js */}
            <Divider/>

            <div className="footerReply">
                <Stack className="footerReplyStack" direction="row">
                    <Stack className="replyAvatarContainer">
                        <Avatar src={pic}/>
                    </Stack>
                    <Stack className="replyBody">
                        <Typography gutterBottom variant="subtitle1" component="div">
                            <TextField value={inputValue}
                                       id="outlined-multiline-flexible"
                                       label="Post your reply"
                                       fullWidth
                                       multiline
                                       maxRows={6}
                            />
                        </Typography>
                    </Stack>
                </Stack>
                <Stack className="replyButton" direction="row">
                    <Button onClick={handleClick}
                            className="replyButtonStyle" variant="outlined"
                    >
                        Reply
                    </Button>
                    {/* todo need modal to handle the reply if the input is empty */}
                </Stack>
            </div>
        </Collapse>
    );
};

export default FooterReply;