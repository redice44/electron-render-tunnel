"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var prefix = 'TUNNEL';
var delim = '-';
var channel = '';
var Tunnel = /** @class */ (function () {
    function Tunnel(id, ipcRenderer, channel) {
        this.ipcRenderer = ipcRenderer;
        this.channel = channel;
        this.id = id;
    }
    Tunnel.prototype.listen = function (cb) {
        this.ipcRenderer.on("" + this.channel, cb);
    };
    Tunnel.prototype.send = function (data) {
        this.ipcRenderer.send("" + this.channel, {
            id: this.id,
            data: data
        });
    };
    return Tunnel;
}());
exports.Tunnel = Tunnel;
exports.createTunnel = function (ipcMain, windows) {
    channel = exports.makeTunnelChannel(windows[0].webContents.id, windows[1].webContents.id);
    ipcMain.on(channel, function (event, arg) {
        otherWindow(windows, arg.id).webContents.send(channel, arg.data);
    });
    windows.forEach(function (window) {
        window.webContents.once('dom-ready', function () {
            window.webContents.send("" + prefix + delim + "NEW", {
                channel: channel,
                targetId: otherWindow(windows, window.webContents.id).webContents.id
            });
        });
    });
};
exports.rendererInit = function (ipcRenderer, cb) {
    ipcRenderer.on("" + prefix + delim + "NEW", cb);
};
exports.makeTunnelChannel = function (firstRenderer, secondRenderer) {
    return "" + prefix + delim + orderNumbers(firstRenderer, secondRenderer);
};
var orderNumbers = function (first, second) {
    return first > second ? "" + second + delim + first : "" + first + delim + second;
};
var otherWindow = function (windows, id) {
    return windows[0].webContents.id === id ? windows[1] : windows[0];
};
//# sourceMappingURL=tunnel.js.map