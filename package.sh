#!/bin/bash
rm -r ./MikeBotArchive
mkdir MikeBotArchive
cp *.js MikeBotArchive
cp install.sh MikeBotArchive
cp runGame.sh MikeBotArchive
zip -r ./MikeBotArchive/MikeBotArchive.zip ./MikeBotArchive