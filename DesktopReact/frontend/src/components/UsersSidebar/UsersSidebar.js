import './UsersSidebar.css';
import {Stack, Typography} from "@mui/material";
import SuggestedUsers from "../suggestedUsers/SuggestedUsers";


const UsersSidebar = () => {

    const showMoreCallback = () => console.log("clicked show more");
    return (
        <Stack 
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            sx={{minWidth: "max-content"}}
            >
            {/*<SearchBox/>*/}
            <Typography> Suggested Users</Typography>
            <SuggestedUsers/>
        </Stack>
    );
}

export default UsersSidebar;
