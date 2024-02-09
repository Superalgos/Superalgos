import React from 'react';
import "./Repost.css"
import "../userProfileHeader/UserProfileHeader.css"
import {Box, IconButton, Modal} from "@mui/material";
import {CloseOutlined} from "@mui/icons-material";
import PostBody from "../post/PostBody";
import Repost from "./Repost";

const RepostModal = ({show, close, postId, postData}) => {

    return (
        <Modal
            open={show}
            onClose={close}
        >
            <Box className="repostQuoteModal">
                <div className="repostHeader">
                    <IconButton onClick={close}>
                        <CloseOutlined/>
                    </IconButton>
                </div>
                <div className="replyModalFooter">
                    <Repost
                        closeModal={close}
                        className="reply" postHash={postId.originPostHash}
                        targetSocialPersonaId={postId.originSocialPersonaId}/>
                </div>
                <div className="replyFeedContainer"> {/*feed of the post clicked*/}
                    <PostBody postData={postData}/>
                </div>
            </Box>
        </Modal>
    );
};

export default RepostModal;