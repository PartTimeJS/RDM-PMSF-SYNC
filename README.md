# RDM-PMSF-SYNC
A script to monitor an RDM database and syncronize it with a PMSF database.

## Installation

### 1: git clone to your directory.
### 2: Install Requirements:
>Install node.js (https://nodejs.org/en/) then run:<br/>
>**npm install mysql**<br/>
>**npm install moment**<br/>
>**npm install @rodrigogs/mysql-events**<br/>
>**npm instal pm2** (Optional. Can run in the background using tmux or pm2

### 3: Database Requirements:
>You need to be on a branch of PMSF that supports manual submitting with a submitted_by column in raids and sightings.
>If not done or just not populated, you will need to insert external_id's into the raids table.
```
UPDATE raids AS R1
     INNER JOIN forts AS f1 ON R1.fort_id = f1.id   
     SET R1.external_id = f1.external_id; 
```
> You will need to change the type of the spawn_id and encounter_id columns in the sightings table to varchar(35). The database did not like the IDs coming from the protos so I had to change this to stop errors. 

### 4: Fill out the sync_config.json.example file that is located in /files and rename to sync_config.json.

### 5: Navigate to directory and run in tmux or using pm2
>pm2 start sync.js

You can start RDM before or after running sync.js. You will begin to see console outputs once RDM begins to populate its database. 


      
