//iske andar ham user ka context rakhenge taki user logedin rahe 
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios"
import server from "../main.jsx"
// Ek dabba banaya. null uski shuruaati value hai — jab tak koi Provider nahi hai, sabko null milega.
const AppContext = createContext(null)

//Ye wo component hai jo dabbe ko bharta hai aur sabko deta hai.
export const AppProvider = ({children})=>{
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)
    const [isAuth,setIsAuth] = useState(false)

 async function FetchUser() {
    setLoading(true)
    try {
        const {data} = await axios.get(`${server}/api/v1/my`,{
            withCredentials:true
        })
        setUser(data)
        setIsAuth(true)
    } catch (error) {
        console.log(error)
         setUser(null)
    setIsAuth(false)
    }finally{setLoading(false)}
}
//useEffect ka matlab: "render ke baad ye chalao."
useEffect(()=>{
   FetchUser()
},[])
return <AppContext.Provider value={{user,setUser,isAuth,setIsAuth,loading}}>{children}</AppContext.Provider>
}

export const AppData = () =>{
    const context = useContext(AppContext)
    if(!context) throw new Error("app dta must be used within the appprovider1")
        return context 

}