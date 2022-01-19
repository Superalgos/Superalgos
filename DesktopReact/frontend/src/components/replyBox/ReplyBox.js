import {Avatar, Button, Stack, TextField} from "@mui/material";
import pic from "../../images/superalgos.png";
import React, {useState} from "react";
import {createReply} from "../../api/post.httpService";
import "./ReplyBox.css"


const ReplyBox = ({postHash, targetSocialPersonaId}) => {
    /*** Variables */
    const [reply, setReply] = useState('');


    /*** Methods */
    const handleChange = (event) => {
        setReply(event.target.value);
    }

    const onButtonClick = async () => {
        console.log("replying")
        console.log(postHash)
        let response = await createReply({postText: reply, postHash,targetSocialPersonaId}).then(response => response.json());
        /* TODO FINISH UP BOYO*/
        debugger
        console.log("replied")
    }

    return <Stack direction="row" className="reply" justifyContent="space-between">
        <Avatar src={pic} className="avatar"/>
        <TextField className="replyText"
                   id="outlined-multiline-flexible"
                   label="Post your reply"
                   multiline
                   maxRows={6}
                   value={reply}
                   onChange={handleChange}
        />
        <Button
            disabled={!reply}
            onClick={onButtonClick}
            className="replyButton" variant="outlined">
            Reply
        </Button>
    </Stack>;
}

export default ReplyBox;