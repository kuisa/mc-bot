async function addBot() {


    const data = {

        name:
            document.getElementById("name").value.trim(),

        host:
            document.getElementById("host").value.trim(),

        port:
            Number(
                document.getElementById("port").value
            ),


        username:
            document.getElementById(
                "username"
            ).value.trim(),


        version:
            document.getElementById(
                "version"
            ).value.trim(),


        safeY:250,


        antiAfk:
            document.getElementById(
                "antiAfk"
            ).checked,


        autoChat:
            document.getElementById(
                "autoChat"
            ).checked,


        autoStart:
            document.getElementById(
                "autoStart"
            ).checked


    };



    const response =
        await fetch(
            "/api/add",
            {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:
                    JSON.stringify(data)

            }
        );



    const result =
        await response.json();



    if(!result.success){


        alert(
            result.error ||
            "添加失败"
        );


        return;

    }



    document.getElementById(
        "name"
    ).value="";



    alert(
        "Bot添加成功"
    );



    load();

}






async function startBot(name){


    const response =
        await fetch(
            "/api/start",
            {

                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:
                    JSON.stringify({
                        name
                    })

            }
        );



    const result =
        await response.json();



    if(!result.success){


        alert(
            result.error ||
            "启动失败"
        );

    }



    load();

}






async function stopBot(name){


    await fetch(
        "/api/stop",
        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },


            body:
                JSON.stringify({
                    name
                })

        }
    );



    load();

}







async function restartBot(name){


    await fetch(
        "/api/restart",
        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },


            body:
                JSON.stringify({
                    name
                })

        }
    );



    setTimeout(
        load,
        1500
    );


}








async function deleteBot(name){


    if(
        !confirm(
            `确定删除 ${name} 吗？`
        )
    ){

        return;

    }



    await fetch(
        "/api/delete",
        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },


            body:
                JSON.stringify({
                    name
                })

        }
    );



    load();

}








function formatTime(seconds){


    if(!seconds){

        return "0秒";

    }



    const h =
        Math.floor(
            seconds / 3600
        );



    const m =
        Math.floor(
            (seconds % 3600) / 60
        );



    const s =
        seconds % 60;



    return `${h}小时 ${m}分 ${s}秒`;

}








async function load(){


    try{


        const response =
            await fetch(
                "/api/status"
            );



        if(response.status===401){


            location.href =
                "/login.html";


            return;

        }



        const bots =
            await response.json();



        const box =
            document.getElementById(
                "bots"
            );



        box.innerHTML="";




        if(
            bots.length===0
        ){


            box.innerHTML=`

                <div class="panel">

                    <p>
                    目前没有Bot
                    </p>

                </div>

            `;


            return;

        }







        bots.forEach(

            bot=>{


                const online =
                    bot.status==="online";



                box.innerHTML += `


                <div class="bot">



                    <h3>

                        ${
                            online
                            ? "🟢"
                            : "🔴"
                        }


                        ${escapeHtml(
                            bot.name
                        )}

                    </h3>




                    <p>

                        服务器:

                        ${escapeHtml(
                            bot.host
                        )}

                        :

                        ${bot.port}

                    </p>




                    <p>

                        账号:

                        ${escapeHtml(
                            bot.username
                        )}

                    </p>





                    <p>

                        状态:

                        <span
                        class="${
                            online
                            ? "on"
                            : "off"
                        }"
                        >

                        ${bot.status}

                        </span>

                    </p>





                    <p>

                        在线:

                        ${formatTime(
                            bot.onlineTime
                        )}

                    </p>


                    <p>

                        版本:

                        ${
                            bot.version
                            ? bot.version
                            : "自动检测"
                        }

                    </p>


                    <p>

                        AFK:

                        ${
                            bot.antiAfk
                            ? "✅"
                            : "❌"
                        }


                        Chat:

                        ${
                            bot.autoChat
                            ? "✅"
                            : "❌"
                        }

                    </p>






                    ${
                        online

                        ?

                        `


                        <button
                        onclick="stopBot(
                        '${escapeJs(bot.name)}'
                        )"
                        >

                        停止

                        </button>




                        <button
                        onclick="restartBot(
                        '${escapeJs(bot.name)}'
                        )"
                        >

                        重启

                        </button>


                        `


                        :


                        `


                        <button
                        onclick="startBot(
                        '${escapeJs(bot.name)}'
                        )"
                        >

                        启动

                        </button>


                        `

                    }






                    <button
                    onclick="deleteBot(
                    '${escapeJs(bot.name)}'
                    )"
                    >

                    删除

                    </button>




                </div>


                `;


            }

        );



    }
    catch(err){


        console.error(
            err
        );


    }


}









function escapeHtml(text){


    return String(text)

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );


}








function escapeJs(text){


    return String(text)

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /'/g,
        "\\'"
    );


}







setInterval(
    load,
    3000
);



load();