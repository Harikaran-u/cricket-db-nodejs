const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
let db = null;

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started working");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDbAndServer();

///get method///

app.get("/players/", async (request, response) => {
  const getAllPlayerQuery = `SELECT player_id as playerId,
    player_name as playerName FROM player_details;`;

  const allPlayersDetails = await db.all(getAllPlayerQuery);
  response.send(allPlayersDetails);
});

///single player///

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDataQuery = `SELECT player_id as playerId,
    player_name as playerName FROM player_details
    WHERE player_id = ${playerId};`;

  const playerData = await db.get(playerDataQuery);
  response.send(playerData);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `UPDATE player_details
    SET player_name = '${playerName}'
    WHERE player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `SELECT match_id as matchId,
    match as match,year as year
    FROM match_details
    WHERE match_id = ${matchId};`;

  const getMatchData = await db.get(getMatchQuery);
  response.send(getMatchData);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchDataQuery = `SELECT match_details.match_id as matchId,
    match_details.match as match, match_details.year as year FROM match_details
    INNER JOIN player_match_score on 
    player_match_score.match_id = match_details.match_id
    INNER JOIN player_details on player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;

  const playerData = await db.all(playerMatchDataQuery);
  response.send(playerData);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerMatchDataQuery = `SELECT player_details.player_id 
    as playerId, player_details.player_name as playerName
    FROM player_details INNER JOIN player_match_score
    ON player_match_score.player_id = player_details.player_id
    INNER JOIN match_details ON
    player_match_score.match_id = match_details.match_id
    WHERE match_details.match_id = ${matchId};`;

  const playerMatchData = await db.all(playerMatchDataQuery);
  response.send(playerMatchData);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerScoreDataQuery = `SELECT player_match_score.player_id as
    playerId, player_details.player_name as playerName,
    sum(score) as totalScore, sum(fours) as totalFours,
    sum(sixes) as totalSixes FROM player_match_score INNER JOIN player_details
    ON player_match_score.player_id = player_details.player_id
    WHERE player_match_score.player_id = ${playerId};`;

  const playerStatistics = await db.get(playerScoreDataQuery);
  response.send(playerStatistics);
});

module.exports = app;
