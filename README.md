# THIS REPO IS NO LONGER MAINTAINED AS OF 6-DEC-2018

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
id, fort_id, last_modified, team, guard_pokemon_id, slots_available, is_in_battle, updated
```

      
