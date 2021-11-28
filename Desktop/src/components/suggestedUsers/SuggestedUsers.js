import "./SuggestedUsers.css"
import React, {useEffect} from 'react';
import UserCard from "../User/UserCard";
import ShowMoreUsers from "../showMoreUsers/ShowMoreUsers";
import {Stack} from "@mui/material";


const SuggestedUsers = ({showMoreCallback}) => {
    const usersIds = [1, 2, 3, 4, 5];


    const users = usersIds.map(value => {
        let callBack = () => console.log(`Clicked follow on user${value}`);
        return <UserCard key={value} id={value} name={`user${value}`} followCallback={callBack}/>
    })

    useEffect(() => {
        console.log("SuggestedUsersConstructor called")
    }, []);


    return (
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={1}>
            {users}
            <ShowMoreUsers showMoreCallback={showMoreCallback}/>
        </Stack>
    );
};
export default SuggestedUsers;
