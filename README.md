# RDM-PMSF-SYNC
A script to monitor an RDM database and syncronize it with a PMSF database.

# Installation

### 1: git clone to your directory.
### 2: Install Requirements:
>Install node.js (https://nodejs.org/en/) then run:\n 
>**npm install mysql\n
>npm install @rodrigogs/mysql-events\n
>npm instal pm2** (Optional. Can run in the background using tmux or pm2

### 3: Database Requirements:
>If not done or just not populated, you will need to insert external_id's into the raids table.
    
```UPDATE raids AS R1
     INNER JOIN forts AS f1 ON R1.fort_id = f1.id   
     SET R1.external_id = f1.external_id; 
```
     
### 4: Navigate to directory and run in tmux or using pm2 (pm2 start sync.js)


      
