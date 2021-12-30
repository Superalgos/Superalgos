import React, {useEffect, useState} from 'react';
import {Box, Modal, Typography} from "@mui/material";
import {getPosts} from "../../api/post.httpService";
import "./FooterReplyModal.css"
import FooterReply from "../FooterReply/FooterReply";

const FooterReplyModal = ({show, close}) => {
    const [modalBody, setModalBody] = useState()
    const modalBodyValue = () => {
        let data = getPosts()
        setModalBody(data)
    }

    /*useEffect(() => {
        return modalBodyValue();
    }, []); fix needed, breaks the code */

    return (
        <>
            {show ?
                <Modal open={show} /* todo unfinished, need style */
                       onClose={close}
                >
                    <Box className="replyModal">
                        <div className="replyFeedContainer"> {/*feed of the post clicked*/}
                            <Typography>
                                Post to reply to
                            </Typography>
                            {modalBody}
                        </div>
                        <div className="replyModalFooter">
                            <FooterReply show={true}/>
                        </div>
                    </Box>
                </Modal> : null}
        </>
    );
};

export default FooterReplyModal;