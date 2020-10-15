import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const fs = require('fs')
let readline = require('readline')
let { google } = require('googleapis')
let OAuth2 = google.auth.OAuth2
const Discord = require('discord.js')
const client = new Discord.Client()

let url
let videoId

const config = require('./config.json')

//discordボットのトークン
const token = config.discord.token
//youtubeプレイリストのプレイリストID
const playlistId = config.server.playlistId
//使うyoutubeDataApiのスコープ
let SCOPES = ['https://www.googleapis.com/auth/youtubepartner', 'https://www.googleapis.com/auth/youtube']
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/'
let TOKEN_PATH = TOKEN_DIR + 'client_secret.json'

client.on('ready', function () {
  console.log('ready...')
})

client.on('message', function (message) {
//共有リンクとurlそのままコピーで場合分け
  if (message.content.indexOf('https://youtu.be/') === 0) {
    url = message.content
    if (url.indexOf('be/') >= 0) {
      videoId = url.substring(url.indexOf('be/') + 3, url.length)
      console.log(videoId)
      loadTokenAndPost()
    }
  } else if (message.content.indexOf('https://www.youtube.com') === 0) {
    url = message.content
    if (url.indexOf('v=') >= 0) {
      let str1 = url.substring(url.indexOf('v=') + 2, url.length)
      videoId = str1.split('&')[0]
      console.log(videoId)
      loadTokenAndPost()
    }
  }
})

//client_secret.jsonから色々読み込んで認証した後post
function loadTokenAndPost () {
  fs.readFile('client_secret.json', function processClientSecrets (err, content) {
    if (err) {
      console.log('client_secretを読み込めません: ' + err)
      return
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content), addPlayList)
  })
}

//oauth認証
function authorize (credentials, callback) {
  let clientSecret = credentials.installed.client_secret
  let clientId = credentials.installed.client_id
  let redirectUrl = credentials.installed.redirect_uris[0]
  let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl)

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback)
    } else {
      oauth2Client.credentials = JSON.parse(token)
      callback(oauth2Client)
    }
  })
}

//oauth認証してapiキー取得
function getNewToken (oauth2Client, callback) {
  let authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('リンクからアプリを認証してください: ', authUrl)
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('コードを入力してください: ', function (code) {
    rl.close()
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('アクセストークン取得エラー', err)
        return
      }
      oauth2Client.credentials = token
      storeToken(token)
      callback(oauth2Client)
    })
  })
}

//取得したoauth認証トークンをローカルに保存
function storeToken (token) {
  try {
    fs.mkdirSync(TOKEN_DIR)
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
    if (err) throw err
    console.log('保存されたトークン: ' + TOKEN_PATH)
  })
}

//プレイリストに追加する
function addPlayList (auth) {
  let service = google.youtube('v3')
  service.playlistItems.insert({
    auth: auth,
    part: 'id,snippet,contentDetails',
    requestBody: {
      snippet: {
        playlistId: playlistId,
        position: 0,
        resourceId: {
          videoId: videoId,
          kind: 'youtube#video',
        },
      },
    },
  }).then(function (res) {
    console.log(res.data)
  }).catch(console.error)
}

client.login(token)

