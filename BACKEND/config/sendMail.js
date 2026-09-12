import {createTransport} from "nodemailer"

const sendMail = async({email,subject,html})=>{
    const transport = createTransport({
        host:"smtp.gmail.com",
        port:465,
        auth:{
user:"afdbdh",
pass:"hasdfh"
        },
    })
await transport.sendMail({
    from:"hsjfh",
    to:email,
    html
})
}

export default sendMail