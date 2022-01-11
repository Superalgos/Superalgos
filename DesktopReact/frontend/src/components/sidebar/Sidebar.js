import './Sidebar.css';
import {Divider, Stack, Button, Drawer, Box, IconButton} from "@mui/material";
import SidebarItem from "../sidebarItem/SidebarItem";
import Logo from "../logo/Logo";
import {LoginOutlined} from '@mui/icons-material'
import HomeIcon from '@mui/icons-material/Home';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
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
        <>

            <div className="sidebar">

            <Box sx={{display: 'flex', width: {sm: `calc(100% - ${drawerWidth}px)`},
                }}>
                <CssBaseline/>
                {/*<AppBar
                        position="fixed"
                        sx={{
                            width: {sm: `calc(100% - ${drawerWidth}px)`},
                            ml: {sm: `${drawerWidth}px`},
                        }}
                    >*/}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{marginRight: '36px',
                        ...(mobileOpen && { display: 'none' }),}}
                >
                    <MenuIcon/>
                </IconButton>
                <Stack direction="column"
                       justifyContent="flex-start"
                       alignItems="center"
                       spacing={5}
                       sx={{minWidth: "max-content"}}>
                    <Logo/>
                    <Stack className="sidebarContainer"
                           direction="column"
                           spacing={2}
                           divider={<Divider orientation="horizontal" flexItem/>}>
                        {/*{menuItems}*/}

                        <SidebarItem value="Home" Button={Button} Icon={HomeIcon}/>
                        <SidebarItem value="Profile" Button={Button} Icon={PersonIcon}/>
                        <SidebarItem value="Post" Button={Button} Icon={PostAddIcon}/>
                    </Stack>
                </Stack>
                {/*</AppBar>*/}
                <Drawer open={mobileOpen}
                    variant="temporary"
                    anchor="left"
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}>

                </Drawer>
            </Box>
            </div>
        </>
    );
}

export default Sidebar;
