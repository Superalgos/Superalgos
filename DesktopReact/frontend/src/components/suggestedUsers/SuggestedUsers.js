import "./SuggestedUsers.css"
import React, {useEffect, useState} from 'react';
import ShowMoreUsers from "../showMoreUsers/ShowMoreUsers";
import {Skeleton, Stack} from "@mui/material";
import {STATUS_OK} from "../../api/httpConfig";
import {getProfiles} from "../../api/profile.httpService";
import UserCard from "../User/UserCard";


const SuggestedUsers = () => {
    const skeletons = [<div className="skeleton">
        <Skeleton variant="circular" width="3rem" height="3rem"/>
        <Skeleton variant="text"
                  width="8rem"/>
        <Skeleton variant="text"
                  width="4rem"/>
    </div>, <div className="skeleton">
        <Skeleton variant="circular" width="3rem" height="3rem"/>
        <Skeleton variant="text"
                  width="8rem"/>
        <Skeleton variant="text"
                  width="4rem"/>
    </div>, <div className="skeleton">
        <Skeleton variant="circular" width="3rem" height="3rem"/>
        <Skeleton variant="text"
                  width="8rem"/>
        <Skeleton variant="text"
                  width="4rem"/>
    </div>]

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [reload, setReload] = useState(0);
    const loadProfiles = async () => {
        console.log('loading profiles')
        setLoading(true)
        let {data, result} = await getProfiles().then(response => response.json());
        if (result === STATUS_OK) {
            let mappedUsers = data.map((profile, index) => {
                let callBack = () => console.log(`Clicked follow on user${profile.userProfileHandle}`);
                return <UserCard key={index} id={index} name={`user${profile.userProfileHandle}`}
                                 followCallback={callBack}/>
            });
            setUsers(mappedUsers);
        }
        setLoading(false);

    }

    useEffect(() => {
        return loadProfiles();
    }, [reload]);

    const reloadUsers = () => {
      setReload((val)=> val++ );
    }

    return (
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={1}
               width="20rem">

            {
                loading ? (skeletons) : (users)
            }
            <ShowMoreUsers  showMoreCallback={reloadUsers}/>
        </Stack>
    );
};
export default SuggestedUsers;
