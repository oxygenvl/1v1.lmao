var version = "v1.2";
fetch("https://raw.githubusercontent.com/Kepler-11/1v1.lmao/main/server/version.json").then((res) => res.text()).then(text => {
    var json = JSON.parse(text);
    var currentVersion = json.currentVersion;
    if (currentVersion != version) {
        alert("1v1.lmao is outdated!\nYour version: " + version + "\nNewest version: " + currentVersion + "\nPlease update.");
        location.href = "https://github.com/Kepler-11/1v1.lmao";
    }
});

var send = WebSocket.prototype.send,
    buffers = [],
    on = false,
    cheats = [],
    gui = true

function cheat(name, key, status, update) {
    this.name = name;
    this.key = key;
    this.status = status;
    this.update = update;

    this.toggle = function() {
        this.status = !this.status;
        if (typeof this.update == 'function') this.update(this.status, this);
    }
}

function getCheat(name) {
    var _return;
    cheats.forEach(cheat => {
        if (cheat.name == name) _return = cheat;
    });
    return _return;
}

cheats.push(new cheat("gui", "`", true));

cheats.push(new cheat("blink", "t", false, function(status, me) {
    if (status) {
        WebSocket.prototype.send = function(...arguments) {
            buffers.push([this, arguments]);
        };
    } else {
        getCheat("blink").time = 0;
        if (buffers.length != 0) {
            for (let i in buffers) {
                var buffer = buffers[i];
                send.apply(buffer[0], buffer[1]);
            }
            buffers = [];
        }
        WebSocket.prototype.send = send;
    }
}));
getCheat("blink").time = 0;

document.addEventListener("keydown", function(event) {
    for (let i in cheats) {
        var cheat = cheats[i];
        if (event.key == cheat.key) cheat.toggle();
    }
});

setInterval(function() {
    var cheatGui = document.querySelector("#cheatGui");
    if (cheatGui) cheatGui.remove();

    var div = document.createElement("div");
    div.id = "cheatGui";
    div.style = `
    border-radius: 25px;
    font-family: "Comic Sans MS";
    color: grey;
    text-align: center;
    top: 0;
    position: absolute;
    width: 225px;
    background-color: black;
    z-index:10000;
    `;

    div.innerHTML += "<h1>1v1.lmao</h1>";
    for (let i in cheats) {
        var cheat = cheats[i];
        var key = cheat.key.toUpperCase();
        var name = cheat.name.toUpperCase();
        var status = cheat.status ? "ON" : "OFF";
        var statusColor = cheat.status ? "lime" : "red";
        var seconds = cheat.name == "blink" && cheat.status ? " (" + parseFloat(cheat.time / 10) + `${parseInt(cheat.time / 10) == cheat.time / 10 ? ".0" : ""})` : "";
        div.innerHTML += `<span>[${key}] ${name} <span style="color:${statusColor}">${status}${seconds}</span></span><br>`;
    }

    var gameContainer = document.querySelector("#gameContainer");
    if (gameContainer && getCheat("gui").status) {
        gameContainer.style.position = "relative";
        gameContainer.appendChild(div);
    }
    if (getCheat("blink").status) getCheat("blink").time += 1;
}, 100);
