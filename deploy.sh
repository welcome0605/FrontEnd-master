#!/bin/bash
ionic build
rsync --delete -avzP www/* deployer@app.digitalkasten.de:~/apps_production/app_frontend/current/
