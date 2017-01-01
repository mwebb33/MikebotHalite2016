#!/bin/bash
rm ./match.log
rm *.hlt
rm *.log
./halite -d "30 30" "node MyBot.js" "node RandomBot.js"