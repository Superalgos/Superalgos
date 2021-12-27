import "./SuggestedUsers.css"
import React, {useEffect, useState} from 'react';
import ShowMoreUsers from "../showMoreUsers/ShowMoreUsers";
import {Skeleton, Stack} from "@mui/material";
import {STATUS_OK} from "../../api/httpConfig";
import {getProfiles} from "../../api/profile.httpService";
import UserCard from "../UserCard/UserCard";


const SuggestedUsers = () => {
    //  TODO change this, should not be here
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
    const loadProfiles = async () => {
        setLoading(true)
        let {data, result} = await getProfiles().then(response => response.json());
        if (result === STATUS_OK) {
            let mappedUsers = data.map((profile, index) => {
                let callBack = () => console.log(`Clicked follow on user${profile.userProfileHandle}`);
                return <UserCard key={index} id={index} name={profile.userProfileHandle}
                                 userId={profile.userProfileId}
                                 followCallback={callBack}/>
            });
            setUsers(mappedUsers);
        }
        setLoading(false);

    }

    useEffect(() => {
        return loadProfiles();
    }, []);


    return (
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={1}
               width="20rem">

            {
                loading ? (skeletons) : (users)
            }
            {/*<ShowMoreUsers  showMoreCallback={() => {console.log("need to show more users")}}/> TODO hacer que vuelva a llamar al back con otro tamaño de paginacion*/}
        </Stack>
    );
};
export default SuggestedUsers;
