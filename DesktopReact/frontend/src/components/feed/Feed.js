import './Feed.css';
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from 'react-redux'
import PostPlaceholder from "../postPlaceholder/PostPlaceholder";
import PostsFeed from "../postsFeed/PostsFeed";
import {getFeed} from "../../api/post.httpService";
import {getProfile} from '../../api/profile.httpService'
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const socialPersona = useSelector(state => state.profile.socialPersona);
    const actualUser = useSelector(state => state.profile.actualUser)

    useEffect(() => {
        loadPosts();
    }, []);

    const drawFeedPosts = async (rawPosts) => {
        const mappedPosts = await Promise.all(
            rawPosts.map(async (post, index) => {
                if (post.eventType === 10) {
                    const {data, result} = await getProfile({socialPersonaId: post.originPost.originSocialPersonaId})
                        .then(response => response.json())
                    const postData = {
                        postText: post?.postText,
                        originPostHash: post?.originPost.originPostHash,
                        reactions: post?.originPost.reactions,
                        postType: post?.originPost.postType,
                        repliesCount: post?.originPost.repliesCount,
                        creator: {
                            name: data?.name,
                            profilePic: data?.profilePic,
                            originSocialPersonaId: data?.nodeId,
                            username: data?.userProfileHandle
                        }
                    }
                    return <Post key={Math.random()} id={index} postData={postData}/>
                }

            })
        )
        setPosts(mappedPosts)
    }

    const loadPosts = async () => {
        setLoading(true);
        const {
            data,
            result
        } = await getFeed({originSocialPersonaId: socialPersona.nodeId}).then(response => response.json());
        if (result === STATUS_OK) {
            await drawFeedPosts(data);
        }
        setLoading(false);
    }

    return (
        <div className="feed">
            <div className="feedContainer">
                <PostPlaceholder reloadPostCallback={loadPosts}/>
            </div>
            <PostsFeed posts={posts} loading={loading}/>
        </div>
    );
}

export default Feed;
