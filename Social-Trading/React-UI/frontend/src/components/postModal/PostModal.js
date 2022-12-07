import React from 'react';
import {Box, IconButton, Modal} from "@mui/material";
import PostPlaceholder from "../postPlaceholder/PostPlaceholder";
import "./PostModal.css";
import {CloseOutlined} from "@mui/icons-material";

const PostModal = ({show, close}) => {
    return (
        <div>
            {show ?
                <Modal open={show}
                       onClose={close}>
                    <Box className="modalContainer">
                        <div className="postHeaderContainer">
                            <IconButton onClick={close}>
                                <CloseOutlined/>
                            </IconButton>
                        </div>
                        <PostPlaceholder/>
                    </Box>
                </Modal>
                : null}
        </div>
    )
}

export default PostModal;
