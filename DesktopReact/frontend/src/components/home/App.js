import './App.css';
import Sidebar from "../sidebar/Sidebar";
import UsersSidebar from "../UsersSidebar/UsersSidebar";
import {Stack} from "@mui/material";
import {Outlet} from "react-router-dom";
import {getProfiles} from '../../api/service'

function App() {
    getProfiles().then( response => {
        console.log(response)
    });
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
