import axios from "axios";


const githubStorage = axios.create({
    baseURL: "https://raw.githubusercontent.com/"
});

export default {
    getPost() {
        return githubStorage.get('/theblockchainarborist/Social_Trading_App/main/TestPostData.json');
    }
}