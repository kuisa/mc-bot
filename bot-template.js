const mineflayer = require("mineflayer");


function createBot(config, callback) {

    console.log(
        `[CONNECT] ${config.name} -> ${config.host}:${config.port}`
    );


    let bot = null;

    let stopped = false;


    try {

        bot = mineflayer.createBot({

            host: config.host,

            port: Number(config.port),

            username: config.username || "Admin",

            version: config.version || false

        });


    } catch (err) {

        console.log(
            `[CREATE ERROR] ${config.name}: ${err.message}`
        );

        return null;

    }



    /*
        Task列表
    */

    const tasks = {};



    /*
        Bot状态
    */

    let startTime = null;


    let status = {

        name:
        config.name,


        username:
        config.username || "Admin",


        status:
        "connecting",


        health:
        20,


        food:
        20,


        position:
        null,


        onlineTime:
        0,


        antiAfk:
        config.antiAfk === true,


        autoChat:
        config.autoChat === true

    };



    const safeY =
        Number(
            config.safeY || 250
        );



    /*
        清理任务
    */

    function clearTasks() {


        for(
            const key of Object.keys(tasks)
        ){

            if(tasks[key]){

                clearInterval(
                    tasks[key]
                );


                clearTimeout(
                    tasks[key]
                );

            }

        }



        for(
            const key of Object.keys(tasks)
        ){

            delete tasks[key];

        }

    }




    /*
        TP安全位置
    */

    function teleportSafe(){


        try {


            bot.chat(
                `/tp ${bot.username} 0 ${safeY} 0`
            );


            console.log(
                `[TP] ${bot.username} -> 0 ${safeY} 0`
            );


        }catch(err){


            console.log(
                `[TP ERROR] ${bot.username}: ${err.message}`
            );


        }

    }





    /*
        Creative
    */

    function setCreative(){


        try {


            bot.chat(
                `/gamemode creative ${bot.username}`
            );


            console.log(
                `[GAMEMODE] Creative ${bot.username}`
            );


        }catch(err){


            console.log(
                `[CREATIVE ERROR] ${bot.username}: ${err.message}`
            );


        }

    }





    /*
        Spawn
    */

    bot.once(
        "spawn",
        async()=>{


            console.log(
                `[ONLINE] ${config.name}`
            );


            status.status =
                "online";


            startTime =
                Date.now();



            try{

                await bot.waitForTicks(40);

            }catch{}



            teleportSafe();



            tasks.initialCreative =
            setTimeout(()=>{


                if(!stopped){

                    setCreative();

                }


            },1000);




            tasks.creative =
            setInterval(()=>{


                if(stopped){

                    return;

                }


                if(!bot.entity){

                    return;

                }


                setCreative();



            },600000);




            if(config.antiAfk !== false){


                tasks.antiAfk =
                setInterval(()=>{


                    try{


                        if(!bot.entity){

                            return;

                        }


                        bot.look(

                            bot.entity.yaw + 0.35,

                            bot.entity.pitch,

                            true

                        );


                    }catch{}



                },60000);


            }

            /*
                自动聊天
            */

            if(config.autoChat === true){


                const messages = [

                    "Anyone still alive?",

                    "Hello?",

                    "Good day folks."

                ];



                let messageIndex = 0;



                tasks.chat =
                setInterval(()=>{


                    try{


                        if(!bot.entity){

                            return;

                        }



                        bot.chat(
                            messages[messageIndex]
                        );



                        messageIndex++;



                        if(
                            messageIndex >= messages.length
                        ){

                            messageIndex = 0;

                        }



                    }catch{}



                },300000);


            }





            /*
                状态更新

                10秒一次
            */

            tasks.status =
            setInterval(()=>{


                try{


                    if(!bot.entity){

                        return;

                    }



                    status.health =
                        Number(bot.health);



                    status.food =
                        Number(bot.food);



                    status.position = {


                        x:
                        Number(
                            bot.entity.position.x.toFixed(2)
                        ),


                        y:
                        Number(
                            bot.entity.position.y.toFixed(2)
                        ),


                        z:
                        Number(
                            bot.entity.position.z.toFixed(2)
                        )


                    };




                    if(startTime){


                        status.onlineTime =
                        Math.floor(

                            (
                                Date.now() -
                                startTime

                            ) / 1000

                        );


                    }



                }catch{}



            },10000);





            if(callback){


                callback(

                    null,

                    bot,

                    status

                );


            }


        }
    );





    /*
        Health
    */


    bot.on(
        "health",
        ()=>{


            try{


                status.health =
                    Number(bot.health);



                status.food =
                    Number(bot.food);



                if(
                    bot.health < 6
                ){


                    console.log(
                        `[LOW HP] ${config.name} -> teleport`
                    );


                    teleportSafe();


                }



            }catch{}



        }
    );






    /*
        Death
    */


    bot.on(
        "death",
        ()=>{


            console.log(
                `[DEATH] ${config.name}`
            );



            setTimeout(()=>{


                if(stopped){

                    return;

                }



                try{


                    setCreative();


                    teleportSafe();



                }catch{}



            },2000);



        }
    );







    /*
        Chat
    */


    bot.on(
        "messagestr",
        msg=>{


            console.log(
                `[CHAT ${config.name}] ${msg}`
            );


        }
    );







    /*
        Kicked
    */


    bot.on(
        "kicked",
        reason=>{


            console.log(
                `[KICKED] ${config.name}`,
                JSON.stringify(reason)
            );



            status.status =
                "kicked";


        }
    );







    /*
        Error
    */


    bot.on(
        "error",
        err=>{


            console.log(
                `[ERROR ${config.name}] ${err.message}`
            );


        }
    );







    /*
        Disconnect
    */


    bot.on(
        "end",
        ()=>{


            console.log(
                `[DISCONNECTED] ${config.name}`
            );



            status.status =
                "offline";



            status.position =
                null;



            status.onlineTime =
                0;



            clearTasks();



            if(stopped){


                console.log(
                    `[STOPPED] ${config.name}`
                );


                return;


            }



        }
    );







    /*
        Stop
    */


    function stop(){


        console.log(
            `[STOP] ${config.name}`
        );



        stopped = true;



        clearTasks();




        try{


            bot.quit(
                "Bot stopped"
            );


        }catch{}



    }







    return {


        bot,

        status,

        stop


    };


}





module.exports = {


    createBot


};