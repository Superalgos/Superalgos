import React from 'react';
import {ArrowBackOutlined} from "@mui/icons-material";
import ReplyBox from "../replyBox/ReplyBox";
import Post from '../post/Post'
import {Skeleton, Stack} from "@mui/material";

const ReplyFeedView = ({loading, goBack, selectedPost, replies, callbackEvent}) => {
    const {creator: {originSocialPersonaId}, originPostHash} = selectedPost;

    return (
        <Stack className="middleSection">
            <div className="editProfileCloseBtn">
                <ArrowBackOutlined onClick={goBack}/> {/* todo need onClick to go back to home */}
            </div>
            {loading ?
                <Skeleton variant="rectangular" width="100%" height="12rem"/> :
                (<Post postData={selectedPost}/>)}
            <ReplyBox
                className="reply" postHash={originPostHash} targetSocialPersonaId={originSocialPersonaId}
                closeModal={callbackEvent}/>
            {replies}
        </Stack>
    );
};

export default ReplyFeedView;
