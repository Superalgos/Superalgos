import React from 'react';
import "./Repost.css"
import "../userProfileHeader/UserProfileHeader.css"
import {Box, Modal} from "@mui/material";
import {CloseOutlined} from "@mui/icons-material";
import ReplyBox from "../replyBox/ReplyBox";
import PostBody from "../post/PostBody";

const RepostModal = ({show, close, postId, postData}) => {

    return (
            <Modal
                open={show}
                onClose={close}
            >
                <Box className="repostQuoteModal">
                    <div className="repostHeader">
                        <div className="repostCloseButton">
                            <CloseOutlined onClick={close}/>
                        </div>
                    </div>
                    <div className="replyModalFooter">
                        <ReplyBox
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