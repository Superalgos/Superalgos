import './App.css';
import Sidebar from "../sidebar/Sidebar";
import {Stack} from "@mui/material";
import {Outlet, useNavigate} from "react-router-dom";
import UsersSidebar from "../usersSidebar/UsersSidebar";
import {useDispatch, useSelector} from "react-redux";
import {getProfile} from "../../api/profile.httpService";
import {useEffect} from "react";
import {STATUS_OK} from "../../api/httpConfig";
import {setActualProfile} from "../../store/slices/Profile.slice";

function App() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.actualUser);
    let navigate = useNavigate();

    const loadUser = async () => {
        if (user) return;
        let {data, result} = await getProfile().then(response => response.json());
        console.log({data, result})
        if (data.missingProfile) {
             navigate("/signUp")
        }
        if (result === STATUS_OK) {
            dispatch(setActualProfile(data))
        }
    }

    useEffect(() => {
        loadUser();
    }, [navigate]);

    return (
        <div className="app">
            <Stack className="app"
                   direction="row"
                   justifyContent="space-around">
                <Sidebar/>
                <Outlet className="middleSection"/>
                <UsersSidebar/>
            </Stack>

        </div>
    );
}

export default App;
