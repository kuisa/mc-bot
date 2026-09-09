const fs = require("fs");
const path = require("path");

const {
    createBot
} = require("./bot-template");


const BOTS_FILE =
    path.join(__dirname, "bots.json");



const runningBots = {};




function loadConfigs(){

    try{

        if(!fs.existsSync(BOTS_FILE)){

            fs.writeFileSync(
                BOTS_FILE,
                "[]"
            );

        }


        const data =
            fs.readFileSync(
                BOTS_FILE,
                "utf8"
            );


        if(!data.trim()){

            return [];

        }


        return JSON.parse(data);



    }catch(err){

        console.error(
            err
        );

        return [];

    }

}




function saveConfigs(bots){

    fs.writeFileSync(

        BOTS_FILE,

        JSON.stringify(
            bots,
            null,
            4
        )

    );

}





/*
    自动生成管理名称

    Bot-001
    Bot-002
*/

function generateName(){


    const bots =
        loadConfigs();


    let id = 1;



    while(true){


        const name =
            "Bot-" +
            String(id)
            .padStart(3,"0");



        const exists =
            bots.find(
                b =>
                b.name === name
            );



        if(!exists){

            return name;

        }


        id++;


    }

}






function findConfig(name){


    return loadConfigs()
        .find(
            b =>
            b.name === name
        );


}






function addBot(config){



    const bots =
        loadConfigs();



    /*
        自动管理名称
    */

    config.name =
        String(config.name).trim();



    /*
        Minecraft登录名字固定

    */

    config.username =
        String(config.username || "Admin").trim();



    bots.push(
        config
    );



    saveConfigs(
        bots
    );



    return config;

}








function deleteBot(name){


    if(runningBots[name]){


        runningBots[name].stop();


        delete runningBots[name];


    }



    let bots =
        loadConfigs();



    bots =
        bots.filter(
            b =>
            b.name !== name
        );



    saveConfigs(
        bots
    );


    return true;

}








function startBot(name){


    if(runningBots[name]){

        return {

            success:false,

            error:
            "Bot已经运行"

        };

    }



    const config =
        findConfig(name);



    if(!config){


        return {

            success:false,

            error:
            "找不到Bot"

        };

    }



    const instance =
        createBot(

            config,

            ()=>{}

        );



    runningBots[name] =
        instance;



    /*
        监听断线

        重新创建实例

        更新runningBots引用
    */

    if(instance && instance.bot){

        instance.bot.on(
            "end",
            ()=>{


                delete runningBots[name];


                console.log(
                    `[MANAGER] ${name} disconnected`
                );


                setTimeout(
                    ()=>{


                        console.log(
                            `[MANAGER] reconnect ${name}`
                        );


                        startBot(
                            name
                        );


                    },

                    5000

                );


            }

        );

    }



    return {

        success:true

    };


}








function stopBot(name){



    const bot =
        runningBots[name];



    if(!bot){

        return {

            success:false

        };

    }



    bot.stop();



    delete runningBots[name];



    return {

        success:true

    };

}







function restartBot(name){



    stopBot(name);



    setTimeout(

        ()=>{

            startBot(name);

        },

        1000

    );



    return {

        success:true

    };

}








function getAllStatus(){



    const configs =
        loadConfigs();




    return configs.map(

        config=>{


            const instance =
                runningBots[
                    config.name
                ];




            if(!instance){


                return {


                    name:
                    config.name,


                    host:
                    config.host,


                    port:
                    config.port,

                    username:
                        config.username || "Admin",

                    status:
                    "offline",


                    health:0,


                    food:0,


                    position:null,


                    onlineTime:0,


                    antiAfk:
                    config.antiAfk === true,


                    autoChat:
                    config.autoChat === true,

                };


            }





            return {

                name:
                config.name,

                host:
                config.host,

                port:
                config.port,

                username:
                    config.username || "Admin",

                status:
                instance.status.status,

                health:
                instance.status.health,

                food:
                instance.status.food,

                position:
                instance.status.position,

                onlineTime:
                instance.status.onlineTime,

                antiAfk:
                config.antiAfk === true,

                autoChat:
                config.autoChat === true,

            };


        }

    );


}







function autoStartBots(){


    const bots =
        loadConfigs();



    bots.forEach(

        (bot,index)=>{


            if(bot.autoStart){


                setTimeout(

                    ()=>{


                        startBot(
                            bot.name
                        );


                    },


                    index * 3000

                );


            }


        }

    );

}








module.exports = {


    loadConfigs,

    saveConfigs,

    addBot,

    deleteBot,

    startBot,

    stopBot,

    restartBot,

    getAllStatus,

    autoStartBots


};