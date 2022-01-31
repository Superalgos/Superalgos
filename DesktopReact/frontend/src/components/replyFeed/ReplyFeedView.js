import React from 'react';
import {ArrowBackOutlined} from "@mui/icons-material";
import Post from "../post/Post";
import ReplyBox from "../replyBox/ReplyBox";
import {Stack} from "@mui/material";

const ReplyFeedView = ({goBack, selectedPost, replies, callbackEvent}) => {
    const {creator: {originSocialPersonaId}, originPostHash} = selectedPost;

    return (
        <Stack className="middleSection">
            <div className="editProfileCloseBtn">
                <ArrowBackOutlined onClick={goBack}/> {/* todo need onClick to go back to home */}
            </div>
            <Post postData={selectedPost}/>
            <ReplyBox
                className="reply" postHash={originPostHash} targetSocialPersonaId={originSocialPersonaId} closeModal={callbackEvent}/>
            { replies }
        </Stack>
    );
};

export default ReplyFeedView;
