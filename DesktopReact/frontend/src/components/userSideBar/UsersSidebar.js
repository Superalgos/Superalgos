import './UsersSidebar.css';
import {Drawer, Stack, Typography} from "@mui/material";
import SuggestedUsers from "../suggestedUsers/SuggestedUsers";


const UsersSidebar = () => {
    const drawerWidth = 240;
    const showMoreCallback = () => console.log("clicked show more");
    return (
        <Drawer className="usersSidebarContainer"
                variant="permanent"
                PaperProps={{style: {position: "relative"}}}
                sx={{display: {xs: 'none', sm: 'none', md: 'block'}}}>
            <Stack
                direction="column"
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
                sx={{minWidth: "max-content"}}>
                {/*<SearchBox/>*/}
                <Typography> Suggested Users</Typography>
                <SuggestedUsers/>
            </Stack>
        </Drawer>
    );
}

export default UsersSidebar;
