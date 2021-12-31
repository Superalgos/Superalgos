import './SidebarItem.css';
import {Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import PostModal from "../postModal/PostModal";

const SidebarItem = ({value, Icon}) => {
    const [modal, setModal] = useState(false)

    let navigate = useNavigate();
    const handleClick = () => {
        if (value === "Post") {
            setModal(!modal)
        } else {
            navigate(`/${value}`)
            setModal(false)
        }
    }

    return (
        <div className="sidebarItem" >
            <Stack direction="row">
                <Icon className="sidebarIcon"/>
                <div className="sidebarText" onClick={handleClick}> {value} </div>
            </Stack>
            <PostModal show={modal} close={handleClick}/>
        </div>
    );
}

export default SidebarItem;
