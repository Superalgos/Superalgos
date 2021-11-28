import './Feed.css';
import PostPlaceholder from "../postPlaceholder/PostPlaceholder";
import PostsFeed from "../postsFeed/PostsFeed";

const Feed = () => {
    return (
        <div className="feed">
                <PostPlaceholder/>
                <PostsFeed/>
            </div>
    );
}

export default Feed;
