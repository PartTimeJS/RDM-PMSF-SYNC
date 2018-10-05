# RDM-PMSF-SYNC
A script to monitor an RDM database and syncronize it with a PMSF database.

## Installation

### 1: git clone to your directory.
### 2: Install Requirements:
>Install node.js (https://nodejs.org/en/) then run:<br/>
>**npm install mysql**<br/>
>**npm install moment**<br/>
>**npm install @rodrigogs/mysql-events**<br/>
>**npm install pm2** (Optional. Can run in the background using tmux or pm2

### 3: Database Requirements:
>You need to be on a branch of PMSF that supports manual submitting with a submitted_by column in raids and sightings.
>If not done or just not populated, you will need to insert external_id's into the raids table.
```
UPDATE raids AS R1
     INNER JOIN forts AS f1 ON R1.fort_id = f1.id   
     SET R1.external_id = f1.external_id; 
```
>To reduce queries for high volume databases, external_id needs to be added to fort_sightings. 
```
ALTER TABLE fort_sightings ADD COLUMN external_id varchar(35)
UPDATE fort_sightings AS R1
     INNER JOIN forts AS f1 ON R1.fort_id = f1.id   
     SET R1.external_id = f1.external_id; 
```

> You will need to change the type of the spawn_id and encounter_id columns in the sightings table to varchar(35). The database did not like the IDs coming from the protos so I had to change this to stop errors. 

### 4: Fill out the sync_config.json.example file that is located in /files and rename to sync_config.json.

### 5: Navigate to directory and run in tmux or using pm2
>pm2 start sync.js

You can start RDM before or after running sync.js. You will begin to see console outputs once RDM begins to populate its database. 


### This is based on the following table setup:
RAIDS table:
```
id, external_id, fort_id, level, pokemon_id, move_1, move_2, time_spawn, time_battle, time_end, cp, submitted_by, form
```
SIGHTINGS table:
```
id, pokemon_id, spawn_id, expire_timestamp, encounter_id, lat, lon, atk_iv, def_iv, sta_iv, move_1, move_2, gender, form, cp, level, updated, weather_boosted_condition, weather_cell_id, weight
```
FORTS table:
```
id, external_id, lat, lon, name, url, sponsor, weather_cell_id, park, parkid, edited_by
```
FORT_SIGHTINGS table:
```
id, fort_id, last_modified, team, guard_pokemon_id, slots_available, is_in_battle, updated, external_id
```

      
