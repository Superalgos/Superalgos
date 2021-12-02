import './SidebarItem.css';
import {Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";


const SidebarItem = ({value, Icon}) => {
    let navigate = useNavigate();
    const handleClick = () => {
        navigate(`/${value}`)
    }

    return (
        <div className="sidebarItem" onClick={handleClick}>
            <Stack direction="row">
                <Icon className="sidebarIcon"/>
                <div className="sidebarText"> {value} </div>
            </Stack>
        </div>
    );
}

export default SidebarItem;
