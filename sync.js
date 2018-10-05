const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const config=require('./files/sync_config.json');
const moment=require('moment');

const PMSF_DB = mysql.createConnection({
  host: config.PMSF_DB.host,
  user: config.PMSF_DB.username,
  password: config.PMSF_DB.password,
  database: config.PMSF_DB.dbname,
});

PMSF_DB.connect();

const RDM_DB = mysql.createConnection({
  host: config.RDM_DB.host,
	user: config.RDM_DB.username,
	password: config.RDM_DB.password,
  database: config.RDM_DB.dbname,
});

RDM_DB.connect();

const instance = new MySQLEvents(RDM_DB, {
  startAtEnd: true,
  excludedSchemas: {
    mysql: true,
  },
});

instance.start();

var num;

instance.addTrigger({
  name: 'POKEMON',
  expression: config.RDM_DB.dbname+'.pokemon',
  statement: MySQLEvents.STATEMENTS.ALL,
  onEvent: (event) => {
    let sighting=event.affectedRows[0].after; let newID, lat, lon;
    PMSF_DB.query(`SELECT * FROM sightings WHERE spawn_id='${sighting.id}'`, (err, row) => {
      if(!row[0]){
        let polarity=Math.floor(Math.random() * 2);
        let latAdj=(Math.floor(Math.random() * 5)+4)/100000;
        let lonAdj=(Math.floor(Math.random() * 5)+4)/100000;
        let timeNow=new Date().getTime();
        let expireTime=moment(timeNow).unix()+900;
        if(polarity==0){ lat=sighting.lat+lonAdj; lon=sighting.lon-latAdj; }
        else{ lat=sighting.lat-latAdj; lon=sighting.lon+lonAdj; }
        PMSF_DB.query(`INSERT INTO sightings (id, pokemon_id, spawn_id, expire_timestamp, encounter_id, lat, lon, atk_iv, def_iv, sta_iv, move_1, move_2, gender, form, cp, level, updated, weather_boosted_condition, weather_cell_id, weight) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [newID, sighting.pokemon_id, sighting.id, expireTime, sighting.id, lat, lon, sighting.atk_iv, sighting.def_iv, sighting.sta_iv, sighting.move_1, sighting.move_2, sighting.gender, sighting.form, sighting.cp, sighting.level, sighting.updated, 0, , sighting.weight], function (error, results, fields) {
          if(error){ console.error('[SIGHTINGS] Insert Pokemon ERROR',error); }
          else{ console.info('[SIGHTINGS] Inserted a Pokemon.'); }
        });
      }
      if(err){ console.error('[FORTS] Unable to select a sighting in the sightings table.',error); }
    });
  }
});

instance.addTrigger({
  name: 'RAIDS',
  expression: config.RDM_DB.dbname+'.gym',
  statement: MySQLEvents.STATEMENTS.ALL,
  onEvent: (event) => {
    let gym=event.affectedRows[0].after;
    PMSF_DB.query(`SELECT * FROM forts WHERE external_id = '${gym.id}'`, (err, row) => {
      if(!row[0]){
        PMSF_DB.query(`INSERT INTO forts (id, external_id, lat, lon, name, url, sponsor, weather_cell_id, park, parkid, edited_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [ , gym.id, gym.lat, gym.lon, gym.name, gym.url, gym.ex_raid_eligible, ,  , , 'sync.js'], function (error, results, fields) {
          if(error){ console.error('[SIGHTINGS] Insert fort ERROR',error); }
          else{ console.info('[FORTS] Added a new fort to the database.'); }
        });
      }
      if(err){ console.error('[FORTS] Unable to select a fort in the forts table.',error); }
    });
    PMSF_DB.query(`SELECT * FROM raids WHERE external_id='${gym.id}'`, (err, row) => {
      if(row[0]){
        if(row.pokemon_id!=gym.raid_pokemon_id || row.time_battle!=gym.raid_battle_timestamp){
          PMSF_DB.query(`UPDATE raids SET level = ?, pokemon_id = ?, move_1 = ?, move_2 = ?, time_spawn = ?, time_battle = ?, time_end = ?, cp = ?, form = ? WHERE external_id = ?`,
            [gym.raid_level, gym.raid_pokemon_id, gym.raid_pokemon_move_1, gym.raid_pokemon_move_2, gym.raid_spawn_timestamp, gym.raid_battle_timestamp, gym.raid_end_timestamp, gym.raid_pokemon_cp, gym.raid_pokemon_form, gym.id], function (error, results, fields) {
              if(error){ console.error('[RAIDS] Update raids ERROR',error); }
              else{ console.info('[RAIDS] Updated a Raid.'); }
          });
        }
      }
      else{
        PMSF_DB.query(`SELECT * FROM forts WHERE external_id = '${gym.id}'`, (err, row) => {
          PMSF_DB.query(`INSERT INTO raids (id, external_id, fort_id, level, pokemon_id, move_1, move_2, time_spawn, time_battle, time_end, cp, submitted_by, form) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [ , gym.id, result[0].id, gym.raid_level, gym.raid_pokemon_id, gym.raid_pokemon_move_1, gym.raid_pokemon_move_2, gym.raid_spawn_timestamp, gym.raid_spawn_battle, gym.raid_end_timestamp, gym.raid_pokemon_cp, , gym.raid_pokemon_form], function (error, results, fields) {
              if(error){ console.error('[RAIDS] Update raids ERROR',error); }
              else{ console.info('[RAIDS] Inserted a new raid record.'); }
          });
          if(err){ console.error('[FORTS] Unable to select a fort in the forts table.',error); }
        });
      }
      if(err){ console.error('[RAIDS] Unable to select a raid in the raids table.',error); }
      updateFortSightings(gym);
    });
  }
});

instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);

instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);

function updateFortSightings(gym){
  PMSF_DB.query(`SELECT * FROM fort_sightings WHERE external_id = '${gym.id}'`, (err, row) => {
    if(!row[0]){
      PMSF_DB.query(`SELECT * FROM forts WHERE external_id = '${gym.id}'`, function (error, fort, fields) {
        PMSF_DB.query(`INSERT INTO fort_sightings (id, fort_id, last_modified, team, guard_pokemon_id, slots_available, is_in_battle, updated, external_id) VALUES (?,?,?,?,?,?,?,?,?)`,
          [ , fort.id, gym.updated, gym.team_id, gym.guard_pokemon_id, gym.availble_slots, gym.in_battle, gym.updated, gym.id], function (error, results, fields) {
            if(error){ console.error('[FORT_SIGHTINGS] Update fort_sightings ERROR. You may be missing the external_id column in fort_sightings.',error); }
            else{ console.info('[FORT_SIGHTINGS] Updated a fort sighting.'); }
        });
        if(error){ console.error }
      });
    }
    else{
      PMSF_DB.query(`UPDATE fort_sightings SET updated = ?, team = ?, guard_pokemon_id = ?, slots_available = ?, is_in_battle =? WHERE external_id = ?`,
        [gym.updated, gym.team_id, gym.guard_pokemon_id, gym.availble_slots, gym.in_battle, gym.id], function (error, results, fields) {
        if(error){ console.error('[FORT_SIGHTINGS] Update fort_sightings ERROR. You may be missing the external_id column in fort_sightings.',error); }
        else{ console.info('[FORT_SIGHTINGS] Updated a fort sighting.'); }
      });
    }
  });
}
