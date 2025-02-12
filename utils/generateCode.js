const User = require("../models/userModel");

const generateCode = () =>{
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let code = "";

    for (let i = 0; i < 3; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
        code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return code;
}

const generateUniqueCode =async () => {
    let agentCode ;
    let isUnique = false;
    while(!isUnique){
        agentCode = generateCode();
        

        const existingAgentCode = await User.findOne({ agent_code: agentCode ,userType:"agent"});

        if (!existingAgentCode) {
            isUnique = true;
        }   
       
    }
    return agentCode;
    
}

module.exports = {
    generateUniqueCode
}