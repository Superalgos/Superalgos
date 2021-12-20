import "./SuggestedUsers.css"
import React, {useEffect, useState} from 'react';
import ShowMoreUsers from "../showMoreUsers/ShowMoreUsers";
import {Stack} from "@mui/material";
import {getProfiles, STATUS_OK} from "../../api/service";
import UserCard from "../User/UserCard";


const SuggestedUsers = () => {

    const [users, setUsers] = useState([]);
    const loadProfiles = async () => {
        let {data, result} = await getProfiles().then(response => response.json());
        if (result === STATUS_OK) {
            let mappedUsers = data.map((profile, index) => {
                let callBack = () => console.log(`Clicked follow on user${profile.userProfileHandle}`);
                return <UserCard key={index} id={index} name={`user${profile.userProfileHandle}`}
                                 followCallback={callBack}/>
            });
            setUsers(mappedUsers);
        }

    }

    useEffect(() => {
        return loadProfiles();
    }, []);


    return (
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={1}>
            {users}
            <ShowMoreUsers/>
        </Stack>
    );
};
export default SuggestedUsers;
