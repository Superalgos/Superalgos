import "./SuggestedUsers.css"
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux'
import {Skeleton, Stack} from "@mui/material";
import ShowMoreUsers from "../showMoreUsers/ShowMoreUsers";
import UserCard from "../userCard/UserCard";
import {getPaginationProfiles, getProfile} from "../../api/profile.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import {setSuggestedUsersList} from '../../store/slices/suggestedUsers.slice'

/* TODO remove unused code */
const SuggestedUsers = () => {
    //  TODO change this, should not be here
    const skeletons = [<div key={0} className="skeleton">
        <Skeleton variant="circular" width="3rem" height="3rem"/>
        <Skeleton variant="text"
                  width="8rem"/>
        <Skeleton variant="text"
                  width="4rem"/>
    </div>, <div key={1} className="skeleton">
        <Skeleton variant="circular" width="3rem" height="3rem"/>
        <Skeleton variant="text"
                  width="8rem"/>
        <Skeleton variant="text"
                  width="4rem"/>
    </div>, <div key={2} className="skeleton">
        <Skeleton variant="circular" width="3rem" height="3rem"/>
        <Skeleton variant="text"
                  width="8rem"/>
        <Skeleton variant="text"
                  width="4rem"/>
    </div>]
    const dispatch = useDispatch();
    const suggestedUsersList = useSelector(state => state.suggestedUsers.suggestedUsersList)
    const [loading, setLoading] = useState(true);
    const /*[*/pagination/*, setPagination] */ =/* useState(*/3/*)*/;

    useEffect(() => {
        const loadUsers = async () => {
            const {data, result} = await getPaginationProfiles().then(response => response.json())
            if (result === STATUS_OK) {
                const usersList = await loadSuggestedUsersInfo(data)
                dispatch(setSuggestedUsersList(usersList));
            }
        };

        setLoading(true);
        loadUsers();
        setLoading(false);
    }, []);

    const followCallback = (userProfile) => {

    }

    const loadSuggestedUsersInfo = async (rawUsersData) => {
        return await Promise.all(
            rawUsersData.map(async (user) => {
                const {
                    data,
                    result
                } = await getProfile({socialPersonaId: user.socialPersonaId}).then(response => response.json());
                return {...user, profilePic: data?.profilePic}
            })
        );
    }

    const showMoreCallback = async () => {
        const paginationIndex = suggestedUsersList.length + initialPaginationIndex;
        const {
            data,
            result
        } = await getPaginationProfiles(paginationIndex, pagination).then(response => response.json());

        if (result === STATUS_OK) {
            const usersList = await loadSuggestedUsersInfo(data);
            dispatch(
                setSuggestedUsersList(suggestedUsersList.concat(usersList))
            );

            const docElement = document.getElementById('scroll-div')
            docElement.scrollTop = docElement.scrollHeight
        }
    }

    return (
        <>
            <div className='scroll-element' id='scroll-div'>
                <Stack
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                    spacing={1}
                    width="20rem"
                >
                    {
                        (!loading) || suggestedUsersList
                            ? suggestedUsersList.map((profile, index) => {
                                return <UserCard
                                    key={index}
                                    id={index}
                                    name={profile.socialPersonaHandle}
                                    userId={profile.socialPersonaId}
                                    profilePic={profile.profilePic}
                                    followCallback={followCallback}
                                />
                            })
                            : (skeletons)
                    }
                </Stack>
            </div>
            <ShowMoreUsers showMoreCallback={showMoreCallback}/>
        </>
    );
};
export default SuggestedUsers;
