import React, {useState} from 'react';
import {Box, Modal} from "@mui/material";
import PostPlaceholder from "../postPlaceholder/PostPlaceholder";
import ReactDOM from "react-dom";

const style = { // todo need proper style
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40rem',
    height: '12.2rem',
    bgcolor: 'background.paper',
    border: '1px solid #000',
    boxShadow: 24,
};

// TODO used ref to handle the modal. Correct way?
const PostModal = ({show}) => {
    return (
        <div>
            {show ?
                <Modal open={show}
                >
            <Box className="modalContainer" sx={style}>
                <PostPlaceholder/>
            </Box>
                </Modal>
                : null}
        </div>
    )
}

/*return (
{
    isShowing, toggle,
}

<Modal
    //open={props}
    onClose={handleClick}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description">
    >
    <div>
        <Box className="modalContainer" sx={style}>
            <PostPlaceholder/>
        </Box>
    </div>
</Modal>

);*/

export default PostModal;
