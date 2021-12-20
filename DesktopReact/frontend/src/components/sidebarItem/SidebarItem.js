import './SidebarItem.css';
import {DialogContent, Modal, Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import PostModal from "../postModal/PostModal";
import useModal from '../postModal/useModal';

const SidebarItem = ({value, Icon}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    //const handleClose = () => setOpen(false);
    const handleClose = () => setOpen(false);

    const [modal, setModal] = useState(false)
    const Toggle = () => setModal(!modal)

    let navigate = useNavigate();
    const handleClick = () => {
        if (value === "Post") {
            modalHandler()
            // console.log(value)
            // console.log(open)

        } else {
            navigate(`/${value}`)
        }
    }

    const modalHandler = () => {
        Toggle()
    }

    return (
        <div className="sidebarItem" onClick={handleClick}>
            <Stack direction="row">
                <Icon className="sidebarIcon"/>
                <div className="sidebarText"> {value} </div>
            </Stack>
            <PostModal show={modal}/>

        </div>
    );
}

export default SidebarItem;
