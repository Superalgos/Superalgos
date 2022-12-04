import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {Avatar, Button, Stack, TextField} from "@mui/material";
import pic from "../../images/superalgos.png";

const Repost = ({postHash, targetSocialPersonaId, closeModal}) => {
    /*** Variables */
    const [repost, setRepost] = useState('');
    const {profilePic} = useSelector(state => state.profile.actualUser);

    /*** Methods */
    const handleChange = (event) => {
        setRepost(event.target.value);
    }

    const onButtonClick = async () => { // todo add repost functionality
        console.log("reposting with quote")
        setRepost('');
        closeModal && closeModal();
        /*console.log(postHash)
        let {status} = await createReply({
            postText: repost,
            postHash,
            targetSocialPersonaId
        }).then(response => response.json());
        if (status !== STATUS_OK) {
            setRepost('');
            closeModal && closeModal(); /!* TODO make this better*!/
        }*/
    }

    return <Stack direction="row" className="reply" /*justifyContent="space-between"*/>
        <Avatar src={profilePic || pic}/>
        <TextField className="replyText"
                   id="outlined-multiline-flexible"
                   label="Add a comment"
                   multiline
                   maxRows={6}
                   value={repost}
                   onChange={handleChange}
        />
        <Button
            disabled={!repost}
            onClick={onButtonClick}
            className="replyButton" variant="outlined">
            Repost
        </Button>
    </Stack>;
};

export default Repost;