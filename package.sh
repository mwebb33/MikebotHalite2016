#!/bin/bash
rm -r ./MikeBot
mkdir MikeBot
cp *.js MikeBot
cp install.sh MikeBot
cp runGame.sh MikeBot
zip -r ./MikeBot/MikeBot.zip ./MikeBot