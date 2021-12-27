import React, {useEffect, useState} from 'react';
import {Box, Modal, Typography} from "@mui/material";
import {getPosts} from "../../api/post.httpService";

/* TODO Mode style to css if posible */
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40rem',
    height: '25.2rem',
    bgcolor: 'background.paper',
    border: '1px solid #000',
    boxShadow: 24,
};

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
                    <Box sx={style}>
                        <div>
                            <Typography>
                                Post to reply to
                            </Typography>
                            {modalBody}
                        </div>
                        <div>
                            <Typography>
                                Reply Component
                            </Typography>
                        </div>
                    </Box>
                </Modal> : null}
        </>
    );
};

export default FooterReplyModal;