// import React from "react"
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Home from "./pages/home.jsx"
import Login from "./Login.jsx"
import {ToastContainer} from "react-toastify"
import VerifyOtp from "./Verifyotp.jsx"
const App = ()=>{
  return  <>
  <BrowserRouter>
<Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path="/verifyotp" element={<VerifyOtp/>}/>
  <Route path="/" element={<Home/>}/>
  <Route path="/" element={<Home/>}/>
</Routes>
<ToastContainer/>
</BrowserRouter>
  </>
}
export default App