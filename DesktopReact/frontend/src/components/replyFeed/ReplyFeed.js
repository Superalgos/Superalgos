import React, {useState} from 'react';
import {Avatar, Button, Stack, TextField} from "@mui/material";
import {useSelector} from "react-redux";
import Post from "../post/Post";
import './ReplyFeed.css'
import {ArrowBackOutlined} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import pic from "../../images/superalgos.png";


const ReplyFeed = ({post}) => {
    const selectedPost = useSelector(state => state.post.selectedPost);
    const [reply, setReply] = useState('');
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }
    const handleChange = (event) => {
        setReply(event.target.value);
    }
    const onButtonClick = async () => {
        console.log("replied")
        /*
                let {result} = await createPost({postText: postText}).then(response => response.json());
                if (result === STATUS_OK) {
                    console.log(reloadPostCallback)
                    reloadPostCallback && reloadPostCallback();
                    return;
                }
                setOpen(true);
        */

    }
    return (<Stack className="middleSection">
        <div className="editProfileCloseBtn">
            <ArrowBackOutlined onClick={goBack}/> {/* todo need onClick to go back to home */}
        </div>
        <Post postData={selectedPost}/>
        <Stack direction="row" className='response'>
            <Avatar src={pic}/>
            <TextField
                id="outlined-multiline-flexible"
                label="Post your reply"
                fullWidth
                multiline
                maxRows={6}
                value={reply}
                onChange={handleChange}
            />
            <Button
                disabled={!reply}
                onClick={onButtonClick}
                className="postPlaceholderButton" variant="outlined">
                Reply
            </Button></Stack>
        <div> this is the place where you write your reply</div>
        <div>here there would be replies</div>
        <div>if only there were some</div>
        <div>or this worked</div>
        <div>either way, hi</div>
    </Stack>);
};

export default ReplyFeed;