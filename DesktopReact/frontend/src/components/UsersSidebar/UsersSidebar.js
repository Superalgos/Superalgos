import './UsersSidebar.css';
import {Stack} from "@mui/material";
import SearchBox from "../searchBox/SearchBox";
import SuggestedUsers from "../suggestedUsers/SuggestedUsers";


const UsersSidebar = () => {

    const showMoreCallback = () => console.log("clicked show more");
    return (
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={2}
               sx={{minWidth: "max-content"}}>

            <SearchBox/>
            <SuggestedUsers showMoreCallback={showMoreCallback}/>
        </Stack>
    );
}

export default UsersSidebar;
