import './Sidebar.css';
import {Avatar, Button, Card, CardMedia, Divider, Drawer, Stack} from "@mui/material";
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
    /*const menuOptions = [{name: "Home", icon: HomeIcon},
        {name: "Profile", icon: PersonIcon},
        {name: "Post", icon: PostAddIcon}
        /!*, "Explore", "Notifications", "Messages", "Bookmarks", "Lists", "More"*!/]*/

    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const drawerWidth = 240;

    /*const menuItems = menuOptions.map(option => {
        return <SidebarItem key={option.name} Icon={option.icon} value={option.name}/>
    })*/

    return (
        <div className="sidebar">
            <Drawer
                variant="permanent"
                PaperProps={{style: {position: "relative"}}}
                sx={{ height: "100%",
                    display: {xs: 'none', sm: 'none', md: 'none', lg: 'block'},
                    '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},}}open>
            <Stack direction="column"
                   spacing={5}
                   sx={{minWidth: "max-content"}}>
                <Logo/>
                <Stack className="sidebarContainer"
                    spacing={2}
                    divider={<Divider orientation="horizontal" flexItem/>}>
                    <SidebarItem text={true} value="Home" Button={Button} Icon={HomeIcon}/>
                    <SidebarItem text={true} value="Profile" Button={Button} Icon={PersonIcon}/>
                    <SidebarItem text={true} value="Post" Button={Button} Icon={PostAddIcon}/>
                </Stack>
            </Stack>
            <Card className="sidebarProfileCard" variant="outlined">
                <CardMedia className="avatar"
                           component="img"
                           image={pic}
                           alt="PP"/>
                <SidebarUserProfile/>
            </Card>
            </Drawer>
            <Drawer
                variant="permanent"
                PaperProps={{style: {position: "relative"}}}
                sx={{ height: "100%",
                    display: { xs: 'block', sm: 'block', md: 'block', lg: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth - 185},}}open>
                <div className="sidebarMini">
                    <Avatar className="icon" alt="SuperAlgos" src={pic}/>
                    <Stack className="sidebarMiniContainer"
                           spacing={2}
                           divider={<Divider orientation="horizontal" flexItem/>}>
                        <SidebarItem text={false} value="Home" Button={Button} Icon={HomeIcon}/>
                        <SidebarItem text={false} value="Profile" Button={Button} Icon={PersonIcon}/>
                        <SidebarItem text={false} value="Post" Button={Button} Icon={PostAddIcon}/>
                    </Stack>
                </div>
                {/* todo broken with new merge, review */}
                <Card className="sidebarProfileCard" variant="outlined" sx={{border: "0px"}}>
                    <CardMedia className="avatar"
                               sx={{ paddingLeft: "0px"}}
                               component="img"
                               image={pic}
                               alt="PP"/>
                    <SidebarUserProfile/>
                </Card>
            </Drawer>
        </div>
    );
}

export default Sidebar;
