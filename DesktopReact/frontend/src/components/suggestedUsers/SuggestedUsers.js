import "./SuggestedUsers.css"
import React, { useEffect, useState } from 'react';
import ShowMoreUsers from "../showMoreUsers/ShowMoreUsers";
import { Skeleton, Stack } from "@mui/material";
import { STATUS_OK } from "../../api/httpConfig";
import { getPaginationProfiles } from "../../api/profile.httpService";
import UserCard from "../UserCard/UserCard";
import { useDispatch, useSelector } from 'react-redux'
import { setSuggestedUsersList, addSuggestedUsersList } from '../../store/slices/suggestedUsers.slice'


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
    const dispatch = useDispatch();
    const suggestedUsersList = useSelector(state => state.suggestedUsers.suggestedUsersList)
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [initialPaginationIdex, setInitialPaginationIndex] = useState(7);
    const [pagination, setPagination] = useState(3);

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
        getPaginationProfiles().then( promiseResponse => {
            promiseResponse.json().then( response =>{
                const { data , result} = response; 
                if (result === STATUS_OK) {
                   dispatch( setSuggestedUsersList(data) );
                }
            });
        })
    }, []);

    const followCallback = (userProfile) => {

    }

    const showMoreCallback = () => {
        const paginationIndex = suggestedUsersList.length + initialPaginationIdex;
        getPaginationProfiles(paginationIndex, pagination).then( promiseResponse => {
            promiseResponse.json().then( response => {
                const {data, result} = response;
                if(result === STATUS_OK){
                    const arr = suggestedUsersList.concat(data)
                    dispatch( setSuggestedUsersList(arr) )
                    const docElement = document.getElementById('scroll-div')
                    docElement.scrollTop = docElement.scrollHeight
                }
            })
        })  
    }

    return (
        <>
        <div className='scroll-element' id='scroll-div' >
            <Stack 
                direction="column"
                justifyContent="flex-start"
                alignItems="center"
                spacing={1}
                width="20rem"
            >
                { 
                    suggestedUsersList 
                        ? suggestedUsersList.map( (profile, index) => {
                            return <UserCard 
                                key={index} 
                                id={index} 
                                name={profile.userProfileHandle}
                                userId={profile.userProfileId}
                                followCallback={followCallback} 
                            /> })
                        : (skeletons) 
                }
            </Stack>
        </div>
        <ShowMoreUsers  showMoreCallback={showMoreCallback}/>
        </>
    );
};
export default SuggestedUsers;
