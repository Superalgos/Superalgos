import './Sidebar.css';
import {Avatar, Button, Drawer, Stack} from "@mui/material";
import SidebarItem from "../sidebarItem/SidebarItem";
import Logo from "../logo/Logo";
import '../logo/Logo.css'
import HomeIcon from '@mui/icons-material/Home';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonIcon from '@mui/icons-material/Person';
import pic from "../../images/superalgos.png";
import SidebarUserProfile from "../sidebarUserProfile/SidebarUserProfile";
import React, {useState} from "react";

const Sidebar = props => {

    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const drawerWidth = 240;

    const stylePropsSidebar = {
        height: "100%", minHeight: "340px",
        display: {xs: 'none', sm: 'none', md: 'none', lg: 'block'},
        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
    }

    const stylePropsSidebarMini = {
        height: "100%", minHeight: "340px",
        display: {xs: 'block', sm: 'block', md: 'block', lg: 'none'},
        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth - 185},
    }
    /* TODO CLAUDIO, use a single tag and change styles based on size*/
    return (
        <div className="sidebar">
            <Drawer
                variant="permanent"
                PaperProps={{style: {position: "relative"}}}
                sx={{...stylePropsSidebar}} open>
                <Stack direction="column"
                       spacing={5}
                       sx={{minWidth: "max-content"}}>
                    <Logo/>
                    <Stack className="sidebarContainer"
                           spacing={2}>
                        <SidebarItem text={true} value="Home" Button={Button} Icon={HomeIcon}/>
                        <SidebarItem text={true} value="Profile" Button={Button} Icon={PersonIcon}/>
                        <SidebarItem text={true} value="Post" Button={Button} Icon={PostAddIcon}/>
                    </Stack>
                </Stack>
                <SidebarUserProfile/>
            </Drawer>
            <Drawer
                variant="permanent"
                PaperProps={{style: {position: "relative"}}}
                sx={{...stylePropsSidebarMini}} open>
                <div className="sidebarMini">
                    <div className="iconContainer">
                        <Avatar className="icon" alt="SuperAlgos" src={pic}/>
                    </div>
                    <Stack className="sidebarMiniContainer"
                           spacing={2}>
                        <SidebarItem text={false} value="Home" Button={Button} Icon={HomeIcon}/>
                        <SidebarItem text={false} value="Profile" Button={Button} Icon={PersonIcon}/>
                        <SidebarItem text={false} value="Post" Button={Button} Icon={PostAddIcon}/>
                    </Stack>
                </div>
                <SidebarUserProfile/>
            </Drawer>
        </div>
    );
}

export default Sidebar;
