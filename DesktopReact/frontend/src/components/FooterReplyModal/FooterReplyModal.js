import React, {useEffect, useState} from 'react';
import {Box, Modal, Typography} from "@mui/material";
import "./FooterReplyModal.css"
import FooterReply from "../FooterReply/FooterReply";
import {useSelector} from "react-redux";

const FooterReplyModal = ({show, close}) => {
    const [modalBody, setModalBody] = useState() // review state. Needed?
    const modalPost = useSelector(state => state.post.modalPost)
    // todo get the post by id
    console.log(modalPost)

    useEffect(() => { // todo destroy the data from modalPost. Need get individual post from post.slice
        /*return modalPost = undefined;*/
        console.log("this has been destroyed")
    })

    return (
        <>
                <Modal open={show}
                       onClose={close}
                >
                    <Box className="replyModal">
                        <div className="replyFeedContainer"> {/*feed of the post clicked*/}
                            <Typography> {/* Remove this when dispatch fixed */}
                                Post to reply to
                            </Typography>
                            {modalPost}
                        </div>
                        <div className="replyModalFooter">
                            <FooterReply show={true}/>
                        </div>
                    </Box>
                </Modal>
        </>
    );
};

export default FooterReplyModal;