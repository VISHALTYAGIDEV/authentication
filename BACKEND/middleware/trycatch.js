const trycatch = (handler)=>{
    return async(req,res)=>{
        try {
            await handler(req,res)
        } catch (error) {
             console.error(error)
            res.status(500).json({
                message:error.message
            })
        }
    }
}

export default trycatch;