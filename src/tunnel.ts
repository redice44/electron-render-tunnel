import * as Electron from 'electron';

interface tunnelMessage {
  id: number,
  data: any
};

const prefix: string = 'TUNNEL';
const delim: string = '-';

let channel: string = '';

export class Tunnel {
  ipcRenderer: Electron.IpcRenderer;
  channel: string;
  id: number;

  constructor(id: number, ipcRenderer: Electron.IpcRenderer, channel: string) {
    this.ipcRenderer = ipcRenderer;
    this.channel = channel;
    this.id = id;
  }

  listen(cb: Function) {
    this.ipcRenderer.on(`${this.channel}`, cb);
  }

  send(data) {
    this.ipcRenderer.send(`${this.channel}`, {
      id: this.id,
      data: data
    });
  }
}

export const createTunnel = (ipcMain: Electron.IpcMain, windows: [Electron.BrowserWindow, Electron.BrowserWindow]): void => {
  channel = makeTunnelChannel(windows[0].webContents.id, windows[1].webContents.id);

  ipcMain.on(channel, (event, arg: tunnelMessage) => {
    otherWindow(windows, arg.id).webContents.send(channel, arg.data);
  });

  windows.forEach((window) => {
    window.webContents.once('dom-ready', () => {
      window.webContents.send(`${prefix}${delim}NEW`, { 
        channel: channel,
        targetId: otherWindow(windows, window.webContents.id).webContents.id
      });
    });
  });
};

export const makeTunnelChannel = (firstRenderer: number, secondRenderer: number): string => {
  return `${prefix}${delim}${orderNumbers(firstRenderer, secondRenderer)}`;
}

const orderNumbers = (first: number, second: number): string => {
  return first > second ? `${second}${delim}${first}`: `${first}${delim}${second}`;
}

const otherWindow = (windows: [Electron.BrowserWindow, Electron.BrowserWindow], id: number): Electron.BrowserWindow => {
  return windows[0].webContents.id === id ? windows[1] : windows[0];
};
