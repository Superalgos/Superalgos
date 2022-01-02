import './Feed.css';
import PostPlaceholder from "../postPlaceholder/PostPlaceholder";
import PostsFeed from "../postsFeed/PostsFeed";
import {getPosts} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";
import React, {useEffect, useState} from "react";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        setLoading(true)
        getPosts().then(promiseResponse => {
            const mappedPosts = [];
            let parsedPromiseResponse = promiseResponse.json();
            parsedPromiseResponse.then(response => {
                const {data, result} = response
                if (result === STATUS_OK) {
                    data.map((post, index) => {
                        if (post.eventType === 10) {
                            mappedPosts.push(<Post key={Math.random()} id={index} postData={post}/>)
                        }
                    })
                    setPosts(mappedPosts);
                }
                setLoading(false);
            })
        })
    }

    useEffect(() => {
        loadPosts();
    }, []);

    return (
        <div className="feed">
            <PostPlaceholder reloadPostCallback={loadPosts}/>
            <PostsFeed posts={posts} loading={loading}/>
        </div>
    );
}

export default Feed;
