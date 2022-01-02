import React from 'react';
import {Box, Modal} from "@mui/material";
import PostPlaceholder from "../postPlaceholder/PostPlaceholder";
import "./PostModal.css";

const PostModal = ({show, close}) => {
    return (
        <div>
            {show ?
                <Modal open={show}
                       onClose={close}>
                    <Box className="modalContainer">
                        <PostPlaceholder/>
                    </Box>
                </Modal>
                : null}
        </div>
    )
}

export default PostModal;
