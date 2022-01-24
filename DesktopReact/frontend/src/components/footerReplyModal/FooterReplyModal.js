import React from 'react';
import {Box, Modal} from "@mui/material";
import "./FooterReplyModal.css"
import Post from "../post/Post";
import ReplyBox from "../replyBox/ReplyBox";

const FooterReplyModal = ({show, close, post}) => {
    return (
        <Modal open={show}
               onClose={close}
        >
            <Box className="replyModal">
                <div className="replyFeedContainer"> {/*feed of the post clicked*/}
                    <Post postData={post}/>
                </div>
                <div className="replyModalFooter">
                    <ReplyBox
                        closeModal={close}
                        className="reply" postHash={post.originPostHash}
                        targetSocialPersonaId={post.originSocialPersonaId}/>
                </div>
            </Box>
        </Modal>
    );
};

export default FooterReplyModal;