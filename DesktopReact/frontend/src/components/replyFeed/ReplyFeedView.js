import React from 'react';
import {ArrowBackOutlined} from "@mui/icons-material";
import Post from "../post/Post";
import ReplyBox from "../replyBox/ReplyBox";
import {Stack} from "@mui/material";

const ReplyFeedView = ({goBack, selectedPost, replies}) => {
    console.log({selectedPost, replies})
    const replyBox = () => {
        return (<ReplyBox className="reply" postHash={selectedPost.originPostHash}
                          targetSocialPersonaId={selectedPost.originSocialPersonaId}/>)
    }

    return (
        <Stack className="middleSection">
            <div className="editProfileCloseBtn">
                <ArrowBackOutlined onClick={goBack}/> {/* todo need onClick to go back to home */}
            </div>
            <Post postData={selectedPost}/>
            {replyBox()}
            {replies}
        </Stack>
    );
};


export default ReplyFeedView;
