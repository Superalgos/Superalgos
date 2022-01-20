import React from 'react';
import {Stack} from "@mui/material";
import {useSelector} from "react-redux";
import Post from "../post/Post";
import './ReplyFeed.css'
import {ArrowBackOutlined} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import ReplyBox from "../replyBox/ReplyBox";


const ReplyFeed = ({}) => {
    const selectedPost = useSelector(state => state.post.selectedPost);
    const post = selectedPost;
    console.log(selectedPost)
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }

    return (<Stack className="middleSection">
        <div className="editProfileCloseBtn">
            <ArrowBackOutlined onClick={goBack}/> {/* todo need onClick to go back to home */}
        </div>
        <Post postData={selectedPost}/>
        <ReplyBox className="reply" postHash={selectedPost.originPostHash} targetSocialPersonaId={selectedPost.originSocialPersonaId}/>
        <div>if only there were some</div>
        <div>or this worked</div>
        <div>either way, hi</div>
    </Stack>);
};

export default ReplyFeed;