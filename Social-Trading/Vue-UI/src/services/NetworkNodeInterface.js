import axios from "axios";

const NetworkNodeInterface = axios.create({
    baseURL: "http://localhost:31248"
});

export default {
    getGithubInfo() {
        return NetworkNodeInterface.get('/New-Message')
    }
}